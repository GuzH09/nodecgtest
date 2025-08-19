# nodecgtest

> Experimento “Hello World” para conocer el framework de gráficos en vivo **NodeCG**

---

## Propósito general
Este repositorio demuestra de manera muy acotada cómo utilizar NodeCG para crear un flujo completo de datos en tiempo real: obtención de información externa, procesamiento en un _extension_ (back-end), visualización en un *overlay* (_graphics_) y control desde un panel de operador (_dashboard_) mediante **Replicants**.  
Sirve como punto de partida para evaluar el esfuerzo de adopción y las posibilidades que ofrece la plataforma.

## Estructura del proyecto
```
nodecgtest/
├─ assets/                     # Recursos estáticos globales (vacío)
├─ bundles/
│  └─ my-first-bundle/         # Único bundle de ejemplo
│     ├─ extension/            # Lógica de servidor (Node.js)
│     ├─ dashboard/            # Panel de control del operador
│     ├─ graphics/             # Overlay mostrado en la emisión
│     ├─ package.json          # Dependencias del bundle
│     └─ README.md             # Notas internas del bundle
├─ cfg/                        # Configuración de NodeCG (no versionado)
├─ db/                         # SQLite con persistencia de Replicants
├─ logs/                       # Registros de ejecución
├─ package.json                # Dependencias raíz
└─ README.md                   # (este archivo)
```

## Flujo funcional principal
1. **Extension** (`bundles/my-first-bundle/extension/index.js`)
   * Inicia una simulación de una carrera de F1 al cargar el bundle.
   * Cada 3 s consulta la API pública Ergast (vueltas 1-10) y calcula la clasificación acumulada.
   * Publica dos Replicants compartidos:
     * `leaderboard` → array con posición, código de piloto y diferencia al líder.
     * `currentLap` → número de vuelta actual.
2. **Dashboard** (`dashboard/panel.html` + `panel.js`)
   * Muestra un campo de texto ligado al Replicant `displayText` (ejemplo de edición en vivo).
3. **Graphics** (`graphics/index.html` + `index.js`)
   * Lee `leaderboard` y `currentLap` para mostrar el *leaderboard* con animaciones de subida/bajada de puesto y el número de vuelta.

## Conceptos clave ilustrados
* **Bundles**: módulos autocontenidos de NodeCG que se pueden habilitar o deshabilitar individualmente.
* **Replicants**: variables reactivas/persistentes que sincronizan datos entre back-end y clientes en tiempo real.
* **Separación de responsabilidades**: `extension` (lógica), `dashboard` (operador) y `graphics` (espectador).

## Uso de Replicants
En el bundle `vite-bundle` se ilustra un caso práctico donde **Replicants** actúan como puente en tiempo real entre una fuente de datos externa (un *stream* de Redis), el _extension_, el panel de control y el overlay gráfico.

### Declaración en el _extension_
```ts
// bundles/vite-bundle/src/extension/index.ts
const redisStreamLenRep = nodecg.Replicant<number>("redisStreamLen", {
  defaultValue: 0,
});

const redisLatestMessagesRep = nodecg.Replicant<RedisMessage[]>(
  "redisLatestMessages",
  { defaultValue: [] }
);
```
Cada 5 s el _extension_ consulta Redis y actualiza `replicant.value`, propagando inmediatamente el nuevo estado a todos los clientes conectados.

### Consumo en panel y overlay
En React se usa un *hook* utilitario `useReplicant` que:
1. Declara nuevamente el Replicant en el contexto del navegador (`nodecg.Replicant<T>(name)`).
2. Se suscribe al evento `change` para refrescar la UI cuando cambie el valor.
3. Devuelve el estado actual para utilizarlo como estado de React.

```tsx
// Ejemplo abreviado de bundles/vite-bundle/src/dashboard/Panel.tsx
const streamLen = useReplicant<number>('redisStreamLen', 0);
const messages  = useReplicant<RedisMessage[]>('redisLatestMessages', []);
```

### Flujo de datos resumido
`Redis → extension (cada 5 s) → Replicants → dashboard / graphics → DOM`

### Eventos, caché y persistencia (resumen de la documentación oficial de NodeCG)
* **`change`**: emitido en todos los contextos al modificarse `replicant.value` (args: `newValue`, `oldValue`).
* **Instantánea inicial**: al crear/escuchar un Replicant se recibe inmediatamente la última instantánea almacenada (sin esperar al primer `change`).
* **Persistencia**: por defecto `persistent: true`. NodeCG guarda el valor en disco y lo restaura al reiniciar (en este repo, `db/nodecg.sqlite3`).
* **Volatilidad**: si se define `persistent: false` el valor vive solo en memoria (ideal para datos temporales).
* **Validación**: un Replicant puede asociarse a un **JSON Schema** (colocado en `schemas/`). Los cambios que no cumplan el esquema son rechazados.
* **Otras opciones**: `defaultValue`, `schemaPath`, `clearOnSet`, entre otras, permiten personalizar comportamiento.

*Nota:* Además de Replicants, NodeCG ofrece un sistema de **mensajes** (`sendMessage`/`listenFor`) para eventos de tipo *fire-and-forget*. A diferencia de los Replicants, estos mensajes **no se cachean**: si un cliente no está conectado en el momento de enviarse, no lo recibirá.

## Puesta en marcha
```bash
# 1. Instalar dependencias
npm install                 # en el directorio raíz
cd bundles/my-first-bundle && npm install

# 2. Iniciar NodeCG
a npx nodecg start          # por defecto http://localhost:9090/dashboard
```
En el dashboard, selecciona **My First Bundle** y verás el panel junto con la simulación de vueltas.  
Para mostrar el overlay, abre `graphics/index.html` en un navegador o añádelo como *browser source* en OBS.
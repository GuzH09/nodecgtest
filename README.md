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
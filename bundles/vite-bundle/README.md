# Vite Bundle - NodeCG with React & TypeScript

This bundle demonstrates how to use **Vite**, **React**, and **TypeScript** together to create a modern NodeCG bundle with fast development and optimized builds.

## 🏗️ Architecture Overview

This bundle uses a multi-configuration Vite setup with separate builds for different components:

- **Dashboard Panel**: React-based dashboard panel for NodeCG
- **Graphics**: React-based graphics for overlays/broadcast
- **Extension**: TypeScript backend extension

## 📁 Project Structure

```
vite-bundle/
├── src/
│   ├── dashboard/          # Dashboard panel source
│   │   ├── panel.html     # HTML template
│   │   ├── main.tsx       # React entry point
│   │   └── Panel.tsx      # Main panel component
│   ├── graphics/          # Graphics source
│   │   ├── index.html     # HTML template
│   │   ├── main.tsx       # React entry point
│   │   └── Index.tsx      # Main graphics component
│   ├── extension/         # Backend extension
│   │   ├── index.ts       # Extension entry point
│   │   └── tsconfig.json  # Extension-specific TS config
│   └── types/             # Shared TypeScript types
├── dashboard/             # Built dashboard files
├── graphics/             # Built graphics files
├── extension/            # Built extension files
├── vite.config.dashboard.ts  # Dashboard build config
├── vite.config.graphics.ts   # Graphics build config
├── tsconfig.json         # Main TypeScript config
└── package.json          # Dependencies and scripts
```

## ⚙️ Configuration Files

### Vite Configuration

**`vite.config.dashboard.ts`** - Dashboard panel build:
```typescript
export default defineConfig({
  plugins: [react()],
  base: './',              // Use relative paths
  root: 'src/dashboard',   // Source directory
  build: {
    outDir: '../../dashboard',  // Output directory
    emptyOutDir: false,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, 'src/dashboard/panel.html'),
      },
      output: {
        entryFileNames: 'panel.js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
```

**`vite.config.graphics.ts`** - Graphics build:
```typescript
export default defineConfig({
  plugins: [react()],
  base: './',              // Use relative paths
  root: 'src/graphics',    // Source directory
  build: {
    outDir: '../../graphics',  // Output directory
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/graphics/index.html'),
      },
      output: {
        entryFileNames: 'index.js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
```

### TypeScript Configuration

**`tsconfig.json`** - Main TypeScript config:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node", "express", "nodecg/types/augment-window"]
  }
}
```

## 🚀 Development Workflow

### Available Scripts

```bash
# Development
npm run dev                    # Start Vite dev server

# Building
npm run build:graphics         # Build graphics only
npm run build:dashboard        # Build dashboard only
npm run build:extension        # Build extension only
npm run build                  # Build all components

# Preview
npm run preview                # Preview built files
```

### Development Process

1. **Development**: Use `npm run dev` for hot-reload development
2. **Building**: Use `npm run build` to build all components
3. **Testing**: Built files are automatically placed in the correct NodeCG bundle structure

## 📦 Dependencies

### Core Dependencies
- **React**: ^19.1.0 - UI library
- **React DOM**: ^19.1.0 - React DOM rendering

### Development Dependencies
- **Vite**: ^6.3.5 - Build tool and dev server
- **@vitejs/plugin-react**: ^4.2.0 - React plugin for Vite
- **TypeScript**: ^5.3.2 - Type checking and compilation
- **NodeCG**: ^2.6.0 - NodeCG types and utilities

## 🎯 NodeCG Integration

### Bundle Configuration
The `package.json` includes NodeCG-specific configuration:

```json
{
  "nodecg": {
    "compatibleRange": "^2.0.0",
    "dashboardPanels": [
      {
        "name": "panel",
        "title": "Panel",
        "width": 2,
        "file": "panel.html",
        "headerColor": "#525F78"
      }
    ],
    "graphics": [
      {
        "file": "index.html",
        "width": 1920,
        "height": 1080,
        "singleInstance": false
      }
    ]
  }
}
```

### File Structure
Built files are organized for NodeCG:
- `dashboard/panel.html` - Dashboard panel
- `graphics/index.html` - Graphics overlay
- `extension/index.js` - Backend extension

## 🛠️ Customization

### Adding New Components
1. Create new React components in `src/dashboard/` or `src/graphics/`
2. Import and use them in the respective `main.tsx` files
3. Vite will automatically handle the bundling

### Adding Dependencies
```bash
npm install <package-name>
npm install -D <dev-package-name>
```

### TypeScript Types
Add custom types in `src/types/` and import them where needed.

## 🚨 Troubleshooting

### Common Issues

1. **Build Paths**: Ensure `base: './'` is set in Vite configs
2. **TypeScript Errors**: Check `tsconfig.json` includes all necessary files
3. **NodeCG Integration**: Verify bundle structure matches NodeCG requirements

### Development Tips

- Use `npm run dev` for fast development with hot reload
- Check browser console for React/TypeScript errors
- Use NodeCG's built-in debugging tools for extension development

---
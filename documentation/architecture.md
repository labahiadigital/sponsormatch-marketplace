# Arquitectura del Proyecto SponsorMatch

## Estructura de Carpetas

```
sponsormatch-marketplace/
├── back/                    # Backend SpacetimeDB
│   ├── spacetimedb/
│   │   ├── src/index.ts     # Schema, reducers, seed data
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── spacetime.json       # Config del servidor local
├── front/                   # Frontend SvelteKit (app principal)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # Componentes reutilizables
│   │   │   ├── stores.svelte.ts  # Estado reactivo Svelte 5
│   │   │   ├── types.ts     # Interfaces TypeScript
│   │   │   ├── utils.ts     # Funciones de utilidad
│   │   │   ├── config.ts    # Configuración SpacetimeDB
│   │   │   ├── spacetimedb.ts # Conexión WebSocket
│   │   │   └── module_bindings/ # Bindings generados
│   │   └── routes/          # Páginas SvelteKit
│   │       ├── dashboard/   # Panel de resumen
│   │       ├── marketplace/ # Explorador de clubes
│   │       │   └── [clubId]/ # Perfil detallado del club
│   │       ├── deals/       # Gestión de acuerdos
│   │       └── messages/    # Mensajería en tiempo real
│   ├── vite.config.ts       # Config Vite + Vitest
│   └── package.json
├── landing/                 # Landing page Astro
│   ├── src/
│   │   ├── components/      # Componentes Astro
│   │   ├── layouts/         # Layout base
│   │   ├── pages/           # Páginas estáticas
│   │   └── styles/          # CSS global
│   ├── astro.config.mjs
│   └── package.json
└── documentation/           # Documentación del proyecto
```

## Diagrama de Flujo de Datos

```
┌──────────────┐    WebSocket     ┌───────────────────┐
│   Frontend   │ ◄──────────────► │   SpacetimeDB     │
│  (SvelteKit) │    Suscripciones │   (Backend)       │
│              │    + Reducers    │                   │
│  puerto 5173 │                  │   puerto 3000     │
└──────────────┘                  └───────────────────┘

┌──────────────┐
│   Landing    │    Estático (sin backend)
│   (Astro)    │
│  puerto 4321 │
└──────────────┘
```

## Flujo de Datos

1. **Conexión**: El frontend se conecta via WebSocket a SpacetimeDB
2. **Suscripción**: Se suscribe a todas las tablas públicas (clubs, metrics, deals, etc.)
3. **Lectura**: Los datos llegan en tiempo real y se sincronizan con los stores de Svelte 5
4. **Escritura**: Las acciones del usuario invocan reducers en SpacetimeDB
5. **Propagación**: SpacetimeDB propaga cambios a todos los clientes conectados

## Decisiones de Arquitectura

### ¿Por qué SpacetimeDB en lugar de una API REST?
- Sincronización en tiempo real sin polling
- Estado del servidor como base de datos
- Reducers tipados ejecutados en el servidor
- Sin necesidad de escribir endpoints HTTP manualmente

### ¿Por qué NO se usa TanStack?
- Svelte 5 con runes (`$state`, `$derived`) cubre toda la reactividad necesaria
- SpacetimeDB maneja la sincronización de datos (reemplaza a TanStack Query)
- No hay necesidad de cache client-side adicional porque SpacetimeDB mantiene una réplica local
- Agregar TanStack añadiría complejidad sin beneficio real

### ¿Por qué Astro para la landing?
- Genera HTML estático puro (0 JS por defecto)
- Rendimiento perfecto (Lighthouse 100)
- Independiente del frontend de la app
- Despliegue trivial en CDN

### ¿Por qué Svelte 5 sin adapters SSR?
- La app es un SPA (Single Page Application) por diseño
- SpacetimeDB requiere WebSocket client-side
- SSR no tiene sentido para una app de datos en tiempo real
- `export const ssr = false` en layout

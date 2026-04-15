# SponsorMatch - Marketplace de Patrocinio Deportivo

Plataforma inteligente que conecta marcas con clubes deportivos usando filtros avanzados, métricas en tiempo real y recomendaciones IA.

## Estructura del proyecto

```
├── landing/   → Landing page estática (Astro + Tailwind CSS v4)
├── front/     → Aplicación del marketplace (SvelteKit + Tailwind CSS v4)
├── back/      → Backend en tiempo real (SpacetimeDB TypeScript)
└── documentation/  → Documentación del proyecto
```

## Requisitos

- Node.js 18+
- [SpacetimeDB CLI](https://spacetimedb.com/install)

## Setup

### Backend (SpacetimeDB)

```bash
cd back/spacetimedb
npm install

# Build del módulo
cd ..
spacetime build

# Iniciar servidor local
spacetime start

# Publicar módulo
spacetime publish sponsormatch --project-path . --delete-data always -y --server local

# Ejecutar seed data
spacetime call sponsormatch seedData --server local
```

### Landing Page (Astro)

```bash
cd landing
npm install
npm run dev    # Desarrollo en http://localhost:4321
npm run build  # Build de producción
```

### Frontend App (SvelteKit)

```bash
cd front
npm install
npm run dev    # Desarrollo en http://localhost:5173
npm run build  # Build de producción
```

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Landing | Astro 6, Tailwind CSS v4 |
| Frontend | SvelteKit 2, Svelte 5, Tailwind CSS v4 |
| Backend | SpacetimeDB (TypeScript modules) |
| Comunicación | WebSocket (SpacetimeDB SDK) |

## Design System

Tema "Neon Observatory" con estética dark inmersiva:
- Fondo base: `#060B14`
- Primary: `#2563eb` / `#b4c5ff`
- Secondary: `#4cd7f6` (cyan)
- Tertiary: `#d0bcff` / `#8B5CF6` (purple)
- Fuente: Inter
- Glassmorphism: `backdrop-filter: blur(24px)`
- Bordes redondos: 8px
- Regla "No-Line": sin bordes 1px, separación por cambio de fondo

## Funcionalidades

- **Marketplace Explorer** con filtros por deporte, ubicación y presupuesto
- **Perfil de Club** con métricas de engagement y gráficos de tendencia
- **Gestión de Acuerdos** con flujo completo de propuestas
- **Mensajería** directa entre marcas y clubes
- **Búsquedas guardadas** (hasta 10 por marca)
- **Dashboard** con resumen de actividad

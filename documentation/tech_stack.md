# Stack Tecnológico

## Versiones Exactas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Astro** | 6.1.6 | Landing page estática |
| **SvelteKit** | 2.x | Framework frontend app |
| **Svelte** | 5.x | UI reactiva con runes |
| **SpacetimeDB** | 2.1.0 | Backend + base de datos en tiempo real |
| **Tailwind CSS** | 4.x | Sistema de estilos utility-first |
| **TypeScript** | 5.x | Tipado estático en todo el stack |
| **Vitest** | 4.1.4 | Testing unitario frontend |
| **Vite** | 7.x | Bundler (Astro 6 requiere Vite 7) |

## Frontend (SvelteKit)

### Dependencias de producción
- `@sveltejs/kit` - Framework full-stack
- `svelte` - UI reactiva
- `spacetimedb` - SDK cliente WebSocket

### Dependencias de desarrollo
- `@tailwindcss/vite` - Plugin Tailwind para Vite
- `tailwindcss` - Estilos utility-first
- `vitest` - Test runner
- `@testing-library/svelte` - Testing de componentes
- `@testing-library/jest-dom` - Matchers DOM
- `jsdom` - Entorno DOM para tests
- `svelte-check` - Verificación de tipos

## Backend (SpacetimeDB)

### Módulo TypeScript
- `spacetimedb` - SDK servidor para definir schema y reducers
- TypeScript nativo sin frameworks adicionales

### Tablas
| Tabla | Registros seed | Descripción |
|-------|---------------|-------------|
| `brand` | 0 (se crean via reducer) | Marcas registradas |
| `club` | 20 | Clubes deportivos |
| `clubMetrics` | 20 | Métricas de redes sociales |
| `savedSearch` | 0 (se crean via reducer) | Búsquedas guardadas |
| `deal` | 0 (se crean via reducer) | Acuerdos de patrocinio |
| `message` | 0 (se crean via reducer) | Mensajes entre usuarios |

### Índices B-tree
- `brand.bySector`
- `club.bySport`, `club.byLocation`
- `clubMetrics.byClubId`
- `savedSearch.byBrandIdentity`
- `deal.byBrandIdentity`, `deal.byClubId`
- `message.bySenderIdentity`, `message.byReceiverIdentity`

## Landing (Astro)

### Dependencias
- `astro` 6.1.6 - Framework
- `@tailwindcss/vite` - Estilos
- `tailwindcss` - CSS utility-first

### Output
- Generación estática (SSG)
- HTML puro, 0 JavaScript en el bundle final
- Una sola página: `index.html`

## Sistema de Diseño

### Tema: "Neon Observatory"
- **Fondo**: `#060B14` (dark navy)
- **Superficie**: `#0D1321` con glassmorphism
- **Primario**: `#7dd3fc` (cyan claro)
- **Secundario**: `#c084fc` (púrpura)
- **Tipografía**: Inter (Google Fonts)
- **Bordes**: 8px radius, sin líneas de separación
- **Efectos**: `backdrop-filter: blur()`, sombras cyan/púrpura sutiles
- **Labels**: ALL-CAPS, tracking-widest

## Testing

### Frontend
- **Runner**: Vitest 4.1.4
- **Entorno**: jsdom
- **Archivos de test**: `*.test.ts` junto al código fuente
- **Cobertura actual**: utils, config, stores (42 tests)
- **Verificación tipos**: `svelte-check` (0 errores, 0 warnings)

### Backend
- **Verificación**: `spacetime build` (compilación TypeScript)
- **Validación datos**: Queries SQL contra BD local
- **20 clubes + 20 métricas** verificados vía `spacetime sql`

### Landing
- **Verificación**: `astro build` (generación estática sin errores)

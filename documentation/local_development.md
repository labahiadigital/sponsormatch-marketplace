# Desarrollo Local

## Requisitos Previos

- Node.js >= 20
- SpacetimeDB CLI (`spacetime`) instalado globalmente
- npm

## Levantar el Proyecto Completo

### 1. Backend (SpacetimeDB)

```bash
cd back

# Iniciar servidor local de SpacetimeDB
spacetime start

# En otra terminal, instalar deps y compilar
cd back/spacetimedb
npm install
spacetime build

# Publicar el módulo (primera vez)
spacetime publish sponsormatch-server-v2xmo --delete-data=always -y -s local

# Seed de datos iniciales
spacetime call sponsormatch-server-v2xmo seed_data -s local

# Verificar datos
spacetime sql sponsormatch-server-v2xmo "SELECT id, name, sport FROM club LIMIT 5" -s local
```

### 2. Frontend (SvelteKit)

```bash
cd front
npm install
npm run dev
# Disponible en http://localhost:5173
```

### 3. Landing (Astro)

```bash
cd landing
npm install
npm run dev
# Disponible en http://localhost:4321
```

## Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| SpacetimeDB | 3000 | `ws://localhost:3000` |
| Frontend SvelteKit | 5173 | `http://localhost:5173` |
| Landing Astro | 4321 | `http://localhost:4321` |

## Comandos Útiles

### Tests
```bash
cd front
npx vitest run          # Ejecutar todos los tests
npx vitest              # Modo watch
npx svelte-check        # Verificación de tipos
```

### Build de producción
```bash
# Landing
cd landing && npx astro build   # Output en landing/dist/

# Frontend
cd front && npm run build       # Output en front/.svelte-kit/output/
```

### SpacetimeDB
```bash
# Consultar tablas
spacetime sql sponsormatch-server-v2xmo "SELECT * FROM club" -s local

# Ver logs del módulo
spacetime logs sponsormatch-server-v2xmo -s local

# Republicar tras cambios en el schema
spacetime build
spacetime publish sponsormatch-server-v2xmo --delete-data=always -y -s local
spacetime call sponsormatch-server-v2xmo seed_data -s local
```

## Notas Importantes

- El frontend usa **datos mock** en `stores.svelte.ts` como fallback cuando SpacetimeDB no está conectado
- La conexión WebSocket se configura en `front/src/lib/config.ts`
- El nombre de la base de datos SpacetimeDB es `sponsormatch-server-v2xmo` (generado en el init)
- Astro 6 requiere Vite 7; se fuerza con `overrides` en `landing/package.json`

# Estrategia de Testing

## Estado Actual

| Capa | Método | Resultado |
|------|--------|-----------|
| Backend schema | `spacetime build` | Compila sin errores |
| Backend datos | `spacetime sql` queries | 20 clubes, 20 métricas verificados |
| Frontend utils | Vitest (23 tests) | PASS |
| Frontend config | Vitest (2 tests) | PASS |
| Frontend stores | Vitest (17 tests) | PASS |
| Frontend tipos | `svelte-check` | 0 errores, 0 warnings |
| Landing build | `astro build` | Build exitoso, 1 página generada |

**Total: 42 tests unitarios + verificaciones de build**

## Archivos de Test

```
front/src/lib/
├── utils.test.ts      # formatNumber, formatCurrency, formatDate, timeAgo, getStatusColor, getStatusBgColor
├── config.test.ts     # SPACETIMEDB_URI formato, MODULE_NAME valor
└── stores.test.ts     # clubs, clubMetrics, deals, messages, savedSearches integridad de datos
```

## Qué se Testea

### utils.test.ts (23 tests)
- `formatNumber`: M/K suffixes, edge cases (0, 999, exact boundaries)
- `formatCurrency`: Formato EUR con locale es-ES
- `formatDate`: Parsing ISO a formato español
- `timeAgo`: Minutos, horas, días relativos
- `getStatusColor`: Mapeo de status a clases CSS
- `getStatusBgColor`: Mapeo de status a clases CSS de fondo

### config.test.ts (2 tests)
- URI de SpacetimeDB es una URL WebSocket válida
- Nombre del módulo es un string no vacío

### stores.test.ts (17 tests)
- 20 clubes con campos requeridos y IDs únicos
- Deportes esperados presentes (Fútbol, Baloncesto, Pádel, Esports)
- Métrica para cada club, engagement rates válidos
- Deals con status válidos y montos positivos
- Mensajes con contenido y timestamps válidos, referenciando deals existentes
- Búsquedas guardadas con JSON parseable

## Ejecutar Tests

```bash
cd front

# Todos los tests
npx vitest run

# Modo watch (re-ejecuta al cambiar archivos)
npx vitest

# Test específico
npx vitest run src/lib/utils.test.ts

# Con cobertura
npx vitest run --coverage

# Verificación de tipos (no es Vitest, complementario)
npx svelte-check --tsconfig ./tsconfig.json
```

## Configuración Vitest

Definida en `front/vite.config.ts`:

```typescript
test: {
  include: ['src/**/*.{test,spec}.{js,ts}'],
  environment: 'jsdom',
}
```

## Próximos Tests a Implementar

1. **Componentes Svelte** (`@testing-library/svelte`):
   - `ClubCard` renderiza nombre, deporte, ubicación
   - `FilterPanel` emite eventos onChange con filtros correctos
   - `DealCard` muestra status con color correcto
   - `MetricTile` formatea valores grandes correctamente
   - `Toast` aparece y desaparece

2. **Tests E2E** (Playwright):
   - Flujo completo: Dashboard → Marketplace → Filtrar → Ver perfil → Proponer deal
   - Guardar y cargar búsqueda guardada
   - Enviar mensaje desde la página de mensajes

3. **Backend** (cuando SpacetimeDB soporte test runner):
   - Reducers con validación de errores
   - Límite de 10 búsquedas guardadas
   - Autorización por identity

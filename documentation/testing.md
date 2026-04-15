# Estrategia de Testing

## Estado Actual

| Capa | Método | Resultado |
|------|--------|-----------|
| Backend schema | `spacetime build` | Compila sin errores |
| Backend datos | `spacetime sql` queries | 20 clubes, 20 métricas verificados |
| Frontend utils | Vitest (23 tests) | PASS |
| Frontend config | Vitest (2 tests) | PASS |
| Frontend stores | Vitest (21 tests) | PASS |
| Frontend sponsorship | Vitest (14 tests) | PASS |
| Frontend activation | Vitest (7 tests) | PASS |
| Frontend content-metrics | Vitest (6 tests) | PASS |
| Frontend tipos | `svelte-check` | 0 errores, 0 warnings |
| Landing build | `astro build` | Build exitoso, 1 página generada |

**Total: 73 tests unitarios + verificaciones de build**

## Archivos de Test

```
front/src/lib/
├── utils.test.ts            # formatNumber, formatCurrency, formatDate, timeAgo, getStatusColor, getStatusBgColor
├── config.test.ts           # SPACETIMEDB_URI formato, MODULE_NAME valor
├── stores.test.ts           # clubs, clubMetrics, deals, messages, savedSearches, clubProfiles
├── sponsorship.test.ts      # calculateROI, calculateMediaValue, getMatchScore, getAudienceSegments
├── activation.test.ts       # generateActivationPlan (fases, acciones, presupuesto, objetivos)
└── content-metrics.test.ts  # calculateContentMetrics, compareWithLocalMedia
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

### stores.test.ts (21 tests)
- 20 clubes con campos requeridos y IDs únicos
- Deportes esperados presentes (Fútbol, Baloncesto, Pádel, Esports)
- Métrica para cada club, engagement rates válidos
- Deals con status válidos y montos positivos
- Mensajes con contenido y timestamps válidos
- Búsquedas guardadas con JSON parseable
- `clubProfiles` tiene perfil para cada club con territory, purpose, objectives y content pillars

### sponsorship.test.ts (14 tests)
- `calculateMediaValue`: Valor positivo, proporcional a followers y engagement, cero para 0 followers
- `calculateROI`: ROI positivo/negativo según inversión vs valor, coste por impresión escala con audiencia, growth amplifica ROI
- `getMatchScore`: Score entre 0-100, presupuesto en rango puntúa más, más objetivos = mayor score
- `getAudienceSegments`: Segmentos con nombre/porcentaje/tamaño, suman ~total followers, audiencia joven tiene más Digital Natives

### activation.test.ts (7 tests)
- Plan con 3 fases (pre, durante, post), cada una con acciones
- Acciones con nombre, descripción, coste estimado y canal
- Coste total dentro de ratio de activación (40% del presupuesto)
- Esports incluye activaciones digitales, branding incluye visibilidad, CSR incluye acciones solidarias

### content-metrics.test.ts (6 tests)
- Métricas mensuales positivas para club activo
- Valor mediático estimado positivo
- Posts recomendados mínimo 3/semana
- Más followers = más impresiones
- Comparativa con medios locales incluye tipos y valores
- Canales digitales y tradicionales en comparativas

## Ejecutar Tests

```bash
cd front

# Todos los tests
npx vitest run

# Modo watch
npx vitest

# Test específico
npx vitest run src/lib/sponsorship.test.ts

# Con cobertura
npx vitest run --coverage

# Verificación de tipos
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
   - `MetricTile` formatea valores grandes correctamente

2. **Tests E2E** (Playwright):
   - Flujo completo: Dashboard → Marketplace → Filtrar → Ver perfil → Calcular ROI → Proponer deal
   - Verificar plan de activación se genera correctamente por deporte
   - Verificar mapa de audiencias y segmentos

3. **Backend** (cuando SpacetimeDB soporte test runner):
   - Reducers con validación de errores
   - Límite de 10 búsquedas guardadas
   - Autorización por identity

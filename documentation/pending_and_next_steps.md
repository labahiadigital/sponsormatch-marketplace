# Tareas Pendientes y Próximos Pasos

## Estado Actual (Abril 2026)

MVP funcional con:
- Landing page estática completa
- Frontend SvelteKit con 5 páginas (Dashboard, Marketplace, Perfil Club, Deals, Messages)
- Backend SpacetimeDB con 6 tablas, 8 reducers y seed data de 20 clubes
- **73 tests unitarios** pasando (TDD estricto en lógica de negocio)
- 0 errores de tipos, 0 warnings de accesibilidad
- Repositorio en GitHub: https://github.com/labahiadigital/sponsormatch-marketplace

### Funcionalidades de Sponsorship Marketing (Nuevas)

Inspiradas en las 20 Reglas del Marketing y Patrocinio Deportivo de KairoSportMarketing:

| Funcionalidad | Archivo | Tests | Descripción |
|---|---|---|---|
| **Calculadora de ROI** | `sponsorship.ts` | 14 | Calcula valor mediático, ROI estimado, coste por impresión, alcance anual |
| **Match Score** | `sponsorship.ts` | (incluido) | Puntuación 0-100 de compatibilidad marca-club basada en presupuesto, engagement, objetivos |
| **Mapa de Audiencias** | `sponsorship.ts` | (incluido) | Segmentación demográfica: Digital Natives, Fans Casuales, Hardcore, Familias, Corporativo |
| **Plan de Activación** | `activation.ts` | 7 | Genera plan pre/durante/post-evento con acciones específicas por deporte y objetivos |
| **Métricas de Contenido** | `content-metrics.ts` | 6 | Impresiones, alcance mensual, valor mediático, posts recomendados |
| **Comparativa Medios** | `content-metrics.ts` | (incluido) | Compara alcance del club con prensa local, radio, TV y publicidad digital |
| **Territorio de Marca** | `stores.svelte.ts` | 4 | Territorio único, propósito superior, pilares de contenido, audiencias por club |

### Integración UI

La página de perfil de club (`/marketplace/[clubId]`) ahora incluye 5 pestañas:
1. **Resumen**: Métricas base + pilares de contenido + audiencias objetivo
2. **ROI y Métricas**: Calculadora de retorno + análisis consideración/conversión/crecimiento
3. **Audiencias**: Segmentación con barras visuales + mapa de audiencias del club
4. **Plan de Activación**: Plan completo pre/durante/post-evento con costes y canales
5. **Contenido**: Métricas tipo medio + comparativa con medios locales + estrategia

## Pendiente para Producción

### P0 - Crítico
- [ ] **Autenticación real**: Integrar SpacetimeDB identity con flujo de login
- [ ] **Conectar frontend a backend real**: Reemplazar datos mock con suscripciones SpacetimeDB
- [ ] **Bindings TypeScript**: Regenerar y usar `module_bindings/` generados por `spacetime generate`
- [ ] **Validación server-side**: Añadir validación robusta en reducers

### P1 - Importante
- [ ] **Perfil de marca personalizable**: Permitir al patrocinador configurar sector, presupuesto y objetivos para Match Score real
- [ ] **Filtrado server-side**: Implementar filtrado eficiente en SpacetimeDB usando índices B-tree
- [ ] **Paginación real**: Actualmente la paginación es client-side sobre mock data
- [ ] **Recomendaciones IA**: Implementar el servicio de recomendaciones (actualmente mock en frontend)
- [ ] **Subida de imágenes**: Logos y banners de clubes
- [ ] **Tests E2E**: Playwright para flujos completos
- [ ] **Tests de componentes Svelte**: Ampliar cobertura con `@testing-library/svelte`

### P2 - Mejora
- [ ] **Dashboard enriquecido**: Integrar ROI Calculator y Match Score en el dashboard principal
- [ ] **Exportar informes**: PDF con Plan de Activación + ROI + Métricas de Contenido
- [ ] **Storytelling**: Sección de storytelling magnético por club con narrativas editables
- [ ] **Contenido generado por fans (UGC)**: Integración con APIs de redes sociales
- [ ] **Notificaciones push**: WebSocket notifications para nuevos mensajes/deals
- [ ] **Internacionalización**: Soporte para inglés
- [ ] **SEO landing**: Meta tags dinámicos, schema markup, sitemap

### P3 - Nice to Have
- [ ] **Analíticas avanzadas**: Tracking de búsquedas, contactos, conversiones con medición por audiencia
- [ ] **Admin panel**: Gestión de clubes y marcas para administradores
- [ ] **Agenda mediática**: Calendario editorial integrado por club
- [ ] **CI/CD**: Pipeline de GitHub Actions (lint, test, build, deploy)
- [ ] **Despliegue**: Cloudflare Pages (landing), Cloudflare Workers (front), SpacetimeDB Cloud (back)
- [ ] **Monitoring**: Sentry para errores, métricas de rendimiento

## Decisiones Técnicas Pendientes

1. **¿SpacetimeDB Cloud o self-hosted?** - Evaluar costes y latencia
2. **¿Autenticación propia o tercero?** - Better Auth, Clerk, o SpacetimeDB identity nativo
3. **¿Cómo implementar IA de recomendaciones?** - Workers AI, OpenAI API, o modelo propio
4. **¿Cómo manejar imágenes?** - Cloudflare R2 es candidato natural si se despliega en CF
5. **¿Cómo generar informes PDF?** - Puppeteer, react-pdf, o generación server-side

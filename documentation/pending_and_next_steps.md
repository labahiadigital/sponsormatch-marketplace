# Tareas Pendientes y Próximos Pasos

## Estado Actual (Abril 2026)

MVP funcional con:
- Landing page estática completa
- Frontend SvelteKit con 5 páginas (Dashboard, Marketplace, Perfil Club, Deals, Messages)
- Backend SpacetimeDB con 6 tablas, 8 reducers y seed data de 20 clubes
- 42 tests unitarios pasando
- 0 errores de tipos, 0 warnings de accesibilidad
- Repositorio en GitHub: https://github.com/labahiadigital/sponsormatch-marketplace

## Pendiente para Producción

### P0 - Crítico
- [ ] **Autenticación real**: Integrar SpacetimeDB identity con flujo de login (email/contraseña o OAuth)
- [ ] **Conectar frontend a backend real**: Reemplazar datos mock en `stores.svelte.ts` con suscripciones SpacetimeDB reales
- [ ] **Bindings TypeScript**: Regenerar y usar `module_bindings/` generados por `spacetime generate`
- [ ] **Validación server-side**: Añadir validación robusta en reducers (longitudes, formatos, sanitización)

### P1 - Importante
- [ ] **Filtrado server-side**: Implementar filtrado eficiente en SpacetimeDB usando índices B-tree
- [ ] **Paginación real**: Actualmente la paginación es client-side sobre mock data
- [ ] **Recomendaciones IA**: Implementar el servicio de recomendaciones (actualmente mock en frontend)
- [ ] **Subida de imágenes**: Logos y banners de clubes (integrar R2, S3, o similar)
- [ ] **Responsive completo**: Verificar y ajustar todos los breakpoints en móvil y tablet
- [ ] **Tests E2E**: Playwright para flujos completos (buscar club → proponer deal → enviar mensaje)
- [ ] **Tests de componentes Svelte**: Ampliar cobertura con `@testing-library/svelte`

### P2 - Mejora
- [ ] **Notificaciones push**: WebSocket notifications para nuevos mensajes/deals
- [ ] **Dashboard con datos reales**: Métricas calculadas desde SpacetimeDB en lugar de mock
- [ ] **Gráficos de engagement**: Sparklines reales con datos históricos
- [ ] **Internacionalización**: Soporte para inglés (actualmente solo español)
- [ ] **Dark/Light mode toggle**: Actualmente solo dark mode
- [ ] **PWA**: Service worker para experiencia offline
- [ ] **SEO landing**: Meta tags dinámicos, schema markup, sitemap

### P3 - Nice to Have
- [ ] **Analíticas**: Integrar tracking de eventos (búsquedas, contactos, conversiones)
- [ ] **Admin panel**: Gestión de clubes y marcas para administradores
- [ ] **Rate limiting**: Proteger reducers contra abuso
- [ ] **CI/CD**: Pipeline de GitHub Actions (lint, test, build, deploy)
- [ ] **Despliegue**: Configurar Cloudflare Pages (landing), Cloudflare Workers (front), SpacetimeDB Cloud (back)
- [ ] **Monitoring**: Sentry para errores, métricas de rendimiento

## Decisiones Técnicas Pendientes

1. **¿SpacetimeDB Cloud o self-hosted?** - Evaluar costes y latencia
2. **¿Autenticación propia o tercero?** - Better Auth, Clerk, o SpacetimeDB identity nativo
3. **¿Cómo implementar IA de recomendaciones?** - Workers AI, OpenAI API, o modelo propio
4. **¿Cómo manejar imágenes?** - Cloudflare R2 es candidato natural si se despliega en CF

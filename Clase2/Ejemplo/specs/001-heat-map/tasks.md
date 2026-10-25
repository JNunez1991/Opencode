# Tasks — Mapa de calor (Heatmap)

Tareas pequeñas (≤ 30 min), en orden de dependencia. Cada una cubre RFs específicos y tiene criterio "Hecho cuando:" verificable.

---

## 1. Lógica pura: funciones de cálculo y formato (app.js)

- [x] **T1.1** Añadir constante `HEATMAP_WEEKS = 20` y función pura `calcularDatosHeatmap(sesiones, hoy)`
  - **RFs**: RF-1, RF-2, RF-5
  - **Hecho cuando:** `node --test` pasa test `calcularDatosHeatmap devuelve 140 días exactos` y `calcularDatosHeatmap semana actual completa hasta domingo`

- [x] **T1.2** Añadir función pura `obtenerColorHeatmap(minutos, maxMinutos)` con interpolación HSL
  - **RFs**: RF-3
  - **Hecho cuando:** `node --test` pasa tests `obtenerColorHeatmap 0 min → color base`, `obtenerColorHeatmap max min → acento 100% saturación`, `obtenerColorHeatmap max=0 → color base`

- [x] **T1.3** Añadir función pura `formatearFechaHeatmap(fechaISO)` forzando español `es-ES`
  - **RFs**: RF-4
  - **Hecho cuando:** `node --test` pasa test `formatearFechaHeatmap fuerza español` (ej. `"2026-10-15" → "15 oct 2026"`)

- [x] **T1.4** Añadir función pura `obtenerAriaLabelHeatmap(fechaISO, minutos)`
  - **RFs**: RF-7
  - **Hecho cuando:** `node --test` pasa tests `obtenerAriaLabelHeatmap sin actividad` y `obtenerAriaLabelHeatmap con minutos`

- [x] **T1.5** Añadir helpers locales de fecha (sin `toISOString`): `domingoDeLaSemana`, `sumarDía`, `restarDías`, `esFechaValida`
  - **RFs**: RF-1, RF-5 (casos límite: datos sucios)
  - **Hecho cuando:** `node --test` pasa test `localStorage corrupto → devuelve estructura vacía` y `calcularDatosHeatmap ignora sesiones fecha futura`

---

## 2. Tests unitarios (app.test.js)

- [x] **T2.1** Crear `app.test.js` importando funciones puras y ejecutar `node --test app.test.js` en verde
  - **RFs**: RF-1 a RF-5, RF-7
  - **Hecho cuando:** `node --test app.test.js` muestra 0 fallos (tests del plan §6.1)

---

## 3. Estructura HTML (index.html)

- [x] **T3.1** Añadir `<section class="heatmap-section">` tras `.streak-section` con: h2, wrapper, eje Y (L M X J V S D), grid vacío `role="grid" tabindex="0"`, leyenda con gradiente CSS
  - **RFs**: RF-1, RF-4, RF-6, RF-7, RNF-3
  - **Hecho cuando:** Abriendo `index.html` en navegador, la sección aparece bajo la racha, sin errores consola, estructura coincide con plan §4.1

---

## 4. Estilos CSS (styles.css)

- [x] **T4.1** Añadir estilos base del mapa: `.heatmap-section`, `.heatmap-wrapper`, `.heatmap-y-axis`, `.heatmap-grid` (grid 20×7, gap 2px, min-width max-content)
  - **RFs**: RF-1, RNF-3
  - **Hecho cuando:** En desktop (≥480px) el grid cabe en ≤640px con cuadrados 11-12px; en móvil (<480px) aparece scroll horizontal y cuadrados 10-12px

- [x] **T4.2** Añadir estilos de `.heatmap-day`: aspect-ratio 1, border-radius, color base `var(--paper)`, focus-visible/hover scale+z-index+sombra, `prefers-reduced-motion` sin transiciones
  - **RFs**: RF-3, RF-7, RNF-3
  - **Hecho cuando:** Botón día enfocado/hover crece y muestra sombra acento; con reduced-motion no hay transición

- [x] **T4.3** Añadir tooltip CSS-only (`::after` con `content: attr(data-tooltip)`) y leyenda `.heatmap-legend` con gradiente `linear-gradient(90deg, var(--paper), var(--accent))`
  - **RFs**: RF-4, RF-6
  - **Hecho cuando:** Hover/focus en día con minutos > 0 muestra tooltip "DD MMM AAAA — N min"; días con 0 min no muestran tooltip; leyenda visible con "Menos"/"Más" y barra gradiente

---

## 5. Render e interacción (app.js)

- [x] **T5.1** Añadir `renderHeatmap(datos)`: limpia grid, crea 140 `<button class="heatmap-day">` con `style.background-color`, `aria-label`, `data-fecha`, `data-minutos`, `data-tooltip` (solo si minutos>0 y no futuro/pre-historia), `data-es-futuro`, `data-es-prehistoria`
  - **RFs**: RF-1, RF-2, RF-3, RF-4, RF-5, RF-7
  - **Hecho cuando:** Recargando `index.html` con datos de prueba, 140 botones renderizados, colores según minutos, aria-labels correctos, tooltips solo en días válidos

- [x] **T5.2** Añadir `setupHeatmapInteraction()`: roving tabindex (contenedor tabindex=0, días tabindex=-1), flechas ←/→/↑/↓ mueven foco (±1 / ±7), Enter/Espacio en día con minutos>0 añade `.heatmap-day--tooltip-visible`, Escape quita clase
  - **RFs**: RF-7
  - **Hecho cuando:** Tab entra al mapa (1 tab stop), flechas navegan entre días, Enter/Espacio muestra tooltip persistente, Escape lo cierra, NVDA/VoiceOver lee aria-label correcto

---

## 6. Integración y verificación

- [x] **T6.1** En `refresh()`: llamar `renderHeatmap(calcularDatosHeatmap(sesiones, getTodayLocal()))` tras `updateStreak()`
  - **RFs**: RF-1 a RF-7
  - **Hecho cuando:** Tras registrar sesión y pulsar Guardar, mapa se actualiza con el nuevo día coloreado

- [x] **T6.2** Al final de `app.js` (fuera de funciones): llamar `setupHeatmapInteraction()` una sola vez
  - **RFs**: RF-7
  - **Hecho cuando:** Interacción funciona sin recargar; consola sin errores

- [x] **T6.3** Verificación manual completa (desktop + móvil): casos de TESTING.md §6.2
  - **RFs**: RF-1 a RF-7, RNF-1, RNF-3
  - **Hecho cuando:** Todos los casos de TESTING.md pasan: sin datos, una sesión, varias sesiones mismo día, 20 semanas, teclado, reduced-motion, zoom 150%, datos sucios

---

## 7. Documentación y cierre

- [x] **T7.1** Crear `specs/001-heat-map/TESTING.md` con casos de prueba manuales (tabla plan §6.2) y resumen tests unitarios
  - **RFs**: Todos
  - **Hecho cuando:** Archivo existe y lista todos los casos con pasos/resultado/RF

- [x] **T7.2** Actualizar `MEMORY.md`: decisión diseño (semana antigua izquierda, eje vertical L-D, HSL saturación, roving tabindex, tooltip CSS), aprendizajes, errores a evitar
  - **RFs**: Todos
  - **Hecho cuando:** MEMORY.md actualizado y breve (~50 líneas)
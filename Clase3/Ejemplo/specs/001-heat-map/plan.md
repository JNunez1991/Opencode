# Plan de Implementación — Mapa de calor (Heatmap)

## 1. Archivos creados / modificados y responsabilidades

| Archivo | Tipo | Responsabilidad | RFs cubiertos |
|---------|------|-----------------|---------------|
| `app.js` | Modificar | Añadir lógica pura (`calcularDatosHeatmap`, `obtenerColorHeatmap`, `formatearFechaHeatmap`), render (`renderHeatmap`), interacción (`setupHeatmapInteraction`), integración en `refresh()` | RF-1, RF-2, RF-3, RF-4, RF-5, RF-7 |
| `index.html` | Modificar | Añadir sección `<section class="heatmap-section">` con contenedor del mapa, eje vertical (días), eje horizontal (meses), leyenda | RF-1, RF-4, RF-6, RF-7 |
| `styles.css` | Modificar | Estilos del mapa: grid 20x7, cuadrados, colores HSL, tooltip CSS, leyenda gradiente, responsive scroll, reduced-motion, focus-visible | RF-3, RF-4, RF-6, RF-7, RNF-3 |
| `specs/001-heat-map/TESTING.md` | Crear | Casos de prueba manuales + tests unitarios node --test para funciones puras | RF-1 a RF-7, RNF-1 |

> **Principio Constitución #3**: Separación estricta — `app.js` exporta funciones puras (lógica) y funciones de render/interacción (DOM). `index.html` y `styles.css` solo estructura y presentación. Cero estilos en JS.

---

## 2. Funciones puras de lógica (en `app.js`)

Todas reciben `hoy` como parámetro (`string "AAAA-MM-DD"`) para testabilidad y evitar `new Date()` global.

```javascript
// Constante de configuración
const HEATMAP_WEEKS = 20;

// RF-1, RF-2, RF-5
// Calcula matriz 140 días (20 sem x 7 días) con minutos agregados por día
// Devuelve: { dias: Array<{ fecha: string, minutos: number, esFuturo: boolean, esPreHistoria: boolean }>, maxMinutos: number, fechaInicio: string, fechaFin: string }
function calcularDatosHeatmap(sesiones, hoy) { ... }

// RF-3
// Devuelve color HSL string: "hsl(h, s%, l%)" donde h = matiz acento (fijo), s = saturación interpolada
// Si maxMinutos === 0 → devuelve color base (--paper)
function obtenerColorHeatmap(minutos, maxMinutos) { ... }

// RF-4, RF-7
// Devuelve string "DD MMM AAAA" en español forzado (ej. "15 oct 2026")
function formatearFechaHeatmap(fechaISO) { ... }

// RF-7
// Devuelve string para aria-label: "DD MMM AAAA, N minutos estudiados" o "DD MMM AAAA, sin actividad"
function obtenerAriaLabelHeatmap(fechaISO, minutos) { ... }
```

---

## 3. Algoritmo del mapa (pseudocódigo)

```
FUNCIÓN calcularDatosHeatmap(sesiones, hoy):
    // RF-1: Rango fijo 20 semanas, lunes-domingo, termina domingo semana actual
    finRango ← domingoDeLaSemana(hoy)                    // RF-1
    inicioRango ← restarDías(finRango, 139)              // 140 días = 20 sem * 7

    // RF-2: Agregar minutos por día (filtrar futuras y datos sucios)
    mapaMinutos ← Map<string, number> vacío
    primeraSesionValida ← null
    PARA cada sesión EN sesiones:
        SI sesión.fecha > hoy: CONTINUAR                 // RF-5: ignorar futuras
        SI no válida(sesión): CONTINUAR                  // Caso límite: datos sucios
        mapaMinutos[sesión.fecha] ← (mapaMinutos[sesión.fecha] O 0) + sesión.minutos
        SI primeraSesionValida ES null O sesión.fecha < primeraSesionValida:
            primeraSesionValida ← sesión.fecha

    maxMinutos ← MAX(valores(mapaMinutos)) O 0

    // Construir array ordenado 140 días (lunes→domingo, semana más antigua primero)
    dias ← ARRAY VACÍO
    fechaActual ← inicioRango
    MIENTRAS fechaActual ≤ finRango:
        minutos ← mapaMinutos[fechaActual] O 0
        esFuturo ← fechaActual > hoy
        esPreHistoria ← primeraSesionValida ≠ null Y fechaActual < primeraSesionValida
        dias.AGREGAR({ fecha: fechaActual, minutos, esFuturo, esPreHistoria })
        fechaActual ← sumarDía(fechaActual)

    // RF-6: Preparar datos para leyenda (valores en 33% y 66% del max)
    marcasLeyenda ← SI maxMinutos > 0 ENTONCES
        [ redondear(maxMinutos * 0.33), redondear(maxMinutos * 0.66), maxMinutos ]
    SINO [0, 0, 0]

    DEVOLVER { dias, maxMinutos, fechaInicio: inicioRango, fechaFin: finRango, marcasLeyenda }
```

**Notas clave:**
- Semana más antigua = izquierda (estilo GitHub) — resuelve duda pendiente
- `domingoDeLaSemana(hoy)`: si hoy es lunes, domingo = hoy + 6; si hoy es domingo, domingo = hoy
- `restarDías`/`sumarDía` usan `new Date(año, mes-1, día ± n)` en zona local (consistente con `getTodayLocal()`)

---

## 4. Cómo se pinta en la interfaz

### 4.1 Estructura HTML (añadir en `index.html` tras `.streak-section`)

```html
<section class="heatmap-section" aria-label="Mapa de calor de actividad de 20 semanas">
  <h2>Actividad reciente</h2>
  <div class="heatmap-wrapper">
    <!-- Eje vertical: días L M X J V S D -->
    <div class="heatmap-y-axis" aria-hidden="true">
      <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
    </div>
    <!-- Grid del mapa -->
    <div class="heatmap-grid" role="grid" tabindex="0" aria-roledescription="mapa de calor">
      <!-- 140 <button class="heatmap-day" data-fecha="..." data-minutos="..."> generados por JS -->
    </div>
  </div>
  <!-- Leyenda RF-6 -->
  <div class="heatmap-legend" aria-hidden="true">
    <span class="heatmap-legend-label">Menos</span>
    <div class="heatmap-legend-gradient" style="background: linear-gradient(90deg, var(--paper), var(--accent))"></div>
    <span class="heatmap-legend-label">Más</span>
    <!-- Marcas intermedias opcionales inyectadas por JS -->
  </div>
</section>
```

### 4.2 Render (en `app.js` → `renderHeatmap(datos)`)

1. Limpiar `.heatmap-grid`
2. Para cada `dia` en `datos.dias`:
   - Crear `<button class="heatmap-day" role="gridcell" tabindex="-1" data-fecha="..." data-minutos="...">`
   - `style.background-color = obtenerColorHeatmap(dia.minutos, datos.maxMinutos)`
   - `aria-label = obtenerAriaLabelHeatmap(dia.fecha, dia.minutos)`
   - Si `dia.minutos === 0` O `dia.esFuturo` O `dia.esPreHistoria`: sin tooltip (CSS `pointer-events: none` en `::before`/`::after`)
3. Inyectar marcas de leyenda en `.heatmap-legend` si `datos.maxMinutos > 0`

### 4.3 Interacción (en `app.js` → `setupHeatmapInteraction()`)

- **Roving tabindex**: Contenedor `tabindex="0"`, días `tabindex="-1"`. Flechas mueven foco entre días (índice ±1 horizontal, ±7 vertical). Enter/Espacio en día con `minutos > 0` → añade clase `.heatmap-day--tooltip-visible` (tooltip persistente). Escape → quita clase.
- **Hover**: CSS `:hover` + `:focus-within` muestra tooltip (pseudo-elemento `::after` con `content: attr(data-tooltip)`).
- **Tooltip content**: `data-tooltip="formatearFechaHeatmap(fecha) + ' — ' + minutos + ' min'"` solo si `minutos > 0` Y no `esFuturo` Y no `esPreHistoria`.

### 4.4 CSS clave (`styles.css`)

```css
.heatmap-section { /* igual que .form-section: papel, borde, sombra */ }
.heatmap-wrapper { display: flex; gap: var(--space-2); overflow-x: auto; }
.heatmap-y-axis { display: grid; grid-template-rows: repeat(7, 1fr); gap: 2px; font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-light); text-transform: uppercase; }
.heatmap-grid { display: grid; grid-template-columns: repeat(20, 1fr); grid-template-rows: repeat(7, 1fr); gap: 2px; min-width: max-content; }
.heatmap-day { aspect-ratio: 1; border: none; border-radius: var(--radius-sm); background: var(--paper); cursor: default; transition: transform 0.1s, box-shadow 0.1s; position: relative; }
.heatmap-day[data-minutos="0"], .heatmap-day[data-es-futuro="true"], .heatmap-day[data-es-prehistoria="true"] { pointer-events: none; }
.heatmap-day:focus-visible, .heatmap-day:hover { transform: scale(1.3); z-index: 1; box-shadow: 0 0 0 2px var(--accent); outline: none; }
.heatmap-day::after { content: attr(data-tooltip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); padding: var(--space-1) var(--space-2); background: var(--ink); color: var(--paper); font-size: 0.6875rem; font-family: var(--font-mono); border-radius: var(--radius-sm); white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.15s; }
.heatmap-day:hover::after, .heatmap-day:focus::after, .heatmap-day--tooltip-visible::after { opacity: 1; }
.heatmap-legend { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-3); font-family: var(--font-mono); font-size: 0.625rem; color: var(--ink-muted); }
.heatmap-legend-gradient { flex: 1; height: 6px; border-radius: var(--radius-sm); }
@media (prefers-reduced-motion: reduce) { .heatmap-day { transition: none; } }
@media (max-width: 480px) { .heatmap-day { width: 10px; height: 10px; } }
```

---

## 5. Decisiones técnicas justificadas

| Decisión | Justificación | Alternativa descartada |
|----------|---------------|------------------------|
| **Semana más antigua a la izquierda** (GitHub style) | Estándar de facto, usuarios lo esperan; cronología natural izquierda→derecha | Más reciente a la izquierda: requiere inversión mental, rompe convención |
| **Eje vertical con etiquetas L M X J V S D** | RNF-3 lo especifica; accesibilidad: screen reader anuncia fila | Solo puntos: pierde referencia de día de semana |
| **Interpolación HSL (matiz fijo, saturación variable)** | Perceptualmente uniforme para "intensidad"; --accent ya definido en design system | RGB lineal: bandas de color feas; Opacidad sobre acento: no funciona sobre fondos variables |
| **`<button>` por día (no `<div>`)** | RF-7: nativamente enfocable, activable con Enter/Espacio, semántica correcta | `<div tabindex="0">`: requiere más ARIA, no activa con Enter nativamente |
| **Roving tabindex (1 tab stop)** | RF-7: 140 tab stops inmanejables; patrón WAI-ARIA Grid recomendado | Tabindex en cada día: fatiga de tabulación, falla criterio WCAG 2.4.3 |
| **Tooltip CSS-only (pseudo-elemento `::after`)** | Constitución #1: sin librerías; 0 JS para mostrar/ocultar; funciona en hover + focus | JS tooltip library / custom divs: añade complejidad, rompe separación |
| **Leyenda gradiente CSS `linear-gradient`** | Nativo, 0 JS, responsive automático | Canvas / SVG / librería: overkill, rompe Constitución #1 |
| **Funciones puras con `hoy` inyectado** | Testable con node --test; evita `new Date()` global; consistente con `local-dates` skill | Leer `getTodayLocal()` dentro: no testable unitariamente, acopla a hora real |
| **Validación defensiva en `calcularDatosHeatmap`** | Constitución #5: datos sagrados, compatibilidad hacia atrás; ignora sesiones corruptas/futuras | Asumir datos limpios: frágil, rompe con localStorage manipulado |

---

## 6. Estrategia de tests

### 6.1 Tests unitarios con `node --test` (archivo `app.test.js`)

Solo funciones puras (sin DOM). Ejecutar: `node --test app.test.js`

```javascript
// app.test.js — solo importar funciones puras (requiere exponerlas o usar IIFE pattern)
const { calcularDatosHeatmap, obtenerColorHeatmap, formatearFechaHeatmap, obtenerAriaLabelHeatmap } = require('./app.js'); // o patrón módulo simple

// RF-1: Rango temporal
test('calcularDatosHeatmap devuelve 140 días exactos', () => {
  const hoy = '2026-10-24'; // sábado
  const res = calcularDatosHeatmap([], hoy);
  assert.strictEqual(res.dias.length, 140);
  assert.strictEqual(res.fechaInicio, '2026-06-08'); // lunes 20 sem atrás
  assert.strictEqual(res.fechaFin, '2026-10-25');    // domingo semana actual
});

test('calcularDatosHeatmap semana actual completa hasta domingo', () => {
  const hoy = '2026-10-21'; // miércoles
  const res = calcularDatosHeatmap([], hoy);
  assert.strictEqual(res.fechaFin, '2026-10-25'); // domingo, no miércoles
});

// RF-2: Agregación
test('suma minutos de varias sesiones mismo día', () => {
  const sesiones = [{fecha:'2026-10-20',minutes:30},{fecha:'2026-10-20',minutes:15}];
  const res = calcularDatosHeatmap(sesiones, '2026-10-24');
  const dia = res.dias.find(d => d.fecha === '2026-10-20');
  assert.strictEqual(dia.minutos, 45);
});

// RF-3: Color
test('obtenerColorHeatmap 0 min → color base (--paper)', () => {
  const color = obtenerColorHeatmap(0, 100);
  assert.ok(color.startsWith('hsl('));
  // saturación = 0% → gris/color base
});

test('obtenerColorHeatmap max min → acento 100% saturación', () => {
  const color = obtenerColorHeatmap(60, 60);
  assert.ok(color.includes('100%')); // saturación máxima
});

test('obtenerColorHeatmap max=0 → color base', () => {
  const color = obtenerColorHeatmap(0, 0);
  assert.ok(color.startsWith('hsl('));
});

// RF-4: Formato fecha español
test('formatearFechaHeatmap fuerza español', () => {
  assert.strictEqual(formatearFechaHeatmap('2026-10-15'), '15 oct 2026');
  assert.strictEqual(formatearFechaHeatmap('2026-01-03'), '3 ene 2026');
});

// RF-5: Días futuros y pre-historia
test('calcularDatosHeatmap marca esFuturo=true para días > hoy', () => {
  const hoy = '2026-10-24';
  const res = calcularDatosHeatmap([], hoy);
  const manana = res.dias.find(d => d.fecha === '2026-10-25');
  assert.strictEqual(manana.esFuturo, true);
});

test('calcularDatosHeatmap ignora sesiones fecha futura', () => {
  const sesiones = [{fecha:'2099-01-01',minutes:100}];
  const res = calcularDatosHeatmap(sesiones, '2026-10-24');
  assert.strictEqual(res.maxMinutos, 0);
});

// RF-7: aria-label
test('obtenerAriaLabelHeatmap sin actividad', () => {
  assert.strictEqual(obtenerAriaLabelHeatmap('2026-10-15', 0), '15 oct 2026, sin actividad');
});
test('obtenerAriaLabelHeatmap con minutos', () => {
  assert.strictEqual(obtenerAriaLabelHeatmap('2026-10-15', 45), '15 oct 2026, 45 minutos estudiados');
});

// Casos límite
test('localStorage corrupto → devuelve estructura vacía', () => {
  const res = calcularDatosHeatmap(null, '2026-10-24');
  assert.strictEqual(res.dias.length, 140);
  assert.strictEqual(res.maxMinutos, 0);
});
```

### 6.2 Tests manuales (documentar en `TESTING.md`)

| Caso | Pasos | Resultado esperado | RF |
|------|-------|-------------------|----|
| Usuario sin datos | Abrir index.html, localStorage vacío | Mapa todo color base, leyenda "Menos/Más", sin errores | RF-1, RF-3, RF-6, HU-3 |
| Una sesión hoy | Registrar 45 min hoy, refresh | Hoy color acento, resto base, tooltip "24 oct 2026 — 45 min" | RF-2, RF-3, RF-4 |
| Varias sesiones mismo día | Registrar 30+15 min misma fecha | Día suma 45, color intermedio | RF-2 |
| 20 semanas completas | Poblar 140 días con datos variados | Mapa lleno, gradiente visible, scroll horizontal en móvil | RF-1, RNF-3 |
| Navegación teclado | Tab → foco en mapa, flechas mueven, Enter muestra tooltip, Escape cierra | Roving tabindex funciona, aria-label leído por NVDA/VoiceOver | RF-7 |
| Reduced motion | Activar "reducir animaciones" en OS | Sin transiciones hover/focus, tooltip instantáneo | Caso límite |
| Zoom 150% | Ctrl++ en navegador | Layout no rompe, scroll horizontal aparece | Caso límite |
| Datos sucios en localStorage | Editar localStorage → añadir sesión fecha futura / sin minutes | Mapa ignora dato sucio, no rompe, consola silenciosa | Caso límite |

---

## 7. Integración en flujo existente

En `app.js`, dentro de `refresh()`:

```javascript
function refresh() {
    const sesiones = loadSessions();
    renderSessions(sesiones);      // existente
    updateStreak();                // existente
    renderHeatmap(calcularDatosHeatmap(sesiones, getTodayLocal())); // NUEVO
}
```

Y al final del script (fuera de `refresh`):

```javascript
setupHeatmapInteraction(); // delegación de eventos en .heatmap-grid
```

---

## 8. Checklist de cumplimiento Constitución

- [ ] **#1 Stack mínimo**: Solo HTML/CSS/JS, sin build, abre con doble clic
- [ ] **#2 Spec = código**: Plan deriva 1:1 de spec.md; cualquier desviación actualiza spec primero
- [ ] **#3 Separación estricta**: Funciones puras separadas de render/interacción; 0 estilos en JS
- [ ] **#4 Tests sin instalar**: `node --test` para lógica; manual para UI (documentado en TESTING.md)
- [ ] **#5 Datos sagrados**: `calcularDatosHeatmap` valida y ignora datos sucios; no toca localStorage
- [ ] **#6 Idioma único**: Nombres en español (`calcularDatosHeatmap`, `fecha`, `minutos`); `es-ES` forzado en fechas
- [ ] **Fechas locales**: Usa `getTodayLocal()` y `new Date(año, mes-1, día)` — nunca `toISOString()` ni `new Date("ISO")`

---

## 9. Dudas pendientes (resueltas en este plan)

- **Orden semanas**: Más antigua izquierda (GitHub) — implementado en pseudocódigo y grid CSS `repeat(20, 1fr)` left-to-right
- **Etiquetas eje vertical**: Incluidas (L M X J V S D) — implementado en HTML y CSS `.heatmap-y-axis`

---

## 10. Próximos pasos

1. Aprobar plan
2. Implementar funciones puras + tests node
3. Implementar HTML + CSS
4. Implementar render + interacción en app.js
5. Verificar manualmente (desktop + móvil)
6. Actualizar `MEMORY.md` y `TESTING.md`
# Plan — Objetivo semanal de estudio

## 1. Resumen de la feature
Añadir una sección bajo el heatmap que permita fijar un objetivo semanal de minutos (lunes–domingo), muestre minutos acumulados esta semana, barra de progreso con marca de día actual centrada, y porcentaje completado. El objetivo persiste en localStorage (clave `diario-estudio-objetivo-semanal`) y el progreso se recalcula al añadir/borrar sesiones o al cambiar de semana.

## 2. Archivos a modificar/crear
- `index.html` — Nueva sección HTML bajo heatmap, antes del formulario
- `styles.css` — Estilos de la sección, barra de progreso, marca de día, responsive, accesibilidad
- `app.js` — Funciones puras, render, event handlers, integración con flujo existente

## 3. Cambios en `index.html`
Nueva sección `<section id="objetivo-semanal" class="card">` insertada tras `#heatmap` y antes de `#formulario-sesion`:
```
<h2>Objetivo semanal</h2>
<div class="objetivo-header">
  <label for="objetivo-semanal-input">Objetivo semanal</label>
  <input type="number" id="objetivo-semanal-input" min="0" max="10080" step="1" placeholder="Minutos/semana (ej. 300)" aria-describedby="objetivo-actual-texto objetivo-porcentaje-texto">
</div>
<div class="objetivo-progreso">
  <span id="objetivo-actual-texto">Esta semana: 0 min / — min</span>
  <span id="objetivo-porcentaje-texto">—%</span>
</div>
<div class="barra-contenedor" role="progressbar" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-label="Progreso objetivo semanal: 0 minutos (sin objetivo)">
  <div class="barra-progreso" id="barra-progreso"></div>
  <div class="marca-dia" id="marca-dia" aria-hidden="true"></div>
</div>
```

## 4. Cambios en `styles.css`
- **Tokens CSS nuevos** (en `:root`): `--marca-posicion` (custom property dinámica), `--color-marca-dia: hsl(210, 35%, 50%)`
- **Layout**: `.objetivo-header` (flex, gap), `.objetivo-progreso` (flex, justify-between), `.barra-contenedor` (relative, height 12px, background `--line`, border-radius)
- **Barra**: `.barra-progreso` (height 100%, background `--accent`, transition width 0.3s, `prefers-reduced-motion` → 0s)
- **Marca de día**: `.marca-dia` (absolute, top 0, bottom 0, width 1px, background `var(--color-marca-dia)`, opacity 0.8, `left: var(--marca-posicion)`)
- **Responsive**: `< 480px` → stack vertical (input 100%, textos apilados, barra ancho completo); `≥ 480px` → horizontal compacta
- **Accesibilidad**: focus visible en input, contraste WCAG AA (teal `--accent` sobre `--paper`), `aria-*` respetados en HTML

## 5. Cambios en `app.js`

### Funciones puras nuevas (export condicional `if (typeof module !== 'undefined')`)
```js
function obtenerDiaSemanaISO(hoy) { /* 1=lun..7=dom usando getDay() mapeado */ }
function obtenerLunesSemana(hoy) { /* retorna Date local lunes 00:00 de la semana de hoy */ }
function obtenerDomingoSemana(hoy) { /* retorna Date local domingo 23:59 de la semana de hoy */ }
function calcularMinutosSemana(sesiones, hoy) { /* suma minutos sesiones entre lunes y domingo inclusive, ignora futuras */ }
function validarObjetivoSemanal(valor) { /* retorna {valido: bool, valor: number|null} */ }
function calcularPorcentajeProgreso(actual, objetivo) { /* retorna number|null (null si objetivo=0) */ }
function calcularPosicionMarcaDia(hoy) { /* retorna number 0-100: ((diaSemana-0.5)/7)*100 */ }
```

### Render
```js
function renderObjetivoSemanal(objetivo, minutosSemana, hoy) {
  // actualiza DOM: input value, textos, barra width, aria-*, marca día position
}
```

### Event handlers
```js
function setupObjetivoSemanal() {
  // blur/Enter en #objetivo-semanal-input → validarObjetivoSemanal → guardar localStorage → renderObjetivoSemanal
}
```

### Integración
- `init()` → `cargarObjetivoSemanal()` → `renderObjetivoSemanal(objetivo, calcularMinutosSemana(sesiones, hoy), hoy)`
- `guardarSesion()` → tras guardar → `renderObjetivoSemanal(objetivoActual, calcularMinutosSemana(sesiones, hoy), hoy)`
- `borrarSesion()` → tras borrar → `renderObjetivoSemanal(...)`
- `cargarObjetivoSemanal()` → lectura defensiva localStorage → number finito ≥ 0 o 0

### localStorage
- Clave: `diario-estudio-objetivo-semanal`
- Lectura: `Number(localStorage.getItem(...))` + validación `isFinite` + `>= 0`
- Escritura: solo si válido; catch cuota excedida → console.error silencioso

## 6. Verificación manual (pasos para RF-1 a RF-8)
| RF | Pasos |
|----|-------|
| RF-1 | Abrir index.html → escribir 300 en input → Tab/Enter → recargar → input muestra 300, localStorage tiene 300 |
| RF-2 | Añadir sesiones lunes, miércoles, domingo → verificar "Esta semana: X min / 300 min" suma correcta; añadir sesión fecha futura → no suma |
| RF-3 | Con objetivo 300 y 150 min → barra 50%, marca día en posición según hoy, % = 50%, texto "150 min / 300 min" |
| RF-4 | Con objetivo activo → añadir sesión → barra/texto/% actualizan sin recargar; borrar sesión → actualizan |
| RF-5 | Escribir "abc" → blur → input recupera valor anterior; escribir -5 → rechaza; escribir 15000 → guarda 10080 |
| RF-6 | Borrar localStorage clave → recargar → input vacío (placeholder), barra vacía, "— min / —%" |
| RF-7 | Tab hasta input → editable; inspeccionar barra → role="progressbar", aria-* correctos; marca día → aria-hidden="true" |
| RF-8 | localStorage con "abc" o null → recargar → trata como 0, NO sobrescribe storage |

## 7. Riesgos y mitigaciones
| Riesgo | Mitigación |
|--------|------------|
| Fecha local / UTC | Usar `getTodayLocal()` existente; helpers nuevos usan `setDate`/`getDay()` sin milisegundos ni `toISOString` |
| Accesibilidad | `role="progressbar"` con `aria-valuemin/max/now/label`, `aria-describedby` en input, `aria-hidden="true"` en marca día, contraste verificado |
| Responsive móvil | Flex wrap en contenedor, `min-width: 0` en input/barra, media query 480px |
| Datos sucios localStorage | Lectura defensiva: `isFinite(Number(val)) && val >= 0`; inválido → 0 en memoria, NO write |
| Cambio de semana | `calcularMinutosSemana` usa `obtenerLunesSemana(hoy)`/`obtenerDomingoSemana(hoy)` con `hoy` inyectado → correcto al recargar o nueva sesión |
| prefers-reduced-motion | `.barra-progreso { transition: width 0.3s; } @media (prefers-reduced-motion: reduce) { transition: none; }` |
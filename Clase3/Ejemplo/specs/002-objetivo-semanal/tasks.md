# Tasks — Objetivo semanal de estudio

## T1: Funciones puras de semana ISO y cálculos
**Archivos**: `app.js` (arriba, antes de lógica de UI)
**Qué hace**: Implementar `obtenerDiaSemanaISO(hoy)`, `obtenerLunesSemana(hoy)`, `obtenerDomingoSemana(hoy)`, `calcularMinutosSemana(sesiones, hoy)`, `validarObjetivoSemanal(valor)`, `calcularPorcentajeProgreso(actual, objetivo)`, `calcularPosicionMarcaDia(hoy)`. Export condicional `if (typeof module !== 'undefined') { module.exports = { ... } }`.
**Criterio (Hecho cuando)**: Funciones puras reciben `hoy` y `sesiones` como parámetros, sin acceso a DOM ni localStorage. `calcularMinutosSemana` ignora fechas futuras y sesiones inválidas. `validarObjetivoSemanal` recorta a 10080. `calcularPosicionMarcaDia` retorna 0-100 centrado en día (lunes ~7%, dom ~93%).
**RF**: RF-2, RF-5

## T2: Lectura/escritura localStorage objetivo semanal
**Archivos**: `app.js`
**Qué hace**: `cargarObjetivoSemanal()` → lectura defensiva clave `diario-estudio-objetivo-semanal` → retorna number finito ≥ 0 o 0 (sin mutar storage si inválido). `guardarObjetivoSemanal(valor)` → valida con `validarObjetivoSemanal` → `localStorage.setItem` con try/catch cuota excedida.
**Criterio**: Sin clave o valor inválido → retorna 0, NO escribe. Valor válido → persiste como number. Error cuota → console.error silencioso, no rompe app.
**RF**: RF-1, RF-8

## T3: Render de la sección objetivo semanal
**Archivos**: `app.js`
**Qué hace**: `renderObjetivoSemanal(objetivo, minutosSemana, hoy)` → actualiza DOM: `#objetivo-semanal-input` value (vacío si objetivo=0), `#objetivo-actual-texto` ("X min / Y min" o "X min / — min"), `#objetivo-porcentaje-texto` (Z% o —%), `.barra-progreso` width `%`, `aria-valuenow/max/label` en `.barra-contenedor`, `--marca-posicion` en `.marca-dia`.
**Criterio**: Objetivo 0 → input vacío, barra 0%, textos con "—", `aria-valuemax=0`, `aria-valuenow=0`, label "(sin objetivo)". Objetivo > 0 → valores correctos, barra capada a 100%, marca día posicionada.
**RF**: RF-3, RF-7

## T4: HTML — Sección objetivo semanal bajo heatmap
**Archivos**: `index.html`
**Qué hace**: Insertar `<section id="objetivo-semanal" class="card">` tras `#heatmap` y antes de `#formulario-sesion` con estructura exacta del plan (h2, label+input, textos, barra-contenedor con barra-progreso y marca-dia). IDs y atributos ARIA según spec.
**Criterio**: Estructura válida, IDs únicos coinciden con `renderObjetivoSemanal` y `setupObjetivoSemanal`. Input `type="number" min="0" max="10080" step="1" placeholder="Minutos/semana (ej. 300)" aria-describedby="objetivo-actual-texto objetivo-porcentaje-texto"`. Barra `role="progressbar"` con `aria-valuemin="0"`. Marca día `aria-hidden="true"`.
**RF**: RF-3, RF-6, RF-7

## T5: CSS — Estilos objetivo semanal, barra, marca día, responsive
**Archivos**: `styles.css`
**Qué hace**: Añadir tokens `--color-marca-dia: hsl(210, 35%, 50%)` en `:root`. Estilos `.objetivo-header`, `.objetivo-progreso`, `.barra-contenedor`, `.barra-progreso`, `.marca-dia` (absolute, `left: var(--marca-posicion)`, width 1px, background `var(--color-marca-dia)`, opacity 0.8). Transición barra 0.3s + `prefers-reduced-motion: reduce` → none. Media query `< 480px` stack vertical, `≥ 480px` horizontal compacta. Focus visible input. Contraste WCAG AA.
**Criterio**: Barra teal (`--accent`) sobre papel (`--paper`). Marca día teal 35% sat 50% lum opacidad 0.8 centrada vía `--marca-posicion`. Móvil: input 100%, textos apilados, barra ancho completo. Desktop: fila compacta. Sin sombras pesadas.
**RF**: RF-3, RF-5, RF-7, RNF-4, RNF-5

## T6: Event handlers — Input objetivo (blur/Enter, validación, guardado)
**Archivos**: `app.js`
**Qué hace**: `setupObjetivoSemanal()` → listener `blur` y `keydown` (Enter) en `#objetivo-semanal-input` → `validarObjetivoSemanal` → si válido: `guardarObjetivoSemanal` + `renderObjetivoSemanal`; si inválido: restaurar input a último valor válido conocido (variable módulo `ultimoObjetivoValido`).
**Criterio**: Blur/Enter guarda solo si válido. Inválido → input recupera valor anterior sin guardar. Variable `ultimoObjetivoValido` inicializada en `cargarObjetivoSemanal`.
**RF**: RF-1, RF-5

## T7: Integración — Llamar render en init, guardarSesion, borrarSesion, cargarObjetivoSemanal
**Archivos**: `app.js`
**Qué hace**: En `init()`: `const objetivo = cargarObjetivoSemanal(); renderObjetivoSemanal(objetivo, calcularMinutosSemana(sesiones, hoy), hoy); setupObjetivoSemanal();`. En `guardarSesion()` y `borrarSesion()`: tras operación → `renderObjetivoSemanal(objetivoActual, calcularMinutosSemana(sesiones, hoy), hoy)`. `cargarObjetivoSemanal` ya existe (T2).
**Criterio**: Progreso actualiza sin recargar al añadir/borrar sesión. Al cargar app muestra objetivo guardado y minutos semana correctos. `hoy` = `getTodayLocal()` inyectado.
**RF**: RF-3, RF-4

## T8: Verificación manual completa (desktop y móvil)
**Archivos**: `index.html` (abrir en navegador), `TESTING.md` (documentar casos)
**Qué hace**: Ejecutar casos de prueba de la tabla "Verificación manual" del plan.md (RF-1 a RF-8). Probar en desktop (≥480px) y móvil (<480px, DevTools device toolbar). Verificar: fijar objetivo, ver progreso, añadir/borrar sesiones, recargar, cambiar semana (simular lunes), marca día posición centrada, accesibilidad (Tab, ARIA, contraste), prefers-reduced-motion, zoom 150%.
**Criterio**: Todos los RF verificados manualmente. Sin errores consola. Layout no rompe en móvil/zoom. Marca día: lunes ~7%, miércoles ~36%, domingo ~93%. `TESTING.md` actualizado con resultados.
**RF**: RF-1 a RF-8, RNF-3, RNF-4, RNF-5, RNF-6
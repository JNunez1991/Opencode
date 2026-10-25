# Especificación — Objetivo semanal de estudio

## Contexto y objetivo
Añadir la posibilidad de fijar un objetivo semanal de minutos de estudio (lunes a domingo) y mostrar el progreso hacia ese objetivo en tiempo real. El usuario podrá editar el objetivo, ver los minutos acumulados esta semana, una barra de progreso visual con una marca de progreso teórico según el día de la semana, y el porcentaje completado. El objetivo se persiste en localStorage y el progreso se recalcula automáticamente al registrar/eliminar sesiones. El propósito es motivar la constancia semanal mediante una meta visible y cuantificable.

## Usuarios
- Estudiante autodidacta que registra sesiones diarias y quiere una meta semanal concreta para mantener el ritmo.
- Usuario que estudia en bloques irregulares y necesita ver "cuánto le falta" para cerrar la semana.

## Historias de usuario
1. **HU-1**: Como usuario, quiero establecer un objetivo semanal de minutos (ej. 300 min/semana) para tener una meta clara cada semana.
2. **HU-2**: Como usuario, quiero ver cuántos minutos llevo acumulados esta semana (lunes–domingo) y una barra de progreso con porcentaje y marca de día actual para saber si voy por buen camino.
3. **HU-3**: Como usuario nuevo, quiero ver el input de objetivo siempre visible (vacío o 0 = "sin objetivo") para poder activarlo cuando decida sin pasos extra.

## Requisitos funcionales

### RF-1: Persistencia del objetivo semanal
**DADO** que el usuario introduce un número entero ≥ 0 en el campo de objetivo **CUANDO** sale del campo (blur) o pulsa Enter **Y el valor es válido** (entero ≥ 0, ≤ 10080) **ENTONCES** el valor se guarda en localStorage bajo la clave `diario-estudio-objetivo-semanal` como número (minutos). Valor 0 significa "sin objetivo activo". Si el valor es inválido, no se guarda y el input recupera el último valor válido conocido (o queda vacío si no hay previo).

### RF-2: Cálculo de minutos acumulados esta semana (lunes–domingo)
**DADO** el array de sesiones en localStorage y una fecha de referencia `hoy` **CUANDO** se calcula el progreso **ENTONCES** se suman los minutos de todas las sesiones cuya fecha cae entre el lunes (inclusive) y el domingo (inclusive) de la semana de `hoy`. La semana sigue convención ISO (lunes=1, domingo=7). Varias sesiones el mismo día se suman. Sesiones con fecha futura (respecto a `hoy`) se ignoran. **Usa `obtenerLunesSemana(hoy)` y `obtenerDomingoSemana(hoy)`** para delimitar el rango.

### RF-3: Visualización del objetivo y progreso
**DADO** un objetivo guardado ≥ 0 y los minutos acumulados esta semana **CUANDO** se renderiza la sección **ENTONCES** se muestra:
- Etiqueta "Objetivo semanal"
- Input numérico editable con el objetivo actual (minutos, entero ≥ 0), placeholder "Minutos/semana (ej. 300)", `id="objetivo-semanal-input"`
- Texto "Esta semana: X min / Y min" (actual / objetivo), `id="objetivo-actual-texto"`. Si objetivo = 0: "Esta semana: X min / — min"
- Barra de progreso horizontal: ancho proporcional a `min(actual, objetivo) / objetivo` (máx 100%). Si objetivo = 0: barra vacía (0%).
- **Marca de progreso teórico (día actual)**: línea vertical fina en la barra posicionada en `% = ((díaSemana - 0.5) / 7) * 100`, donde `díaSemana = obtenerDiaSemanaISO(hoy)` (1 = lunes .. 7 = domingo). Solo visual, no afecta al % real ni al `aria-valuenow`.
- Porcentaje completado: `Math.min(100, Math.round(actual / objetivo * 100))%`, `id="objetivo-porcentaje-texto"`. Si objetivo = 0: "—%".

### RF-4: Actualización automática al cambiar sesiones
**CUANDO** el usuario añade, edita o borra una sesión **ENTONCES** la barra de progreso, el contador, el porcentaje y la marca de día actual se recalculan y re-renderizan inmediatamente sin recargar la página. **`renderObjetivoSemanal` se llama desde: `guardarSesion`, `borrarSesion`, `cargarObjetivoSemanal`, `init`/carga inicial.**

### RF-5: Validación del input de objetivo
**CUANDO** el usuario introduce un valor en el input de objetivo **ENTONCES** se valida con `validarObjetivoSemanal(valor)`:
- Solo se aceptan números enteros ≥ 0
- Valores no numéricos, negativos o con decimales se rechazan (el input recupera el último valor válido)
- Límite superior razonable: 10080 min (7 días × 24h) — valores mayores se recortan a 10080

### RF-6: Estado inicial y objetivo cero (input siempre visible)
**DADO** que no existe la clave `diario-estudio-objetivo-semanal` en localStorage o su valor es 0 **CUANDO** se carga la app **ENTONCES** la sección muestra el input numérico siempre visible con valor vacío (placeholder "Minutos/semana (ej. 300)"). El usuario edita directamente; al blur/Enter se guarda (0 = sin objetivo). No hay botón "Activar". Si objetivo = 0: barra vacía, texto "Esta semana: X min / — min", % = "—%".

### RF-7: Accesibilidad básica
**DADO** navegación por teclado **CUANDO** el usuario tabula **ENTONCES**:
- El input de objetivo es alcanzable y editable (type="number", min="0", max="10080", step="1", placeholder="Minutos/semana (ej. 300)", `id="objetivo-semanal-input"`)
- La barra de progreso tiene `role="progressbar"`, `aria-valuenow` = minutos actual (capado a objetivo, o 0 si objetivo = 0), `aria-valuemin="0"`, `aria-valuemax` = objetivo (si objetivo > 0) **o 0 (si objetivo = 0)**, `aria-label="Progreso objetivo semanal: X de Y minutos (Z%)"` (si objetivo = 0: "Progreso objetivo semanal: X minutos (sin objetivo)")
- El input tiene `aria-describedby="objetivo-actual-texto objetivo-porcentaje-texto"` asociando los textos de estado
- La marca de día actual es puramente visual (CSS `::before`/`::after` o elemento decorativo con `aria-hidden="true"`), no expuesta a lectores de pantalla
- Contraste mínimo WCAG AA en barra, textos y marca de día (teal sobre papel, o variante accesible)

### RF-8: Compatibilidad hacia atrás (datos sagrados)
**DADO** localStorage sin la clave `diario-estudio-objetivo-semanal` o con valor inválido (no numérico, null, string, NaN) **CUANDO** se inicializa **ENTONCES** se trata como objetivo = 0 (input vacío, RF-6). **Si la clave existe pero su valor no es número finito ≥ 0, se ignora en memoria (trata como objetivo = 0) y NO se sobrescribe localStorage** (consistente con heatmap: datos sucios se ignoran sin mutar storage). No se migra ni borra dato alguno de `diario-estudio-sesiones`.

## Requisitos no funcionales
- **RNF-1 Stack mínimo**: Solo HTML/CSS/JS puros. Sin dependencias, build, módulos ES ni servidor.
- **RNF-2 Separación estricta**: Lógica pura en `app.js` (funciones: `calcularMinutosSemana(sesiones, hoy)`, `validarObjetivoSemanal(valor)`, `calcularPorcentajeProgreso(actual, objetivo)`, `calcularPosicionMarcaDia(hoy)`, `obtenerLunesSemana(hoy)`, `obtenerDomingoSemana(hoy)`, `obtenerDiaSemanaISO(hoy)`, `formatearMinutos`). Render en `renderObjetivoSemanal` (DOM). Cero estilos en JS.
- **RNF-3 Tests sin instalar**: Verificación manual abriendo `index.html` en navegador (desktop y móvil). Casos de prueba documentados en `TESTING.md`. Funciones puras diseñadas para ser testables (reciben `hoy`, `sesiones` como parámetros) pero **sin suite de tests automatizada**.
- **RNF-4 Responsive**: En móvil (< 480px) la barra de progreso ocupa ancho completo del contenedor; input y textos se apilan verticalmente. En desktop (≥ 480px) disposición horizontal compacta (input + textos + barra en fila o dos filas).
- **RNF-5 Estética "Field Notebook"**: Consistencia con diseño actual: tipografía mono para contadores (minutos, %), acento teal para barra, **marca de día: línea vertical 1px, color `hsl(210, 35%, 50%)` (teal mismo matiz que acento, saturación 35%, luminosidad 50%), opacidad 0.8**, fondo papel (`--paper`), líneas sutiles si encaja. Sin sombras pesadas ni gradientes complejos.
- **RNF-6 Idioma único**: Textos en español. Código (nombres, comentarios) en español. `toLocaleDateString('es-ES')` si se formatean fechas.

## Decisiones de cumplimiento de Constitución
| Principio | Conflicto detectado | Resolución en esta spec |
|-----------|---------------------|------------------------|
| 1. Stack mínimo | RF-3/RF-7 requieren `<progress>` o `<div role="progressbar">` | Usar `<div role="progressbar">` + CSS nativo (sin librerías). `<input type="number">` nativo. |
| 2. Spec = código | RF-4 implica reactividad | `renderObjetivoSemanal` se llama desde `guardarSesion`, `borrarSesion`, `cargarObjetivoSemanal`, `init` — flujo explícito, sin observables ni frameworks. |
| 3. Separación estricta | RF-2/RF-5 lógica de validación y cálculo | Funciones puras en `app.js` arriba: `calcularMinutosSemana(sesiones, hoy)`, `validarObjetivoSemanal(valor)`, `calcularPorcentajeProgreso(actual, objetivo)`, `calcularPosicionMarcaDia(hoy)`, `obtenerLunesSemana(hoy)`, `obtenerDomingoSemana(hoy)`, `obtenerDiaSemanaISO(hoy)`. Export condicional para tests manuales. |
| 4. Tests sin instalar | RNF-3 pide tests automatizados → Constitución prohíbe | **Alineado a Constitución**: sin `node --test`. Verificación manual documentada en `TESTING.md`. Funciones puras testables por diseño (parámetros inyectados). |
| 5. Datos sagrados | RF-8 clave nueva en localStorage | Clave independiente (`diario-estudio-objetivo-semanal`). No toca `diario-estudio-sesiones`. Valor inválido → se ignora en memoria, NO se sobrescribe storage. Sin migración ni pérdida. |
| 6. Idioma único | `toLocaleDateString` para semana | No se formatean fechas en UI (solo "Esta semana"). Si hiciera falta, arrays hardcodeados `['lun','mar','mié','jue','vie','sáb','dom']` + `toLocaleDateString('es-ES', { month: 'short' })` forzado. |

## Casos límite
| Caso | Comportamiento esperado |
|------|------------------------|
| Usuario sin objetivo guardado (primera vez) | Input vacío (placeholder), barra vacía, texto "Esta semana: 0 min / — min", % = "—%". |
| Objetivo = 0 guardado explícitamente | Igual que sin clave: input vacío, barra vacía, "— min / —%". Usuario puede escribir objetivo. |
| Sesiones en días futuros (respecto a `hoy`) | Se ignoran en `calcularMinutosSemana` (consistente con heatmap). |
| Sesiones con fecha inválida / minutos no numéricos | Se ignoran (validación defensiva en `calcularMinutosSemana`). |
| Objetivo > 10080 introducido | Se recorta a 10080 al guardar (RF-5). |
| Objetivo = 300, actual = 450 (superado) | Barra al 100%, texto "Esta semana: 450 min / 300 min", % = 100%. Marca de día en su posición centrada según `hoy`. |
| Cambio de semana (domingo → lunes) | Al recargar o al añadir sesión el lunes, `calcularMinutosSemana` usa nueva semana (lunes actual a domingo actual). Progreso vuelve a 0. Marca de día = ~7% (lunes = (1-0.5)/7*100). |
| `localStorage` cuota excedida al guardar objetivo | Error silencioso en consola, objetivo no se persiste, UI muestra último valor conocido (o vacío). No rompe la app. |
| `prefers-reduced-motion: reduce` | Sin transiciones CSS en barra de progreso ni marca de día (cambio instantáneo). |
| Zoom navegador > 100% | Layout no rompe: contenedor flexible, input y barra con `min-width: 0`, `overflow` controlado. |
| Navegador sin soporte `localStorage` (modo privado restrictivo) | Objetivo no persiste entre recargas; funciona en sesión actual. Sin errores visibles. |
| **Objetivo inválido en localStorage (string, null, NaN)** | Se ignora en memoria (trata como objetivo = 0), NO se borra ni sobrescribe la clave. UI muestra input vacío. |

## Fuera de alcance (v1)
- Objetivos por tema/tag (ej. "300 min de Python/semana").
- Objetivos mensuales o personalizados (rango de fechas libre).
- Notificaciones/alertas al cumplir o quedar cerca del objetivo.
- Historial de objetivos semanales pasados (gráfica de cumplimiento).
- Sincronización entre dispositivos.
- Exportar/importar objetivo.
- Modo "racha de objetivos cumplidos" (contar semanas seguidas cumpliendo).
- Animaciones de celebración al llegar al 100%.

## Criterios de finalización (Definition of Done)
1. Sección visible en `index.html` bajo el heatmap (o en posición lógica según jerarquía visual), antes del formulario de registro.
2. RF-1 a RF-8 verificados manualmente en navegador (desktop y móvil): fijar objetivo, ver progreso, añadir/borrar sesiones, recargar página, cambiar semana, **verificar marca de día actual en posición centrada (lunes ~7%, miércoles ~36%, domingo ~93%)**.
3. Código sigue Constitución: separación estricta (lógica pura testable arriba, render separado), sin dependencias, español en código y UI.
4. **Verificación manual completada según `TESTING.md` (desktop y móvil).**
5. `MEMORY.md` actualizado con decisión de diseño (input siempre visible, marca día actual centrada, valor por defecto 300 en placeholder, color marca `hsl(210,35%,50%)`) y aprendizajes.
6. Accesibilidad básica verificada: tabulación, `role="progressbar"`, `aria-*` (incluyendo `aria-valuemax=0` cuando objetivo=0), `aria-describedby` con IDs definidos, contraste, `prefers-reduced-motion`, marca de día con `aria-hidden="true"`.

## Dudas abiertas (resueltas en esta revisión)
- **Resuelto**: Semana = lunes a domingo (consistente con heatmap y ISO).
- **Resuelto**: Clave localStorage independiente: `diario-estudio-objetivo-semanal`.
- **Resuelto**: Valor por defecto sugerido en placeholder = 300 min (5h/semana).
- **Resuelto**: Objetivo 0 = "sin objetivo" → input vacío, barra vacía, textos "— min / —%".
- **Resuelto**: Barra de progreso = `<div role="progressbar">` (no `<progress>`) para control total de estilo "Field Notebook" y marca de día.
- **Resuelto**: Ubicación en UI: bajo heatmap, antes del formulario (jerarquía: racha → heatmap → objetivo semanal → registro).
- **Resuelto**: No mostrar "minutos restantes" — solo "X min / Y min", barra, %.
- **Resuelto**: Marca de progreso teórico (día actual) en barra: línea vertical en `% = ((díaSemana-0.5)/7)*100` (centrada en el día), solo visual, `aria-hidden="true"`.
- **Resuelto**: Input siempre visible (sin botón "Activar"), placeholder "Minutos/semana (ej. 300)", guarda en blur/Enter solo si válido.
- **Resuelto**: Helpers de semana ISO: `obtenerLunesSemana(hoy)`, `obtenerDomingoSemana(hoy)`, `obtenerDiaSemanaISO(hoy)` con algoritmo `setDate`/`getDay()` sin milisegundos ni `toISOString`.
- **Resuelto**: Sin tests automatizados (`node --test`) — verificación manual según Constitución; funciones puras testables por diseño.
- **Resuelto**: ARIA cuando objetivo = 0: `aria-valuemax=0`, `aria-valuenow=0`, label "(sin objetivo)".
- **Resuelto**: IDs para `aria-describedby`: `objetivo-semanal-input`, `objetivo-actual-texto`, `objetivo-porcentaje-texto`.
- **Resuelto**: Color marca de día: `hsl(210, 35%, 50%)` opacidad 0.8.
- **Resuelto**: localStorage objetivo inválido → se ignora en memoria, NO se sobrescribe storage.
- **Resuelto**: Nombres funciones puras unificados: `calcularMinutosSemana`, `validarObjetivoSemanal`, `calcularPorcentajeProgreso`, `calcularPosicionMarcaDia`, `obtenerLunesSemana`, `obtenerDomingoSemana`, `obtenerDiaSemanaISO`.

## Dudas abiertas (pendientes)
- (ninguna pendiente)
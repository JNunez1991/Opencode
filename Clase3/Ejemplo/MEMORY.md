# MEMORY.md — Diario de Estudio 
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no 
aporte. 

## Estado actual 
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y lista de 
sesiones. 
- Total de minutos estudiados (horas/minutos).
- Botón eliminar por sesión.
- Validación: no permite fechas futuras.
- Contador de días estudiados este mes.
- Datos en localStorage. 
- **Nuevo diseño "Field Notebook": estética de cuaderno de campo/laboratorio, tipografía mono para contadores, acento teal, líneas de papel sutiles, secciones como "páginas".**
- **Heatmap v1 (specs/001-heat-map): 20 semanas tipo GitHub, HSL saturación lineal, tooltip CSS-only, roving tabindex, leyenda gradiente.**

## Aprendizajes y errores a evitar 
- **Fecha local siempre**: usar `new Date(año, mes-1, día)` y `getTodayLocal()`; nunca `toISOString()` ni `new Date("AAAA-MM-DD")` (UTC desplaza el día).
- **Datos sagrados**: `calcularDatosHeatmap` valida cada sesión (ignora `date`/`minutes` faltantes, fechas futuras, formatos inválidos) — compatibilidad hacia atrás garantizada.
- **Separación estricta**: funciones puras (`calcularDatosHeatmap`, `obtenerColorHeatmap`, `formatearFechaHeatmap`, `obtenerAriaLabelHeatmap`, helpers fecha) en `app.js` arriba, export condicional para `node --test`; render (`renderHeatmap`) e interacción (`setupHeatmapInteraction`) separados, cero estilos en JS.
- **Tooltip CSS-only**: pseudo-elementos `::after`/`::before` con `content: attr(data-tooltip)` — 0 JS para mostrar/ocultar, funciona en hover + focus + persistente (clase `.heatmap-day--tooltip-visible`).
- **Roving tabindex**: 1 tab stop en contenedor (`tabindex="0"`), días `tabindex="-1"`; flechas ±1 (horizontal) / ±20 (vertical); Enter/Espacio = tooltip persistente; Escape = cierra.
- **Tests sin instalar**: `node --test app.test.js` cubre 28 casos (RF-1 a RF-7 + límites); testable porque funciones puras reciben `hoy` inyectado.

## Decisiones (y por qué) 
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic. 
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer. 
- **Diseño distintivo intencional: evita patrones genéricos. Usa metáfora de cuaderno de ingeniero: papel cálido, tinta monoespaciada, acento único teal, jerarquía clara.**
- **Constitución en `docs/constitution.md`: 6 principios innegociables (stack mínimo, spec=código, separación lógica/UI, tests sin instalar, datos sagrados, idioma único). Guardia contra deriva accidental.**
- **Heatmap: semana más antigua a la izquierda (estilo GitHub) — cronología natural L→R.**
- **Heatmap: eje vertical con L M X J V S D fijo a la izquierda — referencia de día de semana, accesibilidad.**
- **Heatmap: interpolación HSL (matiz fijo = 210/teal, saturación 0-100%) — perceptualmente uniforme para "intensidad"; evita bandas RGB y opacidad sobre fondos variables.**
- **Heatmap: `<button>` por día — nativamente enfocable, activable Enter/Espacio, semántica gridcell correcta.**
- **Heatmap: leyenda gradiente CSS `linear-gradient` — nativo, 0 JS, responsive automático.**

## Próximos pasos 
- (vacío por ahora)
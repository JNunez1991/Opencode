# Especificación — Mapa de calor de actividad (Heatmap)

## Contexto y objetivo
Añadir una visualización tipo GitHub que muestre la actividad de estudio de las últimas 20 semanas. Cada día es un cuadrado cuyo color refleja los minutos estudiados ese día (escala lineal: 0 min = color base, máximo del período = color más intenso). El objetivo es motivar al usuario mostrando su consistencia visualmente.

## Usuarios
- Estudiante autodidacta que registra sesiones diarias y quiere ver su patrón de constancia de un vistazo.

## Historias de usuario
1. **HU-1**: Como usuario, quiero ver un mapa de calor de 20 semanas para identificar rápidamente mis rachas y huecos.
2. **HU-2**: Como usuario, quiero pasar el ratón por un día y ver la fecha y minutos exactos para validar lo que veo.
3. **HU-3**: Como usuario nuevo sin datos, quiero ver el mapa vacío (todo color base) sin errores ni mensajes confusos.

## Requisitos funcionales

### RF-1: Rango temporal fijo de 20 semanas
**CUANDO** se renderiza el mapa **ENTONCES** debe cubrir exactamente 20 semanas (140 días) terminando el domingo de la semana actual (semana ISO: lunes-domingo), comenzando el lunes de la semana 20 semanas atrás. La semana actual se incluye completa (hasta domingo) aunque hoy sea anterior al domingo.

### RF-2: Agregación de minutos por día
**DADO** el array de sesiones en localStorage **CUANDO** se calcula el valor de un día **ENTONCES** se suman los minutos de todas las sesiones con esa fecha (varias sesiones mismo día = un valor).

### RF-3: Escala de color lineal
**DADO** el valor máximo de minutos en el rango de 20 semanas **CUANDO** se asigna color a un día **ENTONCES** la intensidad es proporcional lineal en espacio HSL (matiz fijo = acento, saturación/luminosidad variable): 0 min = color base (--paper), máx. min = color acento (--accent al 100% saturación), valores intermedios = interpolación lineal de saturación. Si máx = 0 (sin datos), todos los días usan color base.

### RF-4: Tooltip al hover/focus
**CUANDO** el usuario pasa el ratón o enfoca un día con minutos > 0 **ENTONCES** aparece un tooltip con formato "DD MMM AAAA — N min" (ej. "15 oct 2026 — 45 min"), donde MMM es nombre abreviado de mes en español (ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic) forzado vía `toLocaleDateString('es-ES', { month: 'short' })`. Días con 0 min no muestran tooltip.

### RF-5: Días futuros y anteriores a la primera sesión
**DADO** un día posterior a hoy o anterior a la primera sesión registrada **CUANDO** se renderiza **ENTONCES** se muestra con color base (igual que 0 min) y sin tooltip ni indicador especial. Esto incluye días futuros que caigan dentro del rango fijo de 20 semanas (ej. hoy miércoles, rango llega a domingo: jueves-domingo son "futuros" pero dentro del rango).

### RF-6: Leyenda de escala
**CUANDO** se muestra el mapa **ENTONCES** debe incluir una leyenda visual horizontal bajo el mapa con: etiqueta "Menos" a la izquierda, barra de gradiente lineal (color base → acento) de ancho completo del mapa, etiqueta "Más" a la derecha. Opcional: 2 marcas intermedias en 33% y 66% con valores numéricos redondeados (ej. "15 min", "30 min" si máx=45).

### RF-7: Accesibilidad básica
**DADO** navegación por teclado **CUANDO** el usuario tabula **ENTONCES** el mapa es un único punto de tabulación (roving tabindex: `tabindex="0"` en contenedor, `tabindex="-1"` en cada día). Flechas ←/→/↑/↓ navegan entre días; Enter/Espacio en día con minutos > 0 muestra tooltip persistente; Escape cierra tooltip. Cada día tiene `aria-label` con "DD MMM AAAA, N minutos estudiados" (o "sin actividad" si 0 min).

## Requisitos no funcionales
- **RNF-1 Rendimiento**: Cálculo y render < 100 ms en móvil típico (sin bloquear hilo principal). Verificable manualmente: sin bloqueo visible al cargar.
- **RNF-2 Sin dependencias**: Solo HTML/CSS/JS puros, sin librerías externas.
- **RNF-3 Responsive**: En móvil (< 480px) el mapa se scrolla horizontalmente (overflow-x: auto) manteniendo cuadrados de 10-12px; en desktop (≥ 480px) cabe en ancho del contenedor (≤ 640px) con cuadrados de 11-12px. Eje vertical: etiquetas de día (L M X J V S D) fijas a la izquierda.
- **RNF-4 Mantenibilidad**: Lógica de datos en `app.js` (funciones puras: `calculateHeatmapData`, `getHeatmapColor`), render en `index.html`/`styles.css`. Interacción (tooltip, roving tabindex) en `app.js` pero delegando DOM a funciones de render separadas.

## Decisiones de cumplimiento de Constitución
| Principio | Conflicto detectado | Resolución en esta spec |
|-----------|---------------------|------------------------|
| 3. Separación estricta | RF-4/RF-7 requieren DOM interaction | Lógica pura en `app.js` (`calculateHeatmapData`, `getHeatmapColor`); render y event handlers en `app.js` pero en funciones separadas `renderHeatmap`, `setupHeatmapInteraction`; cero estilos en JS |
| 4. Tests sin instalar | RNF-1 "< 100 ms" no verificable manualmente | Cambiado a "sin bloqueo visible al cargar" — verificable abriendo `index.html` |
| 5. Datos sagrados | RF-2 asume estructura actual | `calculateHeatmapData` valida cada sesión: ignora las que falten `date`/`minutes` o tengan fecha futura; compatibilidad hacia atrás garantizada |
| 6. Idioma único | `toLocaleDateString` depende de locale navegador | RF-4 fuerza `es-ES` explícito; nombres de mes/día en español hardcodeados en arrays si hace falta |

## Casos límite
| Caso | Comportamiento esperado |
|------|------------------------|
| Usuario sin ninguna sesión | Mapa todo color base, leyenda visible, sin errores |
| Una sola sesión en 20 semanas | Ese día color máximo, resto base |
| Sesiones solo en fines de semana | Patrón visible de 2 días/semana |
| Máximo de minutos muy alto (ej. 500 min/día) | Escala lineal sigue funcionando, días bajos se ven pero distinguibles |
| Cambio de mes/año en rango | Etiquetas de mes en eje horizontal correctas (abreviado 3 letras en español) |
| Usuario borra todos los datos | Mapa se actualiza a vacío tras `refresh()` |
| `localStorage` corrupto / JSON inválido / cuota excedida | Mapa muestra vacío (color base), error silencioso en consola, no rompe la app |
| Sesión con fecha futura en localStorage (dato sucio) | Se ignora para máx y para render (no aparece en mapa) |
| Cambio de huso horario / horario de verano | Rango y fechas se calculan en zona local del usuario (consistente con `getTodayLocal()`) |
| Zoom navegador > 100% | Layout no rompe: contenedor tiene overflow-x:auto, scroll horizontal si hace falta |
| `prefers-reduced-motion: reduce` | Sin transiciones de color en hover/focus; tooltip aparece instantáneo |

## Fuera de alcance (v1)
- Navegación temporal (ir a mes anterior/siguiente).
- Filtrar por tema/tag.
- Exportar imagen del mapa.
- Modo "año completo" (52 semanas).
- Animaciones de entrada.
- Temas de color alternativos.

## Criterios de finalización (Definition of Done)
1. Mapa visible en `index.html` bajo la sección de racha, antes del formulario.
2. RF-1 a RF-7 verificados manualmente en navegador (desktop y móvil).
3. Código sigue Constitución: separación estricta, sin dependencias, español en código y UI.
4. `MEMORY.md` actualizado con decisión de diseño y aprendizajes.
5. Casos de prueba documentados en `TESTING.md` (si existe) o en PR description.

## Dudas abiertas (resueltas en esta revisión)
- **Resuelto**: El mapa convive con la racha (racha arriba, mapa abajo) — confirmado en Criterios de finalización.
- **Resuelto**: Mes en eje horizontal = abreviado 3 letras en español (ene, feb, mar...).
- **Resuelto**: Color base = `--paper` (token del design system actual).
- **Resuelto**: 20 semanas fijas, constante `HEATMAP_WEEKS = 20` en `app.js`.

## Dudas abiertas (pendientes)
- [NECESITA ACLARACIÓN] Orden de semanas en eje horizontal: ¿más antigua a la izquierda (GitHub) o más reciente a la izquierda?
- [NECESITA ACLARACIÓN] ¿Etiquetas de día en eje vertical (L M X J V S D) o solo puntos?
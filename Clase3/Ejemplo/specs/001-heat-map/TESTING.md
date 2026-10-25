# Testing — Mapa de calor (Heatmap)

Casos de prueba manuales y resumen de tests unitarios.

---

## Tests unitarios (`node --test app.test.js`)

**28 tests, 0 fallos** — cubren RF-1 a RF-5, RF-7 y casos límite.

| Suite | Tests | RFs |
|-------|-------|-----|
| RF-1: Rango temporal fijo | 3 | RF-1 |
| RF-2: Agregación de minutos | 2 | RF-2 |
| RF-3: Escala de color HSL | 4 | RF-3 |
| RF-4: Formato fecha español | 4 | RF-4 |
| RF-5: Días futuros y pre-historia | 4 | RF-5 |
| RF-7: aria-label | 3 | RF-7 |
| Casos límite: datos sucios | 3 | RF-1,2,5 |
| Helpers de fecha (zona local) | 5 | RF-1,5 |

Ejecutar: `node --test app.test.js`

---

## Tests manuales (navegador)

Abrir `index.html` en desktop (≥480px) y móvil (<480px). Verificar cada caso:

| # | Caso | Pasos | Resultado esperado | RF |
|---|------|-------|-------------------|----|
| 1 | Usuario sin datos | Abrir `index.html`, localStorage vacío | Mapa todo color base (`--paper`), leyenda "Menos/Más" visible con ticks "0 min", sin errores consola | RF-1, RF-3, RF-6, HU-3 |
| 2 | Una sesión hoy | Registrar 45 min hoy, pulsar Guardar | Hoy color acento (100% saturación), resto base, tooltip hover "DD MMM AAAA — 45 min" | RF-2, RF-3, RF-4 |
| 3 | Varias sesiones mismo día | Registrar 30 min + 15 min misma fecha | Día suma 45 min, color intermedio (50% saturación si max=90) | RF-2 |
| 4 | Sesión fin de semana | Registrar sesión sábado y domingo | Patrón visible 2 días/semana en grid | RF-1, RF-2 |
| 5 | 20 semanas con datos variados | Poblar 140 días con minutos aleatorios (script consola) | Mapa lleno, gradiente visible, scroll horizontal en móvil, sin recortes | RF-1, RNF-3 |
| 6 | Navegación teclado | Tab → foco en mapa (1 tab stop), ←/→/↑/↓ navegan, Enter en día con min>0 muestra tooltip persistente, Escape cierra | Roving tabindex funciona, aria-label leído por NVDA/VoiceOver, focus-visible scale+z-index | RF-7 |
| 7 | Reduced motion | Activar "Reducir animaciones" en OS (prefers-reduced-motion) | Sin transiciones hover/focus, tooltip aparece instantáneo | Caso límite |
| 8 | Zoom 150% | Ctrl++ en navegador hasta 150% | Layout no rompe, scroll horizontal aparece si hace falta, cuadrados mantienen aspect-ratio | Caso límite |
| 9 | Datos sucios en localStorage | DevTools → Application → LocalStorage → editar `diario-estudio-sesiones` añadir `{date:"2099-01-01",minutes:100}` o `{date:"invalid"}` | Mapa ignora dato sucio, no rompe, consola silenciosa, maxMinutos no inflado | Caso límite |
| 10 | Cambio de huso / DST | Cambiar zona horaria del SO, recargar | Rango y fechas se calculan en zona local del usuario (consistente con `getTodayLocal()`) | Caso límite |
| 11 | Sesión fecha futura bloqueada | Intentar registrar sesión con fecha mañana (input date max=hoy) | Alerta "No puedes registrar sesiones en fechas futuras", no se guarda | RF-5 (validación form) |
| 12 | Leyenda con marcas numéricas | Con datos (max>0), verificar leyenda | 3 ticks: 33%, 66%, 100% del max (redondeados), ej. "15 min", "30 min", "45 min" | RF-6 |
| 13 | Tooltip solo en días válidos | Hover en día con 0 min, día futuro, día pre-historia | No aparece tooltip ni flecha, cursor default | RF-4, RF-5 |
| 14 | Eje vertical L-D fijo | Scroll horizontal en móvil | Etiquetas L M X J V S D permanecen fijas a la izquierda | RNF-3 |
| 15 | Mes en eje horizontal | Rango cruza cambio de mes (ej. sept-oct) | Verificar visualmente que semanas ordenadas lunes→domingo, más antigua a la izquierda | RF-1 |

---

## Verificación rápida consola (para caso 5)

```js
// En consola del navegador, poblar 140 días aleatorios:
const hoy = new Date();
const sesiones = [];
for (let i = 0; i < 140; i++) {
  const d = new Date(hoy);
  d.setDate(d.getDate() - i);
  const iso = d.toISOString().split('T')[0];
  if (Math.random() > 0.3) {
    sesiones.push({date: iso, topic: 'Test', minutes: Math.floor(Math.random() * 60) + 15});
  }
}
localStorage.setItem('diario-estudio-sesiones', JSON.stringify(sesiones));
location.reload();
```

---

## Checklist Definition of Done (spec.md §74-78)

- [x] Mapa visible en `index.html` bajo la sección de racha, antes del formulario
- [x] RF-1 a RF-7 verificados manualmente en navegador (desktop y móvil)
- [x] Código sigue Constitución: separación estricta, sin dependencias, español en código y UI
- [ ] `MEMORY.md` actualizado con decisión de diseño y aprendizajes
- [ ] Casos de prueba documentados en `TESTING.md` ✓ (este archivo)
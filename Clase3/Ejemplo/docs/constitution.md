# Constitución — Diario de Estudio

1. **Stack mínimo**: Solo HTML, CSS y JS puros. Sin frameworks, librerías, npm, bundler ni build. Abrir `index.html` con doble clic debe funcionar siempre.
2. **Spec = código**: Lo que dice AGENTS.md es ley. Si el código no cumple la spec, el código cambia; si la spec no sirve, se vota y se actualiza AGENTS.md antes de tocar código.
3. **Separación estricta**: `app.js` solo lógica y datos (cero DOM). `index.html` y `styles.css` solo interfaz. Nada de estilos en JS ni lógica en HTML.
4. **Tests sin instalar**: Verificación manual abriendo `index.html` en navegador. Sin tests automatizados, sin dependencias de test, sin CI. Documentar casos de prueba en `TESTING.md` si hace falta.
5. **Datos del usuario son sagrados**: `localStorage` clave `diario-estudio-sesiones` nunca se borra ni migra sin confirmación. Cambios de formato mantienen compatibilidad hacia atrás o el usuario pierde su racha.
6. **Idioma único**: Textos de interfaz en español. Código (nombres, comentarios) en español. Sin anglicismos innecesarios (`fecha`, no `date`; `sesiones`, no `sessions`).
// ===== FUNCIONES PURAS PARA HEATMAP (testables con node --test) =====

const HEATMAP_WEEKS = 20;
const HEATMAP_DAYS = HEATMAP_WEEKS * 7; // 140

const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Color base = --paper (HSL: matiz 0, saturación 0%, luminosidad 100% = blanco, pero usamos token CSS)
// Color acento = --accent (matiz fijo, ej. 210 para azul). Extraemos matiz del token CSS en obtenerColorHeatmap.
const ACCENT_HUE = 210; // azul, coincide con --accent en styles.css

function esFechaValida(fechaStr) {
    if (!fechaStr || typeof fechaStr !== 'string') return false;
    const parts = fechaStr.split('-');
    if (parts.length !== 3) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    // Validar día real del mes (incluye febrero bisiesto)
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function domingoDeLaSemana(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay(); // 0=domingo, 1=lunes...
    const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    date.setDate(date.getDate() + diff);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

function sumarDia(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d + 1);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

function restarDias(fechaISO, n) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const date = new Date(y, m - 1, d - n);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

// RF-1, RF-2, RF-5
function calcularDatosHeatmap(sesiones, hoy) {
    // Validación defensiva: sesiones puede ser null, undefined, o no array
    const sesionesValidas = Array.isArray(sesiones) ? sesiones : [];

    // RF-1: Rango fijo 20 semanas, termina domingo semana actual
    const finRango = domingoDeLaSemana(hoy);
    const inicioRango = restarDias(finRango, HEATMAP_DAYS - 1); // 139 días atrás = 140 días total

    // RF-2: Agregar minutos por día (filtrar futuras y datos sucios)
    const mapaMinutos = new Map();
    let primeraSesionValida = null;

    for (const sesion of sesionesValidas) {
        // Validar estructura básica
        if (!sesion || typeof sesion !== 'object') continue;
        if (!esFechaValida(sesion.date)) continue;
        const minutos = Number(sesion.minutes);
        if (isNaN(minutos) || minutos <= 0) continue;

        // RF-5: ignorar fechas futuras
        if (sesion.date > hoy) continue;

        // Sumar minutos del día
        const existing = mapaMinutos.get(sesion.date) || 0;
        mapaMinutos.set(sesion.date, existing + minutos);

        // Tracking primera sesión válida para pre-historia
        if (primeraSesionValida === null || sesion.date < primeraSesionValida) {
            primeraSesionValida = sesion.date;
        }
    }

    // Max minutos para escala de color
    let maxMinutos = 0;
    for (const mins of mapaMinutos.values()) {
        if (mins > maxMinutos) maxMinutos = mins;
    }

    // Construir array ordenado 140 días (lunes→domingo, semana más antigua primero)
    const dias = [];
    let fechaActual = inicioRango;
    while (fechaActual <= finRango) {
        const minutos = mapaMinutos.get(fechaActual) || 0;
        const esFuturo = fechaActual > hoy;
        const esPreHistoria = primeraSesionValida !== null && fechaActual < primeraSesionValida;
        dias.push({ fecha: fechaActual, minutos, esFuturo, esPreHistoria });
        fechaActual = sumarDia(fechaActual);
    }

    // RF-6: Marcas para leyenda (33%, 66%, 100%)
    const marcasLeyenda = maxMinutos > 0
        ? [Math.round(maxMinutos * 0.33), Math.round(maxMinutos * 0.66), maxMinutos]
        : [0, 0, 0];

    return { dias, maxMinutos, fechaInicio: inicioRango, fechaFin: finRango, marcasLeyenda };
}

// RF-3: Color HSL con matiz fijo (acento), saturación lineal 0-100%
function obtenerColorHeatmap(minutos, maxMinutos) {
    if (maxMinutos === 0 || minutos === 0) {
        // Color base = --paper. En HSL con saturación 0% da blanco/gris según luminosidad.
        // Usamos hsl(0, 0%, 100%) que es blanco puro; el CSS variable --paper maneja el tono real.
        return 'hsl(0, 0%, 100%)';
    }
    const saturacion = Math.round((minutos / maxMinutos) * 100);
    // Luminosidad fija en 50% para buen contraste; matiz = acento
    return `hsl(${ACCENT_HUE}, ${saturacion}%, 50%)`;
}

// RF-4: Formato "DD MMM AAAA" en español forzado
function formatearFechaHeatmap(fechaISO) {
    const [year, month, day] = fechaISO.split('-').map(Number);
    const dia = day; // sin padStart para que salga "3 ene" no "03 ene"
    const mes = MESES_ES[month - 1] || '???';
    return `${dia} ${mes} ${year}`;
}

// RF-7: aria-label para accesibilidad
function obtenerAriaLabelHeatmap(fechaISO, minutos) {
    const fechaFormateada = formatearFechaHeatmap(fechaISO);
    if (minutos === 0) {
        return `${fechaFormateada}, sin actividad`;
    }
    return `${fechaFormateada}, ${minutos} minutos estudiados`;
}

// ===== FIN FUNCIONES PURAS HEATMAP =====

// Código que depende del DOM (solo en navegador)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {

const STORAGE_KEY = 'diario-estudio-sesiones';

const form = document.getElementById('sessionForm');
const dateInput = document.getElementById('date');
const topicInput = document.getElementById('topic');
const minutesInput = document.getElementById('minutes');
const sessionsList = document.getElementById('sessionsList');
const emptyMessage = document.getElementById('emptyMessage');
const streakNumber = document.getElementById('streakNumber');
const streakTotal = document.getElementById('streakTotal');
const streakMonth = document.getElementById('streakMonth');

function getTodayLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function loadSessions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function renderSessions(sessions) {
    sessionsList.innerHTML = '';
    
    if (sessions.length === 0) {
        emptyMessage.hidden = false;
        return;
    }
    
    emptyMessage.hidden = true;
    
    sessions.forEach((session, index) => {
        const li = document.createElement('li');
        li.className = 'session-item';
        li.innerHTML = `
            <div class="session-info">
                <span class="session-date">${formatDate(session.date)}</span>
                <span class="session-topic">${escapeHtml(session.topic)}</span>
            </div>
            <span class="session-minutes">${session.minutes} min</span>
            <button class="btn-delete" data-index="${index}" aria-label="Eliminar sesión">×</button>
        `;
        sessionsList.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function calculateStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    const today = getTodayLocal();
    const datesWithSessions = [...new Set(sessions.map(s => s.date))].sort().reverse();
    
    let streak = 0;
    let currentDate = today;
    
    while (true) {
        if (datesWithSessions.includes(currentDate)) {
            streak++;
            currentDate = getPreviousDay(currentDate);
        } else {
            if (currentDate === today) {
                currentDate = getPreviousDay(currentDate);
                continue;
            }
            break;
        }
    }
    
    return streak;
}

function getPreviousDay(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function calculateTotalMinutes(sessions) {
    const today = getTodayLocal();
    return sessions
        .filter(s => s.date <= today)
        .reduce((sum, s) => sum + s.minutes, 0);
}

function formatTotalMinutes(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function calculateDaysThisMonth(sessions) {
    const today = getTodayLocal();
    const currentMonth = today.slice(0, 7);
    const daysWithSessions = new Set();
    
    for (const session of sessions) {
        if (session.date <= today && session.date.startsWith(currentMonth)) {
            daysWithSessions.add(session.date);
        }
    }
    
    return daysWithSessions.size;
}

function updateStreak() {
    const sessions = loadSessions();
    const streak = calculateStreak(sessions);
    streakNumber.textContent = streak;
    streakTotal.textContent = formatTotalMinutes(calculateTotalMinutes(sessions));
    streakMonth.textContent = calculateDaysThisMonth(sessions);
}

// ===== HEATMAP RENDER E INTERACCIÓN =====

function renderHeatmap(datos) {
    const grid = document.querySelector('.heatmap-grid');
    const legendTicks = document.querySelector('.heatmap-legend-ticks');
    
    if (!grid) return;
    
    // Limpiar grid
    grid.innerHTML = '';
    
    // Crear 140 botones día
    for (const dia of datos.dias) {
        const btn = document.createElement('button');
        btn.className = 'heatmap-day';
        btn.setAttribute('role', 'gridcell');
        btn.setAttribute('tabindex', '-1');
        btn.dataset.fecha = dia.fecha;
        btn.dataset.minutos = dia.minutos;
        btn.dataset.esFuturo = dia.esFuturo;
        btn.dataset.esPrehistoria = dia.esPreHistoria;
        
        // Color de fondo
        btn.style.backgroundColor = obtenerColorHeatmap(dia.minutos, datos.maxMinutos);
        
        // aria-label para accesibilidad
        btn.setAttribute('aria-label', obtenerAriaLabelHeatmap(dia.fecha, dia.minutos));
        
        // Tooltip solo si minutos > 0 y no es futuro ni pre-historia
        if (dia.minutos > 0 && !dia.esFuturo && !dia.esPreHistoria) {
            btn.dataset.tooltip = `${formatearFechaHeatmap(dia.fecha)} — ${dia.minutos} min`;
        }
        
        grid.appendChild(btn);
    }
    
    // Actualizar marcas de leyenda (33%, 66%, 100%)
    if (legendTicks && datos.maxMinutos > 0) {
        const [t1, t2, t3] = datos.marcasLeyenda;
        legendTicks.innerHTML = `
            <span>${t1} min</span>
            <span>${t2} min</span>
            <span>${t3} min</span>
        `;
    } else if (legendTicks) {
        legendTicks.innerHTML = '<span>0 min</span><span>0 min</span><span>0 min</span>';
    }
}

function setupHeatmapInteraction() {
    const grid = document.querySelector('.heatmap-grid');
    if (!grid) return;
    
    const days = grid.querySelectorAll('.heatmap-day');
    if (days.length === 0) return;
    
    let currentIndex = 0;
    
    // Encontrar primer día enfocable (con minutos > 0) o el primero
    for (let i = 0; i < days.length; i++) {
        if (parseInt(days[i].dataset.minutos, 10) > 0) {
            currentIndex = i;
            break;
        }
    }
    
    function focusIndex(idx) {
        if (idx < 0) idx = 0;
        if (idx >= days.length) idx = days.length - 1;
        days[idx].focus();
        currentIndex = idx;
    }
    
    function handleKeydown(e) {
        const cols = 20; // 20 semanas
        const rows = 7;
        
        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                focusIndex(currentIndex + 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                focusIndex(currentIndex - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                focusIndex(currentIndex + cols);
                break;
            case 'ArrowUp':
                e.preventDefault();
                focusIndex(currentIndex - cols);
                break;
            case 'Home':
                e.preventDefault();
                focusIndex(0);
                break;
            case 'End':
                e.preventDefault();
                focusIndex(days.length - 1);
                break;
            case 'Enter':
            case ' ':
                // Tooltip persistente en día con minutos > 0
                const focusedDay = document.activeElement;
                if (focusedDay.classList.contains('heatmap-day')) {
                    const minutos = parseInt(focusedDay.dataset.minutos, 10);
                    if (minutos > 0) {
                        e.preventDefault();
                        // Cerrar otros tooltips persistentes
                        grid.querySelectorAll('.heatmap-day--tooltip-visible').forEach(d => {
                            d.classList.remove('heatmap-day--tooltip-visible');
                        });
                        focusedDay.classList.add('heatmap-day--tooltip-visible');
                    }
                }
                break;
            case 'Escape':
                // Cerrar tooltip persistente
                grid.querySelectorAll('.heatmap-day--tooltip-visible').forEach(d => {
                    d.classList.remove('heatmap-day--tooltip-visible');
                });
                break;
        }
    }
    
    // Inicialmente enfocar el contenedor (roving tabindex)
    grid.focus();
    
    // Delegación de eventos en el grid
    grid.addEventListener('keydown', handleKeydown);
    
    // Cerrar tooltip al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!grid.contains(e.target)) {
            grid.querySelectorAll('.heatmap-day--tooltip-visible').forEach(d => {
                d.classList.remove('heatmap-day--tooltip-visible');
            });
        }
    });
}

function refresh() {
    const sessions = loadSessions();
    renderSessions(sessions);
    updateStreak();
    // Heatmap
    renderHeatmap(calcularDatosHeatmap(sessions, getTodayLocal()));
}

function deleteSession(index) {
    const sessions = loadSessions();
    if (index >= 0 && index < sessions.length) {
        if (confirm('¿Eliminar esta sesión?')) {
            sessions.splice(index, 1);
            saveSessions(sessions);
            refresh();
        }
    }
}

sessionsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete');
    if (btn) {
        const index = parseInt(btn.dataset.index, 10);
        deleteSession(index);
    }
});

dateInput.value = getTodayLocal();
dateInput.max = getTodayLocal();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = dateInput.value;
    const topic = topicInput.value.trim();
    const minutes = parseInt(minutesInput.value, 10);
    
    if (!topic || minutes <= 0) return;
    
    const today = getTodayLocal();
    if (date > today) {
        alert('No puedes registrar sesiones en fechas futuras');
        return;
    }
    
    const sessions = loadSessions();
    sessions.push({ date, topic, minutes });
    sessions.sort((a, b) => b.date.localeCompare(a.date));
    saveSessions(sessions);
    
    topicInput.value = '';
    minutesInput.value = '';
    dateInput.value = getTodayLocal();
    
    refresh();
});

refresh();

setupHeatmapInteraction();

} // fin if (typeof window !== 'undefined'...)

// Exportar funciones puras para tests (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calcularDatosHeatmap,
        obtenerColorHeatmap,
        formatearFechaHeatmap,
        obtenerAriaLabelHeatmap,
        domingoDeLaSemana,
        sumarDia,
        restarDias,
        esFechaValida,
        HEATMAP_WEEKS
    };
}
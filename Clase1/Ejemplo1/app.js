const STORAGE_KEY = 'diario-estudio-sesiones';

const form = document.getElementById('sessionForm');
const dateInput = document.getElementById('date');
const topicInput = document.getElementById('topic');
const minutesInput = document.getElementById('minutes');
const sessionsList = document.getElementById('sessionsList');
const emptyMessage = document.getElementById('emptyMessage');
const streakNumber = document.getElementById('streakNumber');

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
    
    sessions.forEach(session => {
        const li = document.createElement('li');
        li.className = 'session-item';
        li.innerHTML = `
            <div class="session-info">
                <span class="session-date">${formatDate(session.date)}</span>
                <span class="session-topic">${escapeHtml(session.topic)}</span>
            </div>
            <span class="session-minutes">${session.minutes} min</span>
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

function updateStreak() {
    const sessions = loadSessions();
    const streak = calculateStreak(sessions);
    streakNumber.textContent = streak;
}

function refresh() {
    const sessions = loadSessions();
    renderSessions(sessions);
    updateStreak();
}

dateInput.value = getTodayLocal();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = dateInput.value;
    const topic = topicInput.value.trim();
    const minutes = parseInt(minutesInput.value, 10);
    
    if (!topic || minutes <= 0) return;
    
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
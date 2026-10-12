/**
 * Sistema de autenticación - app.js
 * Maneja el login, contador de intentos y bloqueo temporal
 */

(function() {
    'use strict';

    // Estado de la aplicación
    const state = {
        failedAttempts: 0,
        maxAttempts: 5,
        isLocked: false,
        lockoutSeconds: 30,
        lockoutTimer: null,
        countdownTimer: null,
        credentials: null
    };

    // Elementos del DOM
    const elements = {
        form: document.getElementById('login-form'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        submitBtn: document.getElementById('submit-btn'),
        btnText: document.querySelector('.btn-text'),
        btnLoader: document.querySelector('.btn-loader'),
        attemptsInfo: document.getElementById('attempts-info'),
        attemptsText: document.getElementById('attempts-text'),
        lockoutInfo: document.getElementById('lockout-info'),
        lockoutText: document.getElementById('lockout-text'),
        logoImg: document.getElementById('logo-img')
    };

    // Credenciales válidas (en producción vendrían del backend)
    // Como no podemos leer .env via file://, usamos valores por defecto
    // El usuario puede modificar estas constantes
    const VALID_CREDENTIALS = {
        username: 'admin',
        password: 'admin123'
    };

    /**
     * Inicializa la aplicación
     */
    function init() {
        loadStateFromStorage();
        bindEvents();
        updateUI();
        checkLockout();
        handleLogoError();
    }

    /**
     * Carga el estado persistido en localStorage
     */
    function loadStateFromStorage() {
        try {
            const saved = localStorage.getItem('loginState');
            if (saved) {
                const parsed = JSON.parse(saved);
                state.failedAttempts = parsed.failedAttempts || 0;
                state.isLocked = parsed.isLocked || false;
                state.lockoutSeconds = parsed.lockoutSeconds || 30;
                if (parsed.lockoutUntil) {
                    const now = Date.now();
                    if (parsed.lockoutUntil > now) {
                        state.lockoutSeconds = Math.ceil((parsed.lockoutUntil - now) / 1000);
                    } else {
                        // Lockout expirado
                        state.failedAttempts = 0;
                        state.isLocked = false;
                        state.lockoutSeconds = 30;
                    }
                }
            }
        } catch (e) {
            console.warn('No se pudo cargar el estado guardado:', e);
        }
    }

    /**
     * Guarda el estado en localStorage
     */
    function saveStateToStorage() {
        try {
            const data = {
                failedAttempts: state.failedAttempts,
                isLocked: state.isLocked,
                lockoutSeconds: state.lockoutSeconds,
                lockoutUntil: state.isLocked ? Date.now() + state.lockoutSeconds * 1000 : null
            };
            localStorage.setItem('loginState', JSON.stringify(data));
        } catch (e) {
            console.warn('No se pudo guardar el estado:', e);
        }
    }

    /**
     * Vincula eventos del DOM
     */
    function bindEvents() {
        elements.form.addEventListener('submit', handleSubmit);
        elements.username.addEventListener('input', clearValidation);
        elements.password.addEventListener('input', clearValidation);

        // Prevenir envío con Enter en campos
        elements.username.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                elements.password.focus();
            }
        });
    }

    /**
     * Maneja el envío del formulario
     */
    async function handleSubmit(e) {
        e.preventDefault();

        if (state.isLocked) {
            return;
        }

        const username = elements.username.value.trim();
        const password = elements.password.value;

        // Validación básica
        if (!username || !password) {
            showValidationError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);

        // Simular validación asíncrona
        await simulateAuthDelay();

        const isValid = validateCredentials(username, password);

        if (isValid) {
            handleSuccess();
        } else {
            handleFailure();
        }

        setLoading(false);
    }

    /**
     * Simula un retraso de autenticación
     */
    function simulateAuthDelay() {
        return new Promise(resolve => setTimeout(resolve, 800));
    }

    /**
     * Valida credenciales contra las credenciales válidas
     */
    function validateCredentials(username, password) {
        return username === VALID_CREDENTIALS.username &&
               password === VALID_CREDENTIALS.password;
    }

    /**
     * Maneja login exitoso
     */
    function handleSuccess() {
        // Resetear intentos
        state.failedAttempts = 0;
        state.isLocked = false;
        state.lockoutSeconds = 30;
        saveStateToStorage();

        // Mostrar mensaje de éxito
        showSuccessMessage();

        // Intentar abrir PowerShell (limitado por seguridad del navegador)
        openPowerShellWithMessage();

        // Cerrar la interfaz después de un breve momento
        setTimeout(() => {
            closeWindow();
        }, 1500);
    }

    /**
     * Muestra mensaje de éxito en la interfaz
     */
    function showSuccessMessage() {
        elements.btnText.textContent = '¡Acceso concedido!';
        elements.submitBtn.style.background = '#16a34a';
        elements.form.style.opacity = '0.6';
    }

    /**
     * Intenta abrir PowerShell con el mensaje de éxito
     * NOTA: Los navegadores bloquean la apertura de aplicaciones locales por seguridad.
     * Esto solo funcionará si el archivo se ejecuta en un entorno que lo permita (ej. Electron, Tauri)
     * o si el usuario tiene un protocolo personalizado registrado.
     */
    function openPowerShellWithMessage() {
        // Opción 1: Protocolo personalizado (requiere registro previo en Windows)
        // window.location.href = 'powershell://logueo-exitoso';

        // Opción 2: Intentar con mshta (solo IE/Edge legacy)
        // No recomendado para producción

        // Opción 3: Mostrar instrucciones al usuario
        console.log('%c✅ LOGUEO EXITOSO', 'color: #16a34a; font-size: 24px; font-weight: bold;');
        console.log('Para ver el mensaje en PowerShell, ejecuta manualmente:');
        console.log('powershell -Command "Write-Host \\'logueo exitoso\\' -ForegroundColor Green"');

        // Crear notificación visual
        showToast('✅ Logueo exitoso - Revisa la consola para instrucciones');
    }

    /**
     * Maneja login fallido
     */
    function handleFailure() {
        state.failedAttempts++;
        saveStateToStorage();

        if (state.failedAttempts >= state.maxAttempts) {
            initiateLockout();
        } else {
            showAttemptsRemaining();
            shakeForm();
        }

        // Limpiar contraseña
        elements.password.value = '';
        elements.password.focus();
    }

    /**
     * Inicia el bloqueo de 30 segundos
     */
    function initiateLockout() {
        state.isLocked = true;
        state.lockoutSeconds = 30;
        saveStateToStorage();

        elements.attemptsInfo.classList.add('hidden');
        elements.lockoutInfo.classList.remove('hidden');
        elements.submitBtn.disabled = true;

        startCountdown();
    }

    /**
     * Inicia la cuenta regresiva del bloqueo
     */
    function startCountdown() {
        updateLockoutText();

        state.countdownTimer = setInterval(() => {
            state.lockoutSeconds--;
            saveStateToStorage();

            if (state.lockoutSeconds <= 0) {
                endLockout();
            } else {
                updateLockoutText();
            }
        }, 1000);
    }

    /**
     * Actualiza el texto del bloqueo
     */
    function updateLockoutText() {
        const seconds = state.lockoutSeconds;
        elements.lockoutText.textContent =
            `Demasiados intentos fallidos. Intenta de nuevo en ${seconds} segundo${seconds !== 1 ? 's' : ''}.`;
    }

    /**
     * Finaliza el bloqueo
     */
    function endLockout() {
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;

        state.isLocked = false;
        state.failedAttempts = 0;
        state.lockoutSeconds = 30;
        saveStateToStorage();

        elements.lockoutInfo.classList.add('hidden');
        elements.submitBtn.disabled = false;
        updateUI();
    }

    /**
     * Verifica si hay un bloqueo activo al cargar
     */
    function checkLockout() {
        if (state.isLocked && state.lockoutSeconds > 0) {
            startCountdown();
        } else if (state.isLocked && state.lockoutSeconds <= 0) {
            endLockout();
        }
    }

    /**
     * Muestra intentos restantes
     */
    function showAttemptsRemaining() {
        const remaining = state.maxAttempts - state.failedAttempts;
        elements.attemptsText.textContent =
            `Credenciales incorrectas. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''} antes del bloqueo.`;
        elements.attemptsInfo.classList.remove('hidden');
        elements.lockoutInfo.classList.add('hidden');
    }

    /**
     * Actualiza la UI según el estado
     */
    function updateUI() {
        if (state.isLocked) {
            elements.lockoutInfo.classList.remove('hidden');
            elements.attemptsInfo.classList.add('hidden');
            elements.submitBtn.disabled = true;
            updateLockoutText();
        } else if (state.failedAttempts > 0) {
            showAttemptsRemaining();
            elements.submitBtn.disabled = false;
        } else {
            elements.attemptsInfo.classList.add('hidden');
            elements.lockoutInfo.classList.add('hidden');
            elements.submitBtn.disabled = false;
        }
    }

    /**
     * Limpia validación visual al escribir
     */
    function clearValidation() {
        elements.username.removeAttribute('aria-invalid');
        elements.password.removeAttribute('aria-invalid');
        elements.attemptsInfo.classList.add('hidden');
    }

    /**
     * Muestra error de validación
     */
    function showValidationError(message) {
        elements.username.setAttribute('aria-invalid', 'true');
        elements.password.setAttribute('aria-invalid', 'true');
        elements.attemptsText.textContent = message;
        elements.attemptsInfo.classList.remove('hidden');
        shakeForm();
    }

    /**
     * Animación de vibración en el formulario
     */
    function shakeForm() {
        const card = document.querySelector('.login-card');
        card.style.animation = 'shake 0.4s ease';
        setTimeout(() => {
            card.style.animation = '';
        }, 400);
    }

    /**
     * Activa/desactiva estado de carga
     */
    function setLoading(loading) {
        elements.submitBtn.disabled = loading || state.isLocked;
        if (loading) {
            elements.btnText.classList.add('hidden');
            elements.btnLoader.classList.remove('hidden');
        } else {
            elements.btnText.classList.remove('hidden');
            elements.btnLoader.classList.add('hidden');
        }
    }

    /**
     * Maneja error de carga del logo
     */
    function handleLogoError() {
        elements.logoImg.addEventListener('error', () => {
            elements.logoImg.style.display = 'none';
            // Crear un placeholder visual
            const placeholder = document.createElement('div');
            placeholder.className = 'logo-placeholder';
            placeholder.textContent = 'LOGO';
            placeholder.style.cssText = `
                width: 180px; height: 60px; margin: 0 auto;
                background: linear-gradient(135deg, var(--color-primary), #7c3aed);
                border-radius: 8px; display: flex; align-items: center;
                justify-content: center; color: white; font-weight: 700;
                letter-spacing: 0.1em; font-size: 1.25rem;
            `;
            elements.logoImg.parentNode.insertBefore(placeholder, elements.logoImg);
        });
    }

    /**
     * Muestra un toast/notificación
     */
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 1000;
            background: var(--color-text); color: var(--color-white);
            padding: 1rem 1.5rem; border-radius: var(--radius);
            box-shadow: var(--shadow-lg); animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Intenta cerrar la ventana
     */
    function closeWindow() {
        // window.close() solo funciona si la ventana fue abierta por script
        try {
            window.close();
        } catch (e) {
            // Si no se puede cerrar, mostrar mensaje
            document.body.innerHTML = `
                <div style="
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; min-height: 100vh; padding: 2rem;
                    font-family: var(--font-sans); text-align: center;
                    background: var(--color-bg); color: var(--color-text);
                ">
                    <div style="
                        width: 80px; height: 80px; border-radius: 50%;
                        background: var(--color-success-light); color: var(--color-success);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 2rem; margin-bottom: 1.5rem;
                    ">✓</div>
                    <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">¡Logueo Exitoso!</h1>
                    <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">
                        La sesión ha sido iniciada correctamente.<br>
                        Puedes cerrar esta ventana manualmente.
                    </p>
                    <button onclick="window.close()" class="btn btn-primary" style="width: auto; padding: 0.875rem 2rem;">
                        Cerrar Ventana
                    </button>
                </div>
            `;
        }
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exponer para debugging (opcional)
    window.LoginApp = {
        state: () => ({ ...state }),
        reset: () => {
            state.failedAttempts = 0;
            state.isLocked = false;
            state.lockoutSeconds = 30;
            saveStateToStorage();
            updateUI();
        }
    };

})();
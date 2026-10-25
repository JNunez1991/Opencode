// app.test.js — Tests unitarios para funciones puras del heatmap
// Ejecutar: node --test app.test.js

const { test, describe } = require('node:test');
const assert = require('node:assert');

// Importar funciones puras desde app.js (export condicional al final)
const {
    calcularDatosHeatmap,
    obtenerColorHeatmap,
    formatearFechaHeatmap,
    obtenerAriaLabelHeatmap,
    domingoDeLaSemana,
    sumarDia,
    restarDias,
    esFechaValida,
    HEATMAP_WEEKS
} = require('./app.js');

// Helpers para tests
function makeSession(date, minutes) {
    return { date, minutes };
}

describe('RF-1: Rango temporal fijo de 20 semanas', () => {
    test('calcularDatosHeatmap devuelve 140 días exactos', () => {
        const hoy = '2026-10-24'; // sábado
        const res = calcularDatosHeatmap([], hoy);
        assert.strictEqual(res.dias.length, 140);
        assert.strictEqual(res.fechaInicio, '2026-06-08'); // lunes 20 sem atrás
        assert.strictEqual(res.fechaFin, '2026-10-25');    // domingo semana actual
    });

    test('calcularDatosHeatmap semana actual completa hasta domingo', () => {
        const hoy = '2026-10-21'; // miércoles
        const res = calcularDatosHeatmap([], hoy);
        assert.strictEqual(res.fechaFin, '2026-10-25'); // domingo, no miércoles
    });

    test('HEATMAP_WEEKS constante es 20', () => {
        assert.strictEqual(HEATMAP_WEEKS, 20);
    });
});

describe('RF-2: Agregación de minutos por día', () => {
    test('suma minutos de varias sesiones mismo día', () => {
        const sesiones = [
            makeSession('2026-10-20', 30),
            makeSession('2026-10-20', 15)
        ];
        const res = calcularDatosHeatmap(sesiones, '2026-10-24');
        const dia = res.dias.find(d => d.fecha === '2026-10-20');
        assert.strictEqual(dia.minutos, 45);
    });

    test('varios días distintos mantienen sus minutos separados', () => {
        const sesiones = [
            makeSession('2026-10-19', 20),
            makeSession('2026-10-20', 30),
            makeSession('2026-10-21', 10)
        ];
        const res = calcularDatosHeatmap(sesiones, '2026-10-24');
        assert.strictEqual(res.dias.find(d => d.fecha === '2026-10-19').minutos, 20);
        assert.strictEqual(res.dias.find(d => d.fecha === '2026-10-20').minutos, 30);
        assert.strictEqual(res.dias.find(d => d.fecha === '2026-10-21').minutos, 10);
    });
});

describe('RF-3: Escala de color lineal HSL', () => {
    test('obtenerColorHeatmap 0 min → color base (saturación 0%)', () => {
        const color = obtenerColorHeatmap(0, 100);
        assert.ok(color.startsWith('hsl('));
        // Saturación 0% = color base (--paper equivalente)
        assert.ok(color.includes('0%') || color.includes('0 %'));
    });

    test('obtenerColorHeatmap max min → acento 100% saturación', () => {
        const color = obtenerColorHeatmap(60, 60);
        assert.ok(color.startsWith('hsl('));
        assert.ok(color.includes('100%') || color.includes('100 %'));
    });

    test('obtenerColorHeatmap valor intermedio → saturación proporcional', () => {
        const color = obtenerColorHeatmap(30, 60); // 50%
        assert.ok(color.startsWith('hsl('));
        // 50% de 100% = 50% saturación
        assert.ok(color.includes('50%') || color.includes('50 %'));
    });

    test('obtenerColorHeatmap max=0 → color base (sin división por cero)', () => {
        const color = obtenerColorHeatmap(0, 0);
        assert.ok(color.startsWith('hsl('));
        assert.ok(color.includes('0%') || color.includes('0 %'));
    });
});

describe('RF-4: Formato fecha español forzado', () => {
    test('formatearFechaHeatmap fuerza español - octubre', () => {
        assert.strictEqual(formatearFechaHeatmap('2026-10-15'), '15 oct 2026');
    });

    test('formatearFechaHeatmap fuerza español - enero', () => {
        assert.strictEqual(formatearFechaHeatmap('2026-01-03'), '3 ene 2026');
    });

    test('formatearFechaHeatmap fuerza español - agosto (cambio mes)', () => {
        assert.strictEqual(formatearFechaHeatmap('2026-08-09'), '9 ago 2026');
    });

    test('formatearFechaHeatmap fuerza español - diciembre', () => {
        assert.strictEqual(formatearFechaHeatmap('2026-12-25'), '25 dic 2026');
    });
});

describe('RF-5: Días futuros y pre-historia', () => {
    test('calcularDatosHeatmap marca esFuturo=true para días > hoy', () => {
        const hoy = '2026-10-24';
        const res = calcularDatosHeatmap([], hoy);
        const manana = res.dias.find(d => d.fecha === '2026-10-25');
        assert.strictEqual(manana.esFuturo, true);
    });

    test('calcularDatosHeatmap ignora sesiones fecha futura', () => {
        const sesiones = [makeSession('2099-01-01', 100)];
        const res = calcularDatosHeatmap(sesiones, '2026-10-24');
        assert.strictEqual(res.maxMinutos, 0);
    });

    test('calcularDatosHeatmap marca esPreHistoria=true para días antes de primera sesión', () => {
        const sesiones = [makeSession('2026-10-20', 30)];
        const res = calcularDatosHeatmap(sesiones, '2026-10-24');
        const diaAntes = res.dias.find(d => d.fecha === '2026-10-19');
        assert.strictEqual(diaAntes.esPreHistoria, true);
    });

    test('calcularDatosHeatmap NO marca esPreHistoria si no hay sesiones', () => {
        const res = calcularDatosHeatmap([], '2026-10-24');
        const primerDia = res.dias[0];
        assert.strictEqual(primerDia.esPreHistoria, false);
    });
});

describe('RF-7: aria-label', () => {
    test('obtenerAriaLabelHeatmap sin actividad', () => {
        assert.strictEqual(obtenerAriaLabelHeatmap('2026-10-15', 0), '15 oct 2026, sin actividad');
    });

    test('obtenerAriaLabelHeatmap con minutos singular', () => {
        assert.strictEqual(obtenerAriaLabelHeatmap('2026-10-15', 1), '15 oct 2026, 1 minutos estudiados');
    });

    test('obtenerAriaLabelHeatmap con minutos plural', () => {
        assert.strictEqual(obtenerAriaLabelHeatmap('2026-10-15', 45), '15 oct 2026, 45 minutos estudiados');
    });
});

describe('Casos límite: datos sucios y localStorage corrupto', () => {
    test('localStorage corrupto (null) → devuelve estructura vacía', () => {
        const res = calcularDatosHeatmap(null, '2026-10-24');
        assert.strictEqual(res.dias.length, 140);
        assert.strictEqual(res.maxMinutos, 0);
    });

    test('localStorage corrupto (array con objetos inválidos) → ignora inválidos', () => {
        const sesiones = [
            { date: '2026-10-20', minutes: 30 },      // válido
            { date: '2026-10-21' },                    // sin minutes
            { minutes: 45 },                           // sin date
            { date: 'invalid', minutes: 10 },          // fecha inválida
            { date: '2026-10-22', minutes: 'abc' },   // minutes no numérico
            { date: '2026-10-23', minutes: 20 }       // válido
        ];
        const res = calcularDatosHeatmap(sesiones, '2026-10-24');
        // Solo 2 válidas
        assert.strictEqual(res.dias.find(d => d.fecha === '2026-10-20').minutos, 30);
        assert.strictEqual(res.dias.find(d => d.fecha === '2026-10-23').minutos, 20);
        assert.strictEqual(res.maxMinutos, 30);
    });

    test('sesión con fecha futura en localStorage → se ignora para max y render', () => {
        const sesiones = [
            makeSession('2026-10-20', 30),
            makeSession('2099-01-01', 500) // futura
        ];
        const res = calcularDatosHeatmap(sesiones, '2026-10-24');
        assert.strictEqual(res.maxMinutos, 30); // no 500
    });
});

describe('Helpers de fecha (zona local, sin toISOString)', () => {
    test('domingoDeLaSemana: si hoy es lunes, domingo = hoy + 6', () => {
        // 2026-10-19 es lunes
        assert.strictEqual(domingoDeLaSemana('2026-10-19'), '2026-10-25');
    });

    test('domingoDeLaSemana: si hoy es domingo, domingo = hoy', () => {
        // 2026-10-25 es domingo
        assert.strictEqual(domingoDeLaSemana('2026-10-25'), '2026-10-25');
    });

    test('domingoDeLaSemana: si hoy es miércoles, domingo = hoy + 4', () => {
        // 2026-10-21 es miércoles
        assert.strictEqual(domingoDeLaSemana('2026-10-21'), '2026-10-25');
    });

    test('sumarDia y restarDias funcionan en zona local', () => {
        assert.strictEqual(sumarDia('2026-10-24'), '2026-10-25');
        assert.strictEqual(restarDias('2026-10-24', 1), '2026-10-23');
        assert.strictEqual(restarDias('2026-10-24', 139), '2026-06-07');
    });

    test('esFechaValida rechaza formatos inválidos', () => {
        assert.strictEqual(esFechaValida('2026-10-15'), true);
        assert.strictEqual(esFechaValida('2026-13-01'), false); // mes inválido
        assert.strictEqual(esFechaValida('2026-02-30'), false); // día inválido
        assert.strictEqual(esFechaValida('invalid'), false);
        assert.strictEqual(esFechaValida(''), false);
        assert.strictEqual(esFechaValida(null), false);
    });
});
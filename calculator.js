// =============================================
//      calculator.js - Código Completo
// =============================================

/**
 * Calcula la cantidad de bolsas y el volumen final a preparar.
 * Recibe el número de pacientes YA AJUSTADO con el margen (+1).
 * @param {number} numPatients - El número de pacientes (ajustado) para calcular.
 * @param {number} [litersPerPatient=6] - Litros de solución necesarios por paciente.
 * @param {number} [litersPerBag=8] - Litros de solución que rinde cada bolsa.
 * @returns {object|null} Un objeto { bags: number, liters: number } o null si la entrada es inválida.
 */
function calculateBicarbPreparation(numPatients, litersPerPatient = 6, litersPerBag = 8) {
    // Validación del número recibido por la función
    if (isNaN(numPatients) || numPatients === null || numPatients <= 0) {
         console.error("Número de pacientes para cálculo inválido recibido por la función:", numPatients);
         return null; // Indica que el cálculo no se pudo realizar
    }

    // Cálculo principal
    const totalLitersNeeded = numPatients * litersPerPatient; // Necesidad teórica para numPatients
    const minBags = totalLitersNeeded / litersPerBag;        // Bolsas teóricas
    const bagsToUse = Math.ceil(minBags);                    // Redondeo SIEMPRE hacia arriba a bolsas enteras
    const finalVolumeToPrepare = bagsToUse * litersPerBag;   // Volumen real a preparar con esas bolsas

    // Devuelve el resultado
    return {
        bags: bagsToUse,
        liters: finalVolumeToPrepare
    };
}


// --- Interacción con el DOM (Se ejecuta cuando el HTML está listo) ---
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del HTML
    const numPatientsInput = document.getElementById('numPatientsInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultArea = document.getElementById('resultArea');

    // --- Función que se ejecuta al hacer clic en el botón Calcular ---
    calculateBtn.addEventListener('click', () => {
        // Limpiar resultado anterior y quitar clase error si existía
        resultArea.innerHTML = '';
        resultArea.classList.remove('error');

        // 1. Obtener número REAL de pacientes del input
        const actualPatients = parseInt(numPatientsInput.value, 10);

        // 2. Validar entrada inicial (permitimos 0 pacientes)
        if (isNaN(actualPatients) || actualPatients === null || actualPatients < 0) {
             resultArea.innerHTML = `<p>Por favor, ingrese un número válido de pacientes (0 o más).</p>`;
             resultArea.classList.add('error');
             return; // Salir si la entrada no es válida
        }

        // 3. Aplicar margen de error +1 paciente INTERNAMENTE
        const calculationPatients = actualPatients + 1;

        // 4. Llamar a la función de cálculo con el número AJUSTADO
        const result = calculateBicarbPreparation(calculationPatients);

        // 5. Mostrar resultados si el cálculo fue exitoso
        if (result) {
            let initialWaterInstructionText;
            const finalVolume = result.liters;

            // --- Lógica Condicional para Instrucción de Agua Inicial ---
            if (result.bags === 1) {
                // Caso especial: 1 sola bolsa (8 Litros finales)
                initialWaterInstructionText = `
                    Para 1 bolsa (${finalVolume}L): Llenar agua inicial hasta aprox. <strong>6-7 Litros</strong>.
                    <br><small style="display: block; margin-top: 5px; color: #6c757d;">
                        (Mezclar y luego ajustar cuidadosamente hasta la marca final de ${finalVolume}L).
                    </small>
                `;
            } else {
                // Caso general: Más de 1 bolsa
                // Aplicar regla "-10L", asegurando que sea al menos 1 Litro
                const initialWater = Math.max(1, finalVolume - 10);
                initialWaterInstructionText = `
                    Llenar Mixer con agua hasta aprox. <strong class="result-value" style="color: #007bff;">${initialWater}</strong> Litros.
                    <br><small style="display: block; margin-top: 5px; color: #6c757d;">
                        (Regla "Volumen Final - 10L". Ajustar a ${finalVolume}L exactos después de disolver).
                    </small>
                `;
            }
            // --- Fin Lógica Condicional ---

            // Construir el HTML completo para mostrar en el área de resultados
            resultArea.innerHTML = `
                <p style="font-weight:bold; margin-bottom: 5px;">Resultados para ${actualPatients} pacientes (+1 de margen):</p>
                <small style="display: block; margin-bottom: 10px; color: #6c757d;">(Se calcula usando ${calculationPatients} pacientes para asegurar margen)</small>

                <p>Usar: <strong class="result-value">${result.bags}</strong> bolsas</p>
                <p>Volumen Final Objetivo: <strong class="result-value">${finalVolume}</strong> Litros</p>
                <hr style="margin: 10px 0; border-top: 1px solid #ccc;">
                <p style="font-weight: bold;">Instrucción Inicial:</p>
                <div style="margin-top: 5px;">${initialWaterInstructionText}</div>
                <hr style="margin: 15px 0; border-top: 1px solid #ccc;">
                <div style="text-align: left; font-size: 0.9em;">
                    <p style="font-weight: bold; margin-bottom: 5px;">Recordatorios Importantes:</p>
                    <ul>
                        <li>Verificar Lote y Vencimiento de las ${result.bags} bolsas.</li>
                        <li style="color: #dc3545; font-weight: bold;">¡ASEGURAR AUSENCIA de Cloro residual en Mixer ANTES de añadir polvo! (<0.1ppm)</li>
                    </ul>
                </div>
            `;
        } else {
             // Si calculateBicarbPreparation devolvió null (no debería pasar con la validación previa, pero por seguridad)
             resultArea.innerHTML = `<p>Error inesperado en el cálculo.</p>`;
             resultArea.classList.add('error');
        }
    }); // Fin del addEventListener 'click'

     // Opcional: Permitir calcular presionando la tecla Enter en el campo de entrada
     numPatientsInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            // Prevenir el comportamiento por defecto (ej. enviar formulario si lo hubiera)
            e.preventDefault();
            // Simular un clic en el botón de calcular
            calculateBtn.click();
        }
    });

}); // Fin del addEventListener DOMContentLoaded
// --- Lógica de Cálculo Pura (Reutilizable) ---
function calculateBicarbPreparation(numPatients, litersPerPatient = 6, litersPerBag = 8) {
    // Validación básica de entrada
    if (isNaN(numPatients) || numPatients === null || numPatients <= 0) {
        // Podríamos devolver un error o valores nulos/cero
        // Por ahora, devolvemos null para indicar input inválido
        console.error("Número de pacientes inválido:", numPatients);
        return null;
    }

    const totalLitersNeeded = numPatients * litersPerPatient;
    const minBags = totalLitersNeeded / litersPerBag;
    const bagsToUse = Math.ceil(minBags); // Redondear SIEMPRE hacia arriba
    const finalVolumeToPrepare = bagsToUse * litersPerBag;

    // Devolver un objeto con los resultados
    return {
        bags: bagsToUse,
        liters: finalVolumeToPrepare
    };
}

// --- Interacción con el DOM (COMPLETA) ---
// Asegúrate de que la función calculateBicarbPreparation(numPatients, ...) esté definida antes de este bloque.

document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del HTML
    const numPatientsInput = document.getElementById('numPatientsInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultArea = document.getElementById('resultArea');

    // Función que se ejecuta al hacer clic en el botón Calcular
    calculateBtn.addEventListener('click', () => {
        // Limpiar resultado anterior y quitar clase error si existía
        resultArea.innerHTML = '';
        resultArea.classList.remove('error');

        // Obtener y parsear valor del input, asegurando que sea número
        const numPatients = parseInt(numPatientsInput.value, 10);

        // Llamar a la función de cálculo reutilizable (asume parámetros por defecto 6 y 8)
        const result = calculateBicarbPreparation(numPatients);

        // Validar el resultado y que el número de pacientes sea positivo
        if (result && numPatients > 0) {
            // Calcular volumen de agua inicial según regla "-10L"
            const initialWaterInstruction = result.liters - 10;

            // Construir el HTML para mostrar en el área de resultados
            resultArea.innerHTML = `
                <p style="font-weight:bold; margin-bottom: 10px;">Resultados para ${numPatients} pacientes:</p>
                <p>Usar: <strong class="result-value">${result.bags}</strong> bolsas</p>
                <p>Volumen Final Objetivo: <strong class="result-value">${result.liters}</strong> Litros</p>
                <hr style="margin: 10px 0; border-top: 1px solid #ccc;">
                <p style="font-weight: bold;">Instrucción Inicial:</p>
                <p>Llenar Mixer con agua de ósmosis hasta aprox. <strong class="result-value" style="color: #007bff;">${initialWaterInstruction}</strong> Litros.</p>
                <small style="display: block; margin-top: 5px; color: #6c757d;">
                    (Regla "Volumen Final - 10L". Recuerde ajustar al volumen final exacto de ${result.liters}L después de disolver el bicarbonato).
                </small>
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
            // Mostrar mensaje de error si la entrada no es válida
            resultArea.innerHTML = `<p>Por favor, ingrese un número válido de pacientes (mayor que cero).</p>`;
            resultArea.classList.add('error'); // Añadir clase para posible estilo de error
        }
    });

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
// price-calculator.js - Sistema de cálculo automático de precios

console.log('🧮 Inicializando sistema de cálculo de precios...');

// Variables para controlar el modo manual
let wholesaleManual = false;
let retailManual = false;

// Función para calcular todos los precios desde el costo
function calculatePricesFromCost() {
    const costPrice = parseFloat(document.getElementById('product-cost-price').value) || 0;
    const wholesalePercentage = parseInt(document.getElementById('wholesale-percentage').value) || 100;
    const retailPercentage = parseInt(document.getElementById('retail-percentage').value) || 150;
    
    // Calcular precios
    const calculatedWholesale = costPrice * (wholesalePercentage / 100);
    const calculatedRetail = costPrice * (retailPercentage / 100);
    
    // Actualizar campos calculados (solo lectura)
    document.getElementById('wholesale-calculated').textContent = calculatedWholesale.toFixed(2);
    document.getElementById('retail-calculated').textContent = calculatedRetail.toFixed(2);
    
    // Solo actualizar los campos de entrada si no están en modo manual
    if (!wholesaleManual) {
        document.getElementById('product-wholesale-price').value = calculatedWholesale.toFixed(2);
    }
    
    if (!retailManual) {
        document.getElementById('product-retail-price').value = calculatedRetail.toFixed(2);
    }
    
    // Validar que el minorista sea mayor o igual al mayorista
    validatePriceRelationship();
}

// Función para calcular precio mayorista
function calculateWholesalePrice() {
    const costPrice = parseFloat(document.getElementById('product-cost-price').value) || 0;
    const wholesalePercentage = parseInt(document.getElementById('wholesale-percentage').value) || 100;
    
    const calculatedWholesale = costPrice * (wholesalePercentage / 100);
    
    // Actualizar campo calculado
    document.getElementById('wholesale-calculated').textContent = calculatedWholesale.toFixed(2);
    
    // Actualizar campo de entrada y salir del modo manual
    document.getElementById('product-wholesale-price').value = calculatedWholesale.toFixed(2);
    wholesaleManual = false;
    updateInputStyle('product-wholesale-price', false);
    
    // Validar relación de precios
    validatePriceRelationship();
}

// Función para calcular precio minorista
function calculateRetailPrice() {
    const costPrice = parseFloat(document.getElementById('product-cost-price').value) || 0;
    const retailPercentage = parseInt(document.getElementById('retail-percentage').value) || 150;
    
    const calculatedRetail = costPrice * (retailPercentage / 100);
    
    // Actualizar campo calculado
    document.getElementById('retail-calculated').textContent = calculatedRetail.toFixed(2);
    
    // Actualizar campo de entrada y salir del modo manual
    document.getElementById('product-retail-price').value = calculatedRetail.toFixed(2);
    retailManual = false;
    updateInputStyle('product-retail-price', false);
    
    // Validar relación de precios
    validatePriceRelationship();
}

// Función para marcar un precio como manual
function markAsManual(priceType) {
    if (priceType === 'wholesale') {
        wholesaleManual = true;
        updateInputStyle('product-wholesale-price', true);
    } else if (priceType === 'retail') {
        retailManual = true;
        updateInputStyle('product-retail-price', true);
    }
}

// Actualizar estilo del input según modo
function updateInputStyle(inputId, isManual) {
    const input = document.getElementById(inputId);
    if (input) {
        if (isManual) {
            input.classList.add('manual-mode');
            
            // Agregar o actualizar badge
            let badge = input.parentElement.querySelector('.manual-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'manual-badge';
                badge.textContent = 'MANUAL';
                input.parentElement.style.position = 'relative';
                input.parentElement.appendChild(badge);
            }
        } else {
            input.classList.remove('manual-mode');
            
            // Remover badge
            const badge = input.parentElement.querySelector('.manual-badge');
            if (badge) {
                badge.remove();
            }
        }
    }
}

// Validar que el precio minorista sea mayor o igual al mayorista
function validatePriceRelationship() {
    const wholesalePrice = parseFloat(document.getElementById('product-wholesale-price').value) || 0;
    const retailPrice = parseFloat(document.getElementById('product-retail-price').value) || 0;
    
    const retailInput = document.getElementById('product-retail-price');
    const wholesaleInput = document.getElementById('product-wholesale-price');
    
    if (retailPrice < wholesalePrice) {
        retailInput.style.borderColor = '#ef4444';
        retailInput.style.backgroundColor = '#fef2f2';
        showPriceWarning('El precio minorista debe ser mayor o igual al precio mayorista');
        return false;
    } else {
        retailInput.style.borderColor = '';
        retailInput.style.backgroundColor = '';
        hidePriceWarning();
        return true;
    }
}

// Mostrar advertencia de precios
function showPriceWarning(message) {
    let warningElement = document.getElementById('price-warning');
    
    if (!warningElement) {
        warningElement = document.createElement('div');
        warningElement.id = 'price-warning';
        warningElement.className = 'price-warning';
        warningElement.style.cssText = `
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 10px 15px;
            margin: 10px 0;
            color: #92400e;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const priceRow = document.querySelector('.form-row:has(#product-retail-price)');
        if (priceRow) {
            priceRow.parentNode.insertBefore(warningElement, priceRow);
        }
    }
    
    warningElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button onclick="hidePriceWarning()" style="margin-left: auto; background: none; border: none; color: #92400e; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
}

function hidePriceWarning() {
    const warningElement = document.getElementById('price-warning');
    if (warningElement) {
        warningElement.remove();
    }
}

// Función para resetear todos los modos manuales
function resetManualModes() {
    wholesaleManual = false;
    retailManual = false;
    
    const wholesaleInput = document.getElementById('product-wholesale-price');
    const retailInput = document.getElementById('product-retail-price');
    
    if (wholesaleInput) {
        wholesaleInput.classList.remove('manual-mode');
        const wholesaleBadge = wholesaleInput.parentElement.querySelector('.manual-badge');
        if (wholesaleBadge) wholesaleBadge.remove();
    }
    
    if (retailInput) {
        retailInput.classList.remove('manual-mode');
        const retailBadge = retailInput.parentElement.querySelector('.manual-badge');
        if (retailBadge) retailBadge.remove();
    }
}

// Inicializar el sistema de precios
function initPriceCalculator() {
    console.log('🧮 Inicializando calculadora de precios...');
    
    // Configurar event listeners
    document.getElementById('product-cost-price')?.addEventListener('input', calculatePricesFromCost);
    document.getElementById('wholesale-percentage')?.addEventListener('input', calculateWholesalePrice);
    document.getElementById('retail-percentage')?.addEventListener('input', calculateRetailPrice);
    
    document.getElementById('product-wholesale-price')?.addEventListener('input', function() {
        markAsManual('wholesale');
        validatePriceRelationship();
    });
    
    document.getElementById('product-retail-price')?.addEventListener('input', function() {
        markAsManual('retail');
        validatePriceRelationship();
    });
    
    // Calcular precios iniciales
    setTimeout(calculatePricesFromCost, 100);
    
    console.log('✅ Sistema de cálculo de precios inicializado');
}




// Hacer funciones disponibles globalmente
window.calculatePricesFromCost = calculatePricesFromCost;
window.calculateWholesalePrice = calculateWholesalePrice;
window.calculateRetailPrice = calculateRetailPrice;
window.markAsManual = markAsManual;
window.resetManualModes = resetManualModes;
window.validatePriceRelationship = validatePriceRelationship;
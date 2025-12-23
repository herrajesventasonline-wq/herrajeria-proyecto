// price-adjustment-fixed.js - Versión funcional completa
console.log('💰 Iniciando sistema de ajuste de precios...');

// Variables globales
let priceAdjustmentState = {
    selectedProducts: [],
    filteredProducts: [],
    currentAdjustment: null
};

// Función para mostrar el modal
function showPriceAdjustmentModal() {
    console.log('📊 Mostrando modal de ajuste de precios');

    const modal = document.getElementById('price-adjustment-modal');
    const overlay = document.getElementById('overlay');

    if (!modal || !overlay) {
        console.error('❌ No se encontró el modal o overlay');
        return;
    }

    // Resetear formulario
    resetPriceAdjustmentForm();

    // Mostrar modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';

    console.log('✅ Modal visible:', modal.style.display, modal.classList);
}

// Función para ocultar el modal
function hidePriceAdjustmentModal() {
    const modal = document.getElementById('price-adjustment-modal');
    const overlay = document.getElementById('overlay');

    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Resetear formulario
function resetPriceAdjustmentForm() {
    const form = document.getElementById('price-adjustment-form');
    if (form) form.reset();

    // Ocultar campos condicionales
    const categoryField = document.getElementById('category-field');
    const brandField = document.getElementById('brand-field');
    const previewSection = document.getElementById('preview-section');

    if (categoryField) categoryField.style.display = 'none';
    if (brandField) brandField.style.display = 'none';
    if (previewSection) previewSection.style.display = 'none';

    // Resetear estado
    priceAdjustmentState.selectedProducts = [];
}

// Configurar el modal
function setupPriceAdjustmentModal() {
    console.log('⚙️ Configurando modal de ajuste de precios...');

    // Botón para abrir el modal
    const btn = document.getElementById('price-adjustment-btn-2');
    if (btn) {
        btn.addEventListener('click', showPriceAdjustmentModal);
        console.log('✅ Botón configurado');
    } else {
        console.error('❌ No se encontró el botón price-adjustment-btn-2');
    }

    // Botón para cerrar el modal
    const closeBtn = document.querySelector('#price-adjustment-modal .close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePriceAdjustmentModal);
    }

    const cancelBtn = document.getElementById('cancel-adjustment');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hidePriceAdjustmentModal);
    }

    // Overlay para cerrar
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', hidePriceAdjustmentModal);
    }

    // Configurar cambios en el select "Aplicar a"
    const applyToSelect = document.getElementById('apply-to');
    if (applyToSelect) {
        applyToSelect.addEventListener('change', function () {
            const value = this.value;
            const categoryField = document.getElementById('category-field');
            const brandField = document.getElementById('brand-field');

            if (categoryField) {
                categoryField.style.display = value === 'category' ? 'block' : 'none';
            }
            if (brandField) {
                brandField.style.display = value === 'brand' ? 'block' : 'none';
            }

            updatePreview();
        });
    }

    // Configurar cambio en tipo de ajuste
    const adjustmentType = document.getElementById('adjustment-type');
    if (adjustmentType) {
        adjustmentType.addEventListener('change', function () {
            const hint = document.getElementById('adjustment-hint');
            if (hint) {
                hint.textContent = this.value === 'percentage'
                    ? 'Ingrese el porcentaje (ej: 10 para 10%, -5 para -5%)'
                    : 'Ingrese el monto fijo (ej: 50 para $50, -20 para -$20)';
            }
            updatePreview();
        });
    }

    // Configurar inputs para actualizar vista previa
    const inputsToWatch = ['adjustment-value', 'adjustment-operation', 'adjust-wholesale', 'adjust-retail'];
    inputsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updatePreview);
            element.addEventListener('change', updatePreview);
        }
    });

    // Configurar formulario
    const form = document.getElementById('price-adjustment-form');
    if (form) {
        form.addEventListener('submit', handlePriceAdjustmentSubmit);
    }

    console.log('✅ Modal configurado');
}

// Actualizar vista previa
function updatePreview() {
    const applyTo = document.getElementById('apply-to')?.value;
    const adjustmentType = document.getElementById('adjustment-type')?.value;
    const operation = document.getElementById('adjustment-operation')?.value;
    const value = parseFloat(document.getElementById('adjustment-value')?.value || 0);
    const adjustWholesale = document.getElementById('adjust-wholesale')?.checked;
    const adjustRetail = document.getElementById('adjust-retail')?.checked;

    const previewSection = document.getElementById('preview-section');
    const previewDetails = document.getElementById('preview-details');
    const affectedProducts = document.getElementById('affected-products');

    if (!previewSection || !previewDetails || !affectedProducts) return;

    // Validar campos requeridos
    if (!adjustmentType || !operation || value === 0 || (!adjustWholesale && !adjustRetail)) {
        previewSection.style.display = 'none';
        return;
    }

    // Calcular productos afectados
    let productsCount = 0;
    let targetDescription = '';

    if (window.adminProducts && window.adminProducts.length > 0) {
        switch (applyTo) {
            case 'all':
                productsCount = window.adminProducts.filter(p => p.is_active).length;
                targetDescription = 'Todos los productos';
                break;

            case 'category':
                const categoryId = document.getElementById('adjustment-category')?.value;
                if (!categoryId) {
                    previewSection.style.display = 'none';
                    return;
                }
                productsCount = window.adminProducts.filter(p =>
                    p.category_id === categoryId && p.is_active
                ).length;
                const categoryName = document.querySelector(`#adjustment-category option[value="${categoryId}"]`)?.textContent || 'Categoría';
                targetDescription = `Categoría: ${categoryName}`;
                break;

            case 'brand':
                const brandId = document.getElementById('adjustment-brand')?.value;
                if (!brandId) {
                    previewSection.style.display = 'none';
                    return;
                }
                productsCount = window.adminProducts.filter(p =>
                    p.brand_id === brandId && p.is_active
                ).length;
                const brandName = document.querySelector(`#adjustment-brand option[value="${brandId}"]`)?.textContent || 'Marca';
                targetDescription = `Marca: ${brandName}`;
                break;

            case 'selected':
                productsCount = priceAdjustmentState.selectedProducts.length;
                targetDescription = `Productos seleccionados: ${productsCount}`;
                break;
        }
    }

    if (productsCount === 0) {
        previewSection.style.display = 'none';
        return;
    }

    // Crear texto de vista previa
    const priceTypes = [];
    if (adjustWholesale) priceTypes.push('Mayorista');
    if (adjustRetail) priceTypes.push('Minorista');

    let exampleText = '';

    if (adjustmentType === 'percentage') {
        const percentageText = operation === 'increase' ? `+${value}%` : `-${value}%`;
        exampleText = `
            <div><strong>Ajuste:</strong> ${percentageText}</div>
            <div><strong>Aplicado a:</strong> ${targetDescription}</div>
            <div><strong>Precios afectados:</strong> ${priceTypes.join(' y ')}</div>
            <div><strong>Productos afectados:</strong> ${productsCount}</div>
        `;
    } else {
        const amountText = operation === 'increase' ? `+$${value.toFixed(2)}` : `-$${value.toFixed(2)}`;
        exampleText = `
            <div><strong>Ajuste:</strong> ${amountText}</div>
            <div><strong>Aplicado a:</strong> ${targetDescription}</div>
            <div><strong>Precios afectados:</strong> ${priceTypes.join(' y ')}</div>
            <div><strong>Productos afectados:</strong> ${productsCount}</div>
        `;
    }

    previewDetails.innerHTML = exampleText;
    affectedProducts.textContent = productsCount;
    previewSection.style.display = 'block';
}

// Manejar envío del formulario - VERSIÓN CORREGIDA
// price-adjustment-fixed.js - Reemplaza la función handlePriceAdjustmentSubmit completa con esta:

async function handlePriceAdjustmentSubmit(e) {
    e.preventDefault();
    console.log('🔄 Procesando ajuste de precios...');

    const submitBtn = document.getElementById('apply-adjustment');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        // Esperar a que Supabase esté listo
        await waitForSupabase();

        if (!window.supabaseClient || !window.supabaseClient.client) {
            throw new Error('Supabase client no está disponible');
        }

        // Obtener datos del formulario
        const formData = getPriceAdjustmentFormData();

        // Validar
        const validation = validatePriceAdjustmentForm(formData);
        if (!validation.valid) {
            alert(validation.message);
            throw new Error(validation.message);
        }

        // Obtener los productos a ajustar
        const productsToAdjust = await getProductsToAdjust(formData);

        if (productsToAdjust.length === 0) {
            alert('No hay productos para ajustar con los criterios seleccionados.');
            throw new Error('No hay productos para ajustar');
        }

        // Mostrar confirmación con detalles
        const confirmationText = getConfirmationText(formData, productsToAdjust.length);
        const confirmed = confirm(`¿Está seguro de aplicar este ajuste de precios a ${productsToAdjust.length} productos?\n\n${confirmationText}\n\nEsta acción no se puede deshacer.`);

        if (!confirmed) {
            throw new Error('Ajuste cancelado por el usuario');
        }

        // Obtener el ID del usuario admin
        const adminUserId = await getAdminUserId();

        // Determinar los tipos de precios a ajustar
        const priceTypes = [];
        if (formData.adjust_wholesale) priceTypes.push('wholesale');
        if (formData.adjust_retail) priceTypes.push('retail');

        // Preparar el registro del ajuste principal
        const adjustmentRecord = {
            adjustment_percentage: formData.adjustment_type === 'percentage' ? formData.adjustment_value : null,
            adjustment_value: formData.adjustment_type === 'fixed' ? formData.adjustment_value : null,
            applied_to: formData.apply_to,
            applied_by: adminUserId,
            price_types: priceTypes,
            affected_products_count: productsToAdjust.length,
            details: JSON.stringify({
                operation: formData.operation,
                adjustment_type: formData.adjustment_type,
                apply_to: formData.apply_to,
                target_category: formData.category || null,
                target_brand: formData.brand || null
            })
        };

        // Solo agregar target_id si es necesario (para categoría o marca)
        if (formData.apply_to === 'category' && formData.category) {
            adjustmentRecord.target_id = formData.category;
        } else if (formData.apply_to === 'brand' && formData.brand) {
            adjustmentRecord.target_id = formData.brand;
        }

        console.log('📝 Insertando registro de ajuste:', adjustmentRecord);

        // Insertar el registro del ajuste
        const { data: adjustment, error: adjustmentError } = await window.supabaseClient.client
            .from('price_adjustments')
            .insert(adjustmentRecord)
            .select()
            .single();

        if (adjustmentError) {
            console.error('❌ Error insertando ajuste:', adjustmentError);
            throw new Error(`Error al guardar el ajuste: ${adjustmentError.message}`);
        }

        console.log('✅ Ajuste registrado:', adjustment.id);

        // Ahora actualizar cada producto y guardar detalles
        const adjustmentDetails = [];
        const updatedProducts = [];

        for (const product of productsToAdjust) {
            try {
                let updateData = {};
                const detailRecord = {
                    adjustment_id: adjustment.id,
                    product_id: product.id,
                    previous_wholesale_price: product.wholesale_price,
                    previous_retail_price: product.retail_price
                };

                // Calcular y aplicar ajustes
                if (formData.adjust_wholesale) {
                    const newWholesalePrice = calculateNewPrice(
                        product.wholesale_price,
                        formData.adjustment_type,
                        formData.operation,
                        formData.adjustment_value
                    );

                    if (newWholesalePrice !== product.wholesale_price) {
                        updateData.wholesale_price = newWholesalePrice;
                        detailRecord.new_wholesale_price = newWholesalePrice;
                    }
                }

                if (formData.adjust_retail) {
                    const newRetailPrice = calculateNewPrice(
                        product.retail_price,
                        formData.adjustment_type,
                        formData.operation,
                        formData.adjustment_value
                    );

                    if (newRetailPrice !== product.retail_price) {
                        updateData.retail_price = newRetailPrice;
                        detailRecord.new_retail_price = newRetailPrice;
                    }
                }

                // Si hay cambios, actualizar el producto
                if (Object.keys(updateData).length > 0) {
                    const { error: updateError } = await window.supabaseClient.client
                        .from('products')
                        .update(updateData)
                        .eq('id', product.id);

                    if (updateError) {
                        console.error(`❌ Error actualizando producto ${product.id}:`, updateError);
                        continue;
                    }

                    updatedProducts.push(product.id);

                    // Solo agregar detalles si hubo cambios en precios
                    if (detailRecord.new_wholesale_price || detailRecord.new_retail_price) {
                        adjustmentDetails.push(detailRecord);
                    }
                }

            } catch (productError) {
                console.error(`❌ Error procesando producto ${product.id}:`, productError);
                // Continuar con el siguiente producto
            }
        }

        // Insertar los detalles del ajuste si hay
        if (adjustmentDetails.length > 0) {
            const { error: detailsError } = await window.supabaseClient.client
                .from('price_adjustment_details')
                .insert(adjustmentDetails);

            if (detailsError) {
                console.error('⚠️ Error insertando detalles:', detailsError);
                // No lanzamos error aquí para no interrumpir el éxito del ajuste principal
            }

            console.log(`✅ ${adjustmentDetails.length} detalles de ajuste guardados`);
        }

        // Mostrar resumen final
        console.log(`✅ Ajuste completado. ${updatedProducts.length} productos actualizados de ${productsToAdjust.length} procesados.`);

        // Mostrar mensaje de éxito
        alert(`✅ Ajuste de precios aplicado exitosamente\n\n• Productos afectados: ${updatedProducts.length}\n• Ajuste aplicado: ${getConfirmationText(formData, updatedProducts.length)}`);

             // Cerrar modal
        hidePriceAdjustmentModal();

        console.log('🔄 Actualizando interfaz de usuario...');
        
        // Actualizar productos inmediatamente
        if (window.adminProducts && updatedProducts.length > 0) {
            // Actualizar los precios en memoria para reflejar cambios inmediatos
            updatedProducts.forEach(productId => {
                const product = adminProducts.find(p => p.id === productId);
                if (product) {
                    if (formData.adjust_wholesale) {
                        product.wholesale_price = calculateNewPrice(
                            product.wholesale_price,
                            formData.adjustment_type,
                            formData.operation,
                            formData.adjustment_value
                        );
                    }
                    if (formData.adjust_retail) {
                        product.retail_price = calculateNewPrice(
                            product.retail_price,
                            formData.adjustment_type,
                            formData.operation,
                            formData.adjustment_value
                        );
                    }
                }
            });
            
            // Forzar actualización de la UI
            window.adminProducts = adminProducts;
        }

        // Recargar datos desde la base de datos
        setTimeout(() => {
            if (typeof window.reloadAdminProducts === 'function') {
                window.reloadAdminProducts();
            } else if (typeof window.loadAdminData === 'function') {
                window.loadAdminData();
            } else {
                window.location.reload();
            }
        }, 500);

    } catch (error) {
        console.error('❌ Error en ajuste de precios:', error);
        if (error.message !== 'Ajuste cancelado por el usuario') {
            alert(`❌ Error: ${error.message}`);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}
// Función para validar UUID (agrega esta función cerca de las otras funciones de utilidad)
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
// Función para obtener productos según el criterio
// REEMPLAZA la función getProductsToAdjust completa con esta:
async function getProductsToAdjust(formData) {
    console.log('🔍 Obteniendo productos para ajustar...');
    
    try {
        // Si se seleccionaron productos específicos
        if (formData.apply_to === 'selected') {
            return priceAdjustmentState.selectedProducts || [];
        }

        // Para otros casos, obtener de la base de datos
        let query = window.supabaseClient.client
            .from('products')
            .select(`
                *,
                categories(name),
                brands(name)
            `)
            .eq('is_active', true);

        // Aplicar filtros según el criterio
        if (formData.apply_to === 'category' && formData.category) {
            query = query.eq('category_id', formData.category);
            console.log(`📂 Filtrando por categoría: ${formData.category}`);
        } else if (formData.apply_to === 'brand' && formData.brand) {
            query = query.eq('brand_id', formData.brand);
            console.log(`🏷️ Filtrando por marca: ${formData.brand}`);
        }
        // Para 'all' no aplicamos filtros adicionales

        const { data, error } = await query;
        
        if (error) {
            console.error('❌ Error obteniendo productos:', error);
            throw error;
        }

        console.log(`✅ ${data?.length || 0} productos encontrados para ajustar`);
        return data || [];

    } catch (error) {
        console.error('❌ Error en getProductsToAdjust:', error);
        throw new Error(`Error al obtener productos: ${error.message}`);
    }
}

// Calcular nuevo precio
// REEMPLAZA la función calculateNewPrice con esta versión mejorada:
function calculateNewPrice(oldPrice, adjustmentType, operation, value) {
    console.log(`🧮 Calculando nuevo precio: old=${oldPrice}, type=${adjustmentType}, op=${operation}, value=${value}`);
    
    let numericPrice = parseFloat(oldPrice) || 0;
    let newPrice = numericPrice;
    
    if (adjustmentType === 'percentage') {
        const percentage = value / 100;
        if (operation === 'increase') {
            newPrice = numericPrice + (numericPrice * percentage);
        } else {
            newPrice = numericPrice - (numericPrice * percentage);
        }
    } else { // fixed amount
        if (operation === 'increase') {
            newPrice = numericPrice + value;
        } else {
            newPrice = numericPrice - value;
        }
    }
    
    // Asegurar que no sea negativo
    newPrice = Math.max(0, newPrice);
    
    // Redondear a 2 decimales
    newPrice = Math.round(newPrice * 100) / 100;
    
    console.log(`✅ Nuevo precio calculado: ${newPrice}`);
    return newPrice;
}

function getPriceAdjustmentFormData() {
    return {
        adjustment_type: document.getElementById('adjustment-type').value,
        adjustment_value: parseFloat(document.getElementById('adjustment-value').value),
        operation: document.getElementById('adjustment-operation').value,
        apply_to: document.getElementById('apply-to').value,
        adjust_wholesale: document.getElementById('adjust-wholesale').checked,
        adjust_retail: document.getElementById('adjust-retail').checked,
        category: document.getElementById('adjustment-category')?.value,
        brand: document.getElementById('adjustment-brand')?.value
    };
}

function validatePriceAdjustmentForm(data) {
    if (!data.adjustment_type) {
        return { valid: false, message: 'Seleccione el tipo de ajuste' };
    }

    if (!data.adjustment_value || isNaN(data.adjustment_value) || data.adjustment_value === 0) {
        return { valid: false, message: 'Ingrese un valor válido para el ajuste' };
    }

    if (!data.operation) {
        return { valid: false, message: 'Seleccione la operación (aumentar/disminuir)' };
    }

    if (!data.adjust_wholesale && !data.adjust_retail) {
        return { valid: false, message: 'Seleccione al menos un tipo de precio a ajustar' };
    }

    if (data.apply_to === 'category' && !data.category) {
        return { valid: false, message: 'Seleccione una categoría' };
    }

    if (data.apply_to === 'brand' && !data.brand) {
        return { valid: false, message: 'Seleccione una marca' };
    }

    return { valid: true, message: '' };
}

// price-adjustment-fixed.js - Agrega esta función después de getConfirmationText

function getConfirmationText(formData, productCount) {
    const operationText = formData.operation === 'increase' ? 'Aumento' : 'Disminución';
    const typeText = formData.adjustment_type === 'percentage' ? 
        `${formData.adjustment_value}%` : 
        `$${formData.adjustment_value}`;
    
    const priceTypes = [];
    if (formData.adjust_wholesale) priceTypes.push('Precio Mayorista');
    if (formData.adjust_retail) priceTypes.push('Precio Minorista');
    
    let applyToText = '';
    switch (formData.apply_to) {
        case 'all':
            applyToText = 'Todos los productos';
            break;
        case 'category':
            const categorySelect = document.getElementById('adjustment-category');
            const categoryName = categorySelect?.options[categorySelect.selectedIndex]?.text || 'Categoría seleccionada';
            applyToText = `Categoría: ${categoryName}`;
            break;
        case 'brand':
            const brandSelect = document.getElementById('adjustment-brand');
            const brandName = brandSelect?.options[brandSelect.selectedIndex]?.text || 'Marca seleccionada';
            applyToText = `Marca: ${brandName}`;
            break;
        case 'selected':
            applyToText = 'Productos seleccionados';
            break;
    }
    
    return `${operationText} de ${typeText}\nPrecios afectados: ${priceTypes.join(', ')}\nAplicado a: ${applyToText}\nProductos afectados: ${productCount}`;
}

// Inicialización
function initializePriceAdjustmentSystem() {
    console.log('🚀 Inicializando sistema de ajuste de precios...');

    try {
        // Configurar modal
        setupPriceAdjustmentModal();

        // Cargar datos en los selectores
        setTimeout(() => {
            loadAdjustmentSelects();
            console.log('✅ Sistema de ajuste de precios inicializado');
        }, 1000);

    } catch (error) {
        console.error('❌ Error inicializando sistema:', error);
    }
}

// Cargar selectores
function loadAdjustmentSelects() {
    console.log('📋 Cargando selectores...');

    // Cargar categorías
    const categorySelect = document.getElementById('adjustment-category');
    if (categorySelect && window.allCategories && window.allCategories.length > 0) {
        categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
            window.allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        console.log(`✅ ${window.allCategories.length} categorías cargadas`);
    }

    // Cargar marcas
    const brandSelect = document.getElementById('adjustment-brand');
    if (brandSelect && window.allBrands && window.allBrands.length > 0) {
        brandSelect.innerHTML = '<option value="">Seleccionar marca</option>' +
            window.allBrands.map(brand => `<option value="${brand.id}">${brand.name}</option>`).join('');
        console.log(`✅ ${window.allBrands.length} marcas cargadas`);
    }
}
// price-adjustment-fixed.js - Agrega esta función después de las variables globales

// Verificar que Supabase esté listo
function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabaseClient && window.supabaseClient.client) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseClient && window.supabaseClient.client) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}
// price-adjustment-fixed.js - Agrega esta función al inicio del archivo

// Función para obtener el ID del usuario admin autenticado
async function getAdminUserId() {
    try {
        // Verificar si el cliente Supabase está listo
        if (!window.supabaseClient || !window.supabaseClient.client) {
            await waitForSupabase();
        }

        // Obtener la sesión actual
        const { data, error } = await window.supabaseClient.client.auth.getUser();

        if (error) {
            console.warn('⚠️ No se pudo obtener usuario autenticado:', error);

            // Intentar obtener de localStorage como fallback
            const session = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
            if (session.currentSession?.user?.id) {
                return session.currentSession.user.id;
            }

            // Si no hay usuario autenticado, usar un UUID por defecto
            // IMPORTANTE: Asegúrate de que este UUID exista en tu tabla admin_users
            return '00000000-0000-0000-0000-000000000001';
        }

        return data.user.id;
    } catch (error) {
        console.error('❌ Error obteniendo ID de usuario:', error);
        // UUID por defecto para admin (ajusta esto según tu BD)
        return '00000000-0000-0000-0000-000000000001';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM cargado, iniciando sistema de ajuste...');

    // Esperar un momento para que otros scripts se carguen
    setTimeout(() => {
        initializePriceAdjustmentSystem();
    }, 1500);
});

// Hacer funciones disponibles globalmente
window.showPriceAdjustmentModal = showPriceAdjustmentModal;
window.hidePriceAdjustmentModal = hidePriceAdjustmentModal;


// Agrega esta función en price-adjustment-fixed.js después de las otras funciones:
function refreshProductDisplay() {
    console.log('🔄 Forzando actualización de productos...');
    
    // Actualizar la lista de productos global
    if (window.adminProducts && Array.isArray(window.adminProducts)) {
        // Forzar recarga de productos desde Supabase
        if (typeof window.reloadAdminProducts === 'function') {
            window.reloadAdminProducts();
        } else if (typeof window.loadAdminData === 'function') {
            window.loadAdminData();
        } else {
            console.warn('⚠️ No se encontró función de recarga, forzando refresh de página');
            setTimeout(() => window.location.reload(), 1000);
        }
    }
}
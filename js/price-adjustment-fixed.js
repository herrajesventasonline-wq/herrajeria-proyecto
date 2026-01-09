// price-adjustment-fixed.js - Versión funcional completa CON OPCIONES DE CATEGORÍA
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

    // Cargar categorías en el select
    loadAdjustmentCategories();

    // Mostrar modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';

    console.log('✅ Modal visible:', modal.style.display, modal.classList);
}

// Función para cargar categorías en el select de ajuste
function loadAdjustmentCategories() {
    console.log('📂 Cargando categorías para ajuste de precios...');

    const categorySelect = document.getElementById('adjustment-category');
    if (!categorySelect) {
        console.error('❌ No se encontró el select de categorías para ajuste');
        return;
    }

    // Guardar la opción por defecto
    const defaultOption = '<option value="">Seleccionar categoría</option>';

    // Verificar si ya tenemos las categorías cargadas
    if (window.allCategories && Array.isArray(window.allCategories) && window.allCategories.length > 0) {
        console.log(`✅ Cargando ${window.allCategories.length} categorías desde variable global`);

        // Ordenar categorías alfabéticamente
        const sortedCategories = [...window.allCategories].sort((a, b) =>
            (a.name || '').localeCompare(b.name || '')
        );

        categorySelect.innerHTML = defaultOption + sortedCategories.map(cat =>
            `<option value="${cat.id}">${cat.name || 'Sin nombre'}</option>`
        ).join('');

        console.log(`✅ ${sortedCategories.length} categorías cargadas en el select`);
    } else {
        // Intentar cargar categorías desde Supabase
        console.log('🔄 Categorías no disponibles en memoria, intentando cargar desde Supabase...');

        if (window.supabaseClient && typeof window.supabaseClient.getCategories === 'function') {
            window.supabaseClient.getCategories()
                .then(categories => {
                    if (categories && Array.isArray(categories)) {
                        console.log(`✅ ${categories.length} categorías cargadas desde Supabase`);

                        // Guardar en variable global para uso futuro
                        window.allCategories = categories;

                        // Ordenar categorías alfabéticamente
                        const sortedCategories = [...categories].sort((a, b) =>
                            (a.name || '').localeCompare(b.name || '')
                        );

                        categorySelect.innerHTML = defaultOption + sortedCategories.map(cat =>
                            `<option value="${cat.id}">${cat.name || 'Sin nombre'}</option>`
                        ).join('');
                    } else {
                        console.warn('⚠️ No se pudieron cargar categorías');
                        categorySelect.innerHTML = defaultOption;
                    }
                })
                .catch(error => {
                    console.error('❌ Error cargando categorías:', error);
                    categorySelect.innerHTML = defaultOption;
                });
        } else {
            console.warn('⚠️ Supabase client no disponible para cargar categorías');
            categorySelect.innerHTML = defaultOption;
        }
    }
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
    const previewSection = document.getElementById('preview-section');

    if (categoryField) categoryField.style.display = 'none';
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

            // Mostrar/ocultar campo de categoría según la selección
            if (categoryField) {
                if (value === 'category') {
                    categoryField.style.display = 'block';
                    // Asegurarse de que las categorías estén cargadas
                    if (categoryField.querySelector('select').options.length <= 1) {
                        loadAdjustmentCategories();
                    }
                } else {
                    categoryField.style.display = 'none';
                }
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

    // Configurar cambio en categoría seleccionada
    const categorySelect = document.getElementById('adjustment-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', updatePreview);
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

// Actualizar vista previa - VERSIÓN MODIFICADA PARA CATEGORÍAS
function updatePreview() {
    const applyTo = document.getElementById('apply-to')?.value;
    const adjustmentType = document.getElementById('adjustment-type')?.value;
    const operation = document.getElementById('adjustment-operation')?.value;
    const value = parseFloat(document.getElementById('adjustment-value')?.value || 0);
    const adjustWholesale = document.getElementById('adjust-wholesale')?.checked;
    const adjustRetail = document.getElementById('adjust-retail')?.checked;
    const categoryId = applyTo === 'category' ? document.getElementById('adjustment-category')?.value : null;

    const previewSection = document.getElementById('preview-section');
    const previewDetails = document.getElementById('preview-details');
    const affectedProducts = document.getElementById('affected-products');

    if (!previewSection || !previewDetails || !affectedProducts) return;

    // Validar campos requeridos
    if (!adjustmentType || !operation || value === 0 || (!adjustWholesale && !adjustRetail)) {
        previewSection.style.display = 'none';
        return;
    }

    // Validar categoría si se seleccionó "Por Categoría"
    if (applyTo === 'category' && !categoryId) {
        previewSection.style.display = 'none';
        return;
    }

    // Calcular productos afectados
    let productsCount = 0;
    let targetDescription = '';

    if (window.adminProducts && window.adminProducts.length > 0) {
        switch (applyTo) {
            case 'all':
                productsCount = window.adminProducts.filter(p => p.is_active !== false).length;
                targetDescription = 'Todos los productos activos';
                break;

            case 'category':
                if (!categoryId) {
                    previewSection.style.display = 'none';
                    return;
                }
                productsCount = window.adminProducts.filter(p =>
                    p.category_id === categoryId && (p.is_active !== false)
                ).length;

                // Obtener nombre de la categoría seleccionada
                const categorySelect = document.getElementById('adjustment-category');
                let categoryName = 'Categoría seleccionada';
                if (categorySelect && categorySelect.selectedIndex > 0) {
                    categoryName = categorySelect.options[categorySelect.selectedIndex].text;
                }
                targetDescription = `Categoría: ${categoryName}`;
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

    let adjustmentText = '';
    if (adjustmentType === 'percentage') {
        const percentageText = operation === 'increase' ? `+${value}%` : `-${value}%`;
        adjustmentText = `Ajuste: ${percentageText}`;
    } else {
        const amountText = operation === 'increase' ? `+$${value.toFixed(2)}` : `-$${value.toFixed(2)}`;
        adjustmentText = `Ajuste: ${amountText}`;
    }

    const previewHTML = `
        <div class="preview-detail-item">
            <strong>${adjustmentText}</strong>
        </div>
        <div class="preview-detail-item">
            <strong>Aplicado a:</strong> ${targetDescription}
        </div>
        <div class="preview-detail-item">
            <strong>Precios afectados:</strong> ${priceTypes.join(', ')}
        </div>
        <div class="preview-detail-item">
            <strong>Operación:</strong> ${operation === 'increase' ? 'Aumentar' : 'Disminuir'}
        </div>
    `;

    previewDetails.innerHTML = previewHTML;
    affectedProducts.textContent = productsCount;
    previewSection.style.display = 'block';
}

// Manejar envío del formulario
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
            showNotification(validation.message, 'error');
            throw new Error(validation.message);
        }

        // Obtener los productos a ajustar
        const productsToAdjust = await getProductsToAdjust(formData);

        if (productsToAdjust.length === 0) {
            showNotification('No hay productos para ajustar con los criterios seleccionados.', 'warning');
            throw new Error('No hay productos para ajustar');
        }

        // Mostrar confirmación con detalles
        const confirmationText = getConfirmationText(formData, productsToAdjust.length);

        const confirmed = await showConfirmation({
            title: 'Confirmar Ajuste Masivo de Precios',
            message: `¿Está seguro de aplicar este ajuste de precios a ${productsToAdjust.length} productos?`,
            details: confirmationText,
            confirmText: 'Aplicar Ajuste',
            cancelText: 'Cancelar',
            confirmColor: 'warning'
        });

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
                target_category: formData.category || null
            })
        };

        // Solo agregar target_id si es por categoría
        if (formData.apply_to === 'category' && formData.category) {
            adjustmentRecord.target_id = formData.category;
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

                        // IMPORTANTE: Recalcular el porcentaje mayorista basado en el nuevo precio y el costo
                        const cost = parseFloat(product.cost_price) || 0;
                        let newWholesalePercentage = 100; // valor por defecto
                        if (cost > 0) {
                            newWholesalePercentage = (newWholesalePrice / cost) * 100;
                        }
                        updateData.wholesale_percentage = newWholesalePercentage;

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

                        // IMPORTANTE: Recalcular el porcentaje minorista basado en el nuevo precio y el costo
                        const cost = parseFloat(product.cost_price) || 0;
                        let newRetailPercentage = 150; // valor por defecto
                        if (cost > 0) {
                            newRetailPercentage = (newRetailPrice / cost) * 100;
                        }
                        updateData.retail_percentage = newRetailPercentage;

                        detailRecord.new_retail_price = newRetailPrice;
                    }
                }

                // También actualizar el campo para indicar que no use porcentajes globales
                if (formData.adjust_wholesale || formData.adjust_retail) {
                    updateData.use_global_percentages = false;
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

        // Mostrar resultado
        if (updatedProducts.length > 0) {
            showNotification(`✅ Ajuste aplicado a ${updatedProducts.length} productos correctamente`, 'success');

            // Cerrar modal
            hidePriceAdjustmentModal();

            // Actualizar productos en memoria
            if (window.adminProducts && updatedProducts.length > 0) {
                updatedProducts.forEach(productId => {
                    const productIndex = window.adminProducts.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        const product = window.adminProducts[productIndex];
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
            }

            // Recargar productos en la interfaz
            setTimeout(() => {
                if (typeof window.reloadAdminProducts === 'function') {
                    window.reloadAdminProducts();
                } else if (typeof window.loadAdminData === 'function') {
                    window.loadAdminData();
                }
            }, 500);
        } else {
            showNotification('⚠️ No se actualizó ningún producto', 'warning');
        }

    } catch (error) {
        console.error('❌ Error en ajuste de precios:', error);
        if (error.message !== 'Ajuste cancelado por el usuario') {
            showNotification(`Error: ${error.message}`, 'error');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-percentage"></i> Aplicar Ajuste';
    }
}

// Función para obtener productos según el criterio
async function getProductsToAdjust(formData) {
    console.log('🔍 Obteniendo productos para ajustar...');

    try {
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
    const applyTo = document.getElementById('apply-to').value;
    const categoryId = applyTo === 'category' ? document.getElementById('adjustment-category').value : null;

    return {
        adjustment_type: document.getElementById('adjustment-type').value,
        adjustment_value: parseFloat(document.getElementById('adjustment-value').value) || 0,
        operation: document.getElementById('adjustment-operation').value,
        apply_to: applyTo,
        adjust_wholesale: document.getElementById('adjust-wholesale').checked,
        adjust_retail: document.getElementById('adjust-retail').checked,
        category: categoryId
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

    return { valid: true, message: '' };
}

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
    }

    return `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <strong>Resumen del ajuste:</strong>
            <div style="margin-top: 8px;">
                <div><strong>Tipo:</strong> ${operationText} de ${typeText}</div>
                <div><strong>Precios afectados:</strong> ${priceTypes.join(', ')}</div>
                <div><strong>Aplicado a:</strong> ${applyToText}</div>
                <div><strong>Productos afectados:</strong> ${productCount}</div>
            </div>
            <div style="margin-top: 10px; padding: 8px; background: #fef3c7; border-radius: 4px; border-left: 4px solid #f59e0b;">
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                <strong> Esta acción no se puede deshacer.</strong>
            </div>
        </div>
    `;
}

// Inicialización
function initializePriceAdjustmentSystem() {
    console.log('🚀 Inicializando sistema de ajuste de precios...');

    try {
        // Configurar modal
        setupPriceAdjustmentModal();

        console.log('✅ Sistema de ajuste de precios inicializado');

    } catch (error) {
        console.error('❌ Error inicializando sistema:', error);
    }
}

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
window.loadAdjustmentCategories = loadAdjustmentCategories;

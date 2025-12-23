// admin-init.js - VERSIÓN CON GESTIÓN CORRECTA DE MÚLTIPLES IMÁGENES EN SUPABASE
console.log('🔄 Cargando panel de administración para Herrajería...');

// ==============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==============================================

// Estado de la aplicación
let adminProducts = [];
let allCategories = [];
let allBrands = [];
let adminOrders = [];
let currentProduct = null;
let adminFilteredProducts = [];

// URLs y configuraciones
const STORAGE_URL = 'https://opueqifkagoonpbubflj.supabase.co/storage/v1/object/public/product-images/';
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f8fafc'/%3E%3Cpath d='M80 60h40v30H80z' fill='%23e2e8f0'/%3E%3Ccircle cx='100' cy='45' r='15' fill='%23e2e8f0'/%3E%3Ctext x='100' y='120' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' fill='%2394a3b8'%3ESin imagen%3C/text%3E%3C/svg%3E";




// ==============================================
// FUNCIONES GLOBALES PARA FACTURAS
// ==============================================

// Función para ver detalle de orden (factura)
window.viewOrderDetail = async function (orderId) {
    try {
        console.log('🔍 viewOrderDetail llamado para:', orderId);

        if (!adminOrders || adminOrders.length === 0) {
            console.log('🔄 No hay órdenes cargadas, recargando...');
            await loadAdminData();
        }

        const order = adminOrders.find(o => o.id === orderId);

        if (!order) {
            showNotification('Orden no encontrada', 'error');
            return;
        }

        console.log('✅ Mostrando factura para orden:', order.invoice_number || order.id);

        // Llenar y mostrar el modal
        fillInvoiceModal(order);
        showModal('invoice-modal');

    } catch (error) {
        console.error('❌ Error en viewOrderDetail:', error);
        showNotification('Error al cargar la factura: ' + error.message, 'error');
    }
};


// Función para descargar factura
window.downloadInvoice = downloadInvoice;
// ==============================================
// INICIALIZACIÓN PRINCIPAL
// ==============================================
// En la función principal de inicialización, agrega:
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando panel de administración...');

    try {
        // Esperar a que Supabase esté listo
        await waitForSupabase();

        // Verificar sesión de administrador
        await verifyAdminSession();

        // Cargar datos iniciales
        await loadAdminData();

        // Configurar interfaz
        setupAdminEventListeners();
        setupProductForm();
        setupImageUploadListeners();

        // 🔥 AGREGAR ESTA LÍNEA - Configurar modal de confirmación
        setupConfirmationModal();

        console.log('✅ Panel de administración inicializado correctamente');
        // 🔥 INICIALIZAR SISTEMA DE AJUSTE DE PRECIOS
        setTimeout(() => {
            if (typeof setupPriceAdjustmentSystem === 'function') {
                setupPriceAdjustmentSystem();
            }
        }, 500);

    } catch (error) {
        console.error('💥 Error en inicialización:', error);
        showNotification('Error inicializando el panel: ' + error.message, 'error');
    }
    // Agrega esto en la inicialización o en un archivo CSS separado
    function injectInvoiceStyles() {
        const styles = `
    #invoice-modal .modal-content {
        max-width: 900px !important;
        width: 95% !important;
        margin: 20px auto;
    }
    
    #invoice-items td, #invoice-items th {
        padding: 12px 15px !important;
        border-bottom: 1px solid #e2e8f0 !important;
    }
    
    #invoice-items tr:last-child td {
        border-bottom: none !important;
    }
    
    .modal-footer {
        display: flex !important;
        gap: 10px !important;
        justify-content: flex-end !important;
        padding: 20px !important;
        border-top: 1px solid #e2e8f0 !important;
        background: #f8fafc !important;
        border-radius: 0 0 12px 12px !important;
    }
    
    .close-modal {
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        background: #ef4444 !important;
        color: white !important;
        border: none !important;
        border-radius: 50% !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        font-size: 16px !important;
        z-index: 10001 !important;
    }
    
    .close-modal:hover {
        background: #dc2626 !important;
        transform: scale(1.1) !important;
    }
    `;

        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    // Llama a esta función al inicio
    document.addEventListener('DOMContentLoaded', injectInvoiceStyles);

});




// ==============================================
// SISTEMA DE CONFIRMACIÓN PERSONALIZADO
// ==============================================

let confirmationResolve = null;

function showConfirmation(options = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmation-modal');
        const overlay = document.getElementById('overlay');

        // Configurar el modal
        if (options.title) {
            document.getElementById('confirmation-title').textContent = options.title;
        } else {
            document.getElementById('confirmation-title').textContent = 'Confirmar acción';
        }

        if (options.message) {
            document.getElementById('confirmation-message').textContent = options.message;
        } else {
            document.getElementById('confirmation-message').textContent = '¿Estás seguro de que quieres realizar esta acción?';
        }

        // Configurar detalles adicionales si los hay
        const detailsContainer = document.getElementById('confirmation-details');
        if (options.details) {
            detailsContainer.innerHTML = options.details;
            detailsContainer.style.display = 'block';
        } else {
            detailsContainer.style.display = 'none';
        }

        // Configurar botones
        if (options.confirmText) {
            document.getElementById('confirmation-confirm').innerHTML = `<i class="fas fa-check"></i> ${options.confirmText}`;
        } else {
            document.getElementById('confirmation-confirm').innerHTML = '<i class="fas fa-check"></i> Confirmar';
        }

        if (options.cancelText) {
            document.getElementById('confirmation-cancel').innerHTML = `<i class="fas fa-times"></i> ${options.cancelText}`;
        } else {
            document.getElementById('confirmation-cancel').innerHTML = '<i class="fas fa-times"></i> Cancelar';
        }

        // Configurar colores de los botones
        const confirmBtn = document.getElementById('confirmation-confirm');
        if (options.confirmColor === 'danger') {
            confirmBtn.className = 'btn btn-danger';
        } else if (options.confirmColor === 'warning') {
            confirmBtn.className = 'btn btn-warning';
        } else if (options.confirmColor === 'success') {
            confirmBtn.className = 'btn btn-success';
        } else {
            confirmBtn.className = 'btn btn-primary';
        }

        // Mostrar el modal
        modal.style.display = 'flex';
        modal.classList.add('active');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Guardar la función resolve para usarla luego
        confirmationResolve = resolve;
    });
}

function hideConfirmation() {
    const modal = document.getElementById('confirmation-modal');
    const overlay = document.getElementById('overlay');

    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }

    if (overlay) {
        overlay.style.display = 'none';
    }

    document.body.style.overflow = '';
}

function setupConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    const overlay = document.getElementById('overlay');

    if (!modal) {
        console.error('No se encontró el modal de confirmación');
        return;
    }

    // Botón de cancelar
    document.getElementById('confirmation-cancel').addEventListener('click', () => {
        if (confirmationResolve) {
            confirmationResolve(false);
            confirmationResolve = null;
        }
        hideConfirmation();
    });

    // Botón de confirmar
    document.getElementById('confirmation-confirm').addEventListener('click', () => {
        if (confirmationResolve) {
            confirmationResolve(true);
            confirmationResolve = null;
        }
        hideConfirmation();
    });

    // Cerrar con el botón X
    modal.querySelector('.close-modal').addEventListener('click', () => {
        if (confirmationResolve) {
            confirmationResolve(false);
            confirmationResolve = null;
        }
        hideConfirmation();
    });

    // Cerrar con el overlay
    overlay.addEventListener('click', () => {
        if (confirmationResolve) {
            confirmationResolve(false);
            confirmationResolve = null;
        }
        hideConfirmation();
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            if (confirmationResolve) {
                confirmationResolve(false);
                confirmationResolve = null;
            }
            hideConfirmation();
        }
    });
}
// ==============================================
// FUNCIONES DE INICIALIZACIÓN
// ==============================================

function waitForSupabase() {
    return new Promise((resolve, reject) => {
        console.log('🔍 Verificando estado de Supabase...');

        const maxAttempts = 50;
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            if (window.supabaseClient && window.supabaseClient.isReady()) {
                clearInterval(checkInterval);
                console.log('✅ Supabase listo y funcional');
                resolve();
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Timeout: No se pudo inicializar Supabase'));
            }
        }, 100);
    });
}

async function verifyAdminSession() {
    console.log('🔐 Verificando sesión de administrador...');

    try {
        const { session } = await window.supabaseClient.getSession();

        if (!session) {
            console.log('❌ No hay sesión activa, redirigiendo...');
            window.location.href = 'admin-login.html';
            return;
        }

        console.log('✅ Sesión activa encontrada:', session.user.email);

        // Verificación de administrador
        const adminEmails = [
            'herrajesventasonline@gmail.com',
            'admin@herrajeria.com',
            'administrador@herrajeria.com'
        ];

        if (!adminEmails.includes(session.user.email.toLowerCase())) {
            console.warn('⚠️ Email no autorizado:', session.user.email);
            await window.supabaseClient.signOut();
            window.location.href = 'admin-login.html?error=unauthorized';
            return;
        }

        // Mostrar información del usuario
        updateAdminUserInfo(session.user);

    } catch (error) {
        console.error('❌ Error en verificación de sesión:', error);
        throw error;
    }
}

function updateAdminUserInfo(user) {
    const adminUserElement = document.getElementById('admin-user');
    if (adminUserElement) {
        const span = adminUserElement.querySelector('span');
        if (span) {
            span.textContent = user.email;
        }
        adminUserElement.title = `Usuario: ${user.email}`;
    }
}

// ==============================================
// CARGA DE DATOS
// ==============================================
// Modificar loadAdminData para cargar datos de analytics
async function loadAdminData() {
    try {
        console.log('📦 Cargando datos del administrador...');
        showLoadingState(true);

        // Cargar productos, categorías y marcas
        const [productsData, categoriesData, brandsData] = await Promise.allSettled([
            window.supabaseClient.getProducts(),
            window.supabaseClient.getCategories(),
            window.supabaseClient.getBrands()
        ]);

        adminProducts = productsData.status === 'fulfilled' ? productsData.value : [];
        allCategories = categoriesData.status === 'fulfilled' ? categoriesData.value : [];
        allBrands = brandsData.status === 'fulfilled' ? brandsData.value : [];

        // Cargar órdenes
        try {
            adminOrders = await window.supabaseClient.getOrders();
        } catch (orderError) {
            console.error('🔥 Error cargando órdenes:', orderError);
            adminOrders = [];
        }

        // Actualizar interfaz
        updateAdminStats(); // Esto ahora también actualiza advanced stats
        renderAdminProducts();
        populateCategorySelect();
        populateBrandSelect();

        // Renderizar órdenes
        setTimeout(() => {
            renderOrders();
            updateOrdersStats(adminOrders);
        }, 100);

        showLoadingState(false);

    } catch (error) {
        console.error('❌ Error cargando datos admin:', error);
        showNotification('Error al cargar los datos: ' + error.message, 'error');
        showLoadingState(false);
    }
}

// Agregar event listener para actualizar estadísticas cuando se recarga
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar estadísticas cada 60 segundos
    setInterval(() => {
        if (document.querySelector('#dashboard-section.active')) {
            updateAdvancedStats();
        }
    }, 60000);
});

function showModal(modalId) {
    console.log(`🚀 MOSTRANDO MODAL: ${modalId}`);

    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');

    if (!modal) {
        console.error(`❌ Modal ${modalId} no encontrado`);
        return;
    }

    if (!overlay) {
        console.error('❌ Overlay no encontrado');
        return;
    }

    // 1. Asegurar que NO haya clases que oculten el modal
    modal.classList.remove('hidden', 'd-none', 'invisible');
    modal.classList.add('active', 'visible');

    // 2. Forzar estilos directamente (sobreescribir cualquier CSS)
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 10000 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        background: rgba(0,0,0,0.5) !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    `;

    // 3. Asegurar que el contenido sea visible
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.style.cssText = `
            background: white !important;
            border-radius: 12px !important;
            max-width: 900px !important;
            width: 95% !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
            position: relative !important;
            z-index: 10001 !important;
            animation: fadeIn 0.3s ease !important;
        `;
    }

    // 4. Overlay (por si acaso)
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.7) !important;
        z-index: 9999 !important;
        display: block !important;
        backdrop-filter: blur(4px) !important;
    `;

    // 5. Bloquear scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    console.log(`✅ Modal ${modalId} FORZADO a mostrarse`);

    // 6. Depuración final
    setTimeout(() => {
        console.log('📊 ESTADO FINAL DEL MODAL:');
        const rect = modal.getBoundingClientRect();
        console.log('Dimensiones:', rect.width + 'x' + rect.height);
        console.log('Posición:', rect.top + ', ' + rect.left);
        console.log('¿Visible en pantalla?',
            rect.top >= 0 && rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }, 50);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');

    if (modal && overlay) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showLoadingState(show) {
    const loadingElement = document.getElementById('loading-state');
    if (!loadingElement) {
        if (show) {
            const div = document.createElement('div');
            div.id = 'loading-state';
            div.innerHTML = '<div class="spinner"></div><p>Cargando datos...</p>';
            div.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(4px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-size: 16px;
                color: #475569;
            `;
            document.body.appendChild(div);
        }
    } else {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// ==============================================
// CONFIGURACIÓN DE INTERFAZ
// ==============================================
function setupAdminEventListeners() {
    try {
        console.log('🔧 Configurando event listeners...');

        // Pestañas del panel
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', switchAdminTab);
        });

        // Botones principales
        document.getElementById('add-product-btn')?.addEventListener('click', () => showProductModal(false));
        document.getElementById('logout-btn')?.addEventListener('click', logout);
        document.getElementById('price-adjustment-btn-2')?.addEventListener('click', () => showPriceAdjustmentModal());

        // Búsquedas
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', debounce(filterProducts, 300));
        }

        // Configurar filtro de fechas para pedidos
        setupDateFilter();

        // Cerrar modales
        // Configurar cierre específico del modal de factura
        const invoiceModal = document.getElementById('invoice-modal');
        if (invoiceModal) {
            // Botón de cerrar (X)
            const closeBtn = invoiceModal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    console.log('❌ Botón X clickeado');
                    hideInvoiceModal();
                });
            }

            // Cerrar con el overlay específico de este modal
            invoiceModal.addEventListener('click', (e) => {
                if (e.target === invoiceModal) {
                    console.log('🎯 Click en overlay del modal');
                    hideInvoiceModal();
                }
            });
        }

        setupConfirmationModal();
        setupInvoiceActions();

        console.log('✅ Event listeners configurados correctamente');


    } catch (error) {
        console.error('❌ Error configurando event listeners:', error);
    }
}

function setupProductForm() {
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

function setupImageUploadListeners() {
    const imageUpload = document.getElementById('image-upload');
    const uploadArea = document.getElementById('upload-area');

    if (!imageUpload || !uploadArea) return;

    // Click en el área de upload
    uploadArea.addEventListener('click', () => {
        imageUpload.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');

        if (e.dataTransfer.files.length) {
            imageUpload.files = e.dataTransfer.files;
            handleImageUpload({ target: { files: e.dataTransfer.files } });
        }
    });

    // Cambio en el input de archivos
    imageUpload.addEventListener('change', handleImageUpload);
}

// ==============================================
// MANEJO DE IMÁGENES - SISTEMA COMPLETO
// ==============================================

function handleImageUpload(e) {
    const files = e.target.files;
    const preview = document.getElementById('images-preview');
    if (!preview) return;

    console.log('📁 Archivos seleccionados:', files.length);

    // Limpiar solo elementos temporales
    const tempImages = preview.querySelectorAll('.image-preview-item.temporary');
    tempImages.forEach(img => img.remove());

    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
            showNotification(`El archivo "${file.name}" no es una imagen válida`, 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification(`La imagen "${file.name}" es demasiado grande (máximo 5MB)`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-preview-item temporary draggable';
            imgContainer.draggable = true;
            imgContainer.dataset.tempId = `temp-${Date.now()}-${index}`;
            imgContainer.dataset.isNew = 'true';

            const fileName = file.name.substring(0, 20) + (file.name.length > 20 ? '...' : '');

            imgContainer.innerHTML = `
                <div class="preview-header">
                    <span class="image-name">${fileName}</span>
                    <div class="image-actions">
                    
                        <button type="button" class="remove-image" title="Eliminar imagen"><i class="fas fa-times"></i></button>
                   
                    </div>
                </div>
                <img src="${e.target.result}" alt="Nueva imagen ${index + 1}" class="preview-img">
                <div class="image-info">
                    <span class="image-size">${(file.size / 1024).toFixed(1)} KB</span>
                    <span class="image-status new">NUEVA</span>
                    <span class="image-position">Posición: 0</span>
                </div>
            `;

            preview.appendChild(imgContainer);
            setupImageItemListeners(imgContainer);
        };
        reader.readAsDataURL(file);
    });

    updateUploadAreaFeedback();
    updateImageOrderIndicators();
    initImageDragAndDrop();
}

function setupImageItemListeners(container) {
    // Botón para mover arriba


    // Botón para eliminar
    const removeBtn = container.querySelector('.remove-image');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('¿Eliminar esta imagen?')) {
                container.remove();
                updateUploadAreaFeedback();
                updateImageOrderIndicators();
                showNotification('Imagen eliminada', 'warning');
            }
        });
    }

    // Botón para establecer como principal

}

function initImageDragAndDrop() {
    const containers = document.querySelectorAll('.draggable');
    containers.forEach(container => {
        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragend', handleDragEnd);
    });
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => this.style.opacity = '0.4', 0);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const afterElement = getDragAfterElement(e.clientY);
    const container = document.getElementById('images-preview');

    if (afterElement == null) {
        container.appendChild(draggedItem);
    } else {
        container.insertBefore(draggedItem, afterElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
    draggedItem.style.opacity = '';
    updateImageOrderIndicators();
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    this.style.opacity = '';
}

function getDragAfterElement(y) {
    const draggableElements = [...document.querySelectorAll('.draggable:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function moveImageUp(container) {
    const prev = container.previousElementSibling;
    if (prev && prev.classList.contains('image-preview-item')) {
        container.parentNode.insertBefore(container, prev);
        updateImageOrderIndicators();
    }
}

function moveImageDown(container) {
    const next = container.nextElementSibling;
    if (next && next.classList.contains('image-preview-item')) {
        container.parentNode.insertBefore(next, container);
        updateImageOrderIndicators();
    }
}

function updateImageOrderIndicators() {
    const preview = document.getElementById('images-preview');
    if (!preview) return;

    const items = preview.querySelectorAll('.image-preview-item');

    items.forEach((item, index) => {
        const positionIndicator = item.querySelector('.image-position');
        if (positionIndicator) {
            positionIndicator.textContent = `Posición: ${index + 1}`;
        }

        // Actualizar indicador de imagen principal
        const mainIndicator = item.querySelector('.image-size');
        if (mainIndicator && index === 0) {
            if (!mainIndicator.classList.contains('main')) {
                // Remover indicador principal de todas
                items.forEach(i => {
                    const ind = i.querySelector('.image-size');
                    if (ind) ind.classList.remove('main');
                });
                // Agregar a la primera
                mainIndicator.textContent = 'PRINCIPAL';
                mainIndicator.classList.add('main');
            }
        } else if (mainIndicator && mainIndicator.classList.contains('main')) {
            mainIndicator.textContent = 'Secundaria';
            mainIndicator.classList.remove('main');
        }
    });
}

function setAsMainImage(container) {
    const preview = document.getElementById('images-preview');
    if (!preview) return;

    // Mover al inicio
    preview.prepend(container);
    updateImageOrderIndicators();
    showNotification('Imagen establecida como principal', 'success');
}

// Función para obtener imágenes de producto de manera segura
function getSafeProductImages(product) {
    if (!product) return [];

    console.log('🔍 Obteniendo imágenes para producto:', product.name);
    console.log('📦 Campo images:', product.images);
    console.log('📦 Campo main_image:', product.main_image);

    try {
        let finalImages = [];

        // 1. Procesar campo 'images' (es TEXT en tu BD, puede ser JSON string o array)
        if (product.images) {
            try {
                // Intentar parsear como JSON
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed)) {
                    parsed.forEach(img => {
                        if (img && typeof img === 'string' && img.trim()) {
                            const url = ensureImageUrl(img);
                            if (url) {
                                finalImages.push(url);
                            }
                        }
                    });
                } else if (typeof parsed === 'string' && parsed.trim()) {
                    const url = ensureImageUrl(parsed);
                    if (url) {
                        finalImages.push(url);
                    }
                }
            } catch (parseError) {
                console.log('❌ No es JSON válido, tratando como string simple');
                // Si no es JSON válido, tratar como string simple
                if (typeof product.images === 'string' && product.images.trim()) {
                    const url = ensureImageUrl(product.images);
                    if (url) {
                        finalImages.push(url);
                    }
                }
            }
        }

        // 2. Si no hay imágenes en el campo images, usar main_image
        if (finalImages.length === 0 && product.main_image && product.main_image.trim()) {
            const url = ensureImageUrl(product.main_image);
            if (url) {
                finalImages.push(url);
            }
        }

        // 3. Eliminar duplicados
        finalImages = [...new Set(finalImages)];

        console.log('✅ Imágenes finales encontradas:', finalImages.length, finalImages);
        return finalImages;

    } catch (error) {
        console.error('❌ Error obteniendo imágenes:', error);
        return [];
    }
}

function ensureImageUrl(url) {
    if (!url || url === PLACEHOLDER_IMAGE || url === 'null' || url === 'undefined' || url === '""' || url.trim() === '') {
        return null;
    }

    // Limpiar URL si es necesario
    let cleanUrl = url.toString().trim();

    // Si ya es una URL completa, retornarla
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
        return cleanUrl;
    }

    // Si es un nombre de archivo, construir URL de Supabase Storage
    if (cleanUrl.includes('.') && !cleanUrl.includes('/')) {
        return `${STORAGE_URL}${encodeURIComponent(cleanUrl)}`;
    }

    // Si parece ser una ruta de Supabase Storage
    if (cleanUrl.includes('product-images/')) {
        const fileName = cleanUrl.split('product-images/').pop();
        return `${STORAGE_URL}${encodeURIComponent(fileName)}`;
    }

    return cleanUrl;
}

function displayExistingImages(product) {
    console.log('🖼️ Mostrando imágenes existentes...');

    const preview = document.getElementById('images-preview');
    if (!preview) {
        console.error('❌ No se encontró el contenedor de imágenes');
        return;
    }

    preview.innerHTML = '';

    const allImages = getSafeProductImages(product);
    console.log('📋 Total de imágenes a mostrar:', allImages.length, allImages);

    if (allImages.length > 0) {
        allImages.forEach((imgUrl, index) => {
            if (!imgUrl) return;

            console.log(`🖼️ Mostrando imagen ${index + 1}:`, imgUrl);

            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-preview-item existing draggable';
            imgContainer.draggable = true;
            imgContainer.dataset.imageUrl = imgUrl;
            imgContainer.dataset.imageIndex = index;

            const fileName = imgUrl.split('/').pop() || `Imagen ${index + 1}`;
            const displayName = fileName.substring(0, 20) + (fileName.length > 20 ? '...' : '');

            imgContainer.innerHTML = `
                <div class="preview-header">
                    <span class="image-name">${displayName}</span>
                    <div class="image-actions">
              
                        <button type="button" class="remove-image" title="Eliminar imagen"><i class="fas fa-times"></i></button>
                      
                    </div>
                </div>
                <img src="${imgUrl}" alt="Imagen ${index + 1}" class="preview-img"
                     onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'; console.error('❌ Error cargando imagen:', '${imgUrl}')">
                <div class="image-info">
                    <span class="image-size">${index === 0 ? 'PRINCIPAL' : 'Secundaria'}</span>
                    <span class="image-position">Posición: ${index + 1}</span>
                </div>
            `;

            preview.appendChild(imgContainer);
            setupImageItemListeners(imgContainer);
        });
    } else {
        console.log('ℹ️ No hay imágenes para mostrar');
        preview.innerHTML = `
            <div class="no-images" style="text-align: center; padding: 30px; color: #666;">
                <i class="fas fa-image" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
                <p>No hay imágenes para este producto</p>
            </div>
        `;
    }

    updateUploadAreaFeedback();
    updateImageOrderIndicators();
    initImageDragAndDrop();
}

function updateUploadAreaFeedback() {
    const uploadArea = document.getElementById('upload-area');
    const preview = document.getElementById('images-preview');

    if (!uploadArea || !preview) return;

    const totalImages = preview.querySelectorAll('.image-preview-item').length;
    const uploadText = uploadArea.querySelector('p');
    const uploadIcon = uploadArea.querySelector('i');

    if (uploadText && uploadIcon) {
        if (totalImages === 0) {
            uploadText.textContent = 'Arrastra imágenes aquí o haz clic para seleccionar';
            uploadIcon.className = 'fas fa-cloud-upload-alt';
            uploadArea.classList.remove('has-images');
        } else {
            uploadText.textContent = `${totalImages} imagen(es) cargada(s) - Arrastra para cambiar orden`;
            uploadIcon.className = 'fas fa-images';
            uploadArea.classList.add('has-images');
        }
    }
}

async function processProductImages(isEditing) {
    console.log('📷 Procesando imágenes...');
    const preview = document.getElementById('images-preview');
    const finalImages = [];

    try {
        if (!preview) {
            console.log('❌ No hay contenedor de imágenes');
            return [];
        }

        const imageItems = preview.querySelectorAll('.image-preview-item');
        console.log(`📸 Procesando ${imageItems.length} imágenes en el orden actual`);

        // Procesar cada imagen en el orden actual del DOM
        for (let i = 0; i < imageItems.length; i++) {
            const item = imageItems[i];

            if (item.classList.contains('existing')) {
                // Imagen existente - usar URL almacenada
                const imgUrl = item.dataset.imageUrl;
                if (imgUrl && imgUrl.trim()) {
                    console.log(`➕ Imagen existente [${i}]:`, imgUrl);
                    finalImages.push(imgUrl);
                }
            } else if (item.classList.contains('temporary')) {
                // Nueva imagen - subir a Supabase
                const imgElement = item.querySelector('.preview-img');
                if (imgElement && imgElement.src.startsWith('data:')) {
                    try {
                        // Convertir data URL a blob
                        const response = await fetch(imgElement.src);
                        const blob = await response.blob();

                        // Crear archivo desde blob
                        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;
                        const file = new File([blob], fileName, { type: 'image/jpeg' });

                        console.log(`📤 Subiendo nueva imagen [${i}]:`, fileName);

                        // Subir a Supabase
                        const url = await window.supabaseClient.uploadImage(file);
                        if (url) {
                            console.log('✅ Nueva imagen subida:', url);
                            finalImages.push(url);
                        } else {
                            throw new Error('No se obtuvo URL de la imagen subida');
                        }
                    } catch (error) {
                        console.error('❌ Error subiendo nueva imagen:', error);
                        showNotification('Error al subir una imagen nueva: ' + error.message, 'error');
                    }
                } else if (imgElement && imgElement.src) {
                    // Si ya tiene URL (por ejemplo, si se recargó la página)
                    console.log(`➕ Imagen ya con URL [${i}]:`, imgElement.src);
                    finalImages.push(imgElement.src);
                }
            }
        }

        console.log('📷 Total de imágenes procesadas:', finalImages.length, finalImages);

        if (finalImages.length === 0) {
            console.warn('⚠️ No se procesaron imágenes. Verificando si hay imágenes en currentProduct...');
            if (currentProduct && isEditing) {
                const existingImages = getSafeProductImages(currentProduct);
                if (existingImages.length > 0) {
                    console.log('🔄 Usando imágenes existentes del currentProduct');
                    return existingImages;
                }
            }
        }

        return finalImages;

    } catch (error) {
        console.error('❌ Error en processProductImages:', error);
        throw new Error('Error al procesar imágenes: ' + error.message);
    }
}

// ==============================================
// FUNCIONES DEL PANEL PRINCIPAL
// ==============================================
function switchAdminTab(e) {
    try {
        const tabId = e.target.dataset.tab || e.target.closest('.admin-tab').dataset.tab;
        if (!tabId) return;

        console.log(`🔄 Cambiando a pestaña: ${tabId}`);

        // Actualizar pestañas activas
        document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));

        // Marcar la pestaña clicada como activa
        const clickedTab = e.target.closest('.admin-tab');
        clickedTab.classList.add('active');

        // Mostrar la sección correspondiente
        const section = document.getElementById(`${tabId}-section`);
        if (section) {
            section.classList.add('active');
            console.log(`✅ Mostrando sección: ${tabId}-section`);
        }

        // Acciones específicas por pestaña
        switch (tabId) {
            case 'products':
                console.log('📦 Renderizando productos...');
                renderAdminProducts();
                break;
            case 'analytics':
                console.log('📊 Renderizando pedidos...');
                // 🔥 FORZAR la renderización de pedidos
                setTimeout(() => {
                    renderOrders();
                    updateOrdersStats(adminOrders); // Actualizar estadísticas
                }, 100);
                break;
        }

    } catch (error) {
        console.error('❌ Error cambiando pestaña:', error);
    }
}

// Modificar la función updateAdminStats para incluir stock bajo
function updateAdminStats() {
    try {
        const totalProducts = adminProducts.length;
        const inStockProducts = adminProducts.filter(p => p && p.stock > 0).length;
        const lowStockProducts = adminProducts.filter(p => p && p.stock <= (p.min_stock || 0) && p.stock > 0).length;
        const totalOrders = adminOrders.length;
        const totalRevenue = adminOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Actualizar elementos del dashboard
        updateElementText('total-products', totalProducts);
        updateElementText('in-stock-products', inStockProducts);
        updateElementText('low-stock-products', lowStockProducts); // Cambiado de total-sales a low-stock-products
        updateElementText('total-orders', totalOrders);
        updateElementText('total-orders-display', totalOrders);
        updateElementText('total-revenue', `$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

        // También actualizar estadísticas avanzadas
        updateAdvancedStats();

    } catch (error) {
        console.error('❌ Error actualizando estadísticas:', error);
    }
}


function updateElementText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// ==============================================
// GESTIÓN DE PRODUCTOS - MODALES
// ==============================================

function showProductModal(isEditing = false) {
    console.log('🔄 Mostrando modal de producto, isEditing:', isEditing);

    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('overlay');

    if (!modal) {
        console.error('❌ No se encontró el modal #product-modal');
        return;
    }

    if (!overlay) {
        console.error('❌ No se encontró el overlay');
        return;
    }

    console.log('✅ Elementos encontrados, mostrando modal...');

    // Asegurar que el modal esté oculto antes de mostrarlo
    modal.style.display = 'none';
    modal.classList.remove('active');

    // Configurar el modal según si es edición o nuevo
    if (!isEditing) {
        resetProductForm();
        document.getElementById('product-modal-title').innerHTML = '<i class="fas fa-box"></i> <span>Nuevo Producto</span>';
        document.getElementById('save-product').innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        currentProduct = null;
    } else {
        document.getElementById('product-modal-title').innerHTML = '<i class="fas fa-edit"></i> <span>Editar Producto</span>';
        document.getElementById('save-product').innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
    }

    // Mostrar con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        modal.style.display = 'flex';
        modal.classList.add('active');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';

        console.log('✅ Modal visible, clases:', modal.className);
    }, 10);
}

function hideProductModal() {
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('overlay');

    if (modal) modal.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function hideInvoiceModal() {
    console.log('🔴 Cerrando modal de factura...');

    const modal = document.getElementById('invoice-modal');
    const overlay = document.getElementById('overlay');

    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        console.log('✅ Modal ocultado');
    }

    if (overlay) {
        overlay.style.display = 'none';
    }

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}




function hidePriceAdjustmentModal() {
    const modal = document.getElementById('price-adjustment-modal');
    const overlay = document.getElementById('overlay');

    if (modal) modal.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// También mejora la función closeAllModals:
function closeAllModals() {
    console.log('🔴 Cerrando todos los modales...');
    hideProductModal();
    hideInvoiceModal();
    hidePriceAdjustmentModal();
}

function resetProductForm() {
    const form = document.getElementById('product-form');
    if (form) form.reset();

    document.getElementById('product-id').value = '';
    const preview = document.getElementById('images-preview');
    if (preview) preview.innerHTML = '';
    updateUploadAreaFeedback();
}

// ==============================================
// SELECTORES DE CATEGORÍAS Y MARCAS
// ==============================================

function populateCategorySelect() {
    const categorySelect = document.getElementById('product-category');

    const options = '<option value="">Seleccionar categoría</option>' +
        allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

    if (categorySelect) categorySelect.innerHTML = options;
}

function populateBrandSelect() {
    const brandSelect = document.getElementById('product-brand');

    const options = '<option value="">Seleccionar marca</option>' +
        allBrands.map(brand => `<option value="${brand.id}">${brand.name}</option>`).join('');

    if (brandSelect) brandSelect.innerHTML = options;
}

// ==============================================
// GUARDADO DE PRODUCTOS - VERSIÓN CORREGIDA
// ==============================================

async function handleProductSubmit(e) {
    e.preventDefault();
    console.log('🔄 Enviando formulario de producto...');

    const submitBtn = document.getElementById('save-product');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        const productId = document.getElementById('product-id').value;
        const isEditing = !!productId;

        // Validar campos requeridos
        const validation = validateProductForm();
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Preparar datos del producto
        const productData = prepareProductData();

        // Generar SKU si no existe
        if (!productData.sku || productData.sku.trim() === '') {
            productData.sku = generateSKU(productData.name);
        }

        // Procesar imágenes en el orden actual
        console.log('📷 Procesando imágenes...');
        const finalImages = await processProductImages(isEditing);
        console.log('📸 Imágenes finales a guardar:', finalImages);

        // IMPORTANTE: Debido al trigger sync_images_trigger, debemos manejar las imágenes cuidadosamente
        if (finalImages.length > 0) {
            // La primera imagen es la principal
            productData.main_image = finalImages[0];

            // Guardar TODAS las imágenes en el campo images como JSON string
            // Esto es compatible con tu campo TEXT
            productData.images = JSON.stringify(finalImages);

            console.log('✅ main_image:', productData.main_image);
            console.log('✅ images (JSON string):', productData.images);
        } else {
            // Si no hay imágenes, limpiar ambos campos
            productData.main_image = '';
            productData.images = JSON.stringify([]);
        }

        console.log('📦 Datos a enviar a Supabase:', productData);

        // Guardar en Supabase
        let result;
        if (isEditing) {
            console.log('📝 Actualizando producto existente:', productId);
            result = await window.supabaseClient.updateProduct(productId, productData);
        } else {
            console.log('🆕 Creando nuevo producto');
            result = await window.supabaseClient.createProduct(productData);
        }

        console.log('✅ Producto guardado en Supabase:', result);
        showNotification(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`, 'success');

        hideProductModal();
        await reloadAdminProducts();

    } catch (error) {
        console.error('❌ Error guardando producto:', error);
        showNotification('Error al guardar el producto: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function validateProductForm() {
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const category = document.getElementById('product-category').value;
    const brand = document.getElementById('product-brand').value;
    const wholesalePrice = parseFloat(document.getElementById('product-wholesale-price').value) || 0;
    const retailPrice = parseFloat(document.getElementById('product-retail-price').value) || 0;

    if (!name) return { valid: false, message: 'El nombre del producto es requerido' };
    if (!description) return { valid: false, message: 'La descripción del producto es requerida' };
    if (!category) return { valid: false, message: 'La categoría es requerida' };
    if (!brand) return { valid: false, message: 'La marca es requerida' };
    if (wholesalePrice <= 0) return { valid: false, message: 'El precio mayorista debe ser mayor a 0' };
    if (retailPrice <= 0) return { valid: false, message: 'El precio minorista debe ser mayor a 0' };
    if (retailPrice < wholesalePrice) return { valid: false, message: 'El precio minorista debe ser mayor o igual al precio mayorista' };

    return { valid: true, message: '' };
}

function prepareProductData() {
    const colors = document.getElementById('product-colors').value;
    const colorsArray = colors ? colors.split(',').map(c => c.trim()).filter(c => c) : [];

    const specificationsText = document.getElementById('product-specifications').value;
    let specifications = {};

    if (specificationsText.trim()) {
        specificationsText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                specifications[key.trim()] = valueParts.join(':').trim();
            }
        });
    }

    return {
        name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('product-description').value.trim(),
        category_id: document.getElementById('product-category').value,
        brand_id: document.getElementById('product-brand').value,
        sku: document.getElementById('product-sku').value.trim(),
        cost_price: parseFloat(document.getElementById('product-cost-price').value) || 0,
        wholesale_price: parseFloat(document.getElementById('product-wholesale-price').value) || 0,
        retail_price: parseFloat(document.getElementById('product-retail-price').value) || 0,
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        min_stock: parseInt(document.getElementById('product-min-stock').value) || 0,
        colors: colorsArray,
        specifications: specifications,

        is_active: true
    };
}

function generateSKU(name) {
    const prefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// ==============================================
// RENDERIZADO DE PRODUCTOS
// ==============================================

function filterProducts() {
    try {
        const searchInput = document.getElementById('product-search');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            adminFilteredProducts = [];
        } else {
            adminFilteredProducts = adminProducts.filter(product => {
                if (!product) return false;

                const searchFields = [
                    product.name || '',
                    product.categories?.name || '',
                    product.description || '',
                    product.brands?.name || '',
                    product.sku || '',
                    product.colors ? (Array.isArray(product.colors) ? product.colors.join(' ') : product.colors) : ''
                ];

                return searchFields.some(field =>
                    field && field.toLowerCase().includes(searchTerm)
                );
            });
        }

        renderAdminProducts();
    } catch (error) {
        console.error('❌ Error filtrando productos:', error);
    }
}

function renderAdminProducts() {
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;

    try {
        adminProductsList.innerHTML = '';

        const productsToRender = adminFilteredProducts.length > 0 ? adminFilteredProducts : adminProducts;
        const searchInput = document.getElementById('product-search');
        const hasSearchTerm = searchInput && searchInput.value.trim() !== '';

        if (!Array.isArray(productsToRender) || productsToRender.length === 0) {
            if (hasSearchTerm) {
                adminProductsList.innerHTML = createNoResultsHTML(
                    'No se encontraron productos que coincidan con tu búsqueda.',
                    'Limpiar búsqueda',
                    'clearSearch()'
                );
            } else {
                adminProductsList.innerHTML = createNoResultsHTML(
                    'No hay productos registrados.',
                    'Agregar Primer Producto',
                    'showProductModal()'
                );
            }
            return;
        }

        productsToRender.forEach(product => {
            if (!product) return;

            const productElement = createProductElement(product);
            adminProductsList.appendChild(productElement);
        });

    } catch (error) {
        console.error('❌ Error renderizando productos:', error);
        adminProductsList.innerHTML = '<p class="error">Error al cargar los productos</p>';
    }
}

function createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-item';

    const images = getSafeProductImages(product);
    const mainImage = images[0] || PLACEHOLDER_IMAGE;

    const hasStock = (product.stock || 0) > 0;
    const isLowStock = hasStock && (product.stock <= (product.min_stock || 0));
    const stockStatus = hasStock ? (isLowStock ? 'Stock Bajo' : 'En Stock') : 'Sin Stock';
    const stockClass = hasStock ? (isLowStock ? 'low-stock' : 'in-stock') : 'out-of-stock';

    div.innerHTML = `
        <div class="product-image-container">
            <img src="${mainImage}" 
                 alt="${escapeHtml(product.name || 'Producto')}" 
                 class="product-item-image"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
            ${images.length > 1 ? `<div class="images-count-badge" title="${images.length} imágenes">+${images.length - 1}</div>` : ''}
        </div>
        <div class="product-item-info">
            <div class="product-item-name">${escapeHtml(product.name || 'Producto sin nombre')}</div>
            <div class="product-item-category">${escapeHtml(product.categories?.name || 'Sin categoría')}</div>
            <div class="product-item-brand">${escapeHtml(product.brands?.name || 'Sin marca')}</div>
            <div class="product-item-sku">SKU: ${escapeHtml(product.sku || 'N/A')}</div>
            <div class="product-item-stock ${stockClass}">${stockStatus} (${product.stock || 0})</div>
            <div class="product-item-prices">
                <span class="wholesale-price">Mayorista: $${(product.wholesale_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span class="retail-price">Minorista: $${(product.retail_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ${product.colors && product.colors.length > 0 ?
            `<div class="product-item-colors"><strong>Colores:</strong> ${escapeHtml(Array.isArray(product.colors) ? product.colors.join(', ') : product.colors)}</div>` : ''}
            ${images.length > 0 ?
            `<div class="product-item-images-count"><i class="fas fa-images"></i> ${images.length} imagen(es)</div>` : ''}
        </div>
        <div class="product-item-actions">
            <button class="btn btn-edit" onclick="editProduct('${product.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-delete" onclick="deleteProduct('${product.id}')">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
    `;

    return div;
}

function createNoResultsHTML(message, buttonText, buttonAction) {
    return `
        <div class="no-results" style="text-align: center; padding: 60px 20px; grid-column: 1 / -1;">
            <i class="fas fa-box-open" style="font-size: 64px; color: #cbd5e1; margin-bottom: 20px;"></i>
            <p style="font-size: 16px; color: #64748b; margin-bottom: 24px;">${message}</p>
            <button class="btn btn-primary" onclick="${buttonAction}" style="padding: 12px 24px; font-size: 14px;">
                <i class="fas fa-plus"></i> ${buttonText}
            </button>
        </div>
    `;
}

// ==============================================
// EDICIÓN Y ELIMINACIÓN DE PRODUCTOS
// ==============================================

async function editProduct(id) {
    console.log('✏️ Editando producto:', id);
    try {
        const product = await window.supabaseClient.getProductById(id);
        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }

        currentProduct = product;
        console.log('📦 Producto cargado para edición:', product);

        // Llenar formulario con datos existentes
        fillProductForm(product);

        // Mostrar imágenes existentes
        displayExistingImages(product);

        // Actualizar UI del modal
        document.getElementById('product-modal-title').innerHTML = '<i class="fas fa-edit"></i> <span>Editar Producto</span>';
        document.getElementById('save-product').innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';

        // Mostrar modal
        showProductModal(true);
        showNotification(`Editando: ${product.name}`, 'info');

    } catch (error) {
        console.error('❌ Error cargando producto para editar:', error);
        showNotification('Error al cargar el producto: ' + error.message, 'error');
    }
}

function fillProductForm(product) {
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-category').value = product.category_id || '';
    document.getElementById('product-brand').value = product.brand_id || '';
    document.getElementById('product-sku').value = product.sku || '';
    document.getElementById('product-cost-price').value = product.cost_price || 0;
    document.getElementById('product-wholesale-price').value = product.wholesale_price || 0;
    document.getElementById('product-retail-price').value = product.retail_price || 0;
    document.getElementById('product-stock').value = product.stock || 0;
    document.getElementById('product-min-stock').value = product.min_stock || 0;

    // Colores
    const colors = product.colors;
    if (Array.isArray(colors)) {
        document.getElementById('product-colors').value = colors.join(', ');
    } else if (typeof colors === 'string') {
        document.getElementById('product-colors').value = colors;
    } else {
        document.getElementById('product-colors').value = '';
    }

    // Especificaciones
    const specsInput = document.getElementById('product-specifications');
    if (specsInput) {
        if (typeof product.specifications === 'object' && product.specifications !== null) {
            const specsText = Object.entries(product.specifications)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            specsInput.value = specsText;
        } else if (typeof product.specifications === 'string') {
            specsInput.value = product.specifications;
        } else {
            specsInput.value = '';
        }
    }


}

async function deleteProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
    }

    // Crear detalles adicionales para mostrar
    const details = `
        <h4>Detalles del producto:</h4>
        <ul>
            <li><strong>Nombre:</strong> ${escapeHtml(product.name)}</li>
            <li><strong>Categoría:</strong> ${escapeHtml(product.categories?.name || 'Sin categoría')}</li>
            <li><strong>Marca:</strong> ${escapeHtml(product.brands?.name || 'Sin marca')}</li>
            <li><strong>Stock actual:</strong> ${product.stock || 0} unidades</li>
        </ul>
        <p style="color: #ef4444; font-weight: bold; margin-top: 10px;">
            <i class="fas fa-exclamation-triangle"></i> Esta acción no se puede deshacer.
        </p>
    `;

    // Mostrar el modal de confirmación personalizado
    const confirmed = await showConfirmation({
        title: 'Eliminar Producto',
        message: `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
        details: details,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmColor: 'danger'
    });

    if (!confirmed) {
        return;
    }

    try {
        // Eliminar el producto (marcar como inactivo)
        await window.supabaseClient.deleteProduct(id);
        showNotification('Producto eliminado correctamente', 'success');
        await reloadAdminProducts();
    } catch (error) {
        console.error('❌ Error eliminando producto:', error);
        showNotification('Error al eliminar el producto: ' + error.message, 'error');
    }
}

async function reloadAdminProducts() {
    try {
        console.log('🔄 Recargando productos...');
        adminProducts = await window.supabaseClient.getProducts();
        updateAdminStats();
        renderAdminProducts();
        renderStockTable();
    } catch (error) {
        console.error('❌ Error recargando productos:', error);
        showNotification('Error al recargar productos', 'error');
    }
}

// ==============================================
// GESTIÓN DE STOCK
// ==============================================

function renderStockTable() {
    const tbody = document.getElementById('stock-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    const productsToShow = adminFilteredProducts.length > 0 ? adminFilteredProducts : adminProducts;

    if (productsToShow.length === 0) {
        let message = 'No hay productos registrados';
        const searchInput = document.getElementById('stock-search');
        if (searchInput && searchInput.value.trim() !== '') {
            message = `No se encontraron productos que coincidan con "${searchInput.value}"`;
        }

        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-box-open" style="font-size: 48px; color: #cbd5e1; margin-bottom: 20px; display: block;"></i>
                    <p style="font-size: 16px; color: #64748b; margin: 10px 0;">${message}</p>
                    ${searchInput && searchInput.value.trim() !== '' ?
                '<button class="btn btn-secondary" onclick="clearStockSearch()" style="margin-top: 15px;">Limpiar búsqueda</button>' :
                '<button class="btn btn-primary" onclick="showProductModal()" style="margin-top: 15px;">Agregar Producto</button>'}
                </td>
            </tr>
        `;
        return;
    }

    productsToShow.forEach(product => {
        const row = document.createElement('tr');

        const hasStock = (product.stock || 0) > 0;
        const isLowStock = hasStock && (product.stock <= (product.min_stock || 0));
        const stockIndicator = hasStock ?
            (isLowStock ?
                '<span style="color: #f59e0b; font-weight: bold;">●</span>' :
                '<span style="color: #10b981; font-weight: bold;">●</span>') :
            '<span style="color: #ef4444; font-weight: bold;">●</span>';

        const stockStatus = hasStock ? (isLowStock ? 'text-warning' : 'text-success') : 'text-danger';

        row.innerHTML = `
            <td>
                ${stockIndicator}
                <strong>${escapeHtml(product.name || 'Sin nombre')}</strong>
            </td>
            <td>${escapeHtml(product.categories?.name || 'N/A')}</td>
            <td>${escapeHtml(product.brands?.name || 'N/A')}</td>
            <td class="${stockStatus}">${product.stock || 0}</td>
            <td>$${(product.wholesale_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>$${(product.retail_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>
                <button class="btn btn-edit" onclick="editProduct('${product.id}')" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" onclick="deleteProduct('${product.id}')" style="padding: 6px 12px; font-size: 12px;">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function searchStockProducts() {
    const searchInput = document.getElementById('stock-search');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        adminFilteredProducts = [];
        renderStockTable();
        return;
    }

    adminFilteredProducts = adminProducts.filter(product => {
        const searchFields = [
            product.name || '',
            product.categories?.name || '',
            product.description || '',
            product.brands?.name || '',
            product.sku || ''
        ];

        return searchFields.some(field =>
            field && field.toLowerCase().includes(searchTerm)
        );
    });

    renderStockTable();
}

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

async function logout() {
    try {
        console.log('🔐 Iniciando proceso de cierre de sesión...');

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cerrando sesión...';
        }

        await window.supabaseClient.signOut();

        // Limpiar almacenamiento local
        localStorage.clear();
        sessionStorage.clear();

        showNotification('Sesión cerrada correctamente', 'success');

        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);

    } catch (error) {
        console.error('💥 Error cerrando sesión:', error);
        window.location.href = 'admin-login.html';
    }
}

function showNotification(message, type = 'success') {
    try {
        // Eliminar notificaciones existentes
        document.querySelectorAll('.custom-notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = 'custom-notification';

        const icon = type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <span>${escapeHtml(message)}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);

    } catch (error) {
        console.error('❌ Error mostrando notificación:', error);
        alert(message);
    }
}

// ==============================================
// FUNCIONES DE UTILIDAD
// ==============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==============================================
// FUNCIÓN FALTANTE: renderOrders
// ==============================================
function renderOrders() {
    console.log('🔍 Buscando contenedor de pedidos...');
    const ordersList = document.getElementById('orders-list');

    if (!ordersList) {
        console.error('❌ CRÍTICO: No se encontró #orders-list en el HTML');
        // Crear el elemento si no existe
        const analyticsSection = document.getElementById('analytics-section');
        if (analyticsSection) {
            const newOrdersList = document.createElement('div');
            newOrdersList.id = 'orders-list';
            newOrdersList.className = 'orders-list';
            newOrdersList.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-top: 20px;
            `;

            // Buscar donde insertarlo (después del último elemento antes de donde debería ir)
            const header = analyticsSection.querySelector('h3');
            if (header && header.textContent.includes('Pedidos Realizados')) {
                header.parentNode.insertBefore(newOrdersList, header.nextSibling);
                console.log('✅ Contenedor de pedidos creado dinámicamente');
                // Volver a llamar a renderOrders con el nuevo contenedor
                setTimeout(renderOrders, 50);
                return;
            }
        }
        return;
    }

    console.log('📋 Renderizando pedidos, total:', adminOrders?.length || 0);

    try {
        ordersList.innerHTML = '';

        if (!adminOrders || adminOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="no-orders" style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 2px dashed #e2e8f0;">
                    <i class="fas fa-receipt" style="font-size: 64px; color: #cbd5e1; margin-bottom: 20px;"></i>
                    <h3 style="color: #475569; margin-bottom: 10px;">No hay pedidos registrados</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">Cuando los clientes realicen pedidos vía WhatsApp, aparecerán aquí.</p>
                    <button class="btn btn-primary" onclick="loadAdminData()" style="padding: 10px 20px;">
                        <i class="fas fa-sync-alt"></i> Recargar Pedidos
                    </button>
                </div>
            `;
            return;
        }

        console.log('✅ Mostrando', adminOrders.length, 'pedidos');

        // Ordenar por fecha más reciente primero
        const sortedOrders = [...adminOrders].sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || 0);
            const dateB = new Date(b.created_at || b.createdAt || 0);
            return dateB - dateA;
        });

        sortedOrders.forEach(order => {
            try {
                const orderElement = createOrderElement(order);
                ordersList.appendChild(orderElement);
            } catch (error) {
                console.error('❌ Error creando elemento de orden:', error);
                // Crear elemento de error como fallback
                const errorElement = document.createElement('div');
                errorElement.className = 'order-card';
                errorElement.innerHTML = `
                    <div style="padding: 20px; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px;">
                        <i class="fas fa-exclamation-triangle"></i> Error cargando orden: ${order.id}
                    </div>
                `;
                ordersList.appendChild(errorElement);
            }
        });

        console.log(`✅ ${sortedOrders.length} pedidos renderizados correctamente`);

    } catch (error) {
        console.error('❌ Error fatal en renderOrders:', error);
        ordersList.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 40px 20px; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Error al cargar los pedidos</h3>
                <p>${error.message || 'Error desconocido'}</p>
                <button class="btn btn-secondary" onclick="loadAdminData()" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> Intentar nuevamente
                </button>
            </div>
        `;
    }
}

// EN admin-init.js - AGREGAR después de renderOrders
function setupDateFilter() {
    const dateFilter = document.getElementById('date-filter');
    if (!dateFilter) return;

    dateFilter.addEventListener('change', filterOrdersByDate);
}

function filterOrdersByDate() {
    const filterValue = document.getElementById('date-filter').value;
    const ordersList = document.getElementById('orders-list');

    if (!adminOrders || adminOrders.length === 0 || !ordersList) {
        renderOrders();
        return;
    }

    const now = new Date();
    let filteredOrders = [...adminOrders];

    switch (filterValue) {
        case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filteredOrders = adminOrders.filter(order =>
                new Date(order.created_at) >= today
            );
            break;

        case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);

            filteredOrders = adminOrders.filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate >= yesterday && orderDate < todayStart;
            });
            break;

        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - 7);
            filteredOrders = adminOrders.filter(order =>
                new Date(order.created_at) >= weekStart
            );
            break;

        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredOrders = adminOrders.filter(order =>
                new Date(order.created_at) >= monthStart
            );
            break;

        case 'all':
        default:
            filteredOrders = [...adminOrders];
            break;
    }

    // Actualizar estadísticas con el filtro actual
    updateOrdersStats(filteredOrders);

    // Renderizar órdenes filtradas
    renderFilteredOrders(filteredOrders);
}

function renderFilteredOrders(filteredOrders) {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    ordersList.innerHTML = '';

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 64px; color: #cbd5e1; margin-bottom: 20px;"></i>
                <h3 style="color: #475569; margin-bottom: 10px;">No hay pedidos en este período</h3>
                <p style="color: #64748b;">Intenta con otro rango de fechas.</p>
            </div>
        `;
        return;
    }

    filteredOrders.forEach(order => {
        const orderElement = createOrderElement(order);
        ordersList.appendChild(orderElement);
    });
}

function updateOrdersStats(filteredOrders = adminOrders) {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    console.log('📊 Actualizando estadísticas:', totalOrders, 'pedidos', totalRevenue, 'ingresos');

    // Actualizar elementos
    const ordersDisplay = document.getElementById('total-orders-display');
    const revenueDisplay = document.getElementById('total-revenue');

    if (ordersDisplay) {
        ordersDisplay.textContent = totalOrders;
        console.log('✅ Actualizado total-orders-display:', totalOrders);
    }

    if (revenueDisplay) {
        revenueDisplay.textContent = `$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        console.log('✅ Actualizado total-revenue:', revenueDisplay.textContent);
    }
}

// EN admin-init.js - MEJORAR la función createOrderElement
function createOrderElement(order) {
    console.log('🔄 Creando elemento para orden:', order.id);

    const orderDate = new Date(order.created_at);
    const formattedDate = orderDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let statusText = 'Confirmado'; // Mostrar siempre como confirmado
    let statusClass = 'confirmed'; // Siempre mostrar como confirmado
    // Calcular cantidad de productos desde el campo 'items' (jsonb)
    let itemCount = 0;
    let productNames = [];

    // Usar el campo 'items' de la tabla
    if (order.items) {
        try {
            let itemsData = order.items;
            if (typeof itemsData === 'string') {
                itemsData = JSON.parse(itemsData);
            }

            if (Array.isArray(itemsData)) {
                itemCount = itemsData.reduce((sum, item) => {
                    return sum + (parseInt(item.quantity) || 1);
                }, 0);

                productNames = itemsData.map(item =>
                    item.name || item.product_name || 'Producto'
                ).filter(name => name);

                console.log(`🛒 Orden ${order.id}: ${itemCount} productos desde items JSONB`);
            }
        } catch (error) {
            console.error(`❌ Error procesando items de orden ${order.id}:`, error);
        }
    }

    const productSummary = productNames.length > 0
        ? productNames.slice(0, 2).join(', ') + (productNames.length > 2 ? ` y ${productNames.length - 2} más` : '')
        : 'Sin productos detallados';

    const div = document.createElement('div');
    div.className = 'order-card';
    div.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    `;
    div.onmouseover = () => div.style.transform = 'translateY(-2px)';
    div.onmouseout = () => div.style.transform = 'translateY(0)';

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div style="flex: 1;">
                <div style="margin-bottom: 8px;">
                    <strong style="font-size: 18px; color: #1e293b;">${escapeHtml(order.customer_name || 'Cliente')}</strong>
                    <div style="color: #64748b; font-size: 14px; margin-top: 4px;">${escapeHtml(order.customer_phone || 'Sin teléfono')}</div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 8px;">
                    <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 13px; color: #475569; font-weight: 500;">
                        ${escapeHtml(order.invoice_number || `ORD-${order.id.substring(0, 8)}`)}
                    </span>
                    <span style="color: #64748b; font-size: 14px;">${formattedDate} ${formattedTime}</span>
                   
<span class="status-badge ${statusClass}" style="... background: #d1fae5; color: #065f46; ...">
    ${statusText}
</span>
                </div>
            </div>
            <div style="font-size: 22px; font-weight: 700; color: #059669; background: #f0fdf4; padding: 8px 16px; border-radius: 8px; border: 2px solid #bbf7d0;">
                $${(order.total_amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569;">
                <i class="fas fa-envelope" style="color: #64748b; width: 16px;"></i>
                <span>${escapeHtml(order.customer_email || 'Sin email')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569;">
                <i class="fas fa-shopping-cart" style="color: #64748b; width: 16px;"></i>
                <span>${itemCount} producto${itemCount !== 1 ? 's' : ''}: ${escapeHtml(productSummary)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569;">
                <i class="fas fa-credit-card" style="color: #64748b; width: 16px;"></i>
                <span>${escapeHtml(order.payment_method || 'Por WhatsApp')}</span>
            </div>
        </div>
        
   <div style="display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0; flex-wrap: wrap;">
    <button class="btn btn-info" onclick="viewOrderDetail('${order.id}')" style="padding: 10px 20px; background: #0ea5e9; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-eye"></i> Ver Factura Completa
    </button>
    
    <button class="btn btn-secondary" onclick="downloadInvoice('${order.id}')" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-download"></i> Descargar PDF
    </button>
</div>
    `;

    return div;
}

// ==============================================
// FUNCIÓN PRINCIPAL PARA LLENAR FACTURA - VERSIÓN CORREGIDA SIN DUPLICADOS
// ==============================================
function fillInvoiceModal(order) {
    console.log('🔄 fillInvoiceModal llamado para orden:', order.id);

    if (!order) {
        showNotification('Error: Orden no encontrada', 'error');
        return;
    }

    try {
        // 1. FECHA Y NÚMERO DE FACTURA
        const orderDate = new Date(order.created_at || order.createdAt || new Date());
        const formattedDate = orderDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = orderDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Actualizar información de cabecera
        document.getElementById('invoice-number').textContent =
            order.invoice_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`;
        document.getElementById('invoice-id').textContent =
            order.invoice_number || order.id;
        document.getElementById('invoice-date').textContent = formattedDate;
        document.getElementById('invoice-time').textContent = formattedTime;

        // 2. ESTADO
        let statusText = 'Confirmado';
        order.status = 'confirmed'; // Esto actualiza el objeto localmente
        const statusElement = document.getElementById('invoice-status');
        statusElement.textContent = statusText;
        statusElement.className = `status-badge confirmed`;

        // 3. INFORMACIÓN DEL CLIENTE
        document.getElementById('customer-name').textContent =
            order.customer_name || 'No especificado';
        document.getElementById('customer-phone').textContent =
            order.customer_phone || 'No especificado';
        document.getElementById('customer-email').textContent =
            order.customer_email || 'No especificado';
        document.getElementById('payment-method').textContent =
            order.payment_method || 'Acordar por WhatsApp';

        // 4. PROCESAR LOS PRODUCTOS DESDE EL CAMPO 'items' (jsonb)
        console.log('🔍 PROCESANDO PRODUCTOS desde campo items...');

        let itemsArray = [];
        let subtotalSinIVA = 0; // SUBTOTAL SIN IVA
        let totalIVA = 0; // TOTAL DE IVA
        let subtotalConIVA = 0; // SUBTOTAL CON IVA INCLUIDO

        // El campo es JSONB, pero podría venir como string o ya parseado
        if (order.items) {
            try {
                // Si es string, parsearlo
                let itemsData = order.items;
                if (typeof itemsData === 'string') {
                    itemsData = JSON.parse(itemsData);
                }

                // Debería ser un array
                if (Array.isArray(itemsData)) {
                    itemsArray = itemsData;
                    console.log(`✅ Encontrados ${itemsArray.length} productos en items JSONB`);

                    // Validar que cada item tenga la estructura correcta
                    itemsArray = itemsArray.map((item, index) => {
                        // Buscar descripción
                        let description = '';
                        if (item.description) {
                            description = item.description;
                        } else if (item.product && item.product.description) {
                            description = item.product.description;
                        } else if (item.product_description) {
                            description = item.product_description;
                        } else if (item.desc) {
                            description = item.desc;
                        }

                        // El precio que viene ya incluye IVA (ejemplo: 40.75)
                        const precioConIVA = parseFloat(item.price) || parseFloat(item.unit_price) || parseFloat(item.product?.price) || 0;

                        // CALCULAR: Precio sin IVA (40.75 / 1.21 = 33.67)
                        const precioSinIVA = precioConIVA / 1.21;

                        // CALCULAR: IVA del producto (40.75 - 33.67 = 7.08)
                        const ivaProducto = precioConIVA - precioSinIVA;

                        // Cantidad
                        const cantidad = parseInt(item.quantity) || parseInt(item.qty) || 1;

                        // Totales
                        const totalConIVA = precioConIVA * cantidad;
                        const totalSinIVA = precioSinIVA * cantidad;
                        const totalIvaProducto = ivaProducto * cantidad;

                        // Normalizar la estructura del item
                        const normalizedItem = {
                            name: item.name || item.product_name || item.product?.name || `Producto ${index + 1}`,
                            quantity: cantidad,
                            precioConIVA: precioConIVA, // Precio que ve el cliente (con IVA incluido)
                            precioSinIVA: precioSinIVA, // Precio base sin IVA
                            ivaPorUnidad: ivaProducto, // IVA por unidad
                            sku: item.sku || item.product?.sku || '',
                            is_wholesale: item.is_wholesale || false,
                            description: description,
                            totalConIVA: totalConIVA, // Total con IVA incluido
                            totalSinIVA: totalSinIVA, // Total sin IVA
                            totalIVA: totalIvaProducto // Total de IVA para este producto
                        };

                        // Sumar a los totales
                        subtotalSinIVA += totalSinIVA;
                        totalIVA += totalIvaProducto;
                        subtotalConIVA += totalConIVA;

                        return normalizedItem;
                    });
                } else if (typeof itemsData === 'object' && itemsData !== null) {
                    // Si es un objeto (no array), convertirlo a array
                    itemsArray = [itemsData];
                    console.log('⚠️ Items es un objeto, convertido a array');
                }
            } catch (parseError) {
                console.error('❌ Error parseando items:', parseError);
                showNotification('Error al procesar los productos de la orden', 'error');
            }
        }

        // DEPURACIÓN: Mostrar qué hay en itemsArray
        console.log(`📦 ItemsArray final (${itemsArray.length} productos):`, itemsArray);
        console.log('💰 TOTALES CALCULADOS:', {
            subtotalSinIVA: subtotalSinIVA.toFixed(2),
            totalIVA: totalIVA.toFixed(2),
            subtotalConIVA: subtotalConIVA.toFixed(2)
        });

        // 5. RENDERIZAR LA TABLA DE PRODUCTOS
        const itemsContainer = document.getElementById('invoice-items');
        if (!itemsContainer) {
            console.error('❌ No se encontró el contenedor de items');
            return;
        }

        // LIMPIAR TODAS LAS FILAS
        itemsContainer.innerHTML = '';

        // 6. INSERTAR LOS PRODUCTOS
        if (itemsArray.length > 0) {
            itemsArray.forEach((item, index) => {
                const row = document.createElement('tr');
                row.style.cssText = 'border-bottom: 1px solid #e2e8f0;';

                // Determinar si es precio mayorista
                const isWholesale = item.is_wholesale || (item.quantity >= 10);

                row.innerHTML = `
                    <td style="padding: 12px 15px; width: 40%;">
                        <div style="font-weight: 600; margin-bottom: 4px; color: #1e293b;">
                            ${escapeHtml(item.name || `Producto ${index + 1}`)}
                        </div>
                        ${item.sku ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">SKU: ${escapeHtml(item.sku)}</div>` : ''}
                        ${isWholesale ?
                        '<div style="font-size: 11px; color: #059669; margin-top: 2px; font-weight: 500; background: #f0fdf4; padding: 2px 6px; border-radius: 4px; display: inline-block;">' +
                        '<i class="fas fa-industry"></i> Precio mayorista</div>' : ''}
                        <div style="font-size: 11px; color: #3b82f6; margin-top: 4px; padding: 3px 6px; background: #eff6ff; border-radius: 4px; display: inline-block;">
                            <i class="fas fa-receipt"></i> Precio IVA incluido
                        </div>
                    </td>
                    <td style="padding: 12px 15px; text-align: center; font-weight: 500; vertical-align: top; width: 15%;">
                        <div style="font-size: 14px; font-weight: 600;">${item.quantity}</div>
                        <div style="font-size: 10px; color: #64748b;">unidades</div>
                        ${!item.description || item.description.trim() === '' ?
                        `<div style="font-size: 11px; color: #475569; margin-top: 6px; padding: 4px; font-style: italic; text-align: left;">
                            ${escapeHtml(item.name.substring(0, 80))}${item.name.length > 80 ? '...' : ''}
                        </div>`
                        :
                        `<div style="font-size: 11px; color: #475569; margin-top: 6px; padding: 6px; background: #f8fafc; border-radius: 4px; border-left: 3px solid #3b82f6; text-align: left;">
                            <span style="font-style: italic;">${escapeHtml(item.description.substring(0, 80))}${item.description.length > 80 ? '...' : ''}</span>
                        </div>`
                    }
                    </td>
                    <td style="padding: 12px 15px; text-align: right; font-weight: 500; vertical-align: top; width: 20%;">
                        <div style="font-size: 14px; font-weight: 600;">$${item.precioConIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                        <div style="font-size: 10px; color: #64748b;">
                            <span style="color: #059669;">IVA incl.</span> |
                            <span style="color: #64748b;">Base: $${item.precioSinIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
                            IVA: $${item.ivaPorUnidad.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                        </div>
                    </td>
                    <td style="padding: 12px 15px; text-align: right; font-weight: 600; vertical-align: top; width: 25%; color: #059669;">
                        <div style="font-size: 16px;">$${item.totalConIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                        <div style="font-size: 10px; color: #64748b;">
                            <span style="display: block; margin-top: 2px;">
                                Base: $${item.totalSinIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                            <span style="display: block; color: #3b82f6; font-size: 9px;">
                                IVA: $${item.totalIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </td>
                `;

                itemsContainer.appendChild(row);
            });
        } else {
            // Mostrar mensaje de que no hay productos
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="4" style="padding: 40px 20px; text-align: center; color: #64748b;">
                    <i class="fas fa-box-open" style="font-size: 32px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
                    <p style="font-size: 14px;">No se encontraron productos detallados en esta orden.</p>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
                        Total registrado: $${(order.total_amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                </td>
            `;
            itemsContainer.appendChild(emptyRow);

            // Usar el total de la orden si no hay productos detallados
            subtotalConIVA = order.total_amount || 0;
            subtotalSinIVA = subtotalConIVA / 1.21;
            totalIVA = subtotalConIVA - subtotalSinIVA;
        }

        // 7. CALCULAR ENVÍO Y TOTAL FINAL
        const shipping = order.shipping_cost || 0;
        const total = subtotalConIVA + shipping;

        console.log('💰 TOTALES FINALES:', {
            subtotalSinIVA: `$${subtotalSinIVA.toFixed(2)}`,
            totalIVA: `$${totalIVA.toFixed(2)} (21%)`,
            subtotalConIVA: `$${subtotalConIVA.toFixed(2)}`,
            shipping: `$${shipping.toFixed(2)}`,
            total: `$${total.toFixed(2)}`
        });

        // 8. CREAR FILAS DE TOTALES
        // Fila de subtotal sin IVA
        const subtotalSinIVARow = document.createElement('tr');
        subtotalSinIVARow.style.cssText = 'background-color: #f8fafc;';
        subtotalSinIVARow.innerHTML = `
            <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: 600; border-top: 2px solid #e2e8f0;">
                Subtotal (sin IVA):
            </td>
            <td style="padding: 12px 15px; text-align: right; font-weight: 600; border-top: 2px solid #e2e8f0;">
                $${subtotalSinIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </td>
        `;
        itemsContainer.appendChild(subtotalSinIVARow);

        // Fila de IVA
        const ivaRow = document.createElement('tr');
        ivaRow.style.cssText = 'background-color: #f0f9ff;';
        ivaRow.innerHTML = `
            <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: 600;">
                IVA (21%):
                <div style="font-size: 11px; color: #3b82f6; font-weight: normal; margin-top: 2px;">
                    Incluido en el precio de cada producto
                </div>
            </td>
            <td style="padding: 12px 15px; text-align: right; font-weight: 600;">
                $${totalIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </td>
        `;
        itemsContainer.appendChild(ivaRow);

        // Fila de subtotal con IVA
        const subtotalConIVARow = document.createElement('tr');
        subtotalConIVARow.style.cssText = 'background-color: #f8fafc;';
        subtotalConIVARow.innerHTML = `
            <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: 600;">
                Subtotal (IVA incluido):
                <div style="font-size: 11px; color: #059669; font-weight: normal; margin-top: 2px;">
                    <i class="fas fa-check-circle"></i> Precios con IVA incluido
                </div>
            </td>
            <td style="padding: 12px 15px; text-align: right; font-weight: 600;">
                $${subtotalConIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </td>
        `;
        itemsContainer.appendChild(subtotalConIVARow);

        // Fila de envío (si existe)
        if (shipping > 0) {
            const shippingRow = document.createElement('tr');
            shippingRow.style.cssText = 'background-color: #fefce8;';
            shippingRow.innerHTML = `
                <td colspan="3" style="padding: 12px 15px; text-align: right; font-weight: 600;">
                    Costo de envío:
                </td>
                <td style="padding: 12px 15px; text-align: right; font-weight: 600;">
                    $${shipping.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </td>
            `;
            itemsContainer.appendChild(shippingRow);
        }

        // Fila de TOTAL
        const totalRow = document.createElement('tr');
        totalRow.style.cssText = 'background-color: #dcfce7; font-weight: bold; border-top: 3px solid #059669;';
        totalRow.innerHTML = `
            <td colspan="3" style="padding: 12px 15px; text-align: right; font-size: 16px;">
                <strong>TOTAL A PAGAR:</strong>
                <div style="font-size: 11px; color: #059669; font-weight: normal; margin-top: 2px;">
                    <i class="fas fa-shopping-cart"></i> IVA incluido en todos los productos
                </div>
            </td>
            <td style="padding: 12px 15px; text-align: right; font-size: 18px; color: #059669;">
                <strong>$${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
            </td>
        `;
        itemsContainer.appendChild(totalRow);

        // 9. ACTUALIZAR ELEMENTOS DEL MODAL
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `$${value.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }
        };

        updateElement('invoice-subtotal', subtotalConIVA);
        updateElement('invoice-tax', totalIVA);
        updateElement('invoice-shipping', shipping);
        updateElement('invoice-total', total);

        // 10. INFORMACIÓN ADICIONAL
        const notesElement = document.querySelector('.invoice-notes p');
        if (notesElement) {
            notesElement.innerHTML = `
                <div style="margin-bottom: 10px; padding: 10px; background: #f0f9ff; border-radius: 6px;">
                    <strong><i class="fas fa-info-circle" style="color: #3b82f6;"></i> Información de facturación:</strong><br>
                    <span style="color: #475569;">
                        Todos los precios incluyen IVA (21%).<br>
                        Subtotal sin IVA: $${subtotalSinIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}<br>
                        Total IVA: $${totalIVA.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Estado:</strong> ${statusText}<br>
                    <strong>Fecha y hora:</strong> ${formattedDate} ${formattedTime}<br>
                    <strong>Número de orden:</strong> ${order.invoice_number || order.id}
                </div>
                ${order.notes ? `<div style="margin-top: 10px; padding: 8px; background: #fef3c7; border-radius: 4px;">
                    <strong>Notas del cliente:</strong> ${escapeHtml(order.notes)}
                </div>` : ''}
                ${order.shipping_address ? `<div style="margin-top: 10px;">
                    <strong>Dirección de envío:</strong> ${escapeHtml(order.shipping_address)}
                </div>` : ''}
                <div style="margin-top: 15px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                    <i class="fas fa-file-invoice-dollar"></i> 
                    Factura emitida por Herrajería - Todos los montos incluyen IVA (21%)<br>
                    <i class="fas fa-phone"></i> Contacto: ${order.customer_phone || 'No especificado'}
                </div>
            `;
        }

        console.log('✅ Factura llenada correctamente - Sistema IVA incluido');

    } catch (error) {
        console.error('❌ Error en fillInvoiceModal:', error);
        showNotification('Error al cargar la factura: ' + error.message, 'error');

        // Fallback básico
        const itemsContainer = document.getElementById('invoice-items');
        if (itemsContainer) {
            itemsContainer.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 20px; text-align: center; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i> Error al cargar los productos.<br>
                        Total del pedido: $${(order.total_amount || 0).toLocaleString('es-AR')}<br>
                    </td>
                </tr>
            `;
        }
    }
}
// Función para calcular y formatear montos con IVA
function calculateWithIVA(subtotal, ivaPercentage = 0.21) {
    const ivaAmount = subtotal * ivaPercentage;
    const totalWithIVA = subtotal + ivaAmount;

    return {
        subtotal: subtotal,
        ivaPercentage: ivaPercentage * 100,
        ivaAmount: ivaAmount,
        total: totalWithIVA
    };
}

// Función para formatear montos en moneda
function formatCurrency(amount) {
    return `$${amount.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}



async function downloadInvoice(orderId) {
    try {
        const order = adminOrders.find(o => o.id === orderId);
        if (!order) {
            showNotification('Orden no encontrada', 'error');
            return;
        }

        showNotification('Generando factura PDF...', 'info');

        // Primero mostrar el modal de factura
        fillInvoiceModal(order);
        showModal('invoice-modal');

        // Esperar un momento para que se renderice
        setTimeout(() => {
            if (typeof html2pdf === 'undefined') {
                showNotification('Cargando generador de PDF...', 'info');
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
                    .then(() => {
                        generatePDF(order);
                    })
                    .catch(error => {
                        console.error('Error cargando html2pdf:', error);
                        showNotification('Usando impresión como alternativa', 'warning');
                        printInvoice();
                    });
            } else {
                generatePDF(order);
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Error descargando factura:', error);
        showNotification('Error al generar PDF: ' + error.message, 'error');
    }
}

function generatePDF(order) {
    try {
        const element = document.getElementById('invoice-modal').querySelector('.modal-content');
        const invoiceNumber = order.invoice_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Factura_${invoiceNumber}_Herrajeria.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            showNotification('PDF generado exitosamente', 'success');
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar PDF. Usando impresión.', 'error');
        printInvoice();
    }
}

// Agrega esta función para notificar al usuario (simulación)
async function notifyUser(order) {
    // Aquí puedes integrar con un servicio de notificaciones
    // Por ahora, solo mostraremos un mensaje
    console.log('Notificando al usuario:', order.customer_email);

    // Ejemplo: Podrías enviar un email o notificación por WhatsApp aquí
    // Esto es un placeholder para la funcionalidad futura
}


// Hacer las funciones disponibles globalmente

window.downloadInvoice = downloadInvoice;
window.viewOrderDetail = viewOrderDetail;


// EN admin-init.js - AGREGAR después de fillInvoiceModal
function setupInvoiceActions() {
    const printBtn = document.getElementById('print-invoice');
    const downloadBtn = document.getElementById('download-pdf');

    if (printBtn) {
        printBtn.addEventListener('click', printInvoice);
    }

    // Crear botón de descarga si no existe - VERSIÓN SEGURA
    if (!downloadBtn) {
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            // Verificar que el botón print exista en el footer
            const printBtnInFooter = modalFooter.querySelector('#print-invoice');

            if (printBtnInFooter) {
                const downloadButton = document.createElement('button');
                downloadButton.id = 'download-pdf';
                downloadButton.className = 'btn btn-success';
                downloadButton.innerHTML = '<i class="fas fa-file-pdf"></i> Descargar PDF';

                // Insertar ANTES del botón de imprimir
                modalFooter.insertBefore(downloadButton, printBtnInFooter);
                downloadButton.addEventListener('click', downloadInvoiceAsPDF);

                console.log('✅ Botón de descarga PDF creado correctamente');
            } else {
                // Si no hay botón print, agregar al final
                const downloadButton = document.createElement('button');
                downloadButton.id = 'download-pdf';
                downloadButton.className = 'btn btn-success';
                downloadButton.innerHTML = '<i class="fas fa-file-pdf"></i> Descargar PDF';
                modalFooter.appendChild(downloadButton);
                downloadButton.addEventListener('click', downloadInvoiceAsPDF);
            }
        } else {
            console.warn('⚠️ No se encontró .modal-footer para agregar botón de descarga');
        }
    } else {
        // Si ya existe, asegurar que tenga el event listener
        downloadBtn.addEventListener('click', downloadInvoiceAsPDF);
    }
}
// ==============================================
// FUNCIONES PARA NUEVAS ESTADÍSTICAS DEL DASHBOARD
// ==============================================

// Función para actualizar todas las estadísticas avanzadas
async function updateAdvancedStats() {
    try {
        console.log('📊 Actualizando estadísticas avanzadas...');
        
        // Actualizar productos más vendidos
        await updateTopSoldProducts();
        
        // Actualizar productos más clickeados
        await updateTopClickedProducts();
        
        // Actualizar productos más buscados
        await updateTopSearchedProducts();
        
        // Actualizar lista de stock bajo
        updateLowStockDetails();
        
        console.log('✅ Estadísticas avanzadas actualizadas');
        
    } catch (error) {
        console.error('❌ Error actualizando estadísticas avanzadas:', error);
    }
}

// Función para obtener productos más vendidos desde Supabase
async function updateTopSoldProducts() {
    try {
        console.log('🛒 Obteniendo productos más vendidos...');
        
        // En una implementación real, esto vendría de Supabase
        // Por ahora, simulemos datos con los pedidos existentes
        
        const topSoldContainer = document.getElementById('top-sold-products');
        if (!topSoldContainer) return;
        
        // Simular datos para demo
        // En producción, consultarías la base de datos
        const sampleData = [
            { name: 'Tornillo hexagonal 1/2"', value: 45, trend: 'up' },
            { name: 'Tuerca galvanizada', value: 32, trend: 'up' },
            { name: 'Arandela plana', value: 28, trend: 'neutral' },
            { name: 'Perno estructural', value: 22, trend: 'down' },
            { name: 'Clavo industrial', value: 18, trend: 'up' }
        ];
        
        if (sampleData.length === 0) {
            topSoldContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>No hay datos de ventas aún</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        sampleData.forEach((product, index) => {
            const trendClass = `trend-${product.trend}`;
            const trendIcon = product.trend === 'up' ? 'fas fa-arrow-up' : 
                             product.trend === 'down' ? 'fas fa-arrow-down' : 
                             'fas fa-minus';
            
            html += `
                <div class="product-stat-item">
                    <div class="product-stat-rank">${index + 1}</div>
                    <div class="product-stat-info">
                        <div class="product-stat-name">${escapeHtml(product.name)}</div>
                        <div class="product-stat-meta">
                            <span>${product.value} unidades</span>
                            <span class="trend-indicator ${trendClass}">
                                <i class="${trendIcon}"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        topSoldContainer.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error obteniendo productos más vendidos:', error);
    }
}

// Función para obtener productos más clickeados
async function updateTopClickedProducts() {
    try {
        console.log('🖱️ Obteniendo productos más clickeados...');
        
        const topClickedContainer = document.getElementById('top-clicked-products');
        if (!topClickedContainer) return;
        
        // En producción, esto vendría de una tabla de analytics
        const sampleData = [
            { name: 'Martillo profesional', clicks: 156, change: '+12%' },
            { name: 'Llave ajustable', clicks: 134, change: '+8%' },
            { name: 'Taladro percutor', clicks: 98, change: '+23%' },
            { name: 'Sierra circular', clicks: 76, change: '-5%' },
            { name: 'Destornillador set', clicks: 65, change: '+15%' }
        ];
        
        if (sampleData.length === 0) {
            topClickedContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <p>No hay datos de clics aún</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        sampleData.forEach((product, index) => {
            const changeColor = product.change.startsWith('+') ? 'text-success' : 
                               product.change.startsWith('-') ? 'text-danger' : 'text-secondary';
            
            html += `
                <div class="product-stat-item">
                    <div class="product-stat-rank">${index + 1}</div>
                    <div class="product-stat-info">
                        <div class="product-stat-name">${escapeHtml(product.name)}</div>
                        <div class="product-stat-meta">
                            <span>${product.clicks} clics</span>
                            <span class="${changeColor}">${product.change}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        topClickedContainer.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error obteniendo productos más clickeados:', error);
    }
}

// Función para obtener productos más buscados
async function updateTopSearchedProducts() {
    try {
        console.log('🔍 Obteniendo productos más buscados...');
        
        const topSearchedContainer = document.getElementById('top-searched-products');
        if (!topSearchedContainer) return;
        
        // En producción, esto vendría de logs de búsqueda
        const sampleData = [
            { name: 'Tornillos inoxidables', searches: 89 },
            { name: 'Herramientas eléctricas', searches: 76 },
            { name: 'Material ferretero', searches: 65 },
            { name: 'Accesorios baño', searches: 54 },
            { name: 'Cerraduras seguridad', searches: 43 }
        ];
        
        if (sampleData.length === 0) {
            topSearchedContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No hay datos de búsquedas aún</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        sampleData.forEach((product, index) => {
            html += `
                <div class="product-stat-item">
                    <div class="product-stat-rank">${index + 1}</div>
                    <div class="product-stat-info">
                        <div class="product-stat-name">${escapeHtml(product.name)}</div>
                        <div class="product-stat-meta">
                            <span>${product.searches} búsquedas</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        topSearchedContainer.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error obteniendo productos más buscados:', error);
    }
}

// Función para actualizar lista detallada de stock bajo
function updateLowStockDetails() {
    try {
        console.log('⚠️ Actualizando lista de stock bajo...');
        
        const lowStockContainer = document.getElementById('low-stock-details');
        const lowStockCount = document.getElementById('low-stock-count');
        
        if (!lowStockContainer || !lowStockCount) return;
        
        // Filtrar productos con stock bajo
        const lowStockProducts = adminProducts.filter(product => {
            const stock = product.stock || 0;
            const minStock = product.min_stock || 0;
            return stock > 0 && stock <= minStock;
        });
        
        // Actualizar contador
        lowStockCount.textContent = lowStockProducts.length;
        
        if (lowStockProducts.length === 0) {
            lowStockContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Todo el stock está en buen nivel</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por stock más bajo
        lowStockProducts.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        
        let html = '';
        lowStockProducts.forEach(product => {
            const stock = product.stock || 0;
            const minStock = product.min_stock || 0;
            
            html += `
                <div class="low-stock-item" onclick="editProduct('${product.id}')" style="cursor: pointer;">
                    <div class="low-stock-name">${escapeHtml(product.name || 'Producto sin nombre')}</div>
                    <div>
                        <span class="low-stock-level">${stock}</span>
                        <span class="low-stock-min">/${minStock} min</span>
                    </div>
                </div>
            `;
        });
        
        lowStockContainer.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error actualizando lista de stock bajo:', error);
    }
}

// Función para cambiar a la pestaña de productos
function switchToProductsTab() {
    const productsTab = document.querySelector('.admin-tab[data-tab="products"]');
    if (productsTab) {
        productsTab.click();
        
        // También enfocar la búsqueda de stock bajo si existe
        setTimeout(() => {
            const searchInput = document.getElementById('stock-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.value = 'stock:bajo';
                searchStockProducts();
            }
        }, 500);
    }
}

// ==============================================
// FUNCIÓN PARA IMPRIMIR FACTURA COMPACTA - 1 HOJA
// ==============================================

function printInvoice() {
    console.log('🖨️ Preparando factura compacta para imprimir...');

    // Obtener el contenido del modal
    const invoiceModal = document.getElementById('invoice-modal');
    if (!invoiceModal) {
        showNotification('No se encontró la factura para imprimir', 'error');
        return;
    }

    const invoiceContent = invoiceModal.querySelector('.modal-content').cloneNode(true);
    if (!invoiceContent) {
        showNotification('Error al obtener contenido de la factura', 'error');
        return;
    }

    // Eliminar botones del print
    const footer = invoiceContent.querySelector('.modal-footer');
    if (footer) footer.remove();

    // Ocultar elementos que no deben imprimirse
    const closeButton = invoiceContent.querySelector('.close-modal');
    if (closeButton) closeButton.style.display = 'none';

    // Agregar estilos específicos para impresión COMPACTA
    const printStyles = document.createElement('style');
    printStyles.textContent = `
        @media print {
            @page {
                size: A4 portrait;
                margin: 5mm 10mm !important;
            }
            
            body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                font-size: 9px !important;
                font-family: 'Arial', sans-serif !important;
                line-height: 1.2 !important;
            }
            
            * {
                box-sizing: border-box !important;
            }
            
            .modal-content {
                width: 100% !important;
                max-width: 190mm !important;
                min-height: auto !important;
                max-height: 277mm !important;
                margin: 0 auto !important;
                padding: 5mm 10mm !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                overflow: hidden !important;
            }
            
            .modal-header, 
            .modal-body, 
            .modal-footer {
                padding: 3mm !important;
                margin: 0 !important;
            }
            
            .modal-header {
                padding-bottom: 2mm !important;
                border-bottom: 1px solid #ddd !important;
                margin-bottom: 3mm !important;
            }
            
            .modal-footer,
            .no-print,
            .close-modal,
            .btn {
                display: none !important;
            }
            
            /* TABLA COMPACTA */
            table {
                width: 100% !important;
                border-collapse: collapse !important;
                font-size: 8px !important;
                page-break-inside: avoid !important;
                margin: 2mm 0 !important;
            }
            
            .invoice-table {
                margin-bottom: 3mm !important;
            }
            
            .invoice-table th,
            .invoice-table td {
                padding: 1.5mm 2mm !important;
                border: 0.5px solid #ccc !important;
                word-wrap: break-word !important;
                max-width: 40mm !important;
            }
            
            .invoice-table th {
                background: #f5f5f5 !important;
                font-weight: bold !important;
                font-size: 8px !important;
                white-space: nowrap !important;
                text-align: center !important;
            }
            
            .invoice-table td {
                font-size: 8px !important;
                vertical-align: top !important;
            }
            
            /* REDUCIR ESPACIOS */
            h2, h3, h4 {
                margin: 1mm 0 !important;
                padding: 0 !important;
                font-size: 10px !important;
                page-break-after: avoid !important;
            }
            
            h2 {
                font-size: 12px !important;
            }
            
            h3 {
                font-size: 10px !important;
            }
            
            h4 {
                font-size: 9px !important;
            }
            
            p {
                margin: 0.5mm 0 !important;
                font-size: 8px !important;
            }
            
            .row {
                display: flex !important;
                flex-wrap: wrap !important;
                margin: 0 -1mm !important;
            }
            
            .col-md-6 {
                flex: 0 0 50% !important;
                max-width: 50% !important;
                padding: 0 1mm !important;
            }
            
            /* INFORMACIÓN COMPACTA */
            .company-info,
            .customer-info {
                font-size: 8px !important;
                line-height: 1.2 !important;
                margin-bottom: 2mm !important;
            }
            
            .company-info p,
            .customer-info p {
                margin: 0.3mm 0 !important;
            }
            
            /* LOGO PEQUEÑO */
            .header-logo {
                display: flex !important;
                align-items: center !important;
                gap: 2mm !important;
                margin-bottom: 2mm !important;
            }
            
            .header-logo i {
                font-size: 12px !important;
                color: #3b82f6 !important;
            }
            
            .invoice-header-info {
                text-align: right !important;
                font-size: 8px !important;
            }
            
            /* TOTALES COMPACTOS */
            .total-row {
                font-weight: bold !important;
                background-color: #f0f0f0 !important;
                font-size: 9px !important;
            }
            
            .text-right {
                text-align: right !important;
            }
            
            .text-center {
                text-align: center !important;
            }
            
            /* OCULTAR ELEMENTOS NO ESENCIALES */
            .invoice-notes div,
            .iva-info,
            .info-grid,
            .status-badge {
                display: none !important;
            }
            
            /* MOSTRAR SOLO LO ESENCIAL */
            .print-only {
                display: block !important;
                font-size: 7px !important;
                color: #666 !important;
                text-align: center !important;
                margin-top: 2mm !important;
                padding-top: 1mm !important;
                border-top: 0.5px dashed #ccc !important;
            }
            
            /* FORZAR TAMAÑOS MÁXIMOS */
            .product-name {
                max-width: 50mm !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }
            
            .product-description {
                display: none !important;
            }
            
            /* AJUSTAR ESPACIOS DE TOTALES */
            #invoice-items tr:last-child {
                border-top: 2px solid #000 !important;
            }
            
            /* REDUCIR PADDING EN CELDAS DE PRODUCTOS */
            #invoice-items td {
                padding-top: 1mm !important;
                padding-bottom: 1mm !important;
            }
        }
        
        /* ESTILOS PARA PREVISUALIZACIÓN */
        .print-preview {
            transform: scale(0.8);
            transform-origin: top left;
        }
    `;

    // Agregar fecha de impresión y leyenda
    const printDate = document.createElement('div');
    printDate.className = 'print-only';
    printDate.innerHTML = `<em>Factura impresa el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - Documento no válido como factura fiscal</em>`;

    const body = invoiceContent.querySelector('.modal-body');
    if (body) {
        body.appendChild(printDate);
    }

    // Crear ventana para imprimir
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=0.8">
            <title>Factura ${document.getElementById('invoice-number')?.textContent || 'Sin número'} - Herrajería</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body {
                    background: #f5f5f5;
                    padding: 10px;
                    font-family: Arial, sans-serif;
                }
                .print-container {
                    background: white;
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 15mm;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    transform: scale(0.95);
                    transform-origin: top center;
                }
            </style>
        </head>
        <body onload="window.print(); setTimeout(() => window.close(), 1000);">
            <div class="print-container">
                ${invoiceContent.outerHTML}
                ${printStyles.outerHTML}
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Forzar escala para mejor ajuste
    setTimeout(() => {
        printWindow.document.body.classList.add('print-preview');
    }, 100);
}

async function downloadInvoiceAsPDF() {
    try {
        showNotification('Generando PDF compacto...', 'info');

        // Cargar la librería html2pdf.js si no está disponible
        if (typeof html2pdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
        }

        const element = document.getElementById('invoice-modal').querySelector('.modal-content');
        const invoiceNumber = document.getElementById('invoice-number').textContent;

        // Clonar y preparar el contenido para PDF COMPACTO
        const pdfElement = element.cloneNode(true);

        // Remover botones y elementos no necesarios en PDF
        const footer = pdfElement.querySelector('.modal-footer');
        if (footer) footer.remove();

        const closeButton = pdfElement.querySelector('.close-modal');
        if (closeButton) closeButton.remove();

        // Agregar estilos de compactación para PDF
        const compactStyles = document.createElement('style');
        compactStyles.textContent = `
            /* ESTILOS PARA PDF COMPACTO */
            body {
                font-size: 9px !important;
                line-height: 1.2 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .modal-content {
                padding: 5mm 10mm !important;
                max-width: 190mm !important;
            }
            
            h2 { font-size: 12px !important; margin: 2mm 0 !important; }
            h3 { font-size: 10px !important; margin: 1mm 0 !important; }
            h4 { font-size: 9px !important; margin: 1mm 0 !important; }
            
            table {
                font-size: 8px !important;
                border-collapse: collapse !important;
            }
            
            th, td {
                padding: 1mm 1.5mm !important;
                border: 0.3mm solid #ddd !important;
                word-wrap: break-word !important;
                max-width: 35mm !important;
            }
            
            .invoice-table th {
                background: #f8f8f8 !important;
                font-weight: bold !important;
            }
            
            .row {
                margin-bottom: 2mm !important;
            }
            
            .company-info,
            .customer-info {
                font-size: 8px !important;
                line-height: 1.3 !important;
            }
            
            .invoice-notes {
                font-size: 7px !important;
                margin-top: 3mm !important;
                padding-top: 2mm !important;
                border-top: 0.5mm solid #eee !important;
            }
            
            /* OCULTAR ELEMENTOS NO CRÍTICOS */
            .btn, .no-pdf {
                display: none !important;
            }
            
            /* COMPACTAR PRODUCTOS */
            .product-description {
                display: none !important;
            }
            
            .product-name {
                max-width: 45mm !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            
            /* TOTALES MÁS COMPACTOS */
            .total-row {
                font-size: 9px !important;
                padding: 1.5mm !important;
            }
        `;

        pdfElement.appendChild(compactStyles);

        // Agregar fecha de generación
        const printDate = document.createElement('div');
        printDate.style.cssText = 'text-align: center; margin-top: 3mm; color: #666; font-size: 7px; border-top: 0.5mm dashed #ccc; padding-top: 1mm;';
        printDate.innerHTML = `<em>Generado el ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</em>`;

        const body = pdfElement.querySelector('.modal-body');
        if (body) {
            body.appendChild(printDate);
        }

        // Configuración óptima para PDF compacto
        const opt = {
            margin: [5, 5, 5, 5], // Márgenes mínimos
            filename: `Factura_${invoiceNumber}_Herrajeria.pdf`,
            image: {
                type: 'jpeg',
                quality: 0.8 // Calidad reducida para tamaño menor
            },
            html2canvas: {
                scale: 2, // Alta resolución para calidad
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800, // Ancho fijo
                windowHeight: 1123 // Aproximadamente A4 (297mm) en píxeles
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Evitar saltos de página
        };

        await html2pdf().set(opt).from(pdfElement).save();
        showNotification('PDF compacto descargado correctamente', 'success');

    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar PDF. Usa la opción de imprimir.', 'error');
        printInvoice(); // Fallback a impresión
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ==============================================
// FUNCIONES GLOBALES
// ==============================================

window.clearSearch = function () {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.value = '';
        adminFilteredProducts = [];
        renderAdminProducts();
    }
};

window.clearStockSearch = function () {
    const stockSearch = document.getElementById('stock-search');
    if (stockSearch) {
        stockSearch.value = '';
        adminFilteredProducts = [];
        renderStockTable();
    }
};

// Exportar funciones principales
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadAdminData = loadAdminData;
window.showProductModal = showProductModal;

// Agrega esto al final de tu archivo admin-init.js, justo antes del último console.log

// Configurar botones de eliminar
document.addEventListener('DOMContentLoaded', function () {
    // Esperar a que todo esté cargado
    setTimeout(function () {
        setupRemoveImageListeners();
        injectRemoveButtonStyles();
    }, 1000);
});

function setupRemoveImageListeners() {
    // Usar delegación de eventos para manejar clics en el contenedor de imágenes
    document.addEventListener('click', async function (e) {
        // Verificar si se hizo clic en un botón de eliminar
        if (e.target.classList.contains('remove-image') ||
            e.target.closest('.remove-image')) {

            e.preventDefault();
            e.stopPropagation();

            const removeBtn = e.target.classList.contains('remove-image')
                ? e.target
                : e.target.closest('.remove-image');

            const imageContainer = removeBtn.closest('.image-preview-item');
            if (imageContainer) {
                const imageName = imageContainer.querySelector('.image-name').textContent;

                const confirmed = await showConfirmation({
                    title: 'Eliminar Imagen',
                    message: `¿Estás seguro de que quieres eliminar la imagen "${imageName}"?`,
                    confirmText: 'Eliminar',
                    cancelText: 'Cancelar',
                    confirmColor: 'danger'
                });

                if (confirmed) {
                    imageContainer.remove();
                    updateUploadAreaFeedback();
                    updateImageOrderIndicators();
                    showNotification('Imagen eliminada', 'warning');
                }
            }
        }
    });
}

function injectRemoveButtonStyles() {
    const styles = `
    .image-preview-item .remove-image {
        cursor: pointer;
        background: #fee2e2;
        color: #dc2626;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border: 1px solid #fecaca;
    }
    
    .image-preview-item .remove-image:hover {
        background: #dc2626;
        color: white;
        transform: scale(1.1);
    }
    
    .image-preview-item .remove-image i {
        font-size: 12px;
    }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
console.log('✅ admin-init.js cargado correctamente');

// ==============================================
// HACER VARIABLES GLOBALES PARA price-adjustment.js
// ==============================================

// Hacer variables disponibles globalmente
window.adminProducts = adminProducts;
window.allCategories = allCategories;
window.allBrands = allBrands;
window.PLACEHOLDER_IMAGE = PLACEHOLDER_IMAGE;

// Función para recargar productos
window.reloadAdminProducts = async function () {
    try {
        console.log('🔄 Recargando productos...');
        adminProducts = await window.supabaseClient.getProducts();
        window.adminProducts = adminProducts; // Actualizar variable global
        updateAdminStats();
        renderAdminProducts();
        renderStockTable();
    } catch (error) {
        console.error('❌ Error recargando productos:', error);
        showNotification('Error al recargar productos', 'error');
    }
};

console.log('✅ Variables globales configuradas para price-adjustment.js');


// Al final de admin-init.js, antes del último console.log
function verifyAdminSetup() {
    console.log('🔍 Verificando configuración del administrador...');

    // Verificar que las funciones críticas existan
    const requiredFunctions = [
        'loadAdminData',
        'renderOrders',
        'fillInvoiceModal',
        'viewOrderDetail'
    ];

    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName}: DISPONIBLE`);
        } else {
            console.error(`❌ ${funcName}: NO DISPONIBLE`);
        }
    });

    // Verificar conexión a Supabase
    if (window.supabaseClient && window.supabaseClient.isReady()) {
        console.log('✅ Supabase: CONECTADO');
    } else {
        console.error('❌ Supabase: NO CONECTADO');
    }
}

// Ejecutar verificación después de cargar
setTimeout(verifyAdminSetup, 2000);

// ==============================================
// FUNCIONES DE DEPURACIÓN (OPCIONAL)
// ==============================================

function debugDOMStructure() {
    console.log('🔍 Depurando estructura DOM...');

    // Verificar elementos críticos
    const criticalElements = [
        'orders-list',
        'admin-products-list',
        'product-modal',
        'invoice-modal',
        'analytics-section'
    ];

    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}: ${element ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`);
    });

    // Verificar pestañas activas
    const activeTab = document.querySelector('.admin-tab.active');
    console.log('Pestaña activa:', activeTab?.dataset?.tab || 'Ninguna');

    // Verificar secciones activas
    const activeSection = document.querySelector('.admin-section.active');
    console.log('Sección activa:', activeSection?.id || 'Ninguna');
}

// Hacerla disponible globalmente si es necesario
window.debugDOMStructure = debugDOMStructure;

// EN admin-init.js - REEMPLAZAR la función viewOrderDetail al final del archivo

// Definir la función viewOrderDetail primero
async function viewOrderDetail(orderId) {
    try {
        console.log('🔍 Buscando orden:', orderId);

        // Buscar la orden en el array local
        let order = adminOrders.find(o => o.id === orderId);

        if (!order) {
            console.log('⚠️ Orden no encontrada localmente, buscando en Supabase...');
            // Intentar cargar la orden directamente desde Supabase
            order = await window.supabaseClient.getOrderById(orderId);

            if (!order) {
                showNotification('Orden no encontrada', 'error');
                return;
            }
        }

        console.log('✅ Orden encontrada:', order);

        // Llenar el modal con los datos de la orden
        fillInvoiceModal(order);

        // Mostrar el modal
        showModal('invoice-modal');

    } catch (error) {
        console.error('❌ Error cargando detalle de orden:', error);
        showNotification('Error al cargar la factura: ' + error.message, 'error');
    }
}



// También asegurar que fillInvoiceModal esté disponible si se necesita
window.fillInvoiceModal = fillInvoiceModal;
// Función para configurar estilos de impresión en A4 COMPACTO
function setupPrintStyles() {
    const printStyles = `
        <style id="print-styles">
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 5mm 10mm !important;
                }
                
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    font-size: 9px !important;
                    font-family: 'Arial', sans-serif !important;
                    line-height: 1.2 !important;
                }
                
                * {
                    box-sizing: border-box !important;
                    max-width: 100% !important;
                }
                
                #invoice-modal .modal-content {
                    position: static !important;
                    margin: 0 auto !important;
                    padding: 5mm 10mm !important;
                    box-shadow: none !important;
                    width: 190mm !important;
                    min-height: 277mm !important;
                    max-height: 277mm !important;
                    overflow: hidden !important;
                    border: none !important;
                    border-radius: 0 !important;
                }
                
                .modal-header, 
                .modal-body, 
                .modal-footer {
                    padding: 2mm !important;
                    margin: 0 !important;
                }
                
                .modal-header {
                    padding-bottom: 2mm !important;
                    border-bottom: 0.5mm solid #333 !important;
                    margin-bottom: 3mm !important;
                }
                
                .modal-footer {
                    display: none !important;
                }
                
                .close-modal,
                .no-print,
                .btn {
                    display: none !important;
                }
                
                .invoice-table {
                    width: 100% !important;
                    font-size: 8px !important;
                    border-collapse: collapse !important;
                    margin: 2mm 0 !important;
                }
                
                .invoice-table th,
                .invoice-table td {
                    padding: 1.5mm 2mm !important;
                    border: 0.3mm solid #ddd !important;
                    word-wrap: break-word !important;
                }
                
                .invoice-table th {
                    background: #f8f8f8 !important;
                    font-weight: bold !important;
                    font-size: 8px !important;
                }
                
                .card {
                    border: 0.3mm solid #ddd !important;
                    margin-bottom: 2mm !important;
                    padding: 2mm !important;
                    page-break-inside: avoid !important;
                }
                
                h3, h4 {
                    margin: 1mm 0 !important;
                    page-break-after: avoid !important;
                    font-size: 10px !important;
                }
                
                h3 {
                    font-size: 11px !important;
                }
                
                h4 {
                    font-size: 9px !important;
                }
                
                .row {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    margin: 0 -1mm !important;
                }
                
                .col-md-6 {
                    flex: 0 0 50% !important;
                    max-width: 50% !important;
                    padding: 0 1mm !important;
                }
                
                .info-grid {
                    display: grid !important;
                    grid-template-columns: repeat(auto-fit, minmax(40mm, 1fr)) !important;
                    gap: 1mm !important;
                    margin-bottom: 2mm !important;
                }
                
                .company-info,
                .customer-info {
                    font-size: 8px !important;
                    line-height: 1.2 !important;
                }
                
                .header-logo {
                    display: flex !important;
                    align-items: center !important;
                    gap: 2mm !important;
                    margin-bottom: 2mm !important;
                }
                
                .header-logo i {
                    font-size: 12px !important;
                    color: #3b82f6 !important;
                }
                
                .invoice-header-info {
                    text-align: right !important;
                    font-size: 8px !important;
                }
                
                @page {
                    size: A4;
                    margin: 5mm;
                }
                
                .print-only {
                    display: block !important;
                    font-size: 7px !important;
                    color: #666 !important;
                    text-align: center !important;
                    margin-top: 3mm !important;
                    padding-top: 1mm !important;
                    border-top: 0.3mm dashed #ccc !important;
                }
                
                /* OCULTAR DETALLES MENORES */
                .product-description,
                .iva-info,
                .info-item {
                    display: none !important;
                }
                
                /* FORZAR COMPACTACIÓN */
                #invoice-items td:nth-child(1) {
                    max-width: 50mm !important;
                }
                
                #invoice-items td:nth-child(2) {
                    max-width: 15mm !important;
                    text-align: center !important;
                }
                
                #invoice-items td:nth-child(3),
                #invoice-items td:nth-child(4) {
                    max-width: 25mm !important;
                    text-align: right !important;
                }
                
                /* TOTALES COMPACTOS */
                .total-row {
                    background: #f0f0f0 !important;
                    font-weight: bold !important;
                    font-size: 9px !important;
                }
            }
            
            .print-only {
                display: none;
            }
            
            /* ESTILOS PARA PREVISUALIZACIÓN EN PANTALLA */
            #invoice-modal .modal-content {
                font-size: 10px;
                line-height: 1.3;
            }
            
            .invoice-table {
                font-size: 9px;
            }
            
            .company-info,
            .customer-info {
                font-size: 9px;
            }
        </style>
    `;

    // Agregar estilos al documento
    document.head.insertAdjacentHTML('beforeend', printStyles);
}

// Al final del archivo, antes del último console.log
function addIVAIncludedStyles() {
    const styles = `
        .iva-included-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1d4ed8;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 5px;
            font-weight: 600;
        }
        
        .price-breakdown {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
        }
        
        .price-base {
            color: #059669;
        }
        
        .price-iva {
            color: #3b82f6;
        }
        
        .total-iva-included {
            background: linear-gradient(135deg, #dbeafe, #dcfce7);
            border-left: 4px solid #3b82f6;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// Agrega esto al final del archivo, antes del último console.log
function addCompactInvoiceStyles() {
    const styles = `
        /* ESTILOS COMPACTOS PARA FACTURA */
        .compact-invoice {
            font-size: 12px !important;
        }
        
        .compact-invoice .modal-content {
            padding: 15px !important;
        }
        
        .compact-invoice table {
            font-size: 11px !important;
        }
        
        .compact-invoice th,
        .compact-invoice td {
            padding: 8px 10px !important;
        }
        
        .compact-invoice .invoice-header {
            padding: 10px 0 !important;
            margin-bottom: 15px !important;
        }
        
        .compact-invoice .company-info,
        .compact-invoice .customer-info {
            font-size: 11px !important;
            line-height: 1.4 !important;
        }
        
        .compact-invoice h3 {
            font-size: 16px !important;
            margin: 10px 0 !important;
        }
        
        .compact-invoice .total-row {
            font-size: 14px !important;
            padding: 10px !important;
        }
        
        /* BOTONES MÁS PEQUEÑOS */
        .compact-invoice .btn {
            padding: 6px 12px !important;
            font-size: 12px !important;
        }
        
        /* OCULTAR DETALLES EXCESIVOS EN VISTA NORMAL */
        .compact-view .product-extra-info {
            display: none !important;
        }
        
        .compact-view .price-breakdown {
            font-size: 9px !important;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// Llamar a la función al cargar
document.addEventListener('DOMContentLoaded', addCompactInvoiceStyles);
// Llamar a la función al cargar
document.addEventListener('DOMContentLoaded', addIVAIncludedStyles);
// Llamar a la función al cargar
document.addEventListener('DOMContentLoaded', setupPrintStyles);
// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

// Productos y Carrito
let products = [];
let cart = [];
let currentProductDetail = null;
let currentStep = 1;
let bestSellingProducts = [];

// Filtros y Categorías
let currentCategory = null;
let activeSubcategoryFilters = [];
let priceRange = { min: 0, max: Infinity };

// Imágenes y Zoom
let currentProductImages = [];
let currentImageIndex = 0;
let isZooming = false;
let zoomLevel = 2;
let touchStartX = 0;
let touchEndX = 0;

// Zoom modernas
let zoomScale = 1;
let maxZoom = 3;
let minZoom = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;
let isZoomActive = false;
let touchStartDistance = 0;
let currentTouchScale = 1;

// Paginación
let currentPage = 1;
let productsPerPage = 8;
let currentProducts = [];
let totalPages = 1;


let currentOrdersPage = 1;
const ordersPerPage = 3;
let totalOrdersPages = 1;

// Usuario
let currentUser = null;
let userOrders = [];

// Datos de Subcategorías
const subcategoriesData = {
    "Todos los Productos": [
        "Ángulo", "Aldaba", "Alfombra", "Bandeja Extraíble", "Barral", "Barral L",
        "Base de Bocallave", "Bisagra", "Bocallave", "Burlete", "Canasto", "Cerrojo",
        "Cerradura", "Cierre", "Cilindro Euro", "Clavo", "Colgador", "Colgador de Cuadros",
        "Columna", "Corredera", "Cubeta", "Cubiertero", "Distanciador para Vidrio", "Enganche",
        "Espejo", "Esquinero", "Estante", "Falleba", "Gancho", "Grampa", "Hoja Adicional",
        "Imán", "Jabonera", "Juego de Placas", "Kit", "Kit Granero", "Kit para Vidrio",
        "Llavín para baño", "Manija", "Manija Barral", "Manija J", "Manijón", "Ménsula",
        "Mirilla", "Organizador", "Pasacable", "Pasador", "Pata", "Percha", "Perchero",
        "Perfil", "Perfil de Aplicar", "Pistón", "Placa", "Porta Escobilla", "Porta Residuos",
        "Porta Secador", "Portacandado", "Push Open", "Repisa", "Retén", "Riel", "Rueda",
        "Set Baño", "Soporte", "Tamiz", "Tapa", "Tarugo", "Tejido", "Tejido Mosquitero",
        "Tender", "Tirador", "Toallero", "Tope", "Tornillo", "Unión Zócalo", "Vértebra Pasacable", "Zócalo"
    ],
    "Linea Mueble": [
        "Manija Barral", "Imán", "Rueda", "Pata", "Cubeta", "Tirador", "Manija J",
        "Cerradura", "Barral L", "Bisagra", "Pistón", "Corredera",
        "Manija", "Tope", "Push Open", "Soporte", "Ménsula",
        "Percha"
    ],
    "Linea Aluminio": [
        "Tejido", "Tapa", "Zócalo", "Perfil", "Ángulo", "Bisagra", "Unión Zócalo", "Kit", "Hoja Adicional",
        "Tejido Mosquitero", "Tamiz", "Pasador", "Manijón", "Aldaba", "Cierre", "Enganche", "Manija",
        "Falleba"
    ],
    "Linea Baño": [
        "Barral", "Percha", "Espejo", "Porta Escobilla", "Bisagra", "Estante", "Toallero", "Jabonera", "Porta Secador",
        "Set Baño", "Perchero", "Esquinero", "Repisa", "Organizador"
    ],
    "Linea Puerta": [
        "Cierre", "Bisagra", "Mirilla", "Gancho", "Cilindro Euro", "Cerradura", "Retén", "Portacandado", "Pasador", "Manija", "Bocallave", "Base de Bocallave",
        "Llavín para baño", "Manijón", "Placa", "Juego de Placas", "Burlete"
    ],
    "Linea Cocina & Lavadero": [
        "Porta Residuos", "Cubiertero", "Tender", "Alfombra", "Bisagra", "Canasto", "Esquinero", "Bandeja Extraíble", "Columna"
    ],
    "Linea Vidrio": [
        "Vértebra Pasacable", "Pasacable", "Perfil de Aplicar", "Grampa", "Distanciador para Vidrio", "Kit para Vidrio",
        "Cerrojo", "Riel", "Soporte", "Bisagra"
    ],
    "Linea Portones": [
        "Kit Granero", "Rueda"
    ],
    "Herramientas": [
        "Grampa", "Colgador", "Tarugo", "Tornillo", "Clavo", "Retén", "Colgador de Cuadros"
    ]
};

// Instancias de Bootstrap
let modalInstances = {};

// En app.js, al inicio del archivo, AGREGAR:
async function getOrdersFromSupabase(email) {
    try {
        console.log(`📋 getOrdersFromSupabase llamado para: ${email}`);

        const SUPABASE_URL = 'https://opueqifkagoonpbubflj.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdWVxaWZrYWdvb25wYnViZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc3OTksImV4cCI6MjA3ODkyMzc5OX0.8ES1VbCKOu79JrMpPNTkUuDZmo9MOHsVZunui4CJYSI';

        // Verificar si supabase ya está disponible
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase SDK no disponible');
            return [];
        }

        // Crear cliente temporal
        const tempClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        const { data, error } = await tempClient
            .from('orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error en consulta:', error);
            return [];
        }

        console.log(`✅ ${data?.length || 0} pedidos obtenidos`);
        return data || [];

    } catch (error) {
        console.error('❌ Error en getOrdersFromSupabase:', error);
        return [];
    }
}


// ============================================
// FUNCIONES DE UTILIDAD GENERALES
// ============================================

function getDefaultImage(productName = 'Sin Imagen') {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, '#4A5568');
    gradient.addColorStop(1, '#2D3748');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 300, 200);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', 150, 80);

    const displayName = productName.length > 30 ?
        productName.substring(0, 27) + '...' : productName;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(displayName, 150, 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText('Imagen no disponible', 150, 140);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'italic 8px Arial, sans-serif';
    ctx.fillText('Herrajería', 150, 180);

    return canvas.toDataURL('image/png');
}
function showToast(type, message) {
    // Limitar mensajes muy largos en móviles
    let displayMessage = message;
    if (window.innerWidth <= 480 && message.length > 100) {
        displayMessage = message.substring(0, 97) + '...';
    }
    
    let toastId = type === 'success' ? 'successToast' : 'errorToast';
    let toast = document.getElementById(toastId);

    if (!toast) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('data-bs-delay', '3000');

        // Para móviles pequeños, agregar clase adicional
        if (window.innerWidth <= 425) {
            toast.classList.add('toast-mobile');
        }

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${displayMessage}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
    } else {
        const toastBody = toast.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = displayMessage;
        }
    }

    // Usar Bootstrap Toast si está disponible
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const bsToast = new bootstrap.Toast(toast, {
            delay: 3000,
            animation: true
        });
        bsToast.show();
    } else {
        // Fallback manual
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
}

function showModal(modalName) {
    try {
        if (modalInstances[modalName]) {
            modalInstances[modalName].show();
        } else {
            const modalElement = document.getElementById(modalName + 'Modal');
            if (modalElement && bootstrap && bootstrap.Modal) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    } catch (error) {
        console.error(`Error mostrando modal ${modalName}:`, error);
    }
}

function hideModal(modalName) {
    try {
        if (modalInstances[modalName]) {
            modalInstances[modalName].hide();
        }
    } catch (error) {
        console.error(`Error ocultando modal ${modalName}:`, error);
    }
}

function showErrorFallback() {
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="mb-3">Error de conexión</h4>
                <p class="text-muted mb-4">No se pudo conectar con el servidor. Mostrando datos de ejemplo.</p>
                <div class="d-flex justify-content-center gap-3">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo me-2"></i>Reintentar
                    </button>
                    <button class="btn btn-outline-primary" onclick="loadSampleProducts()">
                        <i class="fas fa-box me-2"></i>Usar datos de ejemplo
                    </button>
                </div>
            </div>
        `;
    }
}

// ============================================
// FUNCIONES DE USUARIO
// ============================================

function loadUserFromStorage() {
    try {
        const savedUser = localStorage.getItem('nombreSitioUser');
        const savedOrders = localStorage.getItem('nombreSitioOrders');

        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }

        if (savedOrders) {
            userOrders = JSON.parse(savedOrders);
        }
    } catch (error) {
        console.error('Error cargando usuario:', error);
        currentUser = null;
        userOrders = [];
    }
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('nombreSitioUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('nombreSitioUser');
    }

    localStorage.setItem('nombreSitioOrders', JSON.stringify(userOrders));
}

function updateUserUI() {
    const accountLink = document.getElementById('accountLink');
    if (!accountLink) return;

    if (currentUser) {
        accountLink.innerHTML = '<i class="fas fa-user me-1"></i>Mi Cuenta';
        accountLink.setAttribute('onclick', 'event.preventDefault(); showModal("profile");');
        accountLink.removeAttribute('data-bs-toggle');
        accountLink.removeAttribute('data-bs-target');
    } else {
        accountLink.innerHTML = '<i class="fas fa-user me-1"></i>Mi Cuenta';
        accountLink.setAttribute('onclick', 'event.preventDefault(); showModal("login");');
        accountLink.removeAttribute('data-bs-toggle');
        accountLink.removeAttribute('data-bs-target');
    }
}

function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('nombreSitioAllUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email, // ← ¡ESTO ES CRÍTICO!
            phone: user.phone || '',
            company: user.company || '',
            cuit: user.cuit || '',
            accountType: user.accountType || 'retail'
        };

        saveUserToStorage();
        updateUserUI();
        showToast('success', 'Inicio de sesión exitoso');
        hideModal('login');
        return true;
    } else {
        showToast('error', 'Credenciales incorrectas');
        return false;
    }
}

function handleRegister(userData) {
    const users = JSON.parse(localStorage.getItem('nombreSitioAllUsers') || '[]');

    if (users.some(u => u.email === userData.email)) {
        showToast('error', 'El email ya está registrado');
        return false;
    }

    const newUser = {
        id: 'user_' + Date.now(),
        ...userData,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('nombreSitioAllUsers', JSON.stringify(users));

    currentUser = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone || '',
        company: newUser.company || '',
        cuit: newUser.cuit || '',
        accountType: newUser.accountType
    };

    saveUserToStorage();
    updateUserUI();
    showToast('success', 'Registro exitoso');
    hideModal('register');
    return true;
}

function handleLogout() {
    // Mostrar el modal de confirmación
    showLogoutConfirm();
}

function showLogoutConfirm() {
    // Mostrar el modal de confirmación
    showModal('logoutConfirm');

    // Configurar el evento del botón de confirmación
    document.getElementById('confirmLogoutBtn').onclick = function () {
        performLogout();
    };
}

function performLogout() {
    // Ocultar el modal de confirmación
    hideModal('logoutConfirm');

    // Realizar el logout
    currentUser = null;
    localStorage.removeItem('nombreSitioUser');
    updateUserUI();

    hideModal('profile');
    hideModal('ordersHistory');

    setTimeout(() => {
        showToast('success', 'Sesión cerrada exitosamente');
        showModal('login');
    }, 300);
}

function saveOrderToHistory(orderData) {
    const now = new Date();
    const order = {
        id: 'ORD_' + Date.now(),
        date: now.toLocaleDateString('es-AR'),
        time: now.toLocaleTimeString('es-AR'),
        created_at: now.toISOString(), // ← ¡AGREGAR ESTO!
        customer: {
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            email: orderData.email,
            phone: orderData.phone,
            dni: orderData.dni
        },
        shipping: orderData.shipping,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items,
        total: orderData.total,
        status: 'Pendiente',
        notes: orderData.notes || ''
    };

    userOrders.unshift(order);
    saveUserToStorage();
    return order;
}

function getSafeOrderDate(order) {
    // Prioridad: created_at (ISO) -> date (string) -> fecha actual
    if (order.created_at) {
        return formatOrderDate(order.created_at);
    } else if (order.date) {
        return order.date;
    } else {
        return new Date().toLocaleDateString('es-AR');
    }
}
// Asegúrate de que esta función existe en tu app.js
function getOrderStatusBadge(status) {
    if (!status) status = 'pending';

    const statusMap = {
        'pending': { class: 'warning', text: 'Pendiente' },
        'processing': { class: 'info', text: 'Procesando' },
        'shipped': { class: 'primary', text: 'Enviado' },
        'delivered': { class: 'success', text: 'Entregado' },
        'cancelled': { class: 'danger', text: 'Cancelado' }
    };

    const statusInfo = statusMap[status.toLowerCase()] || statusMap.pending;

    return `<span class="badge bg-${statusInfo.class}">${statusInfo.text}</span>`;
}


function getPaymentMethodText(method) {
    const methods = {
        'mercado-pago': 'Mercado Pago',
        'transferencia': 'Transferencia bancaria',
        'tarjeta': 'Tarjeta de crédito/débito',
        'efectivo': 'Efectivo',
        'Acordar por WhatsApp': 'Acordar por WhatsApp',
        'Por WhatsApp': 'Acordar por WhatsApp'
    };

    return methods[method] || method || 'Por definir';
}
// ============================================
// FUNCIONES DE UTILIDAD - AÑADE ESTA FUNCIÓN
// ============================================

async function testSupabaseConnection() {
    try {
        if (!window.supabaseClient || !window.supabaseClient.testConnection) {
            console.error('❌ supabaseClient no está disponible');
            return false;
        }

        const result = await window.supabaseClient.testConnection();
        console.log('🔌 Test conexión:', result);
        return result.success;

    } catch (error) {
        console.error('❌ Error probando conexión:', error);
        return false;
    }
}

// ============================================
// INICIALIZACIÓN PRINCIPAL - CORREGIDA
// ============================================
// ============================================
// INICIALIZACIÓN PRINCIPAL - VERSIÓN CORREGIDA
// ============================================
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 DOM cargado - Iniciando aplicación...');

    try {
        // 1. Cargar usuario primero (no depende de Supabase)
        loadUserFromStorage();
        updateUserUI();
        initializeModals();

        // 2. Esperar a que Supabase esté listo
        console.log('⏳ Esperando inicialización de Supabase...');

        // Configurar un timeout para no bloquear la aplicación
        let supabaseReady = false;

        // Verificar si ya está listo
        if (window.supabaseClient && window.supabaseClient.isReady) {
            supabaseReady = true;
        } else {
            // Esperar máximo 5 segundos
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.warn('⏰ Timeout esperando Supabase, continuando sin conexión');
                    resolve();
                }, 5000);

                window.addEventListener('supabaseReady', () => {
                    clearTimeout(timeout);
                    supabaseReady = true;
                    resolve();
                }, { once: true });
            });
        }

        // 3. Probar conexión si Supabase está disponible
        let connected = false;
        if (supabaseReady && window.supabaseClient && window.supabaseClient.testConnection) {
            try {
                const result = await window.supabaseClient.testConnection();
                connected = result.success;
                console.log('🔌 Test conexión:', result);
            } catch (error) {
                console.error('❌ Error probando conexión:', error);
            }
        }

        if (!connected) {
            console.warn('⚠️ Sin conexión a Supabase, usando modo local');
            showToast('warning', 'Modo local activado - Algunas funciones pueden estar limitadas');
        }

        // 4. Cargar datos iniciales
        await loadInitialData();

        // 5. Configurar UI
        setupEventListeners();
        updateCartCount();
        updateCartBadge();
        initHeroCarousel();

        console.log('✅ Aplicación inicializada correctamente');

    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        showErrorFallback();
    }
});

// ELIMINAR EL SEGUNDO eventListener duplicado (líneas 452-507)
// Solo debe haber UN document.addEventListener('DOMContentLoaded')



// AGREGAR ESTA FUNCIÓN DE ESPERA:
function waitForSupabase() {
    return new Promise((resolve, reject) => {
        const maxAttempts = 30;
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            // Verificar si supabaseClient existe y tiene las funciones críticas
            if (window.supabaseClient &&
                typeof window.supabaseClient.createOrder === 'function' &&
                typeof window.supabaseClient.getProducts === 'function') {
                clearInterval(checkInterval);
                console.log('✅ Supabase listo después de', attempts, 'intentos');
                resolve();
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('❌ Timeout: Supabase no se inicializó');
                reject(new Error('Timeout esperando a Supabase'));
            }
        }, 200);
    });
}
function ensureBestSellingVisible() {
    // Solo mostrar si hay productos más vendidos
    if (bestSellingProducts && bestSellingProducts.length > 0) {
        const bestSellingSection = document.getElementById('best-selling-section');
        if (bestSellingSection) {
            // Solo mostrar si estamos en la página de inicio o catálogo general
            const productsSection = document.getElementById('products-section');
            if (!productsSection || productsSection.style.display === 'none') {
                bestSellingSection.style.display = 'block';
            }
        }
    }
}
// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================
function loadInitialData() {
    console.log('📦 Cargando datos iniciales...');
    loadProductsFromSupabase().then(() => {
        loadCartFromStorage();
        ensureBestSellingVisible(); // Añadir esta línea
    });
}
function initializeModals() {
    console.log('🔧 Inicializando modales...');

    const modals = [
        { id: 'productDetailModal', key: 'productDetail' },
        { id: 'loginModal', key: 'login' },
        { id: 'registerModal', key: 'register' },
        { id: 'checkoutModal', key: 'checkout' },
        { id: 'profileModal', key: 'profile' },
        { id: 'ordersHistoryModal', key: 'ordersHistory' },
        { id: 'changePasswordModal', key: 'changePassword' },
        { id: 'logoutConfirmModal', key: 'logoutConfirm' }
    ];

    modals.forEach(modal => {
        const element = document.getElementById(modal.id);
        if (element && bootstrap && bootstrap.Modal) {
            modalInstances[modal.key] = new bootstrap.Modal(element, {
                backdrop: 'static',
                keyboard: true
            });

            // Configurar eventos específicos para cada modal
            element.addEventListener('hidden.bs.modal', function () {
                if (modal.key === 'productDetail') {
                    closeFullscreenZoom();
                    resetImageZoom();
                }
                if (modal.key === 'checkout') {
                    resetCheckoutForm();
                }
            });

            // En app.js, en initializeModals(), modificar el evento del modal ordersHistory:
            if (modal.key === 'ordersHistory') {
                element.addEventListener('shown.bs.modal', function () {
                    console.log('📋 Modal de historial abierto, cargando pedidos...');

                    // Verificar si hay usuario logueado
                    if (!currentUser) {
                        console.log('⚠️ No hay usuario logueado');
                        const ordersLoginMessage = document.getElementById('ordersLoginMessage');
                        const ordersHistoryContent = document.getElementById('ordersHistoryContent');

                        if (ordersLoginMessage) ordersLoginMessage.style.display = 'block';
                        if (ordersHistoryContent) ordersHistoryContent.style.display = 'none';
                        return;
                    }
                    // Solo cargar pedidos, no cambiar la visualización
                    loadOrdersFromSupabase();
                });

                // IMPORTANTE: Resetear al cerrar el modal
                element.addEventListener('hidden.bs.modal', function () {
                    // Restablecer la página a 1
                    currentOrdersPage = 1;
                });
            }

            // Configurar evento especial para profile
            if (modal.key === 'profile') {
                element.addEventListener('shown.bs.modal', function () {
                    console.log('👤 Modal de perfil abierto, cargando datos...');
                    setTimeout(() => {
                        loadProfileData();
                    }, 300);
                });
            }
        }
    });

    console.log(`✅ ${Object.keys(modalInstances).length} modales inicializados`);
}
// ============================================
// FUNCIONES DE PRODUCTOS
// ============================================

async function loadProductsFromSupabase() {
    try {
        console.log('🔄 Cargando productos desde Supabase...');

        if (!window.supabaseClient) {
            throw new Error('Cliente Supabase no disponible');
        }

        let productsData;

        if (typeof window.supabaseClient.getProducts === 'function') {
            productsData = await window.supabaseClient.getProducts();
        } else if (window.supabaseClient.supabase) {
            const { data, error } = await window.supabaseClient.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            productsData = data;
        } else {
            throw new Error('No hay método disponible para obtener productos');
        }

        if (!productsData || productsData.length === 0) {
            console.log('ℹ️ No hay productos en la base de datos');
            products = [];
            return;
        }

        console.log(`✅ ${productsData.length} productos recibidos`);

        products = productsData.map(product => processProductData(product)).filter(Boolean);

        loadPopularProducts();
        updateCartCount();

    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showToast('error', 'Error al cargar productos: ' + error.message);
    }
}

function processProductData(product) {
    try {
        const productImages = processProductImages(product);

        return {
            id: product.id,
            name: product.name || 'Producto sin nombre',
            price: product.retail_price || 0,
            wholesalePrice: product.wholesale_price || (product.retail_price * 0.85),
            wholesaleLimit: product.wholesale_limit || 10,
            image: productImages.length > 0 ? productImages[0] : getDefaultImage(product.name),
            images: productImages,
            category: product.categories?.name || 'Sin categoría',
            description: product.description || 'Descripción no disponible',
            specifications: product.specifications || {},
            technical_details: product.technical_details || '',
            colors: product.colors || [],
            discount: 0,
            stock: product.stock || 0,
            min_stock: product.min_stock || 0,
            tags: product.colors || [],
            isNew: isProductNew(product.created_at),
            sku: product.sku || '',
            brand: product.brands?.name || '',
            click_count: product.click_count || 0,
            sold_count: product.sold_count || 0
        };
    } catch (error) {
        console.error('Error procesando producto:', error);
        return null;
    }
}

function processProductImages(product) {
    let imagesArray = [];

    if (product.images) {
        if (Array.isArray(product.images)) {
            imagesArray = product.images.filter(img => img && typeof img === 'string');
        } else if (typeof product.images === 'string') {
            try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed)) {
                    imagesArray = parsed.filter(img => img && typeof img === 'string');
                } else if (parsed && typeof parsed === 'string') {
                    imagesArray = [parsed];
                }
            } catch (e) {
                imagesArray = [product.images];
            }
        }
    }

    if (imagesArray.length === 0 && product.main_image && typeof product.main_image === 'string') {
        imagesArray = [product.main_image];
    }

    return imagesArray.map(img => {
        if (!img || img === 'null' || img === 'undefined') {
            return getDefaultImage(product.name);
        }

        if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
        }

        if (img.includes('.') && !img.includes('/')) {
            return `https://opueqifkagoonpbubflj.supabase.co/storage/v1/object/public/product-images/${encodeURIComponent(img)}`;
        }

        return img;
    }).filter(img => img !== null);
}

function isProductNew(createdAt) {
    if (!createdAt) return false;
    try {
        const createdDate = new Date(createdAt);
        const diffTime = Math.abs(new Date() - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    } catch (error) {
        return false;
    }
}

function loadPopularProducts() {
    if (products.length === 0) {
        console.log('📦 No hay productos para mostrar como populares');
        return;
    }

    bestSellingProducts = [...products]
        .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
        .slice(0, 4);

    if (bestSellingProducts.length > 0) {
        displayPopularProducts(bestSellingProducts, 'best-selling-container');
        const bestSellingSection = document.getElementById('best-selling-section');
        if (bestSellingSection) bestSellingSection.style.display = 'block';
    }
}

function displayPopularProducts(productsToDisplay, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    productsToDisplay.forEach(product => {
        const discountBadge = product.discount > 0 ?
            `<span class="product-badge">-${product.discount}%</span>` : '';

        const newBadge = product.isNew ?
            `<span class="product-badge" style="background: var(--secondary);">Nuevo</span>` : '';

        const outOfStockBadge = product.stock <= 0 ?
            `<span class="product-badge" style="background: var(--accent);">Sin Stock</span>` : '';

        const isOutOfStock = product.stock <= 0;

        const productCard = `
            <div class="col-md-4 col-lg-2 mb-4">
                <div class="card product-card ${isOutOfStock ? 'opacity-75' : ''}">
                    <div class="position-relative">
                        <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" 
                             onerror="this.src='${getDefaultImage(product.name)}'; this.onerror=null;"
                             onclick="${!isOutOfStock ? `showProductDetail('${product.id}')` : ''}" 
                             style="${isOutOfStock ? 'cursor: not-allowed;' : 'cursor: pointer;'}">
                        ${discountBadge}
                        ${newBadge}
                        ${outOfStockBadge}
                    </div>
                    <div class="card-body">
                        <h5 class="product-title" onclick="${!isOutOfStock ? `showProductDetail('${product.id}')` : ''}" 
                            style="${isOutOfStock ? 'cursor: not-allowed; color: #6c757d;' : 'cursor: pointer;'}">
                            ${product.name}
                        </h5>
                        <p class="product-category">${product.category}</p>
                        <div class="price-container">
                            <div class="price">$${(product.price || 0).toLocaleString('es-AR')}</div>
                        </div>
                        ${!isOutOfStock ? `
                        <div class="d-flex gap-2 mt-3">
                            <button type="button" class="btn btn-primary flex-grow-1" onclick="addToCart('${product.id}')">
                                <i class="fas fa-cart-plus me-1"></i> Agregar
                            </button>
                          
                        </div>
                        ` : `
                        <div class="mt-3">
                            <button class="btn btn-secondary w-100" disabled>
                                <i class="fas fa-times-circle me-1"></i> Sin Stock
                            </button>
                        </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

// ============================================
// FUNCIONES DE UI - PRODUCTOS
// ============================================

function displayProducts(productsToDisplay = products, title = "Productos") {
    const section = document.getElementById('products-section');
    const sectionTitle = document.getElementById('products-section-title');
    const showAllBtn = document.getElementById('show-all-btn');

    if (!section) return;

    currentProducts = productsToDisplay;
    currentPage = 1;

    section.style.display = 'block';
    if (sectionTitle) sectionTitle.textContent = title;

    if (showAllBtn) {
        showAllBtn.style.display = productsToDisplay.length !== products.length ? 'block' : 'none';
    }

    renderCurrentPage();
    scrollToProductsSection();
    
    // NO ocultar la sección de productos más vendidos - ELIMINAR ESTAS LÍNEAS:
    // const mostClickedSection = document.getElementById('most-clicked-section');
    // const bestSellingSection = document.getElementById('best-selling-section');
    // if (mostClickedSection) mostClickedSection.style.display = 'none';
    // if (bestSellingSection) bestSellingSection.style.display = 'none';
}

function displayProductsPage(productsToDisplay) {
    let container = document.getElementById('filtered-products-container');

    if (!container) {
        container = document.getElementById('products-container');
    }

    if (!container) return;

    container.innerHTML = '';

    if (!productsToDisplay || productsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No se encontraron productos</h4>
                <p class="text-muted">Intenta con otros filtros o categoría</p>
            </div>
        `;
        return;
    }

    productsToDisplay.forEach(product => {
        const discountBadge = product.discount > 0 ?
            `<span class="product-badge">-${product.discount}%</span>` : '';

        const newBadge = product.isNew ?
            `<span class="product-badge" style="background: var(--secondary);">Nuevo</span>` : '';

        const outOfStockBadge = product.stock <= 0 ?
            `<span class="product-badge" style="background: var(--accent);">Sin Stock</span>` : '';

        const lowStockBadge = product.stock > 0 && product.stock <= (product.min_stock || 5) ?
            `<span class="product-badge" style="background: #ffc107; color: #000;">Últimas unidades</span>` : '';

        const isOutOfStock = product.stock <= 0;

        const productCard = `
            <div class="product-card-wrapper">
                <div class="card product-card ${isOutOfStock ? 'opacity-75' : ''} h-100">
                    <div class="position-relative">
                        <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" 
                             onerror="this.src='${getDefaultImage(product.name)}'; this.onerror=null;"
                             onclick="${!isOutOfStock ? `showProductDetail('${product.id}')` : ''}" 
                             style="${isOutOfStock ? 'cursor: not-allowed;' : 'cursor: pointer;'}">
                        ${discountBadge}
                        ${newBadge}
                        ${outOfStockBadge}
                        ${lowStockBadge}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="product-title" onclick="${!isOutOfStock ? `showProductDetail('${product.id}')` : ''}" 
                            style="${isOutOfStock ? 'cursor: not-allowed; color: #6c757d;' : 'cursor: pointer;'}">
                            ${product.name}
                        </h5>
                        <p class="product-category small text-muted">${product.category}</p>
                        ${product.brand ? `<p class="product-brand small text-muted mb-2">Marca: ${product.brand}</p>` : ''}
                        
                        <div class="price-container mt-auto">
                            <div class="price" id="price-${product.id}">$${(product.price || 0).toLocaleString('es-AR')}</div>
                            <div class="wholesale-info" id="wholesale-info-${product.id}" style="display: none;">
                                <div class="wholesale-price">$${(product.wholesalePrice || 0).toLocaleString('es-AR')}</div>
                                <div class="wholesale-limit small text-muted">(Mín. ${product.wholesaleLimit} unid.)</div>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm mt-1" onclick="toggleWholesalePrice('${product.id}')" id="wholesale-btn-${product.id}">
                                <i class="fas fa-eye me-1"></i> Ver mayorista
                            </button>
                        </div>
                        
                        ${!isOutOfStock ? `
                        <div class="quantity-controls mt-2">
                            <button type="button" class="quantity-btn" onclick="decrementQuantity('${product.id}')">-</button>
                            <input type="text" class="quantity-input" id="quantity-${product.id}" value="1" readonly>
                            <button type="button" class="quantity-btn" onclick="incrementQuantity('${product.id}')">+</button>
                        </div>
                        <div class="d-flex gap-2 mt-3">
                            <button type="button" class="btn btn-primary flex-grow-1" onclick="addToCart('${product.id}')">
                                <i class="fas fa-cart-plus me-1"></i> Agregar
                            </button>
                            <button type="button" class="btn btn-outline-primary" onclick="showProductDetail('${product.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        ` : `
                        <div class="mt-3">
                            <button class="btn btn-secondary w-100" disabled>
                                <i class="fas fa-times-circle me-1"></i> Sin Stock
                            </button>
                        </div>
                        `}
                        
                        ${product.stock > 0 && product.stock <= 10 ? `
                            <div class="mt-2 text-warning small">
                                <i class="fas fa-exclamation-triangle"></i> Solo ${product.stock} disponibles
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

// ============================================
// FUNCIONES DE BÚSQUEDA Y CATEGORÍAS
// ============================================
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (searchTerm === '') {
        showToast('info', 'Ingresa un término de búsqueda');
        return;
    }

    if (products.length === 0) {
        showToast('error', 'Los productos aún se están cargando. Por favor, espera un momento.');
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm)) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );

    if (filteredProducts.length === 0) {
        // Usar el mismo layout que el catálogo
        displayFilteredProductsWithFilters([], `Búsqueda: "${searchTerm}"`);
        showToast('error', `No se encontraron productos para "${searchTerm}"`);
    } else {
        // Mostrar con el layout de filtros pero sin filtros activos
        currentCategory = null;
        activeSubcategoryFilters = [];
        priceRange = { min: 0, max: Infinity };
        
        // Crear un layout similar al de categorías
        const section = document.getElementById('products-section');
        const sectionTitle = document.getElementById('products-section-title');
        const showAllBtn = document.getElementById('show-all-btn');
        
        if (section) section.style.display = 'block';
        if (sectionTitle) sectionTitle.textContent = `Resultados de búsqueda: "${searchTerm}" (${filteredProducts.length} productos)`;
        
        if (showAllBtn) {
            showAllBtn.style.display = 'block';
            showAllBtn.innerHTML = '<i class="fas fa-times me-2"></i>Limpiar búsqueda';
            showAllBtn.onclick = showAllProducts;
        }
        
        currentProducts = filteredProducts;
        currentPage = 1;
        
        // Renderizar directamente sin filtros
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="products-content" style="width: 100%;">
                    <div class="products-header">
                        <div class="d-flex align-items-center">
                            <span class="me-2 text-muted" id="products-count">Mostrando 0 productos</span>
                            <div class="form-group mb-0 ms-3">
                                <select class="form-select form-select-sm" id="products-per-page">
                                    <option value="8">8 por página</option>
                                    <option value="12">12 por página</option>
                                    <option value="16">16 por página</option>
                                    <option value="20">20 por página</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="products-grid" id="filtered-products-container"></div>
                    
                    <!-- Paginación -->
                    <div class="row mt-5">
                        <div class="col-12">
                            <nav aria-label="Paginación de productos">
                                <ul class="pagination justify-content-center" id="products-pagination"></ul>
                            </nav>
                        </div>
                    </div>
                </div>
            `;
            
            setupPagination();
            renderCurrentPage();
        }
        
        showToast('success', `Se encontraron ${filteredProducts.length} productos para "${searchTerm}"`);
        
        // Scroll a la sección
        scrollToProductsSection();
    }
}
// ============================================
// FUNCIÓN PARA RESETEAR PAGINACIÓN AL INICIO
// ============================================

function resetCatalogToHome() {
    // Ocultar secciones específicas
    const mostClickedSection = document.getElementById('most-clicked-section');
    const bestSellingSection = document.getElementById('best-selling-section');
    
    if (mostClickedSection) mostClickedSection.style.display = 'none';
    if (bestSellingSection) bestSellingSection.style.display = 'block';
    
    // Mostrar productos destacados
    loadPopularProducts();
    
    // Resetear filtros
    currentCategory = null;
    activeSubcategoryFilters = [];
    priceRange = { min: 0, max: Infinity };
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (mobileSearchInput) mobileSearchInput.value = '';
    
    // Ocultar sección de productos filtrados
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.style.display = 'none';
    }
    
    // Scroll al principio de la página
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Mostrar mensaje
    showToast('info', 'Volviendo al inicio del catálogo');
}
// ============================================
// FUNCIÓN PARA IR AL INICIO DEL CATÁLOGO
// ============================================
function goToCatalogHome() {
    console.log('🏠 Navegando al inicio del catálogo...');
    
    // Ocultar sección de productos filtrados
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.style.display = 'none';
    }
    
    // Mostrar productos más vendidos
    const bestSellingSection = document.getElementById('best-selling-section');
    if (bestSellingSection) {
        bestSellingSection.style.display = 'block';
    }
    
    // Resetear filtros
    currentCategory = null;
    activeSubcategoryFilters = [];
    priceRange = { min: 0, max: Infinity };
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    // Scroll al principio de la página
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    showToast('info', 'Volviendo al inicio del catálogo');
}
function filterByCategory(categoryName) {
    console.log(`Filtrando por categoría: ${categoryName}`);

    if (products.length === 0) {
        showToast('error', 'Los productos aún se están cargando. Por favor, espera un momento.');
        return;
    }

    currentCategory = categoryName;
    activeSubcategoryFilters = [];

    let filteredProducts;
    if (categoryName === 'Todos los Productos') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product =>
            product.category.toLowerCase().includes(categoryName.toLowerCase()) ||
            (product.name && product.name.toLowerCase().includes(categoryName.toLowerCase()))
        );
    }

    displayFilteredProductsWithFilters(filteredProducts, categoryName);
    
    // Desplazarse a la sección de productos
    setTimeout(() => {
        scrollToProductsSection();
    }, 300);
}

function displayFilteredProductsWithFilters(filteredProducts, categoryName) {
    if (!filteredProducts || filteredProducts.length === 0) {
        displayProducts([], `No hay productos en ${categoryName}`);
        showToast('error', `No se encontraron productos en ${categoryName}`);
        return;
    }

    const section = document.getElementById('products-section');
    const sectionTitle = document.getElementById('products-section-title');

    if (section) section.style.display = 'block';
    if (sectionTitle) sectionTitle.textContent = `${categoryName} `;

    currentProducts = filteredProducts;
    currentPage = 1;

    renderSubcategoryFilters(categoryName);
    renderCurrentPage();
    scrollToProductsSection();
}

function renderSubcategoryFilters(categoryName) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    const subcategories = subcategoriesData[categoryName] || [];

    if (subcategories.length === 0) {
        productsContainer.innerHTML = '<div id="filtered-products-container"></div>';
        return;
    }

    let layoutHTML = `
    <div class="products-with-filters">
        <!-- Botón de filtro para móviles -->
        <div class="row d-md-none mb-3">
            <div class="col-12">
                <button class="btn btn-primary w-100" id="mobile-filter-toggle">
                    <i class="fas fa-filter me-2"></i> Filtros
                    <span class="filter-badge ms-2" id="filter-badge-count" style="display: none">0</span>
                </button>
            </div>
        </div>

        <!-- Contenedor de filtros - Oculto en móviles por defecto -->
        <div class="subcategories-filters desktop-filters d-md-block" id="mobile-filters-container">
            <div class="filter-header">
                <h3 class="filter-title">Filtrar por Subcategorías</h3>
                <button class="btn-close d-md-none" id="close-filters">X</button>
            </div>
            <div class="filter-groups">
`;

    const sortedSubcategories = [...subcategories].sort();

    sortedSubcategories.forEach(subcategory => {
        const isChecked = activeSubcategoryFilters.includes(subcategory);
        layoutHTML += `
            <div class="filter-option">
                <input type="checkbox" id="filter-${subcategory.replace(/\s+/g, '-')}" 
                       ${isChecked ? 'checked' : ''} 
                       onchange="toggleSubcategoryFilter('${subcategory}')">
                <label for="filter-${subcategory.replace(/\s+/g, '-')}">${subcategory}</label>
            </div>
        `;
    });

    layoutHTML += `
                </div>
                
                <!-- FILTRO DE PRECIO -->
                <div class="filter-group">
                    <div class="filter-group-title">Filtrar por Precio</div>
                    <div class="price-filter">
                        <div class="price-inputs">
                            <input type="number" id="price-min" placeholder="Mínimo" class="form-control" min="0">
                            <span>a</span>
                            <input type="number" id="price-max" placeholder="Máximo" class="form-control" min="0">
                        </div>
                        <button class="btn btn-primary btn-sm mt-2" onclick="applyPriceFilter()">Aplicar</button>
                        <button class="clear-filters" onclick="clearAllFilters()">
                            <i class="fas fa-times"></i> Limpiar
                        </button>
                    </div>
                </div>
                
                <div class="active-filters" id="active-filters-container"></div>
            </div>
            
            <!-- Columna de Productos -->
            <div class="products-content" style="width: 100%;">
                <div class="products-header">
                    <div class="d-flex align-items-center">
                        <span class="me-2 text-muted" id="products-count">Mostrando 0 productos</span>
                        <div class="form-group mb-0 ms-3">
                            <select class="form-select form-select-sm" id="products-per-page">
                                <option value="8">8 por página</option>
                                <option value="12">12 por página</option>
                                <option value="16">16 por página</option>
                                <option value="20">20 por página</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="products-grid" id="filtered-products-container"></div>
                
                <!-- Paginación -->
                <div class="row mt-5">
                    <div class="col-12">
                        <nav aria-label="Paginación de productos">
                            <ul class="pagination justify-content-center" id="products-pagination"></ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    `;

    productsContainer.innerHTML = layoutHTML;

    setupPagination();
    updateActiveFiltersDisplay();
    applySubcategoryFilters();

    // Configurar filtros móviles
    setTimeout(() => {
        setupMobileFilters();
        updateFilterBadgeCount();
    }, 100);
}

function toggleSubcategoryFilter(subcategory) {
    const index = activeSubcategoryFilters.indexOf(subcategory);

    if (index === -1) {
        activeSubcategoryFilters.push(subcategory);
    } else {
        activeSubcategoryFilters.splice(index, 1);
    }

    applySubcategoryFilters();
    updateFilterBadgeCount();
}

function applyPriceFilter() {
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');

    priceRange = {
        min: minInput.value ? parseFloat(minInput.value) : 0,
        max: maxInput.value ? parseFloat(maxInput.value) : Infinity
    };

    applySubcategoryFilters();
    updateFilterBadgeCount();
}

function applySubcategoryFilters() {
    if (!currentCategory) return;

    let filteredProducts;

    if (currentCategory === "Todos los Productos") {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product =>
            product.category.toLowerCase().includes(currentCategory.toLowerCase())
        );
    }

    if (activeSubcategoryFilters.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
            return activeSubcategoryFilters.some(filter =>
                productText.includes(filter.toLowerCase())
            );
        });
    }

    filteredProducts = filteredProducts.filter(product => {
        const price = product.price;
        return price >= priceRange.min && price <= priceRange.max;
    });

    const sectionTitle = document.getElementById('products-section-title');
    if (sectionTitle) {
        const filterText = activeSubcategoryFilters.length > 0 ?
            ` - Filtros: ${activeSubcategoryFilters.join(', ')}` : '';
        const priceText = (priceRange.min > 0 || priceRange.max < Infinity) ?
            ` - Precio: $${priceRange.min.toLocaleString('es-AR')} - $${priceRange.max === Infinity ? '∞' : priceRange.max.toLocaleString('es-AR')}` : '';

        sectionTitle.textContent = `${currentCategory} (${filteredProducts.length} productos)${filterText}${priceText}`;
    }

    currentProducts = filteredProducts;
    currentPage = 1;
    renderCurrentPage();
    updateActiveFiltersDisplay();
}

function updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById('active-filters-container');
    if (!activeFiltersContainer) return;

    let activeFiltersHTML = '';

    activeSubcategoryFilters.forEach(filter => {
        activeFiltersHTML += `
            <div class="active-filter-tag">
                ${filter}
                <button class="remove-filter" onclick="removeSubcategoryFilter('${filter}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    if (priceRange.min > 0 || priceRange.max < Infinity) {
        let priceText = '';
        if (priceRange.min > 0 && priceRange.max < Infinity) {
            priceText = `Precio: $${priceRange.min.toLocaleString('es-AR')} - $${priceRange.max.toLocaleString('es-AR')}`;
        } else if (priceRange.min > 0) {
            priceText = `Precio: desde $${priceRange.min.toLocaleString('es-AR')}`;
        } else if (priceRange.max < Infinity) {
            priceText = `Precio: hasta $${priceRange.max.toLocaleString('es-AR')}`;
        }

        activeFiltersHTML += `
            <div class="active-filter-tag">
                ${priceText}
                <button class="remove-filter" onclick="clearPriceFilter()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    activeFiltersContainer.innerHTML = activeFiltersHTML;
}

function removeSubcategoryFilter(subcategory) {
    const index = activeSubcategoryFilters.indexOf(subcategory);
    if (index !== -1) {
        activeSubcategoryFilters.splice(index, 1);

        const checkbox = document.getElementById(`filter-${subcategory.replace(/\s+/g, '-')}`);
        if (checkbox) checkbox.checked = false;

        applySubcategoryFilters();
        updateFilterBadgeCount();
    }
}

function clearAllFilters() {
    activeSubcategoryFilters = [];
    priceRange = { min: 0, max: Infinity };

    document.querySelectorAll('.subcategories-filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';

    applySubcategoryFilters();
    updateFilterBadgeCount();
}


function showAllProducts() {
    console.log('📦 Mostrando todos los productos');
    currentCategory = null;
    activeSubcategoryFilters = [];
    priceRange = { min: 0, max: Infinity };
    
    const section = document.getElementById('products-section');
    const sectionTitle = document.getElementById('products-section-title');
    
    if (section) section.style.display = 'block';
    if (sectionTitle) sectionTitle.textContent = "Todos los Productos";
    
    currentProducts = products;
    currentPage = 1;
    
    // Renderizar directamente
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = `
            <div class="products-content" style="width: 100%;">
                <div class="products-header">
                    <div class="d-flex align-items-center">
                        <span class="me-2 text-muted" id="products-count">Mostrando 0 productos</span>
                        <div class="form-group mb-0 ms-3">
                            <select class="form-select form-select-sm" id="products-per-page">
                                <option value="8">8 por página</option>
                                <option value="12">12 por página</option>
                                <option value="16">16 por página</option>
                                <option value="20">20 por página</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="products-grid" id="filtered-products-container"></div>
                
                <!-- Paginación -->
                <div class="row mt-5">
                    <div class="col-12">
                        <nav aria-label="Paginación de productos">
                            <ul class="pagination justify-content-center" id="products-pagination"></ul>
                        </nav>
                    </div>
                </div>
            </div>
        `;
        
        setupPagination();
        renderCurrentPage();
    }
    
    // Desplazarse a la sección
    setTimeout(() => {
        scrollToProductsSection();
    }, 300);
}
function setupPagination() {
    const perPageSelect = document.getElementById('products-per-page');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function (e) {
            productsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderCurrentPage();
            
            // Hacer scroll a la sección de productos
            setTimeout(() => {
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                    const headerOffset = 120;
                    const elementPosition = productsSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    }
}
function scrollToProductsSection() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        const subcategoriesFilters = productsSection.querySelector('.subcategories-filters');
        const productsHeader = productsSection.querySelector('.products-header');

        if (subcategoriesFilters) {
            subcategoriesFilters.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else if (productsHeader) {
            productsHeader.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            productsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ============================================
// FUNCIONES DE PAGINACIÓN
// ============================================

function setupPagination() {
    const perPageSelect = document.getElementById('products-per-page');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', function (e) {
            productsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderCurrentPage();
        });
    }
}

function renderCurrentPage() {
    if (currentProducts.length === 0) {
        const container = document.getElementById('filtered-products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No se encontraron productos</h4>
                    <p class="text-muted">Intenta con otros filtros o categoría</p>
                </div>
            `;
        }
        return;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = currentProducts.slice(startIndex, endIndex);

    displayProductsPage(productsToShow);
    updateProductsCount();
    renderPaginationControls();
}

function updateProductsCount() {
    const countElement = document.getElementById('products-count');
    if (countElement) {
        const startIndex = (currentPage - 1) * productsPerPage + 1;
        const endIndex = Math.min(currentPage * productsPerPage, currentProducts.length);
        countElement.textContent = `Mostrando ${startIndex}-${endIndex} de ${currentProducts.length} productos`;
    }
}

function renderPaginationControls() {
    const paginationContainer = document.getElementById('products-pagination');
    if (!paginationContainer) return;

    totalPages = Math.ceil(currentProducts.length / productsPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage - 1})" aria-label="Anterior">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0);" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0);" onclick="changePage(${currentPage + 1})" aria-label="Siguiente">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderCurrentPage();

    // Obtener la sección de productos
    const productsSection = document.getElementById('products-section');
    if (!productsSection) {
        console.warn('No se encontró la sección de productos');
        return;
    }

    // Desplazar a la sección de productos de forma suave
    setTimeout(() => {
        const productsHeader = document.querySelector('.products-header');
        const subcategoriesFilters = document.querySelector('.subcategories-filters');
        const productsContainer = document.getElementById('products-container');
        
        // Intentar encontrar el elemento más adecuado para hacer scroll
        let scrollTarget = productsHeader;
        
        if (!scrollTarget && subcategoriesFilters) {
            scrollTarget = subcategoriesFilters;
        }
        
        if (!scrollTarget && productsContainer) {
            scrollTarget = productsContainer;
        }
        
        if (!scrollTarget) {
            scrollTarget = productsSection;
        }
        
        if (scrollTarget) {
            // Calcular posición exacta
            const headerOffset = 120; // Compensar por header fijo
            const elementPosition = scrollTarget.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// ============================================
// FUNCIONES DE DETALLE DE PRODUCTO
// ============================================

function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('error', 'Producto no encontrado');
        return;
    }

    currentProductDetail = product;
    currentProductImages = product.images.length > 0 ? product.images : [getDefaultImage(product.name)];
    currentImageIndex = 0;

    document.getElementById('detailProductName').textContent = product.name;
    document.getElementById('detailProductCategory').textContent = product.category;
    document.getElementById('detailProductDescription').textContent = product.description;
    document.getElementById('detailRetailPrice').textContent = `$${product.price.toLocaleString('es-AR')}`;
    document.getElementById('detailWholesalePrice').textContent = `$${product.wholesalePrice.toLocaleString('es-AR')}`;
    document.getElementById('detailWholesaleInfoText').textContent = `Mínimo ${product.wholesaleLimit} unidades`;
    document.getElementById('detailQuantity').value = '1';

    const wholesaleSection = document.getElementById('detailWholesaleSection');
    const wholesaleBtn = document.getElementById('detailWholesaleBtn');

    if (wholesaleSection) {
        wholesaleSection.style.display = 'none';
    }

    if (wholesaleBtn) {
        wholesaleBtn.innerHTML = '<i class="fas fa-eye me-1"></i> Ver mayorista';
        wholesaleBtn.classList.remove('btn-outline-primary');
        wholesaleBtn.classList.add('btn-outline-secondary');
    }

    setupProductImages();
    setupProductSpecifications(product);

    showModal('productDetail');
    // Cargar productos relacionados DESPUÉS de mostrar el modal
setTimeout(() => {
    initializeEnhancedZoom();
    loadRelatedProducts(product);
}, 100);
}

function setupProductImages() {
    const mainImage = document.getElementById('detailMainImage');
    const thumbnailsContainer = document.getElementById('detailThumbnails');
    const currentImageIndexSpan = document.getElementById('currentImageIndex');
    const totalImagesSpan = document.getElementById('totalImages');
    const touchSliderTrack = document.getElementById('touchSliderTrack');
    const sliderCurrentIndexSpan = document.getElementById('sliderCurrentIndex');
    const sliderTotalImagesSpan = document.getElementById('sliderTotalImages');

    if (mainImage) {
        mainImage.src = currentProductImages[0];
        mainImage.onerror = function () {
            this.src = getDefaultImage(currentProductDetail.name);
            this.onerror = null;
        };
    }

    if (touchSliderTrack) {
        touchSliderTrack.innerHTML = '';

        currentProductImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'touch-slide';
            slide.style.width = '100%';
            slide.style.flexShrink = '0';

            const img = document.createElement('img');
            img.src = image;
            img.alt = `Imagen ${index + 1} de ${currentProductDetail.name}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.onerror = function () {
                this.src = getDefaultImage(currentProductDetail.name);
                this.onerror = null;
            };

            slide.appendChild(img);
            touchSliderTrack.appendChild(slide);
        });

        if (sliderCurrentIndexSpan && sliderTotalImagesSpan) {
            sliderCurrentIndexSpan.textContent = '1';
            sliderTotalImagesSpan.textContent = currentProductImages.length.toString();
        }

        setTimeout(() => {
            setupModernZoom();
        }, 100);

        touchSliderTrack.style.width = `${currentProductImages.length * 100}%`;
        touchSliderTrack.style.display = 'flex';
        touchSliderTrack.style.transition = 'transform 0.3s ease';
    }

    if (currentImageIndexSpan && totalImagesSpan) {
        currentImageIndexSpan.textContent = '1';
        totalImagesSpan.textContent = currentProductImages.length.toString();
    }

    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';

        currentProductImages.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.onerror = function () {
                this.src = getDefaultImage(currentProductDetail.name);
                this.onerror = null;
            };
            thumbnail.onclick = () => {
                changeToImage(index);
            };
            thumbnailsContainer.appendChild(thumbnail);
        });
    }

    setTimeout(() => {
        setupImageZoom();
        setupTouchGestures();
        setupMobileSlider();
    }, 100);
}
// Inicialización mejorada
function initializeEnhancedZoom() {
    if (window.innerWidth <= 768) {
        setupMobileTouchSlider();
        setupEnhancedTouchGestures();
        
        // Ocultar elementos de desktop en móviles
        const zoomLens = document.getElementById('zoomLens');
        const zoomWindow = document.getElementById('zoomWindow');
        if (zoomLens) zoomLens.style.display = 'none';
        if (zoomWindow) zoomWindow.style.display = 'none';
    } else {
        setupDesktopZoom();
    }
}

function setupProductSpecifications(product) {
    const metaContainer = document.getElementById('detailProductMeta');
    if (metaContainer) {
        metaContainer.innerHTML = '';

        if (product.specifications && Object.keys(product.specifications).length > 0) {
            for (const [key, value] of Object.entries(product.specifications)) {
                const metaItem = document.createElement('div');
                metaItem.className = 'meta-item';
                metaItem.innerHTML = `<div class="meta-label">${key}:</div><div class="meta-value">${value}</div>`;
                metaContainer.appendChild(metaItem);
            }
        } else {
            metaContainer.innerHTML = '<div class="text-muted">No hay especificaciones disponibles</div>';
        }
    }
}

function initHeroCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');

    if (!carouselInner || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;

    function updateCarousel() {
        carouselInner.style.transform = `translateX(-${currentSlide * 16.666}%)`;

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        updateCarousel();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoSlide();
            goToSlide(currentSlide - 1);
            startAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoSlide();
            goToSlide(currentSlide + 1);
            startAutoSlide();
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoSlide();
            goToSlide(index);
            startAutoSlide();
        });
    });

    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
        carousel.addEventListener('touchstart', stopAutoSlide);
        carousel.addEventListener('touchend', () => {
            setTimeout(startAutoSlide, 5000);
        });
    }

    updateCarousel();
    startAutoSlide();
}

// ============================================
// FUNCIONES DE ZOOM MODERNAS
// ============================================

function setupModernZoom() {
    const wrapper = document.getElementById('imageZoomWrapper');
    const image = document.getElementById('detailMainImage');
    const lens = document.getElementById('zoomLens');
    const zoomWindow = document.getElementById('zoomWindow');
    const zoomWindowImage = document.getElementById('zoomWindowImage');

    if (!wrapper || !image || !lens || !zoomWindow) return;

    zoomScale = 1;
    isZoomActive = false;

    if (window.innerWidth > 768) {
        setupDesktopZoom(wrapper, image, lens, zoomWindow, zoomWindowImage);
    } else {
        setupMobileTouchSlider();
    }

    window.addEventListener('resize', handleZoomResize);
}

function setupDesktopZoom(wrapper, image, lens, zoomWindow, zoomWindowImage) {
    let isMouseOver = false;
    let mouseX = 0;
    let mouseY = 0;

    zoomWindowImage.src = image.src;

    wrapper.addEventListener('mouseenter', () => {
        isMouseOver = true;
        wrapper.classList.add('zooming');
        lens.style.display = 'block';
        zoomWindow.style.display = 'block';
    });

    wrapper.addEventListener('mouseleave', () => {
        isMouseOver = false;
        wrapper.classList.remove('zooming');
        lens.style.display = 'none';
        zoomWindow.style.display = 'none';
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!isMouseOver) return;

        const rect = wrapper.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        const lensSize = 150;
        let lensX = mouseX - lensSize / 2;
        let lensY = mouseY - lensSize / 2;

        lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
        lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

        lens.style.left = `${lensX}px`;
        lens.style.top = `${lensY}px`;

        const zoomX = (lensX / (rect.width - lensSize)) * (image.naturalWidth - zoomWindow.clientWidth);
        const zoomY = (lensY / (rect.height - lensSize)) * (image.naturalHeight - zoomWindow.clientHeight);

        zoomWindow.style.left = `${rect.right + 20}px`;
        zoomWindow.style.top = `${rect.top}px`;

        zoomWindowImage.style.transform = `translate(-${zoomX}px, -${zoomY}px) scale(${maxZoom})`;
    });

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();

        const rect = wrapper.getBoundingClientRect();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;

        zoomScale = Math.max(minZoom, Math.min(maxZoom, zoomScale + delta));
        image.style.transform = `scale(${zoomScale})`;

        if (zoomScale > 1) {
            const x = (mouseX / rect.width) * 100;
            const y = (mouseY / rect.height) * 100;
            image.style.transformOrigin = `${x}% ${y}%`;
        } else {
            image.style.transformOrigin = 'center center';
        }
    });

    wrapper.addEventListener('dblclick', (e) => {
        e.preventDefault();
        zoomScale = 1;
        image.style.transform = `scale(${zoomScale})`;
        image.style.transformOrigin = 'center center';
    });
}

// ============================================
// FUNCIONES MEJORADAS PARA ZOOM EN MÓVILES
// ============================================

function setupMobileTouchSlider() {
    const container = document.getElementById('touchSliderContainer');
    const track = document.getElementById('touchSliderTrack');
    const dotsContainer = document.getElementById('touchSliderDots');

    if (!container || !track || !currentProductImages) return;

    track.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    // Crear slides y dots
    currentProductImages.forEach((imgSrc, index) => {
        // Crear slide
        const slide = document.createElement('div');
        slide.className = 'touch-slide';
        slide.dataset.index = index;

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Imagen ${index + 1} de ${currentProductDetail?.name || 'producto'}`;
        img.loading = 'lazy';
        img.onerror = () => {
            img.src = getDefaultImage(currentProductDetail?.name || 'Producto');
        };

        slide.appendChild(img);
        track.appendChild(slide);

        // Crear dot si existe el contenedor
        if (dotsContainer) {
            const dot = document.createElement('div');
            dot.className = `touch-slider-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.onclick = (e) => {
                e.stopPropagation();
                goToSlide(index);
            };
            dotsContainer.appendChild(dot);
        }
    });

    // Configurar dimensiones del track
    track.style.width = `${currentProductImages.length * 100}%`;
    
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let animationID;
    let velocity = 0;
    let lastTime = 0;

    // Función para animación suave
    function animate() {
        if (Math.abs(velocity) > 0.1) {
            currentTranslate += velocity;
            velocity *= 0.95; // Fricción
            track.style.transform = `translateX(${currentTranslate}px)`;
            animationID = requestAnimationFrame(animate);
        }
    }

    // Eventos táctiles
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none';
        cancelAnimationFrame(animationID);
        velocity = 0;
        lastTime = Date.now();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;

        // Calcular velocidad para deslizamiento inercial
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        if (deltaTime > 0) {
            velocity = (currentTranslate - prevTranslate) / deltaTime * 16;
        }
        lastTime = currentTime;

        // Limitar desplazamiento
        const maxTranslate = 0;
        const minTranslate = -(track.scrollWidth - container.clientWidth);
        currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, currentTranslate));

        track.style.transform = `translateX(${currentTranslate}px)`;
    }, { passive: false });

    track.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const slideWidth = container.clientWidth;
        const movedBy = currentTranslate - prevTranslate;

        // Determinar si hay que cambiar de slide
        if (Math.abs(movedBy) > slideWidth * 0.15 || Math.abs(velocity) > 0.5) {
            if ((movedBy > 0 || velocity > 0) && currentImageIndex > 0) {
                goToSlide(currentImageIndex - 1);
            } else if ((movedBy < 0 || velocity < 0) && currentImageIndex < currentProductImages.length - 1) {
                goToSlide(currentImageIndex + 1);
            } else {
                goToSlide(currentImageIndex);
            }
        } else {
            goToSlide(currentImageIndex);
        }

        // Iniciar animación inercial si hay velocidad
        if (Math.abs(velocity) > 0.1) {
            animationID = requestAnimationFrame(animate);
        }
    });

    // Doble tap para zoom completo
    let lastTap = 0;
    track.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            openFullscreenZoom(currentImageIndex);
        }
        lastTap = currentTime;
    });

    // Inicializar
    goToSlide(0);
}

function setupEnhancedTouchGestures() {
    const container = document.getElementById('imageZoomWrapper');
    if (!container) return;

    let initialDistance = 0;
    let initialScale = 1;
    let isPinching = false;
    let lastTouchEnd = 0;

    // Detectar pellizco para zoom
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            isPinching = true;
            initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
            initialScale = zoomScale;
        }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && isPinching) {
            e.preventDefault();
            
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            
            // Aplicar zoom con límites
            zoomScale = Math.max(minZoom, Math.min(maxZoom, initialScale * scale));
            
            const image = document.getElementById('detailMainImage');
            if (image) {
                image.style.transform = `scale(${zoomScale})`;
                
                // Centrar el zoom en el punto medio de los dedos
                const midpoint = getTouchMidpoint(e.touches[0], e.touches[1]);
                const rect = container.getBoundingClientRect();
                const x = (midpoint.x - rect.left) / rect.width * 100;
                const y = (midpoint.y - rect.top) / rect.height * 100;
                image.style.transformOrigin = `${x}% ${y}%`;
            }
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        isPinching = false;
        
        // Resetear si el zoom es muy pequeño
        if (zoomScale < minZoom + 0.1) {
            zoomScale = minZoom;
            const image = document.getElementById('detailMainImage');
            if (image) {
                image.style.transform = `scale(${zoomScale})`;
                image.style.transformOrigin = 'center center';
            }
        }
    });

    // Funciones auxiliares
    function getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchMidpoint(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }

    // Feedback visual para gestos
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            showTouchFeedback(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
}
function showTouchFeedback(x, y) {
    let feedback = document.querySelector('.touch-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'touch-feedback';
        document.body.appendChild(feedback);
    }
    
    feedback.style.left = `${x - 30}px`;
    feedback.style.top = `${y - 30}px`;
    feedback.style.display = 'block';
    
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 500);
}

function goToSlide(index) {
    if (!currentProductImages || index < 0 || index >= currentProductImages.length) return;

    currentImageIndex = index;
    const container = document.getElementById('touchSliderContainer');
    const track = document.getElementById('touchSliderTrack');

    if (container && track) {
        const slideWidth = container.clientWidth;
        prevTranslate = -index * slideWidth;
        track.style.transform = `translateX(${prevTranslate}px)`;
    }

    document.querySelectorAll('.touch-slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    updateImageCounters();
}

function openFullscreenZoom(startIndex = 0) {
    const modal = document.getElementById('fullscreenZoomModal');
    const image = document.getElementById('fullscreenZoomImage');
    const content = document.getElementById('fullscreenZoomContent');

    if (!modal || !image || !currentProductImages) return;

    currentImageIndex = startIndex;
    image.src = currentProductImages[currentImageIndex];

    zoomScale = 1;
    translateX = 0;
    translateY = 0;
    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    setupFullscreenGestures(content, image);
    updateFullscreenCounter();
}

function closeFullscreenZoom() {
    const modal = document.getElementById('fullscreenZoomModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    zoomScale = 1;
    translateX = 0;
    translateY = 0;
}


// Mejorar la función de zoom completo para móviles
function setupFullscreenGestures(content, image) {
    let isDragging = false;
    let startX, startY;
    let startTouches = [];
    let touchStartDistance = 0;
    let currentScale = 1;
    let lastTapTime = 0;

    // Zoom con pellizco
    content.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            startTouches = [e.touches[0], e.touches[1]];
            touchStartDistance = getDistance(startTouches[0], startTouches[1]);
            currentScale = zoomScale;
        }
    }, { passive: true });

    content.addEventListener('touchmove', (e) => {
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) {
            const x = e.touches[0].clientX - startX;
            const y = e.touches[0].clientY - startY;

            // Limitar el desplazamiento según el nivel de zoom
            const limitX = (image.clientWidth * (zoomScale - 1)) / 2;
            const limitY = (image.clientHeight * (zoomScale - 1)) / 2;

            translateX = Math.max(-limitX, Math.min(limitX, x));
            translateY = Math.max(-limitY, Math.min(limitY, y));

            image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = getDistance(touch1, touch2);

            if (touchStartDistance > 0) {
                const scale = currentDistance / touchStartDistance;
                zoomScale = Math.max(minZoom, Math.min(maxZoom, currentScale * scale));
                
                // Ajustar la posición para mantener el punto entre dedos centrado
                const midPoint = getTouchMidpoint(touch1, touch2);
                const rect = content.getBoundingClientRect();
                const relativeX = midPoint.x - rect.left;
                const relativeY = midPoint.y - rect.top;
                
                image.style.transformOrigin = `${relativeX}px ${relativeY}px`;
                image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
            }
        }
    }, { passive: false });

    // Doble tap para resetear zoom
    content.addEventListener('touchend', (e) => {
        isDragging = false;
        startTouches = [];
        touchStartDistance = 0;

        // Detectar doble tap
        const currentTime = new Date().getTime();
        if (currentTime - lastTapTime < 300) {
            e.preventDefault();
            
            if (zoomScale > minZoom) {
                // Resetear zoom
                zoomScale = minZoom;
                translateX = 0;
                translateY = 0;
                image.style.transform = `translate(0px, 0px) scale(1)`;
                image.style.transformOrigin = 'center center';
            } else {
                // Zoom al punto del tap
                if (e.changedTouches.length === 1) {
                    const touch = e.changedTouches[0];
                    const rect = content.getBoundingClientRect();
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    
                    zoomScale = maxZoom;
                    image.style.transformOrigin = `${x}px ${y}px`;
                    image.style.transform = `translate(0px, 0px) scale(${zoomScale})`;
                }
            }
        }
        lastTapTime = currentTime;
    });

    // Swipe para cambiar imagen
    content.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1 && !isDragging) {
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - startX;
            
            if (Math.abs(deltaX) > 50 && zoomScale <= minZoom + 0.1) {
                if (deltaX > 0) {
                    changeFullscreenImage(-1);
                } else {
                    changeFullscreenImage(1);
                }
            }
        }
    });
}
function changeFullscreenImage(direction) {
    const newIndex = currentImageIndex + direction;

    if (newIndex >= 0 && newIndex < currentProductImages.length) {
        currentImageIndex = newIndex;
        const image = document.getElementById('fullscreenZoomImage');
        image.src = currentProductImages[currentImageIndex];

        zoomScale = 1;
        translateX = 0;
        translateY = 0;
        image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;

        updateFullscreenCounter();
    }
}

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function updateImageCounters() {
    const currentIndexElement = document.getElementById('currentImageIndex');
    const totalImagesElement = document.getElementById('totalImages');

    if (currentIndexElement) {
        currentIndexElement.textContent = (currentImageIndex + 1).toString();
    }
    if (totalImagesElement && currentProductImages) {
        totalImagesElement.textContent = currentProductImages.length.toString();
    }

    const sliderCurrentIndex = document.getElementById('sliderCurrentIndex');
    const sliderTotalImages = document.getElementById('sliderTotalImages');

    if (sliderCurrentIndex) {
        sliderCurrentIndex.textContent = (currentImageIndex + 1).toString();
    }
    if (sliderTotalImages && currentProductImages) {
        sliderTotalImages.textContent = currentProductImages.length.toString();
    }
}

function updateFullscreenCounter() {
    const currentElement = document.getElementById('fullscreenCurrentIndex');
    const totalElement = document.getElementById('fullscreenTotalImages');

    if (currentElement) {
        currentElement.textContent = (currentImageIndex + 1).toString();
    }
    if (totalElement && currentProductImages) {
        totalElement.textContent = currentProductImages.length.toString();
    }
}

function handleZoomResize() {
    const image = document.getElementById('detailMainImage');
    if (image) {
        zoomScale = 1;
        image.style.transform = 'scale(1)';
        image.style.transformOrigin = 'center center';
    }

    setupModernZoom();
}

// ============================================
// FUNCIONES DE IMÁGENES Y ZOOM (MANTENIDAS)
// ============================================

function setupImageZoom() {
    const container = document.getElementById('imageZoomContainer');
    const image = document.getElementById('detailMainImage');
    const lens = document.getElementById('zoomLens');
    const zoomWindow = document.getElementById('zoomWindow');

    if (!container || !image || !lens || !zoomWindow) return;

    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('mouseenter', handleMouseEnter);
    container.removeEventListener('mouseleave', handleMouseLeave);
    container.removeEventListener('click', handleImageClick);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleImageClick);

    const zoomImg = document.createElement('img');
    zoomImg.src = image.src;
    zoomWindow.innerHTML = '';
    zoomWindow.appendChild(zoomImg);

    function handleMouseEnter() {
        if (window.innerWidth > 768) {
            lens.style.display = 'block';
            zoomWindow.style.display = 'block';
            container.classList.add('zooming');
        }
    }

    function handleMouseLeave() {
        lens.style.display = 'none';
        zoomWindow.style.display = 'none';
        container.classList.remove('zooming');
        isZooming = false;
    }

    function handleMouseMove(e) {
        if (!isZooming || window.innerWidth <= 768) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const lensSize = 150;
        let lensX = x - lensSize / 2;
        let lensY = y - lensSize / 2;

        lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
        lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

        lens.style.left = lensX + 'px';
        lens.style.top = lensY + 'px';

        const zoomX = (lensX / (rect.width - lensSize)) * (zoomImg.naturalWidth - zoomWindow.clientWidth);
        const zoomY = (lensY / (rect.height - lensSize)) * (zoomImg.naturalHeight - zoomWindow.clientHeight);

        zoomWindow.style.left = (rect.right + 10) + 'px';
        zoomWindow.style.top = rect.top + 'px';

        zoomImg.style.transform = `scale(${zoomLevel}) translate(-${zoomX}px, -${zoomY}px)`;
    }

    function handleImageClick(e) {
        if (window.innerWidth <= 768) return;

        if (!isZooming) {
            isZooming = true;
            container.classList.add('zooming');
            lens.style.display = 'block';
            zoomWindow.style.display = 'block';

            const rect = container.getBoundingClientRect();
            zoomWindow.style.left = (rect.right + 10) + 'px';
            zoomWindow.style.top = rect.top + 'px';
        } else {
            isZooming = false;
            container.classList.remove('zooming');
            lens.style.display = 'none';
            zoomWindow.style.display = 'none';
        }

        handleMouseMove(e);
    }
}

function setupTouchGestures() {
    const container = document.getElementById('imageZoomContainer');
    if (!container) return;

    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchmove', handleTouchMove);
    container.removeEventListener('touchend', handleTouchEnd);

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipeGesture();
    }
}

function handleSwipeGesture() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            changeProductImage(1);
        } else {
            changeProductImage(-1);
        }
    }
}

function changeProductImage(direction) {
    if (currentProductImages.length <= 1) return;

    currentImageIndex += direction;

    if (currentImageIndex < 0) {
        currentImageIndex = currentProductImages.length - 1;
    } else if (currentImageIndex >= currentProductImages.length) {
        currentImageIndex = 0;
    }

    changeToImage(currentImageIndex);
}

// Optimizar cambio de imágenes
function changeToImage(index) {
    if (index < 0 || index >= currentProductImages.length) return;

    currentImageIndex = index;

    const mainImage = document.getElementById('detailMainImage');
    const zoomWindowImage = document.getElementById('zoomWindowImage');
    const fullscreenImage = document.getElementById('fullscreenZoomImage');

    // Precargar imagen
    const img = new Image();
    img.src = currentProductImages[index];
    img.onload = () => {
        if (mainImage) mainImage.src = currentProductImages[index];
        if (zoomWindowImage) zoomWindowImage.src = currentProductImages[index];
        if (fullscreenImage) fullscreenImage.src = currentProductImages[index];
    };
    img.onerror = () => {
        const defaultImg = getDefaultImage(currentProductDetail?.name || 'Producto');
        if (mainImage) mainImage.src = defaultImg;
        if (zoomWindowImage) zoomWindowImage.src = defaultImg;
        if (fullscreenImage) fullscreenImage.src = defaultImg;
    };

    goToSlide(index);

    // Actualizar miniaturas
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });

    updateImageCounters();
}
function resetImageZoom() {
    const lens = document.getElementById('zoomLens');
    const zoomWindow = document.getElementById('zoomWindow');
    const container = document.getElementById('imageZoomContainer');

    if (lens) lens.style.display = 'none';
    if (zoomWindow) zoomWindow.style.display = 'none';
    if (container) container.classList.remove('zooming');

    isZooming = false;
    currentProductImages = [];
    currentImageIndex = 0;
}

// ============================================
// FUNCIONES DE CARRITO
// ============================================

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('nombreSitioCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            renderCart();
        }
    } catch (error) {
        console.error('Error cargando carrito:', error);
        cart = [];
    }
}

function addToCart(productId, quantity = null) {
    if (!quantity) {
        const quantityInput = document.getElementById(`quantity-${productId}`);
        quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
        showToast('error', 'No hay suficiente stock disponible');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
            showToast('error', 'No hay suficiente stock disponible');
            return;
        }
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            wholesalePrice: product.wholesalePrice,
            wholesaleLimit: product.wholesaleLimit,
            image: product.image,
            quantity: quantity
        });
    }

    updateCart();

    if (!quantity) {
        const quantityInput = document.getElementById(`quantity-${productId}`);
        if (quantityInput) quantityInput.value = 1;
    }

    showToast('success', `${product.name} agregado al carrito`);
}

function updateCart() {
    renderCart();
    updateCartBadge();
    updateCartCount();
    saveCartToStorage();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        updateCartTotals();
        return;
    }

    let cartHTML = '';

    cart.forEach(item => {
        const price = item.quantity >= item.wholesaleLimit ? item.wholesalePrice : item.price;
        const itemTotal = price * item.quantity;

        cartHTML += `
            <div class="cart-item">
                <div class="d-flex align-items-start">
                    <img src="${item.image}" class="cart-item-image" alt="${item.name}" 
                         onerror="this.src='${getDefaultImage(item.name)}'; this.onerror=null;"
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                    <div class="cart-item-details" style="flex: 1;">
                        <div class="cart-item-title" style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
                        <div class="cart-item-price">$${price.toLocaleString('es-AR')} c/u</div>
                        ${item.quantity >= item.wholesaleLimit ?
                '<span class="badge bg-success mt-1">Precio mayorista</span>' : ''}
                    </div>
                    <div class="cart-item-controls">
                        <div class="d-flex align-items-center mb-2">
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold">$${itemTotal.toLocaleString('es-AR')}</div>
                            <button class="btn btn-sm btn-link text-danger p-0" 
                                    onclick="removeFromCart('${item.id}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = cartHTML;
    updateCartTotals();
}

function updateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
        showToast('error', 'No hay suficiente stock disponible');
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showToast('success', 'Producto eliminado del carrito');
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function updateCartTotals() {
    let subtotal = 0;

    cart.forEach(item => {
        const price = item.quantity >= item.wholesaleLimit ? item.wholesalePrice : item.price;
        subtotal += price * item.quantity;
    });

    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;

    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const discountElement = document.getElementById('cart-discount');
    const totalElement = document.getElementById('cart-total');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString('es-AR')}`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'A confirmar' : `$${shipping.toLocaleString('es-AR')}`;
    if (discountElement) discountElement.textContent = discount === 0 ? '$0.00' : `-$${discount.toLocaleString('es-AR')}`;
    if (totalElement) totalElement.textContent = `$${total.toLocaleString('es-AR')}`;
}

function saveCartToStorage() {
    localStorage.setItem('nombreSitioCart', JSON.stringify(cart));
}

// ============================================
// FUNCIONES DE CANTIDAD
// ============================================

function incrementQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    if (!quantityInput) return;

    const currentValue = parseInt(quantityInput.value);
    const product = products.find(p => p.id === productId);

    if (product && currentValue < product.stock) {
        quantityInput.value = currentValue + 1;
    }
}

function decrementQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    if (!quantityInput) return;

    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) quantityInput.value = currentValue - 1;
}

function incrementDetailQuantity() {
    const quantityInput = document.getElementById('detailQuantity');
    if (!quantityInput) return;

    const currentValue = parseInt(quantityInput.value);

    if (currentProductDetail && currentValue < currentProductDetail.stock) {
        quantityInput.value = currentValue + 1;
    }
}

function decrementDetailQuantity() {
    const quantityInput = document.getElementById('detailQuantity');
    if (!quantityInput) return;

    const currentValue = parseInt(quantityInput.value);

    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
    }
}

function addToCartFromDetail() {
    if (!currentProductDetail) return;
    const quantity = parseInt(document.getElementById('detailQuantity').value);
    addToCart(currentProductDetail.id, quantity);
    hideModal('productDetail');
}

// ============================================
// FUNCIONES DE TOGGLE PRECIOS
// ============================================

function toggleWholesalePrice(productId) {
    const priceElement = document.getElementById(`price-${productId}`);
    const wholesaleInfo = document.getElementById(`wholesale-info-${productId}`);
    const wholesaleBtn = document.getElementById(`wholesale-btn-${productId}`);

    if (wholesaleInfo.style.display === 'none') {
        priceElement.style.display = 'none';
        wholesaleInfo.style.display = 'block';
        wholesaleBtn.innerHTML = '<i class="fas fa-eye-slash me-1"></i> Ver unitario';
        wholesaleBtn.classList.remove('btn-outline-secondary');
        wholesaleBtn.classList.add('btn-outline-primary');
    } else {
        priceElement.style.display = 'block';
        wholesaleInfo.style.display = 'none';
        wholesaleBtn.innerHTML = '<i class="fas fa-eye me-1"></i> Ver mayorista';
        wholesaleBtn.classList.remove('btn-outline-primary');
        wholesaleBtn.classList.add('btn-outline-secondary');
    }
}

function toggleDetailWholesale() {
    const retailPriceElement = document.querySelector('.retail-price');
    const wholesaleSection = document.getElementById('detailWholesaleSection');
    const wholesaleBtn = document.getElementById('detailWholesaleBtn');

    if (!wholesaleSection || !wholesaleBtn || !retailPriceElement) return;

    if (wholesaleSection.style.display === 'none') {
        retailPriceElement.style.display = 'none';
        wholesaleSection.style.display = 'block';
        wholesaleBtn.innerHTML = '<i class="fas fa-eye-slash me-1"></i> Ver unitario';
        wholesaleBtn.classList.remove('btn-outline-secondary');
        wholesaleBtn.classList.add('btn-outline-primary');
    } else {
        retailPriceElement.style.display = 'block';
        wholesaleSection.style.display = 'none';
        wholesaleBtn.innerHTML = '<i class="fas fa-eye me-1"></i> Ver mayorista';
        wholesaleBtn.classList.remove('btn-outline-primary');
        wholesaleBtn.classList.add('btn-outline-secondary');
    }
}

// ============================================
// FUNCIONES DE CHECKOUT
// ============================================

function openCheckoutFromCart() {
    console.log('Abriendo checkout desde carrito...');

    if (cart.length === 0) {
        showToast('error', 'El carrito está vacío');
        return;
    }

    const cartOffcanvasElement = document.getElementById('cartOffcanvas');
    if (cartOffcanvasElement) {
        const cartOffcanvas = bootstrap.Offcanvas.getInstance(cartOffcanvasElement);
        if (cartOffcanvas) {
            cartOffcanvas.hide();
        }
    }

    resetCheckoutForm();

    if (currentUser) {
        loadUserDataIntoCheckout();
    }

    updateCheckoutSummary();

    setTimeout(() => {
        showModal('checkout');
    }, 300);
}

function resetCheckoutForm() {
    console.log('Reseteando formulario de checkout...');
    currentStep = 1;

    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

    const firstStep = document.querySelector('.checkout-step[data-step="1"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }

    document.querySelectorAll('.checkout-form').forEach((form, index) => {
        form.classList.remove('active');
        if (index === 0) form.classList.add('active');
    });

    document.querySelectorAll('.payment-method, .shipping-option').forEach(element => {
        element.classList.remove('active');
    });

    const firstPaymentMethod = document.querySelector('.payment-method[data-method="transferencia"]');
    const firstShippingOption = document.querySelector('.shipping-option[data-shipping="domicilio"]');

    if (firstPaymentMethod) {
        firstPaymentMethod.classList.add('active');
    }
    if (firstShippingOption) {
        firstShippingOption.classList.add('active');
        const shippingAddressForm = document.getElementById('shippingAddressForm');
        if (shippingAddressForm) shippingAddressForm.style.display = 'block';
    }

    const fieldsToClear = [
        'checkoutFirstName', 'checkoutLastName', 'checkoutEmail',
        'checkoutPhone', 'checkoutDni', 'checkoutAddress',
        'checkoutCity', 'checkoutState', 'checkoutZipCode'
    ];

    fieldsToClear.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
}

function loadUserDataIntoCheckout() {
    if (!currentUser) return;

    document.getElementById('checkoutFirstName').value = currentUser.firstName || '';
    document.getElementById('checkoutLastName').value = currentUser.lastName || '';
    document.getElementById('checkoutEmail').value = currentUser.email || '';
    document.getElementById('checkoutPhone').value = currentUser.phone || '';
    document.getElementById('checkoutDni').value = '';
}

function updateCheckoutSummary() {
    const subtotal = cart.reduce((total, item) => {
        const price = item.quantity >= item.wholesaleLimit ? item.wholesalePrice : item.price;
        return total + (price * item.quantity);
    }, 0);

    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;
    if (summaryTotal) summaryTotal.textContent = `$${subtotal.toLocaleString('es-AR')}`;
}

// ============================================
// NAVEGACIÓN DEL CHECKOUT
// ============================================

function proceedToStep2() {
    console.log('Procediendo al paso 2...');

    if (!validateStep1()) {
        showToast('error', 'Por favor completa todos los campos obligatorios');
        return;
    }

    navigateToStep(2);
}

function returnToStep1() {
    console.log('Volviendo al paso 1...');
    navigateToStep(1);
}

function proceedToStep3() {
    console.log('Procediendo al paso 3...');

    if (!validateStep2()) {
        showToast('error', 'Por favor completa la información de envío');
        return;
    }

    navigateToStep(3);
}

function returnToStep2() {
    console.log('Volviendo al paso 2...');
    navigateToStep(2);
}

function proceedToStep4() {
    console.log('Procediendo al paso 4...');

    if (!validateStep3()) {
        showToast('error', 'Por favor selecciona un método de pago');
        return;
    }

    updateOrderSummary();
    navigateToStep(4);
}

function navigateToStep(step) {
    console.log(`Navegando al paso ${step}...`);
    currentStep = step;

    updateCheckoutSteps();

    document.querySelectorAll('.checkout-form').forEach(form => {
        form.classList.remove('active');
    });

    const currentStepForm = document.getElementById(`step${step}`);
    if (currentStepForm) {
        currentStepForm.classList.add('active');
    }
}

function updateCheckoutSteps() {
    document.querySelectorAll('.checkout-step').forEach(step => {
        const stepNumber = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active', 'completed');

        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
}

// ============================================
// VALIDACIONES DEL CHECKOUT
// ============================================

function validateStep1() {
    const requiredFields = [
        'checkoutFirstName',
        'checkoutLastName',
        'checkoutEmail',
        'checkoutPhone',
        'checkoutDni'
    ];

    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || field.value.trim() === '') {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    const email = document.getElementById('checkoutEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        document.getElementById('checkoutEmail').classList.add('is-invalid');
        showToast('error', 'Por favor ingresa un email válido');
        isValid = false;
    }

    return isValid;
}

function validateStep2() {
    const shippingMethod = document.querySelector('.shipping-option.active');
    if (!shippingMethod) {
        showToast('error', 'Por favor selecciona un método de envío');
        return false;
    }

    const shippingType = shippingMethod.getAttribute('data-shipping');

    if (shippingType === 'domicilio') {
        const addressFields = [
            'checkoutAddress',
            'checkoutCity',
            'checkoutState',
            'checkoutZipCode'
        ];

        let isValid = true;

        addressFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || field.value.trim() === '') {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    }

    return true;
}

function validateStep3() {
    const paymentMethod = document.querySelector('.payment-method.active');
    if (!paymentMethod) {
        showToast('error', 'Por favor selecciona un método de pago');
        return false;
    }
    return true;
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary) return;

    orderSummary.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const price = item.quantity >= item.wholesaleLimit ? item.wholesalePrice : item.price;
        const itemTotal = price * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>$${itemTotal.toLocaleString('es-AR')}</span>
        `;
        orderSummary.appendChild(itemElement);
    });

    const orderTotal = document.getElementById('orderTotal');
    if (orderTotal) {
        orderTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    }
}




// Verificar conexión al cargar
document.addEventListener('DOMContentLoaded', function () {
    if (window.supabaseClient && window.supabaseClient.testConnection) {
        window.supabaseClient.testConnection().then(result => {
            console.log('🔌 Test conexión Supabase:', result);
        });
    }
});
// ============================================
// PROCESAR PEDIDO POR WHATSAPP
// ============================================
async function confirmOrderByWhatsApp() {
    console.log('🚀 confirmOrderByWhatsApp iniciando...');

    // 1. VALIDAR CARRITO
    if (cart.length === 0) {
        showToast('error', 'El carrito está vacío');
        return;
    }

    // 2. VALIDAR FORMULARIO
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
        showToast('error', 'Por favor completa todos los campos obligatorios');
        return;
    }

    // 3. RECOPILAR DATOS
    const firstName = document.getElementById('checkoutFirstName').value.trim();
    const lastName = document.getElementById('checkoutLastName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const dni = document.getElementById('checkoutDni').value.trim();

    const shippingOption = document.querySelector('.shipping-option.active');
    const shippingType = shippingOption ? shippingOption.getAttribute('data-shipping') : 'domicilio';

    let shippingAddress = '';
    if (shippingType === 'domicilio') {
        const address = document.getElementById('checkoutAddress').value.trim();
        const city = document.getElementById('checkoutCity').value.trim();
        const state = document.getElementById('checkoutState').value.trim();
        const zipCode = document.getElementById('checkoutZipCode').value.trim();
        shippingAddress = `${address}, ${city}, ${state} (CP: ${zipCode})`;
    }

    const paymentMethodElement = document.querySelector('.payment-method.active');
    const paymentMethod = paymentMethodElement ? paymentMethodElement.getAttribute('data-method') : 'transferencia';

    const total = cart.reduce((total, item) => {
        const price = item.quantity >= item.wholesaleLimit ? item.wholesalePrice : item.price;
        return total + (price * item.quantity);
    }, 0);


    // Generar número de orden ANTES de crear orderData
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

    const orderData = {
        firstName,
        lastName,
        email,
        phone,
        dni,
        shipping: {
            type: shippingType,
            address: shippingAddress || (shippingType === 'local' ? 'Retiro en local' : '')
        },
        paymentMethod,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.quantity >= item.wholesaleLimit ? item.wholesalePrice : item.price,
            wholesalePrice: item.wholesalePrice,
            wholesaleLimit: item.wholesaleLimit,
            wholesale: item.quantity >= item.wholesaleLimit
        })),
        total,
        orderNumber: orderNumber, // Usar el número generado
        timestamp: new Date().toISOString() // Agregar timestamp
    };

    console.log('📋 Datos del pedido preparados:', orderData);

    // 4. VERIFICAR QUE SUPABASE CLIENT PÚBLICO EXISTA
    if (!window.supabaseClient || typeof window.supabaseClient.createOrder !== 'function') {
        console.error('❌ ERROR: window.supabaseClient no tiene createOrder');
        showToast('error', 'Error de configuración: No se puede guardar el pedido.');
        return;
    }

    // 5. GUARDAR EN SUPABASE (SOLO UNA VEZ, usando createOrder que ahora incluye items)
    try {
        console.log('💾 Guardando orden completa en Supabase...');
        const order = await window.supabaseClient.createOrder(orderData);

        if (!order || !order.id) {
            throw new Error('No se recibió un ID válido de la orden');
        }

        console.log('✅ Orden guardada en Supabase. ID:', order.id);

    } catch (supabaseError) {
        console.error('❌ ERROR CON SUPABASE:', supabaseError);
        showToast('warning',
            'Pedido guardado localmente. Error en base de datos: ' + supabaseError.message
        );
    }

    // 6. ENVIAR POR WHATSAPP (SIEMPRE)
    const whatsappMessage = generateWhatsAppMessage(orderData);
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappNumber = '5493584363974';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // 7. LIMPIAR CARRITO
    cart = [];
    updateCart();

    // 8. MOSTRAR ÉXITO
    showToast('success', '¡Redirigiendo a WhatsApp...');

    // 9. ABRIR WHATSAPP
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
    }, 1500);

    // 10. CERRAR MODAL
    setTimeout(() => {
        hideModal('checkout');
        resetCheckoutForm();
    }, 2000);
    // Después de procesar el pedido exitosamente
    setTimeout(() => {
        // Recargar pedidos para mostrar el nuevo
        if (currentUser) {
            loadOrdersFromSupabase();
        }
    }, 2000);
}

function generateWhatsAppMessage(orderData) {
    // Formatear fecha y hora correctamente
    const now = new Date();
    const date = now.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const time = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let message = `*NUEVO PEDIDO - Herrajería*\n\n`;
    message += `📋 *INFORMACIÓN DEL PEDIDO*\n`;
    message += `────────────────────────\n`;
    message += `• Número: ${orderData.orderNumber}\n`;
    message += `• Fecha: ${date}\n`;
    message += `• Hora: ${time}\n\n`;

    message += `👤 *DATOS DEL CLIENTE*\n`;
    message += `────────────────────────\n`;
    message += `• Nombre: ${orderData.firstName} ${orderData.lastName}\n`;
    message += `• Email: ${orderData.email}\n`;
    message += `• Teléfono: ${orderData.phone}\n`;
    message += `• DNI: ${orderData.dni}\n\n`;

    message += `🚚 *INFORMACIÓN DE ENVÍO*\n`;
    message += `────────────────────────\n`;
    if (orderData.shipping.type === 'domicilio') {
        message += `• Tipo: Envío a domicilio\n`;
        message += `• Dirección: ${orderData.shipping.address}\n`;
    } else {
        message += `• Tipo: Retiro en local\n`;
    }
    message += `\n`;

    message += `💳 *MÉTODO DE PAGO*\n`;
    message += `────────────────────────\n`;
    const paymentMethods = {
        'transferencia': 'Transferencia bancaria',
        'mercado-pago': 'Mercado Pago',
        'tarjeta': 'Tarjeta de crédito/débito',
        'efectivo': 'Efectivo'
    };
    message += `• ${paymentMethods[orderData.paymentMethod] || orderData.paymentMethod}\n\n`;

    message += `🛒 *DETALLE DEL PEDIDO*\n`;
    message += `────────────────────────\n`;

    orderData.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Cantidad: ${item.quantity} ${item.wholesale ? '(Precio mayorista)' : ''}\n`;
        message += `   Precio: $${item.price.toLocaleString('es-AR')} c/u\n`;
        message += `   Subtotal: $${itemTotal.toLocaleString('es-AR')}\n`;
        message += `   ──────────────\n`;
    });

    message += `\n💰 *RESUMEN DE TOTALES*\n`;
    message += `────────────────────────\n`;
    message += `Subtotal: $${orderData.total.toLocaleString('es-AR')}\n`;
    if (orderData.shipping.type === 'local') {
        message += `Envío: Gratis (Retiro en local)\n`;
    } else {
        message += `Envío: A coordinar\n`;
    }
    message += `────────────────────────\n`;
    message += `*TOTAL: $${orderData.total.toLocaleString('es-AR')}*\n\n`;

    message += `📝 *NOTAS*\n`;
    message += `────────────────────────\n`;
    message += `• Cliente solicita factura (DNI: ${orderData.dni})\n`;
    message += `• Por favor confirmar disponibilidad de productos\n`;
    message += `• Indicar tiempo estimado de entrega\n`;

    // Datos de transferencia (remover los placeholders)
    // Datos de transferencia (solo si es transferencia)
    if (orderData.paymentMethod === 'transferencia') {
        message += `\n🏦 *DATOS PARA TRANSFERENCIA*\n`;
        message += `────────────────────────\n`;
        message += `• Banco: Santander Río\n`;
        message += `• Titular: HERRAJERÍA [NOMBRE]\n`;
        message += `• CBU: 0720123456789012345678\n`;
        message += `• Alias: HERRAJERIA.ALIAS\n\n`;
        message += `*Por favor enviar comprobante por este mismo chat*\n`;
    }

    return message;
}
// Función para formatear fecha mejorada
function formatOrderDate(dateString) {
    if (!dateString) return 'Fecha no disponible';

    try {
        const date = new Date(dateString);

        // Formato completo
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleDateString('es-AR', options);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return dateString;
    }
}

// ============================================
// FUNCIONES DE PERFIL
// ============================================

function loadProfileData() {
    if (!currentUser) return;

    document.getElementById('profileFirstName').value = currentUser.firstName || '';
    document.getElementById('profileLastName').value = currentUser.lastName || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileCompany').value = currentUser.company || '';
    document.getElementById('profileCUIT').value = currentUser.cuit || '';

    const accountTypeBadge = document.getElementById('accountTypeBadge');
    if (accountTypeBadge) {
        const accountTypeText = currentUser.accountType === 'industrial' ? 'MAYORISTA' : 'MINORISTA';
        const accountTypeClass = currentUser.accountType === 'industrial' ? 'bg-warning' : 'bg-info';
        accountTypeBadge.innerHTML = `<span class="badge ${accountTypeClass}">${accountTypeText}</span>`;
    }

    loadUserOrders();
}

// ============================================
// FUNCIONES DE HISTORIAL DE PEDIDOS
// ============================================
// ============================================
// FUNCIONES DE HISTORIAL DE PEDIDOS
// ============================================
async function loadUserOrders() {
    console.log('📋 Cargando pedidos del usuario...');

    const ordersContainer = document.getElementById('ordersHistoryContainer');
    const ordersLoginMessage = document.getElementById('ordersLoginMessage');
    const ordersHistoryContent = document.getElementById('ordersHistoryContent');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const userOrdersList = document.getElementById('userOrdersList');

    // Mostrar/ocultar elementos según el estado del usuario
    if (!currentUser || !currentUser.email) {
        if (ordersLoginMessage) ordersLoginMessage.style.display = 'block';
        if (ordersHistoryContent) ordersHistoryContent.style.display = 'none';
        if (noOrdersMessage) noOrdersMessage.style.display = 'none';
        if (userOrdersList) {
            userOrdersList.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Inicia sesión para ver tus pedidos
                </div>
            `;
        }
        return;
    }

    // Ocultar mensaje de login
    if (ordersLoginMessage) ordersLoginMessage.style.display = 'none';
    if (ordersHistoryContent) ordersHistoryContent.style.display = 'block';

    // Mostrar loading
    const loadingHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando tus pedidos...</p>
        </div>
    `;

    if (ordersContainer) ordersContainer.innerHTML = loadingHTML;
    if (userOrdersList) userOrdersList.innerHTML = loadingHTML;

    try {
        // Cargar pedidos desde Supabase
        await loadOrdersFromSupabase();

        // Si no hay pedidos
        if (userOrders.length === 0) {
            if (noOrdersMessage) {
                noOrdersMessage.style.display = 'block';
                ordersHistoryContent.style.display = 'none';
            }
            if (userOrdersList) {
                userOrdersList.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-box-open"></i>
                        <p class="mt-2">No hay pedidos recientes</p>
                    </div>
                `;
            }
            return;
        }

        // Ocultar mensaje de no pedidos
        if (noOrdersMessage) noOrdersMessage.style.display = 'none';

        // Renderizar pedidos en el historial
        if (ordersContainer) {
            renderOrdersHistory(userOrders, ordersContainer);
        }

        // Renderizar pedidos recientes en el perfil (máximo 3)
        if (userOrdersList) {
            renderRecentOrders(userOrders.slice(0, 3), userOrdersList);
        }

    } catch (error) {
        console.error('❌ Error cargando pedidos:', error);

        const errorHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar los pedidos: ${error.message}
                <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadUserOrders()">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;

        if (ordersContainer) ordersContainer.innerHTML = errorHTML;
        if (userOrdersList) userOrdersList.innerHTML = errorHTML;
    }
}

function renderOrdersWithPagination() {
    const ordersContainer = document.getElementById('ordersHistoryContainer');
    if (!ordersContainer) return;

    // Calcular paginación
    const startIndex = (currentOrdersPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, userOrders.length);
    const ordersToShow = userOrders.slice(startIndex, endIndex);

    // Crear HTML con paginación arriba y abajo
    let html = `
        <div class="orders-pagination-top mb-4">
            ${createOrdersPagination(currentOrdersPage, Math.ceil(userOrders.length / ordersPerPage))}
        </div>
        
        <div class="orders-list">
    `;

    // Añadir cada pedido
    ordersToShow.forEach(order => {
        html += createOrderCard(order);
    });

    html += `
        </div>
        
        <div class="orders-pagination-bottom mt-4">
            ${createOrdersPagination(currentOrdersPage, Math.ceil(userOrders.length / ordersPerPage))}
        </div>
    `;

    ordersContainer.innerHTML = html;

    // Actualizar contador
    const ordersSummary = document.getElementById('ordersSummary');
    if (ordersSummary) {
        ordersSummary.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${userOrders.length} pedidos`;
    }
}

// Función para renderizar pedidos recientes en el perfil
function renderRecentOrders(orders, container) {
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-box-open"></i>
                <p class="mt-2 mb-0">No hay pedidos recientes</p>
            </div>
        `;
        return;
    }

    let recentOrdersHTML = '';

    orders.forEach(order => {
        const orderDate = formatOrderDate(order.created_at || order.date);
        const total = order.total_amount || order.total || 0;

        // Contar productos
        let productCount = 0;
        if (Array.isArray(order.items)) {
            productCount = order.items.length;
        } else if (order.order_items && Array.isArray(order.order_items)) {
            productCount = order.order_items.length;
        }

        recentOrdersHTML += `
            <div class="card mb-2">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1 fw-bold">Pedido #${order.invoice_number || order.id}</h6>
                            <small class="text-muted d-block">
                                <i class="fas fa-calendar me-1"></i>${orderDate}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-box me-1"></i>${productCount} producto(s)
                            </small>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-primary">$${parseFloat(total).toLocaleString('es-AR')}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" 
                                    onclick="showOrderDetails('${order.id}')">
                                <i class="fas fa-eye me-1"></i> Ver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Si hay más de 3 pedidos, agregar botón para ver más
    if (userOrders.length > 3) {
        recentOrdersHTML += `
            <div class="text-center mt-3">
                <button class="btn btn-outline-primary btn-sm" onclick="showModal('ordersHistory')">
                    <i class="fas fa-history me-1"></i>Ver todos los pedidos (${userOrders.length})
                </button>
            </div>
        `;
    }

    container.innerHTML = recentOrdersHTML;
}

// Nueva función para mostrar detalles de un pedido específico
function showOrderDetails(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('error', 'No se encontró el pedido');
        return;
    }

    // Formatear fecha
    const orderDate = formatOrderDate(order.created_at || order.date);
    const total = order.total_amount || order.total || 0;

    // Obtener items
    let itemsArray = [];
    if (Array.isArray(order.items)) {
        itemsArray = order.items;
    } else if (order.order_items && Array.isArray(order.order_items)) {
        itemsArray = order.order_items.map(oi => ({
            name: oi.product_name || oi.products?.name || 'Producto',
            quantity: oi.quantity,
            price: oi.price
        }));
    }

    // Crear modal de detalles
    const modalHTML = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt me-2"></i>Detalles del Pedido
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="card mb-3">
                            <div class="card-header bg-light">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 class="mb-0">Pedido #${order.invoice_number || order.id}</h4>
                                        <small class="text-muted">
                                            <i class="fas fa-calendar me-1"></i>${orderDate}
                                        </small>
                                    </div>
                                    <div class="h3 text-primary mb-0">$${parseFloat(total).toLocaleString('es-AR')}</div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <h5><i class="fas fa-user me-2"></i>Cliente</h5>
                                        <p><strong>Nombre:</strong> ${order.customer_name}</p>
                                        <p><strong>Email:</strong> ${order.customer_email}</p>
                                        <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
                                        ${order.customer_dni ? `<p><strong>DNI:</strong> ${order.customer_dni}</p>` : ''}
                                    </div>
                                    <div class="col-md-6">
                                        <h5><i class="fas fa-truck me-2"></i>Envío y Pago</h5>
                                        <p><strong>Método de envío:</strong> ${order.shipping_type === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
                                        ${order.shipping_address ? `<p><strong>Dirección:</strong> ${order.shipping_address}</p>` : ''}
                                        <p><strong>Pago:</strong> ${getPaymentMethodText(order.payment_method || order.paymentMethod)}</p>
                                    </div>
                                </div>
                                
                                <h5><i class="fas fa-boxes me-2"></i>Productos (${itemsArray.length})</h5>
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Producto</th>
                                                <th class="text-center">Cantidad</th>
                                                <th class="text-end">Precio Unitario</th>
                                                <th class="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsArray.map(item => {
        const itemTotal = item.price * item.quantity;
        return `
                                                    <tr>
                                                        <td>
                                                            <div class="d-flex align-items-center">
                                                                <div>
                                                                    <div class="fw-semibold">${item.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td class="text-center">${item.quantity}</td>
                                                        <td class="text-end">$${item.price.toLocaleString('es-AR')}</td>
                                                        <td class="text-end">$${itemTotal.toLocaleString('es-AR')}</td>
                                                    </tr>
                                                `;
    }).join('')}
                                        </tbody>
                                        <tfoot class="table-light">
                                            <tr>
                                                <td colspan="3" class="text-end fw-bold">Total del Pedido:</td>
                                                <td class="text-end fw-bold text-primary">$${parseFloat(total).toLocaleString('es-AR')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                
                                ${order.notes ? `
                                <div class="mt-4">
                                    <h5><i class="fas fa-sticky-note me-2"></i>Notas Adicionales</h5>
                                    <div class="alert alert-info">
                                        <p class="mb-0">${order.notes}</p>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-primary" onclick="repeatOrder('${order.id}')">
                                <i class="fas fa-redo me-1"></i> Repetir Pedido
                            </button>
                            <button class="btn btn-primary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al DOM
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar modal
    const modalElement = document.getElementById('orderDetailsModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Limpiar modal al cerrar
    modalElement.addEventListener('hidden.bs.modal', function () {
        modalElement.remove();
    });
}


async function loadOrdersFromSupabase() {
    try {
        console.log('🔄 Cargando pedidos desde Supabase...');

        if (!currentUser || !currentUser.email) {
            console.log('❌ No hay usuario logueado');
            userOrders = [];
            return;
        }

        console.log(`🔍 Buscando pedidos para: ${currentUser.email}`);

        // Cargar pedidos
        if (window.supabaseClient && window.supabaseClient.getUserOrders) {
            userOrders = await window.supabaseClient.getUserOrders(currentUser.email);
        } else {
            userOrders = await getOrdersFromSupabase(currentUser.email);
        }

        console.log(`✅ ${userOrders.length} pedidos recibidos`);

        // Ordenar por fecha más reciente
        userOrders.sort((a, b) => {
            const dateA = new Date(a.created_at || a.date || 0);
            const dateB = new Date(b.created_at || b.date || 0);
            return dateB - dateA;
        });

        // Guardar en localStorage para offline
        localStorage.setItem('nombreSitioOrders', JSON.stringify(userOrders));

        // Actualizar UI - ¡IMPORTANTE! Siempre usar la misma visualización
        updateOrdersUI();

    } catch (error) {
        console.error('❌ Error cargando pedidos:', error);

        // Intentar cargar desde localStorage
        try {
            const savedOrders = localStorage.getItem('nombreSitioOrders');
            if (savedOrders) {
                userOrders = JSON.parse(savedOrders);
                updateOrdersUI();
            }
        } catch (error) {
            userOrders = [];
        }
    }
}
// Función auxiliar para actualizar la UI de pedidos
function updateOrdersUI() {
    const ordersContainer = document.getElementById('ordersHistoryContainer');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const ordersHistoryContent = document.getElementById('ordersHistoryContent');
    const ordersLoginMessage = document.getElementById('ordersLoginMessage');

    // Mostrar/ocultar mensajes según estado
    if (!currentUser || !currentUser.email) {
        if (ordersLoginMessage) ordersLoginMessage.style.display = 'block';
        if (ordersHistoryContent) ordersHistoryContent.style.display = 'none';
        return;
    }

    if (ordersLoginMessage) ordersLoginMessage.style.display = 'none';
    if (ordersHistoryContent) ordersHistoryContent.style.display = 'block';

    // Si no hay pedidos
    if (userOrders.length === 0) {
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay pedidos en tu historial</h5>
                    <p class="text-muted">Realiza tu primer pedido para verlo aquí</p>
                   
                </div>
            `;
        }
        return;
    }

    if (noOrdersMessage) noOrdersMessage.style.display = 'none';

    // Siempre usar la misma plantilla con paginación
    renderOrdersWithPagination();
}


// Función para crear orden en Supabase cuando se envía a WhatsApp
async function createOrderInDatabase(orderData) {
    try {
        console.log('📦 Creando orden en base de datos...', orderData);

        const response = await fetch('https://opueqifkagoonpbubflj.supabase.co/rest/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdWVxaWZrYWdvb25wYnViZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc3OTksImV4cCI6MjA3ODkyMzc5OX0.8ES1VbCKOu79JrMpPNTkUuDZmo9MOHsVZunui4CJYSI',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdWVxaWZrYWdvb25wYnViZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc3OTksImV4cCI6MjA3ODkyMzc5OX0.8ES1VbCKOu79JrMpPNTkUuDZmo9MOHsVZunui4CJYSI'
            },
            body: JSON.stringify({
                customer_name: orderData.nombre,
                customer_phone: orderData.telefono,
                customer_email: orderData.email || 'no-especificado@cliente.com',
                invoice_number: `WHATSAPP-${Date.now()}`,
                status: 'pending',
                payment_method: 'Acordar por WhatsApp',
                total_amount: orderData.total,
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Error creando orden');
        }

        const order = await response.json();
        console.log('✅ Orden creada en BD:', order);
        return order;

    } catch (error) {
        console.error('❌ Error creando orden en BD:', error);
        // No detener el flujo aunque falle
        return null;
    }
}

// Llamar esta función cuando se envía el pedido a WhatsApp



function repeatOrder(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('error', 'No se encontró el pedido');
        return;
    }

    cart = [];

    order.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            addToCart(product.id, item.quantity);
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                wholesalePrice: item.price,
                wholesaleLimit: 1,
                image: item.image || getDefaultImage(item.name),
                quantity: item.quantity
            });
        }
    });

    updateCart();
    showToast('success', 'Pedido agregado al carrito');
    hideModal('ordersHistory');
}

function contactAboutOrder(orderId) {
    const order = userOrders.find(o => o.id === orderId);
    if (!order) return;

    // Usar formato seguro para la fecha
    const orderDate = formatOrderDate(order.created_at || order.date || new Date());
    
    // Usar el número de pedido correcto (invoice_number o id)
    const orderNumber = order.invoice_number || order.id;
    
    const message = `Hola, tengo una consulta sobre mi pedido #${orderNumber} realizado el ${orderDate}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5493584363974';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}

function formatOrderDate(dateString) {
    if (!dateString) {
        return 'Fecha no disponible';
    }

    try {
        // Si es una string, convertir a Date
        const date = new Date(dateString);
        
        // Verificar si es una fecha válida
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }

        // Formato amigable en español
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleDateString('es-AR', options);
    } catch (error) {
        console.error('Error formateando fecha:', error, dateString);
        return 'Fecha inválida';
    }
}
function showFullInvoice(orderId) {
    console.log('Mostrando factura completa para orden:', orderId);

    // Aquí deberías obtener los detalles de la orden desde Supabase
    if (!window.supabaseClient || !window.supabaseClient.client) {
        showToast('error', 'Error de conexión');
        return;
    }

    // Mostrar loading
    showModal('invoiceModal');
    document.getElementById('invoiceContent').innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando factura...</p>
        </div>
    `;

    // Obtener datos de la orden
    window.supabaseClient.client
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()
        .then(({ data: order, error }) => {
            if (error) {
                console.error('Error obteniendo orden:', error);
                document.getElementById('invoiceContent').innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la factura: ${error.message}
                    </div>
                `;
                return;
            }

            // Renderizar factura
            renderInvoice(order);
        });
}
// En app.js, REEMPLAZAR completamente la función renderInvoice:
function renderInvoice(order) {
    const formattedDate = formatOrderDate(order.created_at || order.date);
    
    const paymentMethod = getPaymentMethodText(order.payment_method || order.paymentMethod);

    // Obtener items de forma segura
    let orderItems = [];
    let total = order.total_amount || order.total || 0;

    // Manejar diferentes formatos de items
    if (Array.isArray(order.items) && order.items.length > 0) {
        // Caso 1: items es un array JSONB
        orderItems = order.items.map(item => ({
            id: item.product_id || item.id,
            name: item.product_name || item.name || 'Producto no especificado',
            quantity: item.quantity || 1,
            price: item.price || 0,
            wholesale: item.is_wholesale || false
        }));
    } else if (typeof order.items === 'string') {
        // Caso 2: items es una string JSON
        try {
            const parsedItems = JSON.parse(order.items);
            if (Array.isArray(parsedItems)) {
                orderItems = parsedItems.map(item => ({
                    id: item.product_id || item.id,
                    name: item.product_name || item.name || 'Producto no especificado',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    wholesale: item.is_wholesale || false
                }));
            }
        } catch (error) {
            console.error('Error parseando items:', error);
            orderItems = [{
                id: 'error',
                name: 'Error cargando productos',
                quantity: 1,
                price: 0,
                wholesale: false
            }];
        }
    }

    // Si aún no hay items pero hay order_items relacionales
    if (orderItems.length === 0 && order.order_items && Array.isArray(order.order_items)) {
        orderItems = order.order_items.map(oi => ({
            id: oi.product_id,
            name: oi.product_name || oi.products?.name || 'Producto',
            quantity: oi.quantity,
            price: oi.price,
            wholesale: oi.is_wholesale || false
        }));
    }

    // Calcular total si no está definido
    if (!total && orderItems.length > 0) {
        total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Generar HTML de factura
    return `
        <div class="invoice-container">
            <div class="invoice-header bg-light p-4 rounded mb-4">
                <div class="row">
                    <div class="col-md-6">
                        <h3 class="mb-1">Herraje RioIv</h3>
                        <p class="text-muted mb-0">Materiales Industriales Premium</p>
                        <p class="mb-0"><i class="fas fa-map-marker-alt me-2"></i>Av. Industrial 2450, Parque Industrial</p>
                        <p class="mb-0"><i class="fas fa-phone me-2"></i>+54 358 1234-5678</p>
                        <p class="mb-0"><i class="fas fa-envelope me-2"></i>HerrajeRioIv@gmail.com</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <h4 class="text-primary mb-2">FACTURA</h4>
                        <p class="mb-1"><strong>N°:</strong> ${order.invoice_number || order.id}</p>
                        <p class="mb-1"><strong>Fecha:</strong> ${formattedDate}</p>
                        
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0"><i class="fas fa-user me-2"></i>DATOS DEL CLIENTE</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Nombre/Razón Social:</strong><br>
                            ${order.customer_name || (order.customer?.firstName + ' ' + order.customer?.lastName) || 'Cliente'}</p>
                            <p class="mb-2"><strong>Email:</strong> ${order.customer_email || order.customer?.email || 'Sin email'}</p>
                            <p class="mb-2"><strong>Teléfono:</strong> ${order.customer_phone || order.customer?.phone || 'Sin teléfono'}</p>
                            ${order.customer_dni ? `<p class="mb-2"><strong>DNI/CUIT:</strong> ${order.customer_dni}</p>` : ''}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0"><i class="fas fa-truck me-2"></i>DATOS DE ENVÍO Y PAGO</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Método de envío:</strong> ${order.shipping_type === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
                            ${order.shipping_address ? `<p class="mb-2"><strong>Dirección:</strong> ${order.shipping_address}</p>` : ''}
                            <p class="mb-2"><strong>Método de pago:</strong> ${paymentMethod}</p>
                            <p class="mb-2"><strong>Total Factura:</strong> 
                                <span class="h4 text-primary">$${total.toLocaleString('es-AR')}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-dark text-white">
                    <h6 class="mb-0"><i class="fas fa-boxes me-2"></i>DETALLE DE PRODUCTOS (${orderItems.length})</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="45%">Descripción</th>
                                    <th width="15%" class="text-center">Cantidad</th>
                                    <th width="15%" class="text-end">Precio Unitario</th>
                                    <th width="20%" class="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItems.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        const productName = item.name || `Producto ${index + 1}`;
        return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>
                                                <strong>${productName}</strong>
                                                ${item.wholesale ? '<br><small class="text-success">Precio mayorista</small>' : ''}
                                            </td>
                                            <td class="text-center">${item.quantity}</td>
                                            <td class="text-end">$${item.price.toLocaleString('es-AR')}</td>
                                            <td class="text-end fw-semibold">$${itemTotal.toLocaleString('es-AR')}</td>
                                        </tr>
                                    `;
    }).join('')}
                            </tbody>
                            <tfoot class="table-light">
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">SUBTOTAL:</td>
                                    <td class="text-end fw-bold">$${total.toLocaleString('es-AR')}</td>
                                </tr>
                                ${order.shipping_type === 'domicilio' ? `
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">ENVÍO:</td>
                                    <td class="text-end fw-bold">A coordinar</td>
                                </tr>
                                ` : ''}
                                <tr class="table-primary">
                                    <td colspan="4" class="text-end fw-bold h5">TOTAL:</td>
                                    <td class="text-end fw-bold h5">$${total.toLocaleString('es-AR')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>INFORMACIÓN ADICIONAL</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-1"><strong>Vendedor:</strong> Herraje RioIv Online</p>
                            <p class="mb-1"><strong>Condición de venta:</strong> Contado</p>
                            <p class="mb-1"><strong>Tipo de factura:</strong> Consumidor Final</p>
                            <p class="mb-0"><strong>Fecha de vencimiento:</strong> Al momento del pago</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0"><i class="fas fa-sticky-note me-2"></i>OBSERVACIONES</h6>
                        </div>
                        <div class="card-body">
                            ${order.notes ? `<p>${order.notes}</p>` : '<p class="text-muted">Sin observaciones</p>'}
                            <p class="mb-0 small text-muted">Esta factura es válida como comprobante de compra.</p>
                            <p class="mb-0 small text-muted">Conserve este documento para cualquier reclamo o garantía.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-top text-center">
                <p class="text-muted small">
                    <i class="fas fa-shield-alt me-1"></i>
                    Garantía de 30 días contra defectos de fabricación.
                    Para consultas: HerrajeRioIv@gmail.com | +54 358 1234-5678
                </p>
                <p class="small">Herraje RioIv © ${new Date().getFullYear()} - Todos los derechos reservados</p>
            </div>
        </div>
    `;
}

// Función para imprimir factura
function printInvoice() {
    const printContent = document.querySelector('.invoice-container').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;

    // Re-cargar la página para restaurar eventos
    location.reload();
}
// ============================================
// FUNCIÓN PARA GENERAR PDF DEL PEDIDO
// ============================================
function generateOrderPDF(order) {
    try {
        console.log('📄 Generando PDF para pedido:', order.id);

        // Importar jsPDF
        const { jsPDF } = window.jspdf;

        // Crear documento PDF en formato A4 (vertical)
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let currentY = 15; // Posición vertical inicial

        // ===== ENCABEZADO MÁS COMPACTO =====
        doc.setFontSize(16); // Reducido de 20
        doc.setFont(undefined, 'bold');
        doc.text('Herraje RioIv', pageWidth / 2, currentY, { align: 'center' });

        currentY += 5; // Reducido de 7
        doc.setFontSize(10); // Reducido de 14
        doc.setFont(undefined, 'normal');
        doc.text('Materiales Industriales Premium', pageWidth / 2, currentY, { align: 'center' });

        currentY += 4; // Reducido de 5
        doc.setFontSize(8); // Reducido de 10
        doc.text('Av. Industrial 2450, Parque Industrial', pageWidth / 2, currentY, { align: 'center' });
        currentY += 3; // Reducido de 4
        doc.text('Tel: +54 358 1234-5678 | Email: HerrajeRioIv@gmail.com', pageWidth / 2, currentY, { align: 'center' });

        currentY += 8; // Reducido de 10

        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(15, currentY, pageWidth - 15, currentY);
        currentY += 8; // Reducido de 10

        // ===== INFORMACIÓN DEL PEDIDO =====
        doc.setFontSize(14); // Reducido de 16
        doc.setFont(undefined, 'bold');
        doc.text('COMPROBANTE DE PEDIDO', pageWidth / 2, currentY, { align: 'center' });

        currentY += 6; // Reducido de 8

        // Información del pedido en dos columnas MÁS COMPACTA
        doc.setFontSize(9); // Reducido de 10
        doc.setFont(undefined, 'normal');

        // Columna izquierda
        doc.text(`N° Pedido: ${order.invoice_number || order.id}`, 20, currentY);
        doc.text(`Fecha: ${formatOrderDate(order.created_at || order.date)}`, 20, currentY + 4); // Reducido de 5
        doc.text(`Cliente: ${order.customer_name || 'Cliente'}`, 20, currentY + 8); // Reducido de 10

        // Columna derecha
        doc.text(`Email: ${order.customer_email || ''}`, pageWidth - 20, currentY, { align: 'right' });
        doc.text(`Teléfono: ${order.customer_phone || ''}`, pageWidth - 20, currentY + 4, { align: 'right' });
        if (order.customer_dni) {
            doc.text(`DNI: ${order.customer_dni}`, pageWidth - 20, currentY + 8, { align: 'right' });
        }

        currentY += 15; // Reducido de 20

        // ===== TABLA DE PRODUCTOS OPTIMIZADA =====
        // Obtener items del pedido
        let orderItems = [];
        if (Array.isArray(order.items) && order.items.length > 0) {
            orderItems = order.items.map(item => ({
                producto: item.product_name || item.name || 'Producto',
                cantidad: item.quantity || 1,
                precio: `$${(item.price || 0).toLocaleString('es-AR')}`,
                subtotal: `$${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-AR')}`
            }));
        } else if (typeof order.items === 'string') {
            try {
                const parsed = JSON.parse(order.items);
                if (Array.isArray(parsed)) {
                    orderItems = parsed.map(item => ({
                        producto: item.product_name || item.name || 'Producto',
                        cantidad: item.quantity || 1,
                        precio: `$${(item.price || 0).toLocaleString('es-AR')}`,
                        subtotal: `$${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-AR')}`
                    }));
                }
            } catch (e) {
                console.error('Error parsing items:', e);
            }
        }

        // Encabezados de la tabla
        const headers = [['Producto', 'Cant.', 'P. Unit.', 'Subtotal']]; // Encabezados más cortos

        // Datos de la tabla
        const data = orderItems.map(item => [
            item.producto.length > 30 ? item.producto.substring(0, 27) + '...' : item.producto, // Más corto
            item.cantidad,
            item.precio,
            item.subtotal
        ]);

        // Agregar fila de total
        const total = order.total_amount || order.total || 0;
        data.push(['', '', 'TOTAL:', `$${parseFloat(total).toLocaleString('es-AR')}`]);

        // Generar tabla con autoTable COMPACTA
        doc.autoTable({
            startY: currentY,
            head: headers,
            body: data,
            theme: 'grid',
            styles: {
                fontSize: 8, // Reducido de 9
                cellPadding: 2, // Reducido de 3
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 15, halign: 'center' }, // Reducido de 20
                2: { cellWidth: 25, halign: 'right' }, // Reducido de 30
                3: { cellWidth: 25, halign: 'right', fontStyle: 'bold' } // Reducido de 30
            },
            margin: { left: 15, right: 15 },
            didDrawPage: function (data) {
                currentY = data.cursor.y + 5; // Reducido de 10
            }
        });

        // Actualizar posición Y después de la tabla
        currentY = doc.lastAutoTable.finalY + 5; // Reducido de 10

        // ===== INFORMACIÓN ADICIONAL COMPACTA =====
        doc.setFontSize(10); // Reducido de 11
        doc.setFont(undefined, 'bold');
        doc.text('INFORMACIÓN ADICIONAL', 15, currentY);

        currentY += 5; // Reducido de 7

        doc.setFontSize(9); // Reducido de 10
        doc.setFont(undefined, 'normal');

        // Método de envío
        const shippingType = order.shipping_type === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local';
        doc.text(`• Envío: ${shippingType}`, 20, currentY); // Texto más corto

        if (order.shipping_address) {
            currentY += 4; // Reducido de 5
            // Acortar dirección si es muy larga
            const shortAddress = order.shipping_address.length > 60 ?
                order.shipping_address.substring(0, 57) + '...' : order.shipping_address;
            doc.text(`• Dirección: ${shortAddress}`, 20, currentY);
        }

        // Método de pago
        currentY += 4; // Reducido de 5
        const paymentMethod = getPaymentMethodText(order.payment_method || order.paymentMethod);
        const shortPayment = paymentMethod.length > 40 ?
            paymentMethod.substring(0, 37) + '...' : paymentMethod;
        doc.text(`• Pago: ${shortPayment}`, 20, currentY);

        // Notas si existen
        if (order.notes) {
            currentY += 4; // Reducido de 5
            const shortNotes = order.notes.length > 80 ?
                order.notes.substring(0, 77) + '...' : order.notes;
            doc.text(`• Notas: ${shortNotes}`, 20, currentY);
        }

        currentY += 10; // Reducido de 15

        // ===== FOOTER COMPACTO =====
        doc.setFontSize(8); // Reducido de 9
        doc.setFont(undefined, 'italic');
        doc.text('Documento válido como comprobante.', pageWidth / 2, currentY, { align: 'center' });
        currentY += 4; // Reducido de 5
        doc.text('Conserve para reclamos o garantías.', pageWidth / 2, currentY, { align: 'center' });

        currentY += 8; // Reducido de 10

        // Línea final
        doc.setDrawColor(200, 200, 200);
        doc.line(15, currentY, pageWidth - 15, currentY);

        currentY += 4; // Reducido de 5
        doc.setFontSize(7); // Reducido de 8
        doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, currentY, { align: 'center' });

        // ===== GUARDAR PDF =====
        const fileName = `Pedido_${order.invoice_number || order.id}.pdf`;
        doc.save(fileName);

        showToast('success', 'PDF generado correctamente');

    } catch (error) {
        console.error('❌ Error generando PDF:', error);
        showToast('error', 'Error al generar el PDF: ' + error.message);
    }
}
// Función auxiliar para acortar texto si es muy largo
function shortenText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function closeInvoiceModal() {
    hideModal('invoiceModal');
}

// Añade este modal a tu HTML si no existe:
// <div class="modal fade" id="invoiceModal" tabindex="-1">
//   <div class="modal-dialog modal-lg">
//     <div class="modal-content">
//       <div class="modal-header">
//         <h5 class="modal-title">Factura Completa</h5>
//         <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
//       </div>
//       <div class="modal-body">
//         <div id="invoiceContent"></div>
//       </div>
//     </div>
//   </div>
// </div>

// ============================================
// FUNCIONES DE HISTORIAL DE PEDIDOS (PAGINACIÓN)
// ============================================



function viewOrderDetails(orderId) {
    console.log(`Mostrando detalles del pedido: ${orderId}`);

    const order = userOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('error', 'No se encontró el pedido');
        return;
    }

    const paymentMethod = getPaymentMethodText(order.paymentMethod);
    

    const orderDetailsHTML = `
        <div class="order-details-modal">
            <div class="order-details-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h4>Detalles del Pedido #${order.id}</h4>
                    ${statusBadge}
                </div>
                <div class="order-details-meta">
                    <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>${order.date} ${order.time}
                    </small>
                </div>
            </div>
            
            <div class="order-details-body">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header bg-light">
                                <h6 class="mb-0"><i class="fas fa-user me-2"></i>Información del Cliente</h6>
                            </div>
                            <div class="card-body">
                                <p class="mb-1"><strong>Nombre:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
                                <p class="mb-1"><strong>Email:</strong> ${order.customer.email}</p>
                                <p class="mb-1"><strong>Teléfono:</strong> ${order.customer.phone}</p>
                                <p class="mb-1"><strong>DNI:</strong> ${order.customer.dni}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header bg-light">
                                <h6 class="mb-0"><i class="fas fa-shipping-fast me-2"></i>Información de Envío y Pago</h6>
                            </div>
                            <div class="card-body">
                                <p class="mb-1"><strong>Método de envío:</strong> ${order.shipping.type === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
                                ${order.shipping.address ? `<p class="mb-1"><strong>Dirección:</strong> ${order.shipping.address}</p>` : ''}
                                <p class="mb-1"><strong>Método de pago:</strong> ${paymentMethod}</p>
                                <p class="mb-1"><strong>Total:</strong> <span class="text-primary fw-bold">$${order.total.toLocaleString('es-AR')}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-boxes me-2"></i>Productos del Pedido</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th class="text-center">Cantidad</th>
                                        <th class="text-center">Precio Unitario</th>
                                        <th class="text-end">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.items.map(item => `
                                        <tr>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img src="${item.image || getDefaultImage(item.name)}" 
                                                         class="me-2" 
                                                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                                                    <div>
                                                        <div class="fw-semibold">${item.name}</div>
                                                        ${item.wholesale ? '<small class="text-success">Precio mayorista</small>' : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-center">${item.quantity}</td>
                                            <td class="text-center">$${item.price.toLocaleString('es-AR')}</td>
                                            <td class="text-end fw-semibold">$${(item.price * item.quantity).toLocaleString('es-AR')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot class="table-light">
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">Total del Pedido:</td>
                                        <td class="text-end fw-bold text-primary">$${order.total.toLocaleString('es-AR')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                
                ${order.notes ? `
                <div class="card mt-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-sticky-note me-2"></i>Notas Adicionales</h6>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${order.notes}</p>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="order-details-footer mt-4">
                <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-primary" onclick="repeatOrder('${order.id}')">
                        <i class="fas fa-redo me-1"></i> Repetir Pedido
                    </button>
                    <div>
                        <button class="btn btn-outline-secondary me-2" onclick="contactAboutOrder('${order.id}')">
                            <i class="fas fa-comment me-1"></i> Consultar
                        </button>
                        <button class="btn btn-primary" onclick="closeOrderDetails()">
                            <i class="fas fa-times me-1"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal fade';
    modalContainer.id = 'orderDetailsModal';
    modalContainer.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalles del Pedido</h5>
                    <button type="button" class="btn-close" onclick="closeOrderDetails()"></button>
                </div>
                <div class="modal-body">
                    ${orderDetailsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalContainer);

    const modalElement = document.getElementById('orderDetailsModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    modalElement.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}

function closeOrderDetails() {
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        document.body.removeChild(modalElement);
    }
}

function loadUserOrdersWithPagination(page = 1) {


    const ordersContainer = document.getElementById('ordersHistoryContainer');
    const ordersSummary = document.getElementById('ordersSummary');
    const ordersCountBadge = document.getElementById('ordersCountBadge');
    const ordersPaginationTop = document.getElementById('ordersPaginationTop');
    const ordersPaginationBottom = document.getElementById('ordersPaginationBottom');
    const userOrdersList = document.getElementById('userOrdersList');


    if (ordersCountBadge) {
        ordersCountBadge.textContent = userOrders.length;
    }

    if (ordersSummary) {
        const startIndex = (page - 1) * ordersPerPage + 1;
        const endIndex = Math.min(page * ordersPerPage, userOrders.length);
        ordersSummary.textContent = `Mostrando pedidos ${startIndex} a ${endIndex} de ${userOrders.length} totales`;
    }

    if (!currentUser) {
        const message = `
            <div class="text-center py-4">
                <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Inicia sesión para ver tus pedidos</h5>
                <p class="text-muted">Necesitas tener una cuenta para ver el historial de pedidos</p>
                <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
                </button>
            </div>
        `;

        if (ordersContainer) ordersContainer.innerHTML = message;
        if (ordersPaginationTop) ordersPaginationTop.innerHTML = '';
        if (ordersPaginationBottom) ordersPaginationBottom.innerHTML = '';
        if (userOrdersList) userOrdersList.innerHTML = message;
        return;
    }

    if (userOrders.length === 0) {
        const noOrdersMessage = `
            <div class="text-center py-4">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No hay pedidos anteriores</h5>
                <p class="text-muted">Realiza tu primer pedido para verlo aquí</p>
                
            </div>
        `;

        if (ordersContainer) ordersContainer.innerHTML = noOrdersMessage;
        if (ordersPaginationTop) ordersPaginationTop.innerHTML = '';
        if (ordersPaginationBottom) ordersPaginationBottom.innerHTML = '';
        if (userOrdersList) userOrdersList.innerHTML = noOrdersMessage;
        return;
    }

    const totalOrders = userOrders.length;
    totalOrdersPages = Math.ceil(totalOrders / ordersPerPage);
    const startIndex = (page - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, totalOrders);
    const ordersToShow = userOrders.slice(startIndex, endIndex);

    if (ordersContainer) {
        let ordersHTML = '';

        if (ordersToShow.length === 0) {
            ordersHTML = `
                <div class="text-center py-4">
                    <p class="text-muted">No hay pedidos en esta página</p>
                </div>
            `;
        } else {
            ordersToShow.forEach(order => {
                ordersHTML += createOrderCard(order);
            });
        }

        ordersContainer.innerHTML = ordersHTML;
    }

    const paginationHTML = createOrdersPagination(page, totalOrdersPages);

    if (ordersPaginationTop) ordersPaginationTop.innerHTML = paginationHTML;
    if (ordersPaginationBottom) ordersPaginationBottom.innerHTML = paginationHTML;

    if (userOrdersList) {
        userOrdersList.innerHTML = '';
        const recentOrders = userOrders.slice(0, 3);

        if (recentOrders.length === 0) {
            userOrdersList.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-box-open"></i>
                   
                </div>
            `;
            return;
        }

        recentOrders.forEach(order => {
            const orderItem = createOrderListItem(order);
            userOrdersList.innerHTML += orderItem;
        });
    }
}

function createOrdersPagination(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    let paginationHTML = `
        <nav aria-label="Paginación de pedidos" class="mt-4">
            <ul class="pagination justify-content-center">
    `;

    if (currentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <button class="page-link" onclick="changeOrdersPage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </li>
        `;
    } else {
        paginationHTML += `
            <li class="page-item disabled">
                <span class="page-link"><i class="fas fa-chevron-left"></i></span>
            </li>
        `;
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `
                <li class="page-item active">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item">
                    <button class="page-link" onclick="changeOrdersPage(${i})">${i}</button>
                </li>
            `;
        }
    }

    if (currentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <button class="page-link" onclick="changeOrdersPage(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;
    } else {
        paginationHTML += `
            <li class="page-item disabled">
                <span class="page-link"><i class="fas fa-chevron-right"></i></span>
            </li>
        `;
    }

    paginationHTML += `
            </ul>
            <div class="text-center text-muted mt-2">
                Mostrando pedidos ${(currentPage - 1) * ordersPerPage + 1} a ${Math.min(currentPage * ordersPerPage, userOrders.length)} de ${userOrders.length} totales
            </div>
        </nav>
    `;

    return paginationHTML;
}

function changeOrdersPage(page) {
    if (page < 1 || page > totalOrdersPages) return;
    currentOrdersPage = page;
    loadUserOrdersWithPagination(page);

    const ordersContainer = document.getElementById('ordersHistoryContainer');
    if (ordersContainer) {
        ordersContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function loadUserOrders() {
    loadUserOrdersWithPagination(currentOrdersPage);

}
function createOrderCard(order) {
    const statusBadge = getOrderStatusBadge(order.status);
    const paymentMethod = getPaymentMethodText(order.payment_method || order.paymentMethod);
    const formattedDate = formatOrderDate(order.created_at || order.date);
    

    // Obtener items de forma segura
    let orderItems = [];
    let total = order.total_amount || order.total || 0;

    // Manejar diferentes formatos de items
    if (Array.isArray(order.items) && order.items.length > 0) {
        orderItems = order.items.map(item => ({
            id: item.product_id || item.id,
            name: item.product_name || item.name || 'Producto no especificado',
            quantity: item.quantity || 1,
            price: item.price || 0,
            wholesale: item.is_wholesale || false
        }));
    } else if (typeof order.items === 'string') {
        try {
            const parsedItems = JSON.parse(order.items);
            if (Array.isArray(parsedItems)) {
                orderItems = parsedItems.map(item => ({
                    id: item.product_id || item.id,
                    name: item.product_name || item.name || 'Producto no especificado',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    wholesale: item.is_wholesale || false
                }));
            }
        } catch (error) {
            console.error('Error parseando items:', error);
        }
    }

    // Calcular total si no está definido
    if (!total && orderItems.length > 0) {
        total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    return `
        <div class="card order-card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">Pedido #${order.invoice_number || order.id}</h6>
                    <small class="text-muted">${formattedDate}</small>
                </div>
                
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6><i class="fas fa-user me-2"></i>Información del Cliente</h6>
                        <p class="mb-1"><strong>Nombre:</strong> ${order.customer_name || 'Cliente no especificado'}</p>
                        <p class="mb-1"><strong>Email:</strong> ${order.customer_email || 'Sin email'}</p>
                        <p class="mb-1"><strong>Teléfono:</strong> ${order.customer_phone || 'Sin teléfono'}</p>
                        ${order.customer_dni ? `<p class="mb-1"><strong>DNI:</strong> ${order.customer_dni}</p>` : ''}
                        
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-shipping-fast me-2"></i>Información de Envío y Pago</h6>
                        <p class="mb-1"><strong>Método:</strong> ${order.shipping_type === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
                        ${order.shipping_address ? `<p class="mb-1"><strong>Dirección:</strong> ${order.shipping_address}</p>` : ''}
                        <p class="mb-1"><strong>Pago:</strong> ${paymentMethod}</p>
                        <p class="mb-1"><strong>Total:</strong> <span class="text-primary fw-bold">$${parseFloat(total).toLocaleString('es-AR')}</span></p>
                    </div>
                </div>
                
                ${orderItems.length > 0 ? `
                <div class="mt-4">
                    <h6><i class="fas fa-boxes me-2"></i>Productos (${orderItems.length})</h6>
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Producto</th>
                                    <th class="text-center">Cantidad</th>
                                    <th class="text-end">Precio Unitario</th>
                                    <th class="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItems.map(item => {
        const itemTotal = item.price * item.quantity;
        const productName = item.name || 'Producto';
        return `
                                        <tr>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img src="${getDefaultImage(productName)}" 
                                                         class="me-2" 
                                                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"
                                                         onerror="this.src='${getDefaultImage(productName)}'">
                                                    <div>
                                                        <div class="fw-semibold">${productName}</div>
                                                        ${item.wholesale ? '<small class="text-success">Precio mayorista</small>' : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-center">${item.quantity}</td>
                                            <td class="text-end">$${item.price.toLocaleString('es-AR')}</td>
                                            <td class="text-end fw-semibold">$${itemTotal.toLocaleString('es-AR')}</td>
                                        </tr>
                                    `;
    }).join('')}
                            </tbody>
                            <tfoot class="table-light">
                                <tr>
                                    <td colspan="3" class="text-end fw-bold">Total:</td>
                                    <td class="text-end fw-bold text-primary">$${parseFloat(total).toLocaleString('es-AR')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                ` : '<p class="text-muted">No hay detalles de productos disponibles</p>'}
                
                ${order.notes ? `
                <div class="mt-3 p-3 bg-light rounded">
                    <h6><i class="fas fa-sticky-note me-2"></i>Notas</h6>
                    <p class="mb-0">${order.notes}</p>
                </div>
                ` : ''}
                
                <div class="mt-4 d-flex flex-wrap gap-2">
                    <button class="btn btn-primary btn-sm" onclick="downloadOrderPDF('${order.id}')">
                        <i class="fas fa-file-pdf me-1"></i> Descargar PDF
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onclick="showInvoiceModal('${order.id}')">
                        <i class="fas fa-file-invoice me-1"></i> Ver Factura
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="contactAboutOrder('${order.id}')">
                        <i class="fas fa-comment me-1"></i> Consultar
                    </button>
                </div>
            </div>
        </div>
    `;
}
// ============================================
// FUNCIÓN PARA DESCARGAR PDF DEL PEDIDO
// ============================================

function downloadOrderPDF(orderId) {
    console.log(`📥 Descargando PDF para orden: ${orderId}`);

    // Buscar la orden
    const order = userOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('error', 'No se encontró el pedido');
        return;
    }

    // Mostrar indicador de carga
    const originalButton = event.target;
    const originalHTML = originalButton.innerHTML;
    originalButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Generando...';
    originalButton.disabled = true;

    // Generar PDF después de un pequeño delay para mostrar el spinner
    setTimeout(() => {
        generateOrderPDF(order);

        // Restaurar botón
        setTimeout(() => {
            originalButton.innerHTML = originalHTML;
            originalButton.disabled = false;
        }, 1000);
    }, 500);
}
function createOrderListItem(order) {
    const statusBadge = getOrderStatusBadge(order.status);
    const formattedDate = formatOrderDate(order.created_at || order.date);
    const total = order.total_amount || order.total || 0;

    // Contar items de forma segura
    let itemCount = 0;
    if (Array.isArray(order.items)) {
        itemCount = order.items.length;
    } else if (typeof order.items === 'string') {
        try {
            const parsed = JSON.parse(order.items);
            if (Array.isArray(parsed)) {
                itemCount = parsed.length;
            }
        } catch (error) {
            itemCount = 0;
        }
    }

    // Usar el número de pedido correcto
    const orderNumber = order.invoice_number || order.id;

    return `
        <div class="card mb-2">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <h6 class="mb-0 fw-bold">Pedido #${orderNumber}</h6>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                   
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="text-muted small">${itemCount} producto(s)</div>
                        <div class="text-muted small">${order.shipping_type === 'domicilio' ? 'Envío' : 'Retiro'}</div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold text-primary">$${parseFloat(total).toLocaleString('es-AR')}</div>
                        <button class="btn btn-sm btn-outline-primary mt-1" onclick="showInvoiceModal('${order.id}')">
                            <i class="fas fa-eye me-1"></i> Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}


// ============================================
// MODAL DE FACTURA
// ============================================

function showInvoiceModal(orderId) {
    console.log(`📄 Mostrando factura para orden: ${orderId}`);

    // Buscar la orden
    const order = userOrders.find(o => o.id === orderId);
    if (!order) {
        showToast('error', 'No se encontró la orden');
        return;
    }

    // Renderizar factura
    const invoiceHTML = renderInvoice(order);

    // Crear modal dinámico
    const modalHTML = `
        <div class="modal fade" id="invoiceModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-invoice-dollar me-2"></i>
                            Factura #${order.invoice_number || order.id}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${invoiceHTML}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i> Cerrar
                        </button>
                        <!-- CAMBIADO: De "Imprimir" a "Descargar PDF" -->
                        <button type="button" class="btn btn-primary" onclick="downloadOrderPDF('${order.id}')">
                            <i class="fas fa-file-pdf me-1"></i> Descargar PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Si ya existe el modal, eliminarlo
    const existingModal = document.getElementById('invoiceModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Agregar modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar modal
    const modalElement = document.getElementById('invoiceModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}


// ============================================
// CARRUSEL (FUNCIÓN ADICIONAL)
// ============================================

function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const totalSlides = slides.length;

    if (totalSlides === 0) return;

    function updateCarousel() {
        const carouselInner = document.querySelector('.carousel-inner');
        const slideWidth = 100 / totalSlides;
        carouselInner.style.transform = `translateX(-${currentSlide * slideWidth}%)`;

        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });

    let carouselInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }, 5000);

    carousel.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }, 5000);
    });

    updateCarousel();
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        searchInput.addEventListener('input', function () {
            if (this.value.trim() === '') goToCatalogHome();
        });
    }

    // Enlaces de inicio
    const navInicioLinks = document.querySelectorAll('a[href="#inicio"], .nav-link[href="#"]');
    navInicioLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            goToCatalogHome();
            
            // Cerrar menú móvil si está abierto
            if (window.innerWidth <= 768) {
                const mobileNav = document.getElementById('mobileNavContainer');
                if (mobileNav && mobileNav.classList.contains('active')) {
                    mobileNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });

    setupPagination();
    setupCartEvents();
    setupFormEvents();
    setupCheckoutEvents();

    window.addEventListener('resize', function () {
        if (document.getElementById('productDetailModal')?.classList.contains('show')) {
            resetImageZoom();
            setTimeout(setupImageZoom, 100);
        }
    });
}
function setupCartEvents() {
    const cartLink = document.getElementById('cartLink');
    if (cartLink) cartLink.addEventListener('click', renderCart);
}

function setupFormEvents() {
    console.log('🔧 Configurando eventos de formularios...');

    document.querySelectorAll('input[name="accountType"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const industrialFields = document.getElementById('industrialFields');
            if (industrialFields) {
                industrialFields.style.display = this.value === 'industrial' ? 'block' : 'none';
            }
        });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const accountType = document.querySelector('input[name="accountType"]:checked').value;
            const firstName = document.getElementById('registerFirstName').value;
            const lastName = document.getElementById('registerLastName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showToast('error', 'Las contraseñas no coinciden');
                return;
            }

            const userData = {
                firstName,
                lastName,
                email,
                password,
                accountType,
                phone: '',
                company: accountType === 'industrial' ? document.getElementById('companyName').value : '',
                cuit: accountType === 'industrial' ? document.getElementById('cuit').value : ''
            };

            handleRegister(userData);
        });
    }

    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!currentUser) return;

            currentUser.firstName = document.getElementById('profileFirstName').value;
            currentUser.lastName = document.getElementById('profileLastName').value;
            currentUser.phone = document.getElementById('profilePhone').value;
            currentUser.company = document.getElementById('profileCompany').value;
            currentUser.cuit = document.getElementById('profileCUIT').value;

            saveUserToStorage();
            updateUserUI();
            showToast('success', 'Perfil actualizado exitosamente');
            hideModal('profile');
        });
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                showToast('error', 'Las contraseñas no coinciden');
                return;
            }

            showToast('success', 'Contraseña cambiada exitosamente');
            hideModal('changePassword');
        });
    }
}

function setupCheckoutEvents() {
    console.log('🔧 Configurando eventos de checkout...');

    const nextToStep2Btn = document.getElementById('nextToStep2');
    const backToStep1Btn = document.getElementById('backToStep1');
    const nextToStep3Btn = document.getElementById('nextToStep3');
    const backToStep2Btn = document.getElementById('backToStep2');
    const nextToStep4Btn = document.getElementById('nextToStep4');
    const confirmWhatsAppBtn = document.getElementById('confirmWhatsApp');
    const cancelCheckoutBtn = document.getElementById('cancelCheckout');

    if (nextToStep2Btn) {
        nextToStep2Btn.addEventListener('click', proceedToStep2);
    }

    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', returnToStep1);
    }

    if (nextToStep3Btn) {
        nextToStep3Btn.addEventListener('click', proceedToStep3);
    }

    if (backToStep2Btn) {
        backToStep2Btn.addEventListener('click', returnToStep2);
    }

    if (nextToStep4Btn) {
        nextToStep4Btn.addEventListener('click', proceedToStep4);
    }

    if (confirmWhatsAppBtn) {
        confirmWhatsAppBtn.addEventListener('click', confirmOrderByWhatsApp);
    }

    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', cancelCheckoutProcess);
    }

    document.querySelectorAll('.shipping-option').forEach(option => {
        option.addEventListener('click', handleShippingOptionClick);
    });

    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', handlePaymentMethodClick);
    });

}

function handleShippingOptionClick() {
    document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('active'));
    this.classList.add('active');

    const showAddressForm = this.getAttribute('data-shipping') === 'domicilio';
    const shippingAddressForm = document.getElementById('shippingAddressForm');
    if (shippingAddressForm) {
        shippingAddressForm.style.display = showAddressForm ? 'block' : 'none';
    }
}

function handlePaymentMethodClick() {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    this.classList.add('active');
}

function cancelCheckoutProcess() {
    console.log('Cancelando checkout...');
    hideModal('checkout');
    resetCheckoutForm();
}

// ============================================
// DIAGNÓSTICO FINAL
// ============================================

console.log('=== DIAGNÓSTICO DE CARGA ===');
console.log('Bootstrap disponible:', typeof bootstrap !== 'undefined');
console.log('Supabase disponible:', typeof window.supabaseClient !== 'undefined');
console.log('Productos cargados:', products.length);
console.log('Carrito:', cart.length);
console.log('Usuario:', currentUser ? 'Logueado' : 'No logueado');
console.log('Pedidos del usuario:', userOrders.length);
console.log('Funciones nuevas: ✔️ Cerrar sección, ✔️ Historial de pedidos');
console.log('Modales inicializados:', Object.keys(modalInstances).length);
console.log('✅ app.js cargado completamente');

// Función adicional requerida para setupMobileSlider
function setupMobileSlider() {
    const touchSliderTrack = document.getElementById('touchSliderTrack');
    if (!touchSliderTrack) return;

    const slides = document.querySelectorAll('.touch-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    const sliderCurrentIndexSpan = document.getElementById('sliderCurrentIndex');
    const sliderTotalImagesSpan = document.getElementById('sliderTotalImages');

    if (sliderCurrentIndexSpan) sliderCurrentIndexSpan.textContent = '1';
    if (sliderTotalImagesSpan) sliderTotalImagesSpan.textContent = totalSlides.toString();

    touchSliderTrack.style.width = `${totalSlides * 100}%`;
    touchSliderTrack.style.display = 'flex';
    touchSliderTrack.style.transition = 'transform 0.3s ease';

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        currentIndex = index;
        const translateX = -index * (100 / totalSlides);
        touchSliderTrack.style.transform = `translateX(${translateX}%)`;

        if (sliderCurrentIndexSpan) sliderCurrentIndexSpan.textContent = (currentIndex + 1).toString();

        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === currentIndex);
        });

        const currentImageIndexSpan = document.getElementById('currentImageIndex');
        if (currentImageIndexSpan) {
            currentImageIndexSpan.textContent = (currentIndex + 1).toString();
        }
    }

    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;

    touchSliderTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        touchSliderTrack.style.transition = 'none';
        e.preventDefault();
    });

    touchSliderTrack.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;

        const maxTranslate = touchSliderTrack.offsetWidth - window.innerWidth;
        if (currentTranslate > 0) currentTranslate = 0;
        if (currentTranslate < -maxTranslate) currentTranslate = -maxTranslate;

        touchSliderTrack.style.transform = `translateX(${currentTranslate}px)`;
    });

    touchSliderTrack.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        touchSliderTrack.style.transition = 'transform 0.3s ease';

        const slideWidth = window.innerWidth;
        const movedBy = currentTranslate - prevTranslate;

        if (Math.abs(movedBy) > slideWidth * 0.2) {
            if (movedBy > 0 && currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else if (movedBy < 0 && currentIndex < totalSlides - 1) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex);
            }
        } else {
            goToSlide(currentIndex);
        }

        prevTranslate = -currentIndex * (touchSliderTrack.offsetWidth / totalSlides);
        currentTranslate = prevTranslate;
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = btn.classList.contains('prev-btn') ? -1 : 1;
            goToSlide(currentIndex + direction);
        });
    });

    goToSlide(0);
}


// ============================================
// FUNCIONES DE PRODUCTOS RELACIONADOS
// ============================================

function loadRelatedProducts(currentProduct) {
    console.log('🔄 Cargando productos relacionados para:', currentProduct.name);

    const container = document.getElementById('relatedProductsContainer');
    if (!container) return;

    // Mostrar loader mientras carga
    container.innerHTML = `
        <div class="col-12 text-center py-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando productos relacionados...</p>
        </div>
    `;

    // Filtrar productos relacionados
    const relatedProducts = getRelatedProducts(currentProduct);

    if (relatedProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-box-open fa-2x text-muted mb-3"></i>
                <p class="text-muted">No hay productos relacionados disponibles</p>
            </div>
        `;
        return;
    }

    // Mostrar productos relacionados (máximo 4)
    displayRelatedProducts(relatedProducts.slice(0, 4));
}

function getRelatedProducts(currentProduct) {
    if (!currentProduct || !Array.isArray(products)) {
        return [];
    }

    // Filtrar productos de la misma categoría, excluyendo el actual
    const relatedProducts = products.filter(product => {
        // Excluir el producto actual
        if (product.id === currentProduct.id) return false;

        // 1. Misma categoría (prioridad alta)
        if (product.category === currentProduct.category) return true;

        // 2. Mismo nombre de categoría principal (ej: "Linea Baño")
        const currentMainCategory = getMainCategory(currentProduct.category);
        const productMainCategory = getMainCategory(product.category);
        if (currentMainCategory && productMainCategory === currentMainCategory) return true;

        // 3. Productos más vendidos de la misma línea
        if (currentProduct.category && product.category) {
            const currentLine = extractLineFromCategory(currentProduct.category);
            const productLine = extractLineFromCategory(product.category);
            if (currentLine && currentLine === productLine) return true;
        }

        // 4. Productos con etiquetas similares
        if (currentProduct.tags && product.tags) {
            const commonTags = currentProduct.tags.filter(tag =>
                product.tags.includes(tag)
            );
            if (commonTags.length > 0) return true;
        }

        return false;
    });

    // Ordenar por relevancia:
    // 1. Misma categoría exacta
    // 2. Mismo nombre de categoría principal
    // 3. Más vendidos
    // 4. Más nuevos

    relatedProducts.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Puntos por misma categoría exacta
        if (a.category === currentProduct.category) scoreA += 10;
        if (b.category === currentProduct.category) scoreB += 10;

        // Puntos por mismo nombre de categoría principal
        const currentMainCat = getMainCategory(currentProduct.category);
        if (getMainCategory(a.category) === currentMainCat) scoreA += 8;
        if (getMainCategory(b.category) === currentMainCat) scoreB += 8;

        // Puntos por más vendidos
        scoreA += (a.sold_count || 0) * 0.1;
        scoreB += (b.sold_count || 0) * 0.1;

        // Puntos por más nuevos
        if (a.isNew) scoreA += 5;
        if (b.isNew) scoreB += 5;

        return scoreB - scoreA;
    });

    return relatedProducts;
}

function getMainCategory(category) {
    if (!category) return null;

    // Buscar si la categoría contiene alguna de las líneas principales
    const mainCategories = [
        "Linea Mueble", "Linea Aluminio", "Linea Baño", "Linea Puerta",
        "Linea Cocina & Lavadero", "Linea Vidrio", "Linea Portones", "Herramientas"
    ];

    return mainCategories.find(mainCat =>
        category.includes(mainCat.replace("Linea ", "")) ||
        category === mainCat
    );
}

function extractLineFromCategory(category) {
    if (!category) return null;

    const linePatterns = [
        { pattern: /mueble/i, line: "Linea Mueble" },
        { pattern: /aluminio/i, line: "Linea Aluminio" },
        { pattern: /baño/i, line: "Linea Baño" },
        { pattern: /puerta/i, line: "Linea Puerta" },
        { pattern: /cocina|lavadero/i, line: "Linea Cocina & Lavadero" },
        { pattern: /vidrio/i, line: "Linea Vidrio" },
        { pattern: /portones/i, line: "Linea Portones" },
        { pattern: /herramientas/i, line: "Herramientas" }
    ];

    for (const { pattern, line } of linePatterns) {
        if (pattern.test(category)) {
            return line;
        }
    }

    return null;
}

function displayRelatedProducts(relatedProducts) {
    const container = document.getElementById('relatedProductsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (relatedProducts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-box-open fa-2x text-muted mb-3"></i>
                <p class="text-muted">No hay productos relacionados disponibles</p>
            </div>
        `;
        return;
    }

    relatedProducts.forEach(product => {
        const productCard = createRelatedProductCard(product);
        container.innerHTML += productCard;
    });
}

function createRelatedProductCard(product) {
    const isOutOfStock = product.stock <= 0;


    const outOfStockBadge = isOutOfStock ?
        '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Sin Stock</span>' : '';

    const lowStockBadge = product.stock > 0 && product.stock <= (product.min_stock || 5) ?
        '<span class="badge bg-warning position-absolute top-0 start-0 m-2">Últimas</span>' : '';

    return `
        <div class="col-md-3 col-6 mb-3">
            <div class="card related-product-card ${isOutOfStock ? 'opacity-75' : ''} h-100">
                <div class="position-relative" style="height: 150px; overflow: hidden;">
                    <img src="${product.image}" 
                         class="card-img-top h-100 object-fit-cover" 
                         alt="${product.name}"
                         onerror="this.src='${getDefaultImage(product.name)}'; this.onerror=null;"
                         style="cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'};"
                         onclick="${!isOutOfStock ? `showRelatedProductDetail('${product.id}')` : ''}">
                   
                    ${outOfStockBadge}
                    ${lowStockBadge}
                </div>
                <div class="card-body p-2 d-flex flex-column">
                    <h6 class="card-title mb-1" 
                        style="font-size: 0.85rem; cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'};"
                        onclick="${!isOutOfStock ? `showRelatedProductDetail('${product.id}')` : ''}">
                        ${product.name.length > 40 ? product.name.substring(0, 37) + '...' : product.name}
                    </h6>
                    <p class="text-muted mb-1" style="font-size: 0.75rem;">
                        <i class="fas fa-tag me-1"></i>${product.category}
                    </p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="price fw-bold" style="font-size: 0.9rem;">
                                $${product.price.toLocaleString('es-AR')}
                            </div>
                            ${!isOutOfStock ? `
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="addRelatedProductToCart('${product.id}')"
                                    style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                            ` : `
                            <button class="btn btn-sm btn-secondary" disabled
                                    style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">
                                <i class="fas fa-ban"></i>
                            </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showRelatedProductDetail(productId) {
    // Cerrar el modal actual primero
    hideModal('productDetail');

    // Pequeño delay para asegurar que el modal se cierre
    setTimeout(() => {
        // Mostrar el nuevo producto en el mismo modal
        showProductDetail(productId);
    }, 300);
}

function addRelatedProductToCart(productId) {
    // Agregar al carrito
    addToCart(productId);

    // Opcional: Mostrar un toast específico
    const product = products.find(p => p.id === productId);
    if (product) {
        showToast('success', `¡${product.name} agregado al carrito desde productos relacionados!`);
    }
}

// ============================================
// FUNCIONES PARA FILTROS MÓVILES
// ============================================
function setupMobileFilters() {
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    const mobileFiltersContainer = document.getElementById('mobile-filters-container');
    const closeFiltersBtn = document.getElementById('close-filters');

    if (!mobileFilterToggle || !mobileFiltersContainer) return;

    // Mostrar filtros
    mobileFilterToggle.addEventListener('click', (e) => {
        e.preventDefault();
        mobileFiltersContainer.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Crear overlay si no existe
        let overlay = document.querySelector('.filters-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'filters-overlay';
            document.body.appendChild(overlay);

            // Cerrar al hacer click en overlay
            overlay.addEventListener('click', () => {
                mobileFiltersContainer.classList.remove('show');
                overlay.classList.remove('show');
                document.body.style.overflow = '';
            });
        }
        overlay.classList.add('show');
    });

    // Cerrar filtros
    if (closeFiltersBtn) {
        closeFiltersBtn.addEventListener('click', () => {
            mobileFiltersContainer.classList.remove('show');
            const overlay = document.querySelector('.filters-overlay');
            if (overlay) {
                overlay.classList.remove('show');
            }
            document.body.style.overflow = '';
        });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileFiltersContainer.classList.contains('show')) {
            mobileFiltersContainer.classList.remove('show');
            const overlay = document.querySelector('.filters-overlay');
            if (overlay) overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}


// Actualizar contador de filtros activos


function updateFilterBadgeCount() {
    const badge = document.getElementById('filter-badge-count');
    if (!badge) return;

    const activeFiltersCount = activeSubcategoryFilters.length;
    const hasPriceFilter = priceRange.min > 0 || priceRange.max < Infinity;
    const totalFilters = activeFiltersCount + (hasPriceFilter ? 1 : 0);

    if (totalFilters > 0) {
        badge.textContent = totalFilters;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Versión corregida y simplificada del JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del menú
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileNavContainer = document.getElementById('mobileNavContainer');
    const body = document.body;
    
    // Función para abrir/cerrar el menú
    function toggleMobileMenu() {
        console.log('Toggle menu clicked'); // Para depuración
        
        if (mobileNavContainer.classList.contains('active')) {
            // Cerrar menú
            mobileNavContainer.classList.remove('active');
            body.classList.remove('menu-open');
        } else {
            // Abrir menú
            mobileNavContainer.classList.add('active');
            body.classList.add('menu-open');
        }
    }
    
    // Función para cerrar el menú
    function closeMobileMenu() {
        console.log('Close menu clicked'); // Para depuración
        mobileNavContainer.classList.remove('active');
        body.classList.remove('menu-open');
    }
    
    // Event listeners
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
    }
    
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }
    
    // Cerrar menú al hacer clic en un enlace
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-dropdown-link, .mobile-action-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('mobile-dropdown-toggle')) {
                setTimeout(closeMobileMenu, 300);
            }
        });
    });
    
    // Dropdowns para móvil
    const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.nextElementSibling;
            const arrow = this.querySelector('.dropdown-arrow');
            
            // Cerrar otros dropdowns
            document.querySelectorAll('.mobile-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            // Rotar flechas
            document.querySelectorAll('.dropdown-arrow').forEach(a => {
                if (a !== arrow) a.classList.remove('rotated');
            });
            
            // Alternar dropdown actual
            dropdown.classList.toggle('active');
            arrow.classList.toggle('rotated');
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (mobileNavContainer.classList.contains('active') && 
            !mobileNavContainer.contains(e.target) && 
            e.target !== mobileMenuToggle) {
            closeMobileMenu();
        }
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNavContainer.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Sincronizar badge del carrito
    function updateMobileCartBadge() {
        const cartBadge = document.querySelector('.cart-badge');
        const mobileCartBadge = document.getElementById('mobileCartBadge');
        if (cartBadge && mobileCartBadge) {
            mobileCartBadge.textContent = cartBadge.textContent;
        }
    }
    
    // Observar cambios en el badge del carrito
    const observer = new MutationObserver(updateMobileCartBadge);
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        observer.observe(cartBadge, { childList: true, characterData: true });
        updateMobileCartBadge(); // Sincronizar inicialmente
    }
    
    // Búsqueda móvil
    const mobileSearchButton = document.getElementById('mobileSearchButton');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (mobileSearchButton && mobileSearchInput) {
        mobileSearchButton.addEventListener('click', function() {
            const searchTerm = mobileSearchInput.value.trim();
            if (searchTerm) {
                // Usar la misma función de búsqueda que el escritorio
                if (typeof window.performSearch === 'function') {
                    window.performSearch(searchTerm);
                }
                closeMobileMenu();
            }
        });
        
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    if (typeof window.performSearch === 'function') {
                        window.performSearch(searchTerm);
                    }
                    closeMobileMenu();
                }
            }
        });
    }
});

// Función global para actualizar el badge (llamada desde app.js)
window.updateMobileCartBadge = function(count) {
    const mobileCartBadge = document.getElementById('mobileCartBadge');
    if (mobileCartBadge) {
        mobileCartBadge.textContent = count;
    }
};


// En tu app.js existente, agrega:
document.addEventListener('DOMContentLoaded', function() {
    // Detectar touch device
    const isTouchDevice = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         navigator.msMaxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Optimizar para touch
        optimizeForTouch();
    }
    
    // Inicializar filtros responsive
    if (typeof setupResponsiveFilters === 'function') {
        setupResponsiveFilters();
    }
});

function optimizeForTouch() {
    // Aumentar áreas táctiles
    document.querySelectorAll('.mobile-dropdown-link, .dropdown-item').forEach(item => {
        item.style.padding = '12px 15px';
        item.style.minHeight = '44px'; // Tamaño mínimo recomendado para touch
    });
    
    // Mejorar feedback táctil
    document.querySelectorAll('.category-card, .carousel-slide').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        element.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
}

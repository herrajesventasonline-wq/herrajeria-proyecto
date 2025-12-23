// supabase-client-public.js - VERSIÓN SEGURA
console.log('🔄 Inicializando Supabase Client PÚBLICO para Herrajería...');

// Obtener credenciales de variables de entorno
const SUPABASE_URL = window.SUPABASE_URL || 'https://opueqifkagoonpbubflj.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

// Configuración segura
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

console.log('🔐 Modo producción:', isProduction);

// Cliente Supabase global
let supabaseClient = null;
// ============================================
// FUNCIÓN PARA OBTENER PEDIDOS DEL USUARIO
// ============================================
async function getUserOrders(email) {
    try {
        console.log(`📋 Buscando pedidos para: ${email}`);
        
        if (!email || email.trim() === '') {
            console.log('❌ Email no proporcionado');
            return [];
        }

        // Crear cliente temporal si no existe
        if (!supabaseClient) {
            if (typeof supabase === 'undefined') {
                console.error('❌ Supabase SDK no disponible');
                return [];
            }
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        // Consultar pedidos del usuario
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error en consulta:', error);
            return [];
        }

        console.log(`✅ ${data?.length || 0} pedidos encontrados para ${email}`);
        return data || [];

    } catch (error) {
        console.error('❌ Error en getUserOrders:', error);
        return [];
    }
}
// ============================================
// FUNCIÓN PARA CREAR PEDIDO
// ============================================
async function createOrder(orderData) {
    try {
        console.log('🛒 Creando orden en Supabase...');

        if (!supabaseClient) {
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase SDK no disponible');
            }
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        // Preparar items para JSONB
        const itemsArray = orderData.items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            is_wholesale: item.wholesale || false,
            wholesale_price: item.wholesalePrice || null
        }));

        // Crear objeto de orden
        const orderForSupabase = {
            customer_name: `${orderData.firstName} ${orderData.lastName}`,
            customer_phone: orderData.phone,
            customer_email: orderData.email,
            customer_dni: orderData.dni || '',
            shipping_type: orderData.shipping.type,
            shipping_address: orderData.shipping.address || '',
            payment_method: orderData.paymentMethod,
            total_amount: orderData.total,
            status: 'pending',
            invoice_number: orderData.orderNumber,
            items: itemsArray,
            notes: `Pedido desde web - WhatsApp: ${orderData.phone}`
        };

        console.log('📤 Enviando a Supabase:', orderForSupabase);

        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderForSupabase])
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Orden creada exitosamente:', data);
        return data;

    } catch (error) {
        console.error('❌ Error creando orden:', error);
        throw error;
    }
}
// ============================================
// FUNCIÓN PARA OBTENER PRODUCTOS
// ============================================
async function getProducts() {
    try {
        if (!supabaseClient) {
            if (typeof supabase === 'undefined') {
                console.error('❌ Supabase SDK no disponible');
                return [];
            }
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        const { data, error } = await supabaseClient
            .from('products')
            .select(`
                *,
                categories(name),
                brands(name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`✅ ${data?.length || 0} productos cargados`);
        return data || [];

    } catch (error) {
        console.error('❌ Error obteniendo productos:', error);
        return [];
    }
}
// ============================================
// INICIALIZACIÓN
// ============================================
async function initializeSupabase() {
    try {
        console.log('🔧 Inicializando Supabase...');

        // Verificar si Supabase está disponible
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase SDK no cargado');
            return false;
        }

        // Crear cliente
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Configurar funciones globales
        window.supabaseClient = {
            // Cliente base
            client: supabaseClient,
            
            // Funciones principales
            getProducts: getProducts,
            createOrder: createOrder,
            getUserOrders: getUserOrders,  // ¡NUEVA FUNCIÓN AGREGADA!
            
            // Función de prueba
            testConnection: async () => {
                try {
                    const { data, error } = await supabaseClient
                        .from('products')
                        .select('id')
                        .limit(1);
                    
                    if (error) throw error;
                    return { success: true, message: 'Conectado a Supabase' };
                } catch (error) {
                    return { success: false, message: error.message };
                }
            },
            
            isReady: true
        };

        console.log('✅ Supabase inicializado correctamente');
        return true;

    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return false;
    }
}

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeSupabase();
        window.dispatchEvent(new CustomEvent('supabaseReady'));
    });
} else {
    (async () => {
        await initializeSupabase();
        window.dispatchEvent(new CustomEvent('supabaseReady'));
    })();
}






// ============================================
// FUNCIONES PRINCIPALES
// ============================================
async function initializeOrdersClient() {
    try {
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase SDK no cargado');
            return;
        }

        ordersClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Configurar funciones públicas de órdenes
        window.ordersClient = {
            client: ordersClient,

            // En supabase-client-public.js, dentro del setupGlobalClient(), AGREGAR:
            getOrders: async function (email = null) {
                try {
                    console.log('📋 getOrders público llamado para:', email);

                    if (!supabaseClient) {
                        throw new Error('Cliente Supabase no inicializado');
                    }

                    let query = supabaseClient
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (email) {
                        console.log(`🔍 Filtrando por email: ${email}`);
                        query = query.eq('customer_email', email);
                    }

                    const { data, error } = await query;

                    if (error) {
                        console.error('❌ Error en getOrders público:', error);
                        throw error;
                    }

                    console.log(`✅ ${data?.length || 0} pedidos obtenidos`);
                    return data || [];

                } catch (error) {
                    console.error('❌ Error fatal en getOrders público:', error);
                    return [];
                }
            },

            // Función para crear orden (cuando haces checkout)
            createOrder: async function (orderData) {
                try {
                    console.log('🛒 Creando orden en Supabase...');

                    const orderForSupabase = {
                        customer_name: `${orderData.firstName} ${orderData.lastName}`,
                        customer_phone: orderData.phone,
                        customer_email: orderData.email,
                        customer_dni: orderData.dni,
                        shipping_type: orderData.shipping.type,
                        shipping_address: orderData.shipping.address || '',
                        payment_method: orderData.paymentMethod,
                        total_amount: orderData.total,
                        status: 'pending',
                        invoice_number: orderData.orderNumber,
                        items: orderData.items.map(item => ({
                            product_id: item.id,
                            product_name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            is_wholesale: item.wholesale || false
                        })),
                        notes: `Pedido desde web - Cliente: ${orderData.email}`
                    };

                    const { data, error } = await ordersClient
                        .from('orders')
                        .insert([orderForSupabase])
                        .select()
                        .single();

                    if (error) throw error;

                    console.log('✅ Orden creada:', data);
                    return data;

                } catch (error) {
                    console.error('❌ Error creando orden:', error);
                    throw error;
                }
            }
        };

        console.log('✅ Cliente de órdenes inicializado');

    } catch (error) {
        console.error('❌ Error inicializando cliente de órdenes:', error);
        window.ordersClient = {
            getOrders: async () => [],
            createOrder: async () => ({ id: 'local-' + Date.now() })
        };
    }
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOrdersClient);
} else {
    initializeOrdersClient();
}

// Función para probar conexión
async function testConnection() {
    try {
        if (!supabaseClient) {
            return { success: false, message: 'Cliente no inicializado' };
        }

        const { data, error } = await supabaseClient
            .from('products')
            .select('id')
            .limit(1);

        if (error) throw error;

        console.log('✅ Conexión a Supabase exitosa');
        return { success: true, message: 'Conectado a Supabase' };
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return { success: false, message: error.message };
    }
}





// Función de muestra (fallback)
function getSampleProducts() {
    return [
        {
            id: 'sample_1',
            name: 'Producto de Ejemplo',
            retail_price: 100,
            wholesale_price: 85,
            wholesale_limit: 10,
            main_image: '',
            images: [],
            categories: { name: 'Ejemplo' },
            brands: { name: 'Marca Ejemplo' },
            description: 'Este es un producto de ejemplo',
            specifications: { Material: 'Acero', Color: 'Plateado' },
            stock: 10,
            min_stock: 2,
            sku: 'EJ-001',
            is_active: true,
            created_at: new Date().toISOString(),
            click_count: 0,
            sold_count: 0
        }
    ];
}





// Cargar Supabase desde CDN
function loadSupabaseFromCDN() {
    return new Promise((resolve, reject) => {
        // Si ya hay un script cargándose, esperar
        if (document.querySelector('script[src*="supabase-js"]')) {
            const checkInterval = setInterval(() => {
                if (typeof supabase !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
            console.log('✅ Supabase cargado desde CDN');
            resolve();
        };
        script.onerror = (error) => {
            console.error('❌ Error cargando Supabase:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('📄 DOM cargado - Inicializando Supabase...');
        await initializeSupabase();

        // Disparar evento de que Supabase está listo
        window.dispatchEvent(new CustomEvent('supabaseReady', {
            detail: { initialized: true }
        }));
    });
} else {
    // DOM ya está listo
    console.log('📄 DOM ya está listo - Inicializando Supabase...');
    (async () => {
        await initializeSupabase();

        // Disparar evento de que Supabase está listo
        window.dispatchEvent(new CustomEvent('supabaseReady', {
            detail: { initialized: true }
        }));
    })();
}

// Exportar para uso manual
window.initializeSupabase = initializeSupabase;
console.log('✅ supabase-client-public.js cargado');
// supabase-client.js - VERSIÓN SEGURA
console.log('🚀 Inicializando Supabase Client para Herrajería...');

// Obtener credenciales de variables de entorno
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

// Variable global para el cliente Supabase
let supabaseClient = null;

// Inicialización
function initializeSupabase() {
    try {
        console.log('🔧 Inicializando Supabase...');

        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase SDK no está disponible');
            throw new Error('La biblioteca Supabase no se cargó correctamente');
        }

        // Crear cliente Supabase
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            },
            global: {
                headers: {
                    'x-application-name': 'herrajeria-admin'
                }
            }
        });

        console.log('✅ Supabase inicializado correctamente');

        // Configurar cliente global
        setupGlobalClient();

    } catch (error) {
        console.error('💥 Error inicializando Supabase:', error);
        setupFallbackClient();
    }
}

// Configurar todas las funciones del cliente
function setupGlobalClient() {
    console.log('🔧 Configurando cliente Supabase...');

    const clientObject = {
        client: supabaseClient,
        auth: supabaseClient.auth,
        storage: supabaseClient.storage,

        // ========== PRODUCTOS ==========
        getProducts: async function () {
            try {
                console.log('📦 Obteniendo productos...');
                const { data, error } = await supabaseClient
                    .from('products')
                    .select(`
                        *,
                        categories(name),
                        brands(name)
                    `)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ Error obteniendo productos:', error);
                    throw new Error(`Error al cargar productos: ${error.message}`);
                }

                console.log(`✅ ${data?.length || 0} productos cargados`);
                return data || [];
            } catch (error) {
                console.error('❌ Error en getProducts:', error);
                throw error;
            }
        },

        getProductById: async function (id) {
            try {
                console.log(`🔍 Obteniendo producto ID: ${id}`);
                const { data, error } = await supabaseClient
                    .from('products')
                    .select(`
                        *,
                        categories(name),
                        brands(name)
                    `)
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('❌ Error obteniendo producto:', error);
                    throw new Error(`Producto no encontrado: ${error.message}`);
                }
                return data;
            } catch (error) {
                console.error('❌ Error en getProductById:', error);
                throw error;
            }
        },

        createProduct: async function (productData) {
            try {
                console.log('🆕 Creando nuevo producto:', productData.name);
                const { data, error } = await supabaseClient
                    .from('products')
                    .insert([productData])
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Error creando producto:', error);
                    throw new Error(`Error al crear producto: ${error.message}`);
                }
                console.log('✅ Producto creado:', data.id);
                return data;
            } catch (error) {
                console.error('❌ Error en createProduct:', error);
                throw error;
            }
        },

        updateProduct: async function (id, productData) {
            try {
                console.log(`✏️ Actualizando producto ID: ${id}`);
                const { data, error } = await supabaseClient
                    .from('products')
                    .update(productData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                console.log('✅ Producto actualizado');
                return data;
            } catch (error) {
                console.error('❌ Error actualizando producto:', error);
                throw new Error(`Error al actualizar producto: ${error.message}`);
            }
        },

        deleteProduct: async function (id) {
            try {
                console.log(`🗑️ Eliminando producto ID: ${id}`);
                const { error } = await supabaseClient
                    .from('products')
                    .update({ is_active: false })
                    .eq('id', id);

                if (error) throw error;
                console.log('✅ Producto marcado como inactivo');
                return true;
            } catch (error) {
                console.error('❌ Error eliminando producto:', error);
                throw new Error(`Error al eliminar producto: ${error.message}`);
            }
        },

        // ========== CATEGORÍAS Y MARCAS ==========
        getCategories: async function () {
            try {
                const { data, error } = await supabaseClient
                    .from('categories')
                    .select('*')
                    .order('name');

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Error obteniendo categorías:', error);
                return [];
            }
        },

        getBrands: async function () {
            try {
                const { data, error } = await supabaseClient
                    .from('brands')
                    .select('*')
                    .order('name');

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Error obteniendo marcas:', error);
                return [];
            }
        },

        // ========== ÓRDENES ==========
        // EN supabase-client.js - REEMPLAZAR la función getOrders

        // ========== FUNCIONES PARA ÓRDENES ==========
// ========== ÓRDENES ==========
createOrder: async function (orderData) {
    try {
        console.log('🛒 Creando orden en Supabase...', orderData);
        
        // Preparar datos para Supabase
        const orderForSupabase = {
            customer_name: `${orderData.firstName} ${orderData.lastName}`,
            customer_phone: orderData.phone,
            customer_email: orderData.email,
            customer_dni: orderData.dni,
            shipping_type: orderData.shipping.type,
            shipping_address: orderData.shipping.address || '',
            payment_method: orderData.paymentMethod,
            total_amount: orderData.total,
            status: 'confirmed',
            invoice_number: orderData.orderNumber,
            notes: `Pedido desde web - Cliente: ${orderData.email}`,
            created_at: new Date().toISOString()
        };

        console.log('📤 Enviando orden a Supabase:', orderForSupabase);

        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderForSupabase])
            .select()
            .single();

        if (error) {
            console.error('❌ Error creando orden en Supabase:', error);
            throw new Error(`Error al crear orden: ${error.message}`);
        }

        console.log('✅ Orden creada en Supabase:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error en createOrder:', error);
        throw error;
    }
},

createOrderItems: async function (orderId, items) {
    try {
        console.log(`📝 Creando items para orden ${orderId}...`, items);
        
        const orderItems = items.map(item => ({
            order_id: orderId,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            wholesale_price: item.wholesalePrice || null,
            is_wholesale: item.wholesale || false,
            created_at: new Date().toISOString()
        }));

        console.log('📤 Enviando items a Supabase:', orderItems);

        const { data, error } = await supabaseClient
            .from('order_items')
            .insert(orderItems);

        if (error) {
            console.error('❌ Error creando order_items:', error);
            throw new Error(`Error al crear items: ${error.message}`);
        }

        console.log(`✅ ${orderItems.length} items creados para orden ${orderId}`);
        return data;
        
    } catch (error) {
        console.error('❌ Error en createOrderItems:', error);
        throw error;
    }
},
getOrders: async function(email = null) {
    try {
        console.log('📋 Obteniendo órdenes...', email ? 'Para email: ' + email : 'Todas');
        
        let query = supabaseClient
            .from('orders')
            .select(`
                *,
                order_items!left (
                    *,
                    products (
                        id,
                        name,
                        sku,
                        main_image,
                        categories(name),
                        brands(name)
                    )
                )
            `)
            .order('created_at', { ascending: false });

        // Si se pasa un email, filtrar solo las órdenes de ese usuario
        if (email) {
            query = query.eq('customer_email', email);
        }

        const { data: orders, error: ordersError } = await query;

        if (ordersError) {
            console.error('❌ Error obteniendo órdenes:', ordersError);
            return [];
        }

        console.log(`✅ ${orders?.length || 0} órdenes cargadas de la BD`);

        if (!orders || orders.length === 0) {
            return [];
        }

        // Procesar órdenes
        const enhancedOrders = orders.map(order => {
            // Parsear items JSONB si es necesario
            let itemsArray = [];
            try {
                if (typeof order.items === 'string') {
                    itemsArray = JSON.parse(order.items);
                } else if (Array.isArray(order.items)) {
                    itemsArray = order.items;
                }
            } catch (e) {
                console.error('❌ Error parseando items JSONB:', e);
                itemsArray = [];
            }

            // Si no hay items en JSONB, usar order_items
            if (itemsArray.length === 0 && order.order_items && Array.isArray(order.order_items)) {
                itemsArray = order.order_items.map(oi => ({
                    id: oi.product_id,
                    product_id: oi.product_id,
                    name: oi.product_name || oi.products?.name || 'Producto',
                    quantity: oi.quantity,
                    price: parseFloat(oi.price) || 0,
                    wholesale_price: parseFloat(oi.wholesale_price) || null,
                    wholesale: oi.is_wholesale || false,
                    image: oi.products?.main_image || ''
                }));
            }

            return {
                ...order,
                items: itemsArray,
                // Campos para compatibilidad
                customer_name: order.customer_name || 'Cliente no especificado',
                customer_phone: order.customer_phone || 'Sin teléfono',
                customer_email: order.customer_email || 'Sin email',
                customer_dni: order.customer_dni || '',
                invoice_number: order.invoice_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
                total_amount: parseFloat(order.total_amount) || 0,
                status: order.status || 'pending',
                payment_method: order.payment_method || 'Por WhatsApp',
                shipping_type: order.shipping_type || 'domicilio',
                shipping_address: order.shipping_address || ''
            };
        });

        console.log(`📊 ${enhancedOrders.length} órdenes procesadas correctamente`);
        return enhancedOrders;
        
    } catch (error) {
        console.error('❌ ERROR FATAL en getOrders:', error);
        return [];
    }
},
        getOrderById: async function (id) {
            try {
                console.log(`🔍 Obteniendo orden ID: ${id}`);
                const { data, error } = await supabaseClient
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('❌ Error obteniendo orden:', error);
                    return null;
                }
                return data;
            } catch (error) {
                console.error('❌ Error en getOrderById:', error);
                return null;
            }
        },

        // ========== STORAGE - IMÁGENES ==========
        uploadImage: async function (file) {
            try {
                console.log('📤 Subiendo imagen:', file.name);

                const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
                const fileExt = file.name.split('.').pop().toLowerCase();

                if (!allowedExtensions.includes(fileExt)) {
                    throw new Error('Formato no permitido. Use JPG, PNG, WEBP o GIF.');
                }

                if (file.size > 5 * 1024 * 1024) {
                    throw new Error('La imagen debe ser menor a 5MB.');
                }

                const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

                console.log('Nombre del archivo:', fileName);

                const { data, error } = await supabaseClient.storage
                    .from('product-images')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    });

                if (error) {
                    console.error('Error de storage:', error);

                    if (error.message.includes('bucket') || error.message.includes('not found')) {
                        throw new Error('El bucket "product-images" no existe. Ve a Supabase → Storage → Create new bucket → Nombre: "product-images" → Public → Create bucket');
                    }

                    throw error;
                }

                const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
                console.log('✅ Imagen subida:', publicUrl);

                return publicUrl;

            } catch (error) {
                console.error('❌ Error subiendo imagen:', error);
                throw error;
            }
        },

        uploadMultipleImages: async function (files) {
            try {
                console.log(`📤 Subiendo ${files.length} imágenes...`);

                const uploadPromises = Array.from(files).map(file => this.uploadImage(file));
                const results = await Promise.all(uploadPromises);

                console.log(`✅ ${results.length} imágenes subidas correctamente`);
                return results;

            } catch (error) {
                console.error('❌ Error subiendo múltiples imágenes:', error);
                throw error;
            }
        },

        deleteImage: async function (imageUrl) {
            try {
                if (!imageUrl || typeof imageUrl !== 'string') {
                    return false;
                }

                const fileName = imageUrl.split('/').pop();

                if (!fileName) {
                    return false;
                }

                console.log(`🗑️ Eliminando imagen: ${fileName}`);

                const { error } = await supabaseClient.storage
                    .from('product-images')
                    .remove([fileName]);

                if (error) {
                    console.error('❌ Error eliminando imagen:', error);
                    return false;
                }

                console.log('✅ Imagen eliminada');
                return true;

            } catch (error) {
                console.error('❌ Error en deleteImage:', error);
                return false;
            }
        },

        // ========== AUTENTICACIÓN ==========
        getSession: async function () {
            try {
                const { data, error } = await supabaseClient.auth.getSession();
                if (error) {
                    console.error('❌ Error obteniendo sesión:', error);
                    throw error;
                }
                console.log('✅ Sesión obtenida correctamente');
                return data;
            } catch (error) {
                console.error('❌ Error en getSession:', error);
                throw error;
            }
        },

        signOut: async function () {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                    console.error('❌ Error cerrando sesión:', error);
                    throw error;
                }
                console.log('✅ Sesión cerrada correctamente');
                return true;
            } catch (error) {
                console.error('❌ Error en signOut:', error);
                throw error;
            }
        },

        // ========== FUNCIONES DE AJUSTE DE PRECIOS ==========
        applyPriceAdjustment: async function (adjustmentData) {
            try {
                console.log('📊 Aplicando ajuste de precios:', adjustmentData);

                const { data, error } = await supabaseClient
                    .from('price_adjustments')
                    .insert([adjustmentData])
                    .select()
                    .single();

                if (error) throw error;

                console.log('✅ Ajuste aplicado correctamente:', data);
                return data;

            } catch (error) {
                console.error('❌ Error aplicando ajuste:', error);
                throw error;
            }
        },

        createPriceAdjustmentDetails: async function (details) {
            try {
                console.log('📝 Creando detalles de ajuste de precios...');
                const { data, error } = await supabaseClient
                    .from('price_adjustment_details')
                    .insert(details);

                if (error) throw error;
                console.log(`✅ ${details.length} detalles creados`);
                return data;
            } catch (error) {
                console.error('❌ Error creando detalles:', error);
                throw error;
            }
        },

        getPriceAdjustmentsHistory: async function (limit = 50) {
            try {
                console.log('📜 Obteniendo historial de ajustes...');

                const { data, error } = await supabaseClient
                    .from('price_adjustments')
                    .select(`
                        *,
                        admin_user:profiles!applied_by(username, email)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) {
                    console.error('❌ Error en consulta de historial:', error);
                    throw error;
                }

                console.log(`✅ Historial obtenido: ${data?.length || 0} registros`);
                return data || [];

            } catch (error) {
                console.error('❌ Error obteniendo historial:', error);
                return [];
            }
        },

        getProductsByCategory: async function (categoryId) {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .select(`
                        *,
                        categories(name),
                        brands(name)
                    `)
                    .eq('category_id', categoryId)
                    .eq('is_active', true);

                if (error) throw error;
                return data || [];

            } catch (error) {
                console.error('❌ Error obteniendo productos por categoría:', error);
                return [];
            }
        },

        getProductsByBrand: async function (brandId) {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .select(`
                        *,
                        categories(name),
                        brands(name)
                    `)
                    .eq('brand_id', brandId)
                    .eq('is_active', true);

                if (error) throw error;
                return data || [];

            } catch (error) {
                console.error('❌ Error obteniendo productos por marca:', error);
                return [];
            }
        },

        getCurrentUserId: function () {
            try {
                const session = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
                return session.currentSession?.user?.id || 'admin';
            } catch (error) {
                console.error('❌ Error obteniendo ID de usuario:', error);
                return 'admin';
            }
        },

        // ========== UTILIDADES ==========
        isReady: function () {
            return supabaseClient !== null;
        },

        testConnection: async function () {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .select('id')
                    .limit(1);

                if (error) throw error;
                return { success: true, message: 'Conexión exitosa a Supabase' };
            } catch (error) {
                return { success: false, message: `Error de conexión: ${error.message}` };
            }
        }
    };

    // Asignar el objeto al window
    window.supabaseClient = clientObject;

    console.log('✅ Cliente Supabase configurado completamente');

    // Disparar evento de que está listo
    const readyEvent = new CustomEvent('supabaseReady', { detail: { timestamp: Date.now() } });
    window.dispatchEvent(readyEvent);
}

// Cliente de respaldo para desarrollo
function setupFallbackClient() {
    console.warn('⚠️ Usando cliente de respaldo (modo desarrollo)');

    window.supabaseClient = {
        client: null,
        auth: null,
        storage: null,

        getProducts: async () => {
            console.log('📦 Usando datos de ejemplo para productos');
            return [];
        },

        getProductById: async (id) => ({ id, name: 'Producto de ejemplo' }),
        createProduct: async () => ({ id: 'temp-' + Date.now() }),
        updateProduct: async () => ({ id: 'updated' }),
        deleteProduct: async () => true,
        getCategories: async () => [{ id: '1', name: 'Linea Baño' }],
        getBrands: async () => [{ id: '1', name: 'Premium' }],
        getOrders: async () => [],
        getOrderById: async () => null,
        uploadImage: async () => 'https://via.placeholder.com/300x200',
        uploadMultipleImages: async () => ['https://via.placeholder.com/300x200'],
        deleteImage: async () => true,
        getSession: async () => ({ session: null }),
        signOut: async () => true,
        applyPriceAdjustment: async () => ({ id: 'temp-adjustment' }),
        createPriceAdjustmentDetails: async () => [{ id: 'temp-detail' }],
        getPriceAdjustmentsHistory: async () => [],
        getProductsByCategory: async () => [],
        getProductsByBrand: async () => [],
        getCurrentUserId: () => 'admin',
        isReady: () => true,
        testConnection: async () => ({ success: false, message: 'Modo desarrollo activo' })
    };

    console.log('✅ Cliente de respaldo configurado');
    window.dispatchEvent(new CustomEvent('supabaseReady'));
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
    initializeSupabase();
}

console.log('✅ supabase-client.js cargado correctamente');
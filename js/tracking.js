// tracking.js - Sistema de seguimiento de analíticas
console.log('📊 Inicializando sistema de tracking...');

const Tracking = {
    // Registrar un clic en producto
    trackProductClick: function(productId, productName) {
        try {
            console.log(`🖱️ Registrando clic en producto: ${productName}`);
            
            // Enviar datos a Supabase
            if (window.supabaseClient && window.supabaseClient.isReady()) {
                window.supabaseClient
                    .from('product_clicks')
                    .insert({
                        product_id: productId,
                        product_name: productName,
                        session_id: this.getSessionId(),
                        page_url: window.location.href,
                        user_agent: navigator.userAgent,
                        clicked_at: new Date().toISOString()
                    })
                    .then(({ error }) => {
                        if (error) console.error('❌ Error registrando clic:', error);
                    });
            }
            
            // También guardar en localStorage para estadísticas offline
            this.saveLocalStat('product_clicks', { productId, productName, timestamp: Date.now() });
            
        } catch (error) {
            console.error('❌ Error en trackProductClick:', error);
        }
    },
    
    // Registrar una búsqueda
    trackProductSearch: function(searchTerm, resultsCount) {
        try {
            console.log(`🔍 Registrando búsqueda: "${searchTerm}" (${resultsCount} resultados)`);
            
            if (window.supabaseClient && window.supabaseClient.isReady()) {
                window.supabaseClient
                    .from('product_searches')
                    .insert({
                        search_term: searchTerm,
                        search_results_count: resultsCount,
                        session_id: this.getSessionId(),
                        user_agent: navigator.userAgent,
                        searched_at: new Date().toISOString()
                    })
                    .then(({ error }) => {
                        if (error) console.error('❌ Error registrando búsqueda:', error);
                    });
            }
            
            this.saveLocalStat('product_searches', { searchTerm, resultsCount, timestamp: Date.now() });
            
        } catch (error) {
            console.error('❌ Error en trackProductSearch:', error);
        }
    },
    
    // Registrar vista de producto
    trackProductView: function(productId, productName) {
        try {
            console.log(`👁️ Registrando vista de producto: ${productName}`);
            
            if (window.supabaseClient && window.supabaseClient.isReady()) {
                window.supabaseClient
                    .from('product_views')
                    .insert({
                        product_id: productId,
                        product_name: productName,
                        session_id: this.getSessionId(),
                        page_url: window.location.href,
                        user_agent: navigator.userAgent,
                        viewed_at: new Date().toISOString()
                    })
                    .then(({ error }) => {
                        if (error) console.error('❌ Error registrando vista:', error);
                    });
            }
            
            this.saveLocalStat('product_views', { productId, productName, timestamp: Date.now() });
            
        } catch (error) {
            console.error('❌ Error en trackProductView:', error);
        }
    },
    
    // Obtener ID de sesión
    getSessionId: function() {
        let sessionId = localStorage.getItem('tracking_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tracking_session_id', sessionId);
        }
        return sessionId;
    },
    
    // Guardar estadística localmente
    saveLocalStat: function(type, data) {
        try {
            const key = `tracking_${type}`;
            const stats = JSON.parse(localStorage.getItem(key) || '[]');
            stats.push(data);
            
            // Mantener solo los últimos 1000 registros
            if (stats.length > 1000) {
                stats.splice(0, stats.length - 1000);
            }
            
            localStorage.setItem(key, JSON.stringify(stats));
            
        } catch (error) {
            console.error('❌ Error guardando estadística local:', error);
        }
    },
    
    // Sincronizar estadísticas offline
    syncOfflineStats: async function() {
        try {
            console.log('🔄 Sincronizando estadísticas offline...');
            
            // Implementar lógica para enviar estadísticas guardadas localmente
            // a Supabase cuando haya conexión
            
        } catch (error) {
            console.error('❌ Error sincronizando estadísticas:', error);
        }
    }
};

// Exportar para uso global
window.Tracking = Tracking;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de tracking inicializado');
    
    // Sincronizar cada 5 minutos
    setInterval(() => {
        if (navigator.onLine) {
            Tracking.syncOfflineStats();
        }
    }, 5 * 60 * 1000);
});
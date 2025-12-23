// config.js - Configuración segura
(function() {
    // Solo ejecutar si estamos en desarrollo
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
        
        // Credenciales de desarrollo (NUNCA las subas a GitHub)
        // Usa un archivo .env.local para desarrollo
        window.SUPABASE_URL = 'https://opueqifkagoonpbubflj.supabase.co';
        window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdWVxaWZrYWdvb25wYnViZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc3OTksImV4cCI6MjA3ODkyMzc5OX0.8ES1VbCKOu79JrMpPNTkUuDZmo9MOHsVZunui4CJYSI';
        
        console.log('🔧 Configuración de desarrollo cargada');
    }
    // En producción, Netlify inyectará las variables
})();
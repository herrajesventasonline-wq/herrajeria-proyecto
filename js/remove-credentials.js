// remove-credentials.js - Remover credenciales de archivos JS
const fs = require('fs');
const readline = require('readline');

console.log('🔐 Removiendo credenciales expuestas...');

const files = [
    {
        name: 'supabase-client-public.js',
        patterns: [
            {
                search: /const SUPABASE_URL = 'https:\/\/opueqifkagoonpbubflj\.supabase\.co';/g,
                replace: "const SUPABASE_URL = window.SUPABASE_URL || '';"
            },
            {
                search: /const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdWVxaWZrYWdvb25wYnViZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc3OTksImV4cCI6MjA3ODkyMzc5OX0\.8ES1VbCKOu79JrMpPNTkUuDZmo9MOHsVZunui4CJYSI';/g,
                replace: "const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';"
            }
        ]
    },
    {
        name: 'supabase-client.js',
        patterns: [
            {
                search: /const SUPABASE_URL = 'https:\/\/opueqifkagoonpbubflj\.supabase\.co';/g,
                replace: "const SUPABASE_URL = window.SUPABASE_URL || '';"
            },
            {
                search: /const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdWVxaWZrYWdvb25wYnViZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc3OTksImV4cCI6MjA3ODkyMzc5OX0\.8ES1VbCKOu79JrMpPNTkUuDZmo9MOHsVZunui4CJYSI';/g,
                replace: "const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';"
            }
        ]
    }
];

files.forEach(fileInfo => {
    try {
        let content = fs.readFileSync(fileInfo.name, 'utf8');
        let modified = false;
        
        fileInfo.patterns.forEach(pattern => {
            if (pattern.search.test(content)) {
                content = content.replace(pattern.search, pattern.replace);
                modified = true;
                console.log(`✅ Reemplazado en ${fileInfo.name}`);
            }
        });
        
        if (modified) {
            fs.writeFileSync(fileInfo.name, content);
            console.log(`📝 ${fileInfo.name} actualizado`);
        } else {
            console.log(`✓ ${fileInfo.name} ya está seguro`);
        }
    } catch (error) {
        console.error(`❌ Error procesando ${fileInfo.name}:`, error.message);
    }
});

console.log('\n🎉 Credenciales removidas. Ahora:');
console.log('1. Crea un archivo .env.local con tus credenciales');
console.log('2. Asegúrate que .env esté en .gitignore');
console.log('3. Ejecuta: node verify.js para verificar');
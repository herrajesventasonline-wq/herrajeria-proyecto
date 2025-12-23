// verify.js - Verificar seguridad antes de subir a GitHub
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando seguridad del proyecto...');

// Archivos a verificar
const filesToCheck = [
    'supabase-client-public.js',
    'supabase-client.js'
];

let hasExposedCredentials = false;

filesToCheck.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Buscar credenciales expuestas
        const supabaseUrlRegex = /https:\/\/opueqifkagoonpbubflj\.supabase\.co/;
        const anonKeyRegex = /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/;
        
        if (supabaseUrlRegex.test(content) || anonKeyRegex.test(content)) {
            console.error(`❌ CREDENCIALES EXPUESTAS en ${file}`);
            hasExposedCredentials = true;
        } else {
            console.log(`✅ ${file} - OK`);
        }
    } catch (error) {
        console.log(`⚠️ No se pudo verificar ${file}: ${error.message}`);
    }
});

// Verificar .gitignore
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env') || !gitignore.includes('node_modules')) {
        console.error('❌ .gitignore incompleto');
        hasExposedCredentials = true;
    } else {
        console.log('✅ .gitignore - OK');
    }
} catch (error) {
    console.error('❌ No se encontró .gitignore');
    hasExposedCredentials = true;
}

if (hasExposedCredentials) {
    console.error('\n🚨 ¡DETENTE! Tienes credenciales expuestas.');
    console.error('Sigue estos pasos antes de subir a GitHub:');
    console.error('1. Ejecuta: node remove-credentials.js');
    console.error('2. Verifica que .env esté en .gitignore');
    console.error('3. No subas hasta que esta verificación pase');
    process.exit(1);
} else {
    console.log('\n✅ ¡Todo seguro! Puedes subir a GitHub.');
}
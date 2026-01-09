// price-adjustment-global.js - NUEVO ARCHIVO
async function updateGlobalPercentages() {
    const newWholesalePercent = 110; // Ejemplo: subir a 110%
    const newRetailPercent = 160; // Ejemplo: subir a 160%
    
    // Actualizar TODOS los productos
    const { data, error } = await supabaseClient
        .from('products')
        .update({
            wholesale_percentage: newWholesalePercent,
            retail_percentage: newRetailPercent,
            wholesale_price: supabaseClient.raw('cost_price * ? / 100', [newWholesalePercent]),
            retail_price: supabaseClient.raw('cost_price * ? / 100', [newRetailPercent])
        })
        .eq('is_active', true);
}
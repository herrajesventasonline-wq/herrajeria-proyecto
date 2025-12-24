// responsive-filters.js - Manejo unificado de filtros para todos los dispositivos

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Configurando filtros responsive...');
    
    // Configurar eventos para elementos del carrusel
    setupCarouselFilters();
    
    // Configurar eventos para tarjetas de categoría
    setupCategoryCards();
    
    // Configurar eventos para menús móviles
    setupMobileDropdowns();
    
    // Configurar eventos para menús desktop
    setupDesktopDropdowns();
    
    // Configurar scroll suave al mostrar productos
    setupSmoothScroll();
});

// 1. Configurar filtros para carrusel (todas las pantallas)
function setupCarouselFilters() {
    // Click en las slides del carrusel
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    carouselSlides.forEach(slide => {
        // Ya tiene onclick en HTML, pero lo reemplazamos para mejor control
        const originalOnClick = slide.getAttribute('onclick');
        if (originalOnClick) {
            slide.removeAttribute('onclick');
        }
        
        slide.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category') || 
                           this.querySelector('img').getAttribute('alt') || 
                           this.querySelector('h1').textContent;
            
            console.log(`🖱️ Click en carrusel - Categoría: ${category}`);
            handleCategoryFilter(category);
        });
    });
    
    // También los botones "Ver Catálogo" del carrusel
    const carouselButtons = document.querySelectorAll('.carousel-slide .btn');
    carouselButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar doble trigger
            const category = this.getAttribute('data-category') || 
                           this.closest('.carousel-slide').getAttribute('data-category');
            
            if (category) {
                console.log(`📱 Click en botón carrusel - Categoría: ${category}`);
                handleCategoryFilter(category);
            }
        });
    });
}

// 2. Configurar tarjetas de categoría
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        // Hacer toda la tarjeta clickeable
        card.style.cursor = 'pointer';
        
        // Remover onclick original si existe
        const originalOnClick = card.getAttribute('onclick');
        if (originalOnClick) {
            card.removeAttribute('onclick');
        }
        
        card.addEventListener('click', function(e) {
            // Evitar que se active al hacer clic en el botón
            if (e.target.closest('.btn')) return;
            
            const category = this.getAttribute('data-category') || 
                           this.querySelector('img').getAttribute('alt') || 
                           this.querySelector('h5').textContent;
            
            console.log(`📦 Click en tarjeta - Categoría: ${category}`);
            handleCategoryFilter(category);
        });
    });
    
    // También configurar los botones de explorar
    const exploreButtons = document.querySelectorAll('.category-card .btn');
    exploreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const category = this.getAttribute('data-category') || 
                           this.closest('.category-card').getAttribute('data-category');
            
            if (category) {
                handleCategoryFilter(category);
            }
        });
    });
}

// 3. Configurar menús móviles
function setupMobileDropdowns() {
    const mobileLinks = document.querySelectorAll('.mobile-dropdown-link');
    
    mobileLinks.forEach(link => {
        // Remover onclick original
        const originalOnClick = link.getAttribute('onclick');
        if (originalOnClick) {
            link.removeAttribute('onclick');
        }
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category') || 
                           this.textContent.trim();
            
            console.log(`📱 Click en menú móvil - Categoría: ${category}`);
            
            // Cerrar menú móvil después de hacer clic
            const mobileMenu = document.getElementById('mobileNavContainer');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            handleCategoryFilter(category);
        });
    });
}

// 4. Configurar menús desktop
function setupDesktopDropdowns() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        // Remover onclick original
        const originalOnClick = item.getAttribute('onclick');
        if (originalOnClick) {
            item.removeAttribute('onclick');
        }
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category') || 
                           this.textContent.trim();
            
            console.log(`💻 Click en dropdown - Categoría: ${category}`);
            handleCategoryFilter(category);
        });
    });
}

// 5. Función principal para manejar filtros
async function handleCategoryFilter(categoryName) {
    console.log(`🎯 Filtrando por categoría: ${categoryName}`);
    
    try {
        // Mostrar estado de carga
        showLoadingState(true);
        
        // Ocultar otras secciones
        hideOtherSections();
        
        // Mostrar sección de productos
        showProductsSection();
        
        // Actualizar título de sección
        updateSectionTitle(categoryName);
        
        // Filtrar productos (esto depende de tu implementación actual)
        await filterProductsByCategory(categoryName);
        
        // Scroll suave a la sección de productos
        scrollToProducts();
        
        // Ocultar estado de carga
        showLoadingState(false);
        
    } catch (error) {
        console.error('❌ Error filtrando productos:', error);
        showNotification('Error al cargar productos', 'error');
        showLoadingState(false);
    }
}

// 6. Funciones auxiliares
function showLoadingState(show) {
    const productsContainer = document.getElementById('products-container');
    
    if (show) {
        // Mostrar spinner de carga
        productsContainer.innerHTML = `
            <div class="col-12" id="products-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando productos...</span>
                </div>
                <p class="mt-3">Cargando productos de la categoría...</p>
            </div>
        `;
    } else {
        const loadingElement = document.getElementById('products-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
}

function hideOtherSections() {
    // Ocultar secciones que no sean productos
    const sectionsToHide = [
        'most-clicked-section',
        'best-selling-section'
    ];
    
    sectionsToHide.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

function showProductsSection() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.style.display = 'block';
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateSectionTitle(categoryName) {
    const titleElement = document.getElementById('products-section-title');
    if (titleElement) {
        titleElement.textContent = `Productos - ${categoryName}`;
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        setTimeout(() => {
            productsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }
}

// 7. Scroll suave mejorado
function setupSmoothScroll() {
    // Interceptar todos los enlaces que van a la sección de productos
    document.querySelectorAll('a[href="#products-section"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 8. Función para filtrar productos (adaptar a tu implementación existente)
async function filterProductsByCategory(categoryName) {
    // Esta función debe integrarse con tu código actual de filtrado
    // Aquí un ejemplo básico:
    
    console.log(`🔍 Buscando productos de: ${categoryName}`);
    
    // Si tienes una función global filterByCategory, úsala
    if (typeof window.filterByCategory === 'function') {
        return window.filterByCategory(categoryName);
    }
    
    // Si no, implementa tu lógica de filtrado aquí
    // Por ejemplo:
    // 1. Obtener todos los productos
    // 2. Filtrar por categoría
    // 3. Mostrar en #products-container
    
    throw new Error('Función de filtrado no implementada');
}

// 9. Función de notificación
function showNotification(message, type = 'info') {
    // Implementa tu sistema de notificaciones
    console.log(`${type.toUpperCase()}: ${message}`);
}

// 10. Función para alternar menú móvil (debe existir en tu código)
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileNavContainer');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Hacer funciones disponibles globalmente
window.handleCategoryFilter = handleCategoryFilter;
window.setupResponsiveFilters = function() {
    setupCarouselFilters();
    setupCategoryCards();
    setupMobileDropdowns();
    setupDesktopDropdowns();
};
// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Header scroll effect
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Carousel functionality (if exists on page)
const carousel = document.getElementById('carousel');
if (carousel) {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (slides.length > 0 && dotsContainer) {
        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
        
        const dots = document.querySelectorAll('.carousel-dot');
        
        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            currentSlide = (n + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        
        function nextSlide() {
            showSlide(currentSlide + 1);
        }
        
        function prevSlide() {
            showSlide(currentSlide - 1);
        }
        
        function goToSlide(n) {
            showSlide(n);
        }
        
        // Touch support for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    nextSlide();
                } else {
                    // Swipe right - previous slide
                    prevSlide();
                }
            }
        }
        
        // Auto advance carousel every 4 seconds
        setInterval(nextSlide, 4000);
    }
}

// Tabs functionality (if exists on page)
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Research tabs functionality (if exists on page)
const researchTabButtons = document.querySelectorAll('.research-tab-button');
const researchTabContents = document.querySelectorAll('.research-tab-content');

if (researchTabButtons.length > 0) {
    researchTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            researchTabButtons.forEach(btn => btn.classList.remove('active'));
            researchTabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Action Carousels functionality (if exists on page)
const actionCarousels = [
    { id: 'carousel-sobre', dotsId: 'dots-sobre', currentSlide: 0 },
    { id: 'carousel-acao-1', dotsId: 'dots-acao-1', currentSlide: 0 },
    { id: 'carousel-acao-2', dotsId: 'dots-acao-2', currentSlide: 0 },
    { id: 'carousel-acao-3', dotsId: 'dots-acao-3', currentSlide: 0 }
];

actionCarousels.forEach(carousel => {
    const carouselElement = document.getElementById(carousel.id);
    if (!carouselElement) return;
    
    const slides = carouselElement.querySelectorAll('.action-carousel-slide');
    const dotsContainer = document.getElementById(carousel.dotsId);
    
    if (slides.length === 0 || !dotsContainer) return;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('action-carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            showActionSlide(carousel, index);
        });
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.action-carousel-dot');
    
    function showActionSlide(carouselObj, n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        carouselObj.currentSlide = (n + slides.length) % slides.length;
        
        slides[carouselObj.currentSlide].classList.add('active');
        dots[carouselObj.currentSlide].classList.add('active');
    }
    
    function nextActionSlide() {
        showActionSlide(carousel, carousel.currentSlide + 1);
    }
    
    function prevActionSlide() {
        showActionSlide(carousel, carousel.currentSlide - 1);
    }
    
    // Touch support for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    carouselElement.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carouselElement.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleActionSwipe();
    }, { passive: true });
    
    function handleActionSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextActionSlide();
            } else {
                // Swipe right - previous slide
                prevActionSlide();
            }
        }
    }
    
    // Auto advance every 5 seconds
    setInterval(nextActionSlide, 5000);
});

console.log('🌿 GEPERA - Site carregado com sucesso!');

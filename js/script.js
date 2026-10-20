// ==========================================
// 1.5 ІКОНКА ВКЛАДКИ (ЗАЛЕЖИТЬ ВІД ТЕМИ БРАУЗЕРА/СИСТЕМИ)
// ==========================================
const favicon = document.getElementById('favicon');
const systemThemeMatcher = window.matchMedia('(prefers-color-scheme: dark)');

function updateFaviconBySystemTheme(e) {
    const isDark = e.matches; // true, якщо в системі темна тема
    if (favicon) {
        // Підставляємо потрібний файл (додаємо ?v=10 для обходу кешу)
        favicon.href = isDark 
            ? 'images/page_logo/km-logo-white.svg?v=10' 
            : 'images/page_logo/km-logo-black.svg?v=10';
    }
}

// Запускаємо одразу при відкритті сайту
updateFaviconBySystemTheme(systemThemeMatcher);

// Автоматично змінюємо іконку, якщо людина перемкнула тему на телефоні/ПК
systemThemeMatcher.addEventListener('change', updateFaviconBySystemTheme);




// Примусово повертаємо сторінку вгору перед оновленням/завантаженням
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}




document.addEventListener('DOMContentLoaded', () => {

// ==========================================
// 1. ТЕМА (СВІТЛА / ТЕМНА)
// ==========================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlEl = document.documentElement;

function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

const currentTheme = getInitialTheme();
htmlEl.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const activeTheme = htmlEl.getAttribute('data-theme');
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); 
        updateThemeIcon(newTheme);
    });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newSystemTheme);
        updateThemeIcon(newSystemTheme);
    }
});

function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// ==========================================
// 2. ГАЛЕРЕЯ (СЛАЙДЕР) — ЦИКЛІЧНИЙ ТА БЕЗ КНОПОК
// ==========================================
    const track = document.getElementById('sliderTrack');
    const pagination = document.getElementById('pagination');

    if (track) {
        let slides = Array.from(track.children);
        const originalCount = slides.length;
        let currentIndex = 1; 
        let isDragging = false;
        let startX = 0;
        let prevTranslate = 0;
        let autoSlideInterval;
        
        let lastTouchTime = 0;
        let isHovering = false; 

        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[originalCount - 1].cloneNode(true);
        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);
        slides = Array.from(track.children);


        for (let i = 0; i < originalCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i + 1));
            if (pagination) pagination.appendChild(dot);
        }
        const dots = document.querySelectorAll('.dot');

        function updateSlider(withAnimation = true) {
            if (currentIndex >= slides.length) {
                currentIndex = 1;
                withAnimation = false;
            } else if (currentIndex < 0) {
                currentIndex = originalCount;
                withAnimation = false;
            }

            track.style.transition = withAnimation ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            let dotIndex = currentIndex - 1;
            if (currentIndex <= 0) dotIndex = originalCount - 1;
            if (currentIndex >= slides.length - 1) dotIndex = 0;
            
            dots.forEach((dot, i) => dot.classList.toggle('active', i === dotIndex));
            prevTranslate = -currentIndex * track.offsetWidth;
        }

        updateSlider(false);

        track.addEventListener('transitionend', () => {
            if (currentIndex >= slides.length - 1) {
                currentIndex = 1;
                updateSlider(false);
            } else if (currentIndex <= 0) {
                currentIndex = originalCount;
                updateSlider(false);
            }
        });

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
            if (!isHovering) resetAutoSlide(); 
        }

        function dragStart(e) {
            if (e.type === 'touchstart') {
                lastTouchTime = Date.now();
            } else if (e.type === 'mousedown' && Date.now() - lastTouchTime < 500) {
                return;
            }

            if (currentIndex >= slides.length - 1) {
                currentIndex = 1;
                updateSlider(false);
            } else if (currentIndex <= 0) {
                currentIndex = originalCount;
                updateSlider(false);
            }

            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
            clearInterval(autoSlideInterval);
        }

        function dragMove(e) {
            if (!isDragging) return;
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const diff = currentX - startX;
            track.style.transform = `translateX(${prevTranslate + diff}px)`;
        }

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    let finalX;
    if (e.type.includes('mouse')) {
        finalX = e.clientX;
    } else {
        finalX = e.changedTouches[0].clientX;
    }

    const diff = finalX - startX;

    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            currentIndex--; 
        } else {
            currentIndex++; 
        }
    } 
    else if (Math.abs(diff) < 10) {
        const windowWidth = window.innerWidth;
        
        if (finalX < windowWidth / 2) {
            currentIndex--; 
        } 
        else {
            currentIndex++; 
        }
    }
    
    updateSlider();
    
    if (!isHovering) {
        resetAutoSlide();
    }
}

        track.addEventListener('mousedown', dragStart);
        track.addEventListener('mousemove', dragMove);
        track.addEventListener('mouseup', dragEnd);
        track.addEventListener('mouseleave', dragEnd);
        track.addEventListener('touchstart', dragStart, { passive: true });
        track.addEventListener('touchmove', dragMove, { passive: true });
        track.addEventListener('touchend', dragEnd);

        function startAutoSlide() {
            if (document.hidden) return; 
            
            autoSlideInterval = setInterval(() => {
                if (!isDragging && !isHovering) { 
                    currentIndex++;
                    updateSlider();
                }
            }, 5000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(autoSlideInterval);
            } else {
                if (!isHovering) resetAutoSlide();
            }
        });

        startAutoSlide();

        const sliderContainerEl = document.getElementById('sliderContainer');
        if (sliderContainerEl) {
            sliderContainerEl.addEventListener('mouseenter', () => {
                isHovering = true; 
                clearInterval(autoSlideInterval); 
            });
            sliderContainerEl.addEventListener('mouseleave', () => {
                isHovering = false; 
                if (!isDragging) {
                    resetAutoSlide(); 
                }
            });
        }
    }

// ==========================================
// 3. АКОРДЕОН FAQ
// ==========================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.nextElementSibling;
            
            btn.classList.toggle('active');
            requestAnimationFrame(() => {
                if (btn.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    });

// ==========================================
// 6. ПЛАВНА ПРОКРУТКА З ЦЕНТРУВАННЯМ СЕКЦІЙ
// ==========================================
    const navLinks = document.querySelectorAll('.nav-btn');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const targetId = this.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth', 
                        block: 'start'   
                    });
                }
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) window.closeInfoModal(activeModal.id);
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.closeInfoModal(overlay.id);
        });
    });

});

// ==========================================
// 5. ГЛОБАЛЬНІ ФУНКЦІЇ ДЛЯ МОДЕЛЬНИХ ВІКОН
// ==========================================

function adjustModalPosition() {
    const activeOverlay = document.querySelector('.modal-overlay.active');
    if (activeOverlay && window.visualViewport) {
        activeOverlay.style.height = window.visualViewport.height + 'px';
        activeOverlay.style.top = window.visualViewport.offsetTop + 'px';
    }
}

function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

window.openInfoModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        const scrollbarWidth = getScrollbarWidth();
        const navbar = document.querySelector('.navbar');

        document.body.style.transition = 'none';
        if (navbar) {
            navbar.style.transition = 'none';
            navbar.style.marginRight = `calc(auto + ${scrollbarWidth}px)`;
        }

        document.body.style.paddingRight = `${scrollbarWidth}px`;

        document.documentElement.classList.add('modal-open');
        modal.classList.add('active');
        history.pushState({ modalId: id }, "");

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', adjustModalPosition);
            window.visualViewport.addEventListener('scroll', adjustModalPosition);
            adjustModalPosition();
        }

        setTimeout(() => {
            document.body.style.transition = '';
            if (navbar) navbar.style.transition = '';
        }, 50); 
    }
}

window.closeInfoModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', adjustModalPosition);
            window.visualViewport.removeEventListener('scroll', adjustModalPosition);
            modal.style.height = '';
            modal.style.top = '';
        }

        setTimeout(() => {
            document.documentElement.classList.remove('modal-open');
            document.body.style.paddingRight = '';
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.transition = 'none';
                navbar.style.marginRight = '';
            }
            setTimeout(() => {
                document.body.style.transition = '';
                if (navbar) navbar.style.transition = '';
            }, 50);
        }, 400);
    }
}


// ==========================================
// 7. ЛОГІКА КАРТОК "ЩО МИ ВИГОТОВЛЯЄМО" (ЗАХИСТ ВІД СВАЙПУ)
// ==========================================
const furnitureItems = document.querySelectorAll('.furniture-item');
let isAnimating = false;
let startY = 0;
let moveThreshold = 10;

function closeAllFurnitureItems() {
    furnitureItems.forEach(el => {
        el.classList.remove('is-open');
        const desc = el.querySelector('.item-desc');
        if (desc) desc.style.maxHeight = null;
    });
}

furnitureItems.forEach(item => {
    item.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
        if (window.innerWidth > 1024 || isAnimating) return;

        const endY = e.changedTouches[0].clientY;
        if (Math.abs(endY - startY) > moveThreshold) return;

        e.preventDefault();
        handleFurnitureClick(item);
    });

    item.addEventListener('click', (e) => {
        if (window.innerWidth > 1024 || isAnimating || e.pointerType === 'touch') return;
        handleFurnitureClick(item);
    });
});

function handleFurnitureClick(item) {
    const isOpen = item.classList.contains('is-open');
    const hasOtherOpenItems = Array.from(furnitureItems).some(
        el => el.classList.contains('is-open') && el !== item
    );

    if (isOpen) {
        closeAllFurnitureItems();
        return;
    }

    if (hasOtherOpenItems) {
        isAnimating = true;
        closeAllFurnitureItems();
        setTimeout(() => {
            openItem(item);
            isAnimating = false;
        }, 400);
    } else {
        openItem(item);
    }
}

function openItem(item) {
    item.classList.add('is-open');
    const desc = item.querySelector('.item-desc');
    if (desc) {
        // iOS Safari Fix
        requestAnimationFrame(() => {
            desc.style.opacity = "0";
            desc.offsetHeight; 
            desc.style.maxHeight = desc.scrollHeight + "px";
            desc.style.opacity = "0.99";
            setTimeout(() => {
                desc.style.opacity = "1";
            }, 10);
            desc.style.opacity = "1";
        });
    }
}


// ==========================================
// 8. ПРЕЛОАД ЗОБРАЖЕНЬ ДЛЯ ГАЛЕРЕЇ
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const imageUrls = [
            'images/all/1.jpg',
            'images/all/2.jpg',
            'images/all/3.jpg',
            'images/all/4.jpg',
            'images/all/5.jpg',
            'images/all/6.jpg'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url; 
        });
    }, 1000);
});




















// 👇 Замість scroll — закриваємо тільки при тапі поза карткою
document.addEventListener('touchend', (e) => {
    if (!e.target.closest('.furniture-item') && !isAnimating) {
        closeAllFurnitureItems();
    }
}, { passive: true });

document.addEventListener('click', (e) => {
    if (!e.target.closest('.furniture-item') && !isAnimating) {
        closeAllFurnitureItems();
    }
});


document.addEventListener('invalid', (function() {
    let firstInvalid = null;

    // Скидаємо при кожному кліку на кнопку відправки
    // Це дозволить скрипту знайти "перше" поле заново при кожній спробі
    document.addEventListener('click', (e) => {
        if (e.target.type === 'submit' || e.target.closest('.btn-submit')) {
            firstInvalid = null;
        }
    });

    return function(e) {
        e.preventDefault(); // Прибираємо білу бульбашку

        if (!firstInvalid) {
            firstInvalid = e.target;
            
            // Додаємо невелику затримку, щоб браузер встиг обробити всі події
            setTimeout(() => {
                e.target.focus();
            }, 10);
        }
    };
})(), true);

// Обробка свайпу назад або кнопки "Назад" у браузері для закриття модалок
window.addEventListener('popstate', () => {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
        window.closeInfoModal(activeModal.id);
    }
});











document.addEventListener('DOMContentLoaded', () => {
    // 1. АНІМАЦІЯ НАВБАРУ (з'являється відразу)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        setTimeout(() => {
            navbar.classList.add('active');
        }, 100);
    }

    // 2. НАЛАШТУВАННЯ ПОЯВИ ЕЛЕМЕНТІВ (Intersection Observer)
    const isMobile = window.innerWidth < 768;
    
    const observerOptions = {
        // Для мобілок ставимо мінімальний поріг, щоб не було "дірок" при скролі
        threshold: isMobile ? 0.01 : 0.10, 
        // rootMargin створює невидиму зону під екраном (50px), 
        // щоб елементи починали з'являтися ще до того, як їх побачить око
        rootMargin: '0px 0px 50px 0px' 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Вимикаємо спостереження, щоб не навантажувати процесор зайвий раз
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Знаходимо всі елементи з класом .reveal та запускаємо спостереження
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
});













// Захист поля телефону від вводу літер
const phoneInput = document.getElementById('userPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        // Замінюємо всі символи, які НЕ є цифрою (\d) або плюсом (+), на порожнечу ('')
        this.value = this.value.replace(/[^\d+]/g, '');
    });
}
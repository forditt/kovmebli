import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://furniture-e0412-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- НАЛАШТУВАННЯ ЗАХИСТУ ВІД СПАМУ ---
const SETTINGS = {
    USE_LIMITS: true,        
    CHECK_IP: true,         
    MAX_REQUESTS: 2,         // Максимум 2 заявки
    COOLDOWN: 20000,         // Кулдаун між кліками (20 сек)
    RESET_TIME: 36000000     // 10 годин (скидання лічильника)
};

// --- СПОВІЩЕННЯ ---
function showNotification(message, isError = false) {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.classList.remove('show');
        setTimeout(() => { if (existingToast.parentNode) existingToast.remove(); }, 400); 
    }
    const toast = document.createElement('div');
    toast.className = 'custom-toast' + (isError ? ' error' : '');
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 50); 
    setTimeout(() => {
        if (toast.parentNode && toast.classList.contains('show')) {
            toast.classList.remove('show');
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
        }
    }, 3000);
}

// --- ОТРИМАННЯ IP ---
async function getUserIP() {
    if (!SETTINGS.CHECK_IP) return "IP_DISABLED";
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch (e) {
        return "IP_ERROR";
    }
}

// --- ПЕРЕВІРКА ЛІМІТІВ ---
function checkLimits(type) {
    if (!SETTINGS.USE_LIMITS) return { allowed: true };
    const now = Date.now();
    const lastSent = parseInt(localStorage.getItem(`last_${type}_sent`) || 0);
    const count = parseInt(localStorage.getItem(`${type}_count`) || 0);

    if (lastSent !== 0 && (now - lastSent > SETTINGS.RESET_TIME)) {
        localStorage.setItem(`${type}_count`, 0);
        return { allowed: true };
    }

    if (lastSent !== 0 && (now - lastSent < SETTINGS.COOLDOWN)) {
        const sec = Math.ceil((SETTINGS.COOLDOWN - (now - lastSent)) / 1000);
        return { allowed: false, msg: `Зачекайте ${sec} сек.` };
    }

    if (count >= SETTINGS.MAX_REQUESTS) {
        return { allowed: false, msg: 'Ліміт вичерпано, максимум 2 запити.' };
    }

    return { allowed: true };
}

// --- ВІДПРАВКА ЗАЯВКИ ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('userName');
        const phoneInput = document.getElementById('userPhone');

        // Валідація
        if (!nameInput.value.trim()) { nameInput.focus(); return; }
        if (!phoneInput.value.trim()) { phoneInput.focus(); return; }

        // Перевірка ліміту
        const limit = checkLimits('contact');
        if (!limit.allowed) {
            showNotification(limit.msg, true);
            return;
        }

        try {
            const ip = await getUserIP();
            
            const currentCount = parseInt(localStorage.getItem('contact_count') || 0);
            localStorage.setItem('last_contact_sent', Date.now());
            localStorage.setItem('contact_count', currentCount + 1);

            // Відправляємо в Firebase
            await push(ref(db, 'furniture_requests'), {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                ip: ip, 
                status: 'new', 
                timestamp: Date.now()
            });

            if (typeof closeInfoModal === 'function') closeInfoModal('modal-contact');
            showNotification('Заявку відправлено! Ми зателефонуємо.');
            contactForm.reset();
        } catch (err) { 
            showNotification('Помилка відправки!', true); 
        }
    });
}
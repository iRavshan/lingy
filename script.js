document.addEventListener('DOMContentLoaded', () => {
    // ---- Elements ----
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
    const htmlElement = document.documentElement;
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // ---- Theme Management ----
    // Check local storage for theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    }

    function updateThemeIcons(theme) {
        const iconClass = theme === 'dark' ? 'fa-sun' : 'fa-moon';
        
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        }
        
        if (themeToggleMobileBtn) {
            themeToggleMobileBtn.innerHTML = `<span>Mavzuni o'zgartirish</span> <i class="fa-solid ${iconClass}"></i>`;
        }
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (themeToggleMobileBtn) themeToggleMobileBtn.addEventListener('click', toggleTheme);

    // ---- Navbar Scroll Effect ----
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ---- Mobile Menu ----
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenu.classList.contains('active') ? 'fa-xmark' : 'fa-bars';
            mobileMenuBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
        });

        // Close mobile menu on link click
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
            });
        });
    }

    // ---- Scroll Animations ----
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // ---- Translator Logic (Mock) ----
    const textInput = document.getElementById('matn-kiritish');
    const charCount = document.getElementById('char-count');
    const clearBtn = document.getElementById('clear-btn');
    const translateBtn = document.getElementById('tarjima-qilish');
    const micBtn = document.getElementById('nutq-kiritish');
    
    const videoPlaceholder = document.getElementById('video-placeholder');
    const slVideo = document.getElementById('sl-video');
    const loadingOverlay = document.getElementById('loading-overlay');
    const videoStatus = document.getElementById('video-status');
    
    // Video controls
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnReplay = document.getElementById('btn-replay');
    const speedSelect = document.getElementById('speed-select');

    const MAX_CHARS = 500;

    // Character count update
    if (textInput && charCount) {
        textInput.addEventListener('input', () => {
            const length = textInput.value.length;
            charCount.textContent = `${length} / ${MAX_CHARS}`;
            
            if (length > MAX_CHARS) {
                textInput.value = textInput.value.substring(0, MAX_CHARS);
                charCount.textContent = `${MAX_CHARS} / ${MAX_CHARS}`;
                charCount.style.color = 'var(--danger)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        });
    }

    // Clear Button
    if (clearBtn && textInput) {
        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            if (charCount) charCount.textContent = `0 / ${MAX_CHARS}`;
            resetVideo();
            showToast('Matn tozalandi', 'success');
        });
    }

    // Mic Button Mock
    if (micBtn) {
        let isRecording = false;
        micBtn.addEventListener('click', () => {
            isRecording = !isRecording;
            if (isRecording) {
                micBtn.classList.add('recording');
                micBtn.innerHTML = `<i class="fa-solid fa-stop"></i> <span>To'xtatish</span>`;
                showToast('Ovoz yozish boshlandi', 'success');
            } else {
                micBtn.classList.remove('recording');
                micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>Gapirish</span>`;
                showToast('Ovoz yozish to\'xtatildi', 'warning');
                if (textInput) {
                    textInput.value += (textInput.value ? ' ' : '') + "Assalomu alaykum!";
                    const ev = new Event('input', { bubbles: true});
                    textInput.dispatchEvent(ev);
                }
            }
        });
    }

    // Translate Button Mock
    if (translateBtn && textInput) {
        translateBtn.addEventListener('click', () => {
            const text = textInput.value.trim();
            
            if (!text) {
                showToast('Iltimos, tarjima qilish uchun matn kiriting', 'error');
                textInput.focus();
                return;
            }

            // Simulate API Call / Translation Process
            startTranslationMock();
        });
    }

    function startTranslationMock() {
        // UI Updates
        videoPlaceholder.style.display = 'none';
        slVideo.style.display = 'none';
        loadingOverlay.style.display = 'flex';
        
        videoStatus.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Tayyorlanmoqda';
        videoStatus.className = 'status-badge loading';
        
        disableVideoControls();

        // Simulate network delay
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            slVideo.style.display = 'block';
            
            // Set dummy video source (since we don't have a real one, use a placeholder or generic video if available)
            // For now, we will just show a colored block representing the video to simulate success
            slVideo.poster = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%232563eb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23ffffff%22%20font-size%3D%2224%22%20font-family%3D%22Arial%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ETarjima%20qilingan%20Video%3C%2Ftext%3E%3C%2Fsvg%3E';
            
            videoStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tayyor';
            videoStatus.className = 'status-badge ready';
            
            enableVideoControls();
            showToast('Tarjima muvaffaqiyatli yakunlandi', 'success');
        }, 1500);
    }

    function resetVideo() {
        videoPlaceholder.style.display = 'flex';
        slVideo.style.display = 'none';
        loadingOverlay.style.display = 'none';
        
        videoStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Kutmoqda';
        videoStatus.className = 'status-badge';
        
        disableVideoControls();
    }

    function enableVideoControls() {
        if (btnPlayPause) btnPlayPause.disabled = false;
        if (btnReplay) btnReplay.disabled = false;
        if (speedSelect) speedSelect.disabled = false;
        
        if (btnPlayPause) {
            btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    }

    function disableVideoControls() {
        if (btnPlayPause) {
            btnPlayPause.disabled = true;
            btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        if (btnReplay) btnReplay.disabled = true;
        if (speedSelect) speedSelect.disabled = true;
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        const area = document.getElementById('notification-area');
        if (!area) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-circle-xmark';
        if (type === 'warning') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        
        area.appendChild(toast);
        
        // Trigger reflow
        void toast.offsetWidth;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Global listener for custom toast events
    window.addEventListener('toast', (e) => {
        if (e.detail && e.detail.message) {
            showToast(e.detail.message, e.detail.type || 'success');
        }
    });
});

// High-Level App Mode Switching
function switchAppMode(mode) {
    // Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('active');

    // Sections
    document.querySelectorAll('.mode-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(`mode-${mode}`).style.display = 'grid'; // Note: app-grid uses CSS grid so it needs grid
}

// Inner Tabs Logic (For Mode 2 Video input tabs)
function switchVideoTab(tabId) {
    // Find the current mode's card
    const container = document.getElementById('mode-video-to-sl');
    
    // Update buttons
    container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    container.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');

    // Hide all tabs
    container.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if(selectedTab) {
        selectedTab.style.display = 'flex';
        selectedTab.classList.add('active');
    }

    // Update Header
    const title = document.getElementById('video-input-title');
    const icon = document.getElementById('video-input-icon');
    if(tabId === 'fayl-video') {
        title.innerText = "Mahalliy Video fayl";
        icon.className = "fa-solid fa-cloud-arrow-up text-primary";
    } else if(tabId === 'havola-video') {
        title.innerText = "YouTube / Havola";
        icon.className = "fa-brands fa-youtube text-danger";
    }
}

// File Upload Logic
function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        document.getElementById('file-upload-box').style.display = 'none';
        document.getElementById('selected-file-info').style.display = 'flex';
        
        document.getElementById('file-name').innerText = file.name;
        
        let fileSize = (file.size / (1024 * 1024)).toFixed(2);
        document.getElementById('file-size').innerText = `${fileSize} MB`;
        
        document.getElementById('file-translate-btn').disabled = false;
    }
}

function clearFileSelection() {
    document.getElementById('file-upload').value = '';
    document.getElementById('selected-file-info').style.display = 'none';
    document.getElementById('file-upload-box').style.display = 'flex';
    document.getElementById('file-translate-btn').disabled = true;
}

// Ensure the old trranslation button logic calls the right thing if we updated the HTML to use simulateTranslation()
function simulateTranslation() {
    // Try to click original translation logic from initTranslatorMock if it exists
    const simulateBtn = document.getElementById('tarjima-qilish');
    // The initTranslatorMock attaches the event listener to #tarjima-qilish. 
    // Wait, the HTML inline onclick is 'simulateTranslation()'. We shouldn't infinitely loop.
    // Instead of clicking the button to trigger itself, we will trigger the event if possible or just rely on the existing listener.
}

// Picture in Picture simulation logic
function simulateVideoGeneration() {
    window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Fayl tarjimasi boshlandi...', type: 'success'}}));
    
    // UI Loading state
    document.getElementById('video-pip-placeholder').style.display = 'none';
    document.getElementById('loading-pip-overlay').style.display = 'flex';
    document.getElementById('video-pip-status').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Jarayon ketmoqda';
    document.getElementById('video-pip-status').style.backgroundColor = 'var(--bg-card)';
    document.getElementById('video-pip-status').style.color = 'var(--text-main)';

    // Mock API Delay
    setTimeout(() => {
        document.getElementById('loading-pip-overlay').style.display = 'none';
        document.getElementById('pip-result-mockup').style.display = 'block';
        
        const statusBadge = document.getElementById('video-pip-status');
        statusBadge.innerHTML = '<i class="fa-solid fa-check-circle"></i> Tayyor';
        statusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // success tint
        statusBadge.style.color = 'var(--success)';
        
        document.getElementById('download-pip-btn').disabled = false;
        
        window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Tarjimon videoga muvaffaqiyatli ulashib xotiraga saqlandi!', type: 'success'}}));
    }, 3500);
}

// Audio upload logic for Text-to-SL Mode
function handleAudioUpload(input) {
    if (input.files && input.files[0]) {
        window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Audio tahlil qilinmoqda...', type: 'success'}}));
        
        // Disable text area temporarily
        const textarea = document.getElementById('matn-kiritish');
        textarea.disabled = true;
        textarea.value = 'Audio tinglanmoqda va matnga o\'girilmoqda...';

        setTimeout(() => { 
            textarea.disabled = false;
            textarea.value = "Assalomu alaykum, bu siz yuklagan audio xabarning matn ko'rinishi."; 
            
            const charCount = document.getElementById('char-count');
            if (charCount) {
                charCount.innerText = textarea.value.length + ' / 500';
            }
            
            window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Audio muvaffaqiyatli matnga o\'girildi!', type: 'success'}})); 
            
            // Automatically launch translation
            simulateTranslation();
        }, 2000);
        
        // Reset input to allow submitting the same file again if wanted
        input.value = '';
    }
}

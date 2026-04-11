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

    // ---- Real-time Translation Toggle ----
    const realtimeToggle = document.getElementById('realtime-toggle');
    const realtimeIcon = document.getElementById('realtime-icon');
    const realtimeLabel = document.getElementById('realtime-label');
    let isRealtimeMode = false;
    let realtimeDebounceTimer = null;

    function updateRealtimeUI(enabled) {
        isRealtimeMode = enabled;
        if (realtimeIcon) realtimeIcon.style.color = enabled ? 'var(--success)' : 'var(--text-muted)';
        if (realtimeLabel) realtimeLabel.style.color = enabled ? 'var(--success)' : 'var(--text-muted)';
        
        // Hide/show the translate button
        if (translateBtn) {
            translateBtn.style.display = enabled ? 'none' : '';
        }

        if (enabled && textInput && textInput.value.trim()) {
            // Immediately translate what's already typed
            showRealtimeLetter(textInput.value);
        }
    }

    if (realtimeToggle) {
        realtimeToggle.addEventListener('change', () => {
            updateRealtimeUI(realtimeToggle.checked);
        });
    }

    // Character count update + real-time translation
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

            // Real-time translation mode
            if (isRealtimeMode) {
                clearTimeout(realtimeDebounceTimer);
                realtimeDebounceTimer = setTimeout(() => {
                    showRealtimeLetter(textInput.value);
                }, 80);
            }
        });
    }

    // Show the last typed letter's sign image in real-time
    function showRealtimeLetter(text) {
        if (!text) { resetVideo(); return; }
        
        const imgSequenceBlock = document.getElementById('sl-image-sequence');
        const currentImg = document.getElementById('current-sl-image');
        const currentLetter = document.getElementById('current-sl-letter');
        
        if (!imgSequenceBlock || !currentImg || !currentLetter) return;
        
        // Stop any sequence playback
        if (slPlaybackInterval) clearInterval(slPlaybackInterval);
        isPlayingSl = false;
        
        // Get the last valid character
        const validChars = 'abcdefghijklmnopqrstuvwxyz';
        const raw = text.toLowerCase();
        let lastChar = null;
        
        for (let i = raw.length - 1; i >= 0; i--) {
            if (validChars.includes(raw[i])) {
                lastChar = raw[i];
                break;
            } else if (raw[i] === ' ') {
                lastChar = ' ';
                break;
            }
        }
        
        if (!lastChar) return;
        
        // Show the image container
        videoPlaceholder.style.display = 'none';
        slVideo.style.display = 'none';
        imgSequenceBlock.style.display = 'flex';
        
        videoStatus.innerHTML = '<i class="fa-solid fa-bolt" style="color:var(--success)"></i> Real-vaqt';
        videoStatus.className = 'status-badge ready';
        
        // Smooth transition
        currentImg.style.opacity = '0';
        setTimeout(() => {
            if (lastChar === ' ') {
                currentImg.src = '';
                currentLetter.innerText = '_';
            } else {
                currentImg.src = `/static/img/alphabet/${lastChar}.png`;
                currentLetter.innerText = lastChar;
                currentImg.onerror = function() { this.src = ''; };
            }
            currentImg.style.opacity = '1';
        }, 100);
        
        // Also prepare the full sequence for replay
        slSequence = [];
        for (let i = 0; i < raw.length; i++) {
            if (validChars.includes(raw[i])) {
                slSequence.push({ char: raw[i], type: 'letter' });
            } else if (raw[i] === ' ') {
                slSequence.push({ char: ' ', type: 'space' });
            }
        }
        slCurrentIndex = slSequence.length - 1;
        
        enableVideoControls();
        const btnPlay = document.getElementById('btn-play-pause');
        if (btnPlay) btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
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

    // Speech-to-Text via Web Speech API
    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isRecording = false;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'uz-UZ';

            let finalTranscript = '';

            recognition.onstart = () => {
                isRecording = true;
                finalTranscript = '';
                micBtn.classList.add('recording');
                micBtn.innerHTML = `<i class="fa-solid fa-stop"></i> <span>To'xtatish</span>`;
                showToast('Mikrofon yoqildi — gapiring', 'success');
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (textInput) {
                    const existingText = textInput.dataset.prevText || '';
                    textInput.value = existingText + finalTranscript + interimTranscript;
                    const ev = new Event('input', { bubbles: true });
                    textInput.dispatchEvent(ev);
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    showToast('Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.', 'error');
                } else if (event.error === 'no-speech') {
                    showToast('Ovoz eshitilmadi. Qayta urinib ko\'ring.', 'warning');
                } else if (event.error === 'network') {
                    showToast('Tarmoq xatosi. Internetni tekshiring.', 'error');
                } else {
                    showToast('Xatolik yuz berdi: ' + event.error, 'error');
                }
                stopRecording();
            };

            recognition.onend = () => {
                if (isRecording) {
                    if (textInput && finalTranscript.trim()) {
                        textInput.dataset.prevText = textInput.value;
                    }
                    stopRecording();
                }
            };
        }

        function stopRecording() {
            isRecording = false;
            micBtn.classList.remove('recording');
            micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>Gapirish</span>`;
            if (recognition) {
                try { recognition.stop(); } catch(e) {}
            }
            if (textInput) {
                textInput.dataset.prevText = textInput.value;
            }
        }

        micBtn.addEventListener('click', () => {
            if (!SpeechRecognition) {
                showToast('Bu brauzer ovozni yozishni qo\'llab-quvvatlamaydi. Chrome yoki Edge ishlatib ko\'ring.', 'error');
                return;
            }

            if (isRecording) {
                stopRecording();
                showToast('Ovoz yozish to\'xtatildi', 'warning');
            } else {
                if (textInput) {
                    textInput.dataset.prevText = textInput.value;
                }
                try {
                    recognition.start();
                } catch (e) {
                    stopRecording();
                    setTimeout(() => recognition.start(), 200);
                }
            }
        });
    }

    // Translate Button (Manual mode)
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

    let slPlaybackInterval = null;
    let slCurrentIndex = 0;
    let slSequence = [];
    let isPlayingSl = false;

    function startTranslationMock(textToTranslate) {
        if(!textToTranslate && textInput) textToTranslate = textInput.value.trim();
        if(!textToTranslate) return;

        // UI Updates
        videoPlaceholder.style.display = 'none';
        slVideo.style.display = 'none';
        const imgSequenceBlock = document.getElementById('sl-image-sequence');
        if (imgSequenceBlock) imgSequenceBlock.style.display = 'none';
        
        loadingOverlay.style.display = 'flex';
        
        videoStatus.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Tayyorlanmoqda';
        videoStatus.className = 'status-badge loading';
        
        disableVideoControls();

        // Stop any ongoing playback
        if (slPlaybackInterval) clearInterval(slPlaybackInterval);

        // Prepare sequence mapping
        const rawText = textToTranslate.toLowerCase();
        slSequence = [];
        
        // Very basic tokenizer for Uzbek latin (treating ch, sh, o', g' would require slightly complex processing, let's keep it letter by letter for simplicity or basic mapping)
        const validChars = 'abcdefghijklmnopqrstuvwxyz'.split('');
        
        for (let i = 0; i < rawText.length; i++) {
            let char = rawText[i];
            
            // Handle basic multi-char like sh, ch, ng if needed. For now simple character fallback
            if (validChars.includes(char)) {
                slSequence.push({ char: char, type: 'letter' });
            } else if (char === ' ') {
                slSequence.push({ char: ' ', type: 'space' });
            }
        }

        // Simulate network delay
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            if (imgSequenceBlock) {
                imgSequenceBlock.style.display = 'flex';
                // Remove sl-video just in case
                slVideo.style.display = 'none';
            }
            
            videoStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tayyor';
            videoStatus.className = 'status-badge ready';
            
            enableVideoControls();
            showToast('Tarjima muvaffaqiyatli yakunlandi', 'success');
            
            // Auto start playing
            slCurrentIndex = 0;
            isPlayingSl = true;
            playSlSequence();
        }, 1500);
    }

    function playSlSequence() {
        const speed = speedSelect ? parseFloat(speedSelect.value) : 1;
        const intervalMs = 1500 / speed; // Base 1.5s per letter
        
        const currentImg = document.getElementById('current-sl-image');
        const currentLetter = document.getElementById('current-sl-letter');
        const imgSequenceBlock = document.getElementById('sl-image-sequence');

        if (!currentImg || !currentLetter || slSequence.length === 0) return;
        
        if (btnPlayPause) {
            btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }

        // Immediate first render
        renderSlFrame();

        slPlaybackInterval = setInterval(() => {
            slCurrentIndex++;
            if (slCurrentIndex >= slSequence.length) {
                clearInterval(slPlaybackInterval);
                isPlayingSl = false;
                if (btnPlayPause) btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
                // Don't auto-reset, just stop at the end or clear
                setTimeout(() => {
                    currentImg.style.opacity = '0';
                    currentLetter.innerText = '';
                }, 1000);
                return;
            }
            renderSlFrame();
        }, intervalMs);
    }

    function renderSlFrame() {
        const currentImg = document.getElementById('current-sl-image');
        const currentLetter = document.getElementById('current-sl-letter');
        const item = slSequence[slCurrentIndex];
        
        // Smooth transition effect
        currentImg.style.opacity = '0';
        
        setTimeout(() => {
            if (item.type === 'space') {
                currentImg.src = '';
                currentLetter.innerText = '_';
            } else {
                currentImg.src = `/static/img/alphabet/${item.char}.png`;
                currentLetter.innerText = item.char;
                
                // Fallback for missing images
                currentImg.onerror = function() {
                    this.src = ''; // Clear broken image icon
                    currentLetter.innerText = item.char; // Let the text remain
                };
            }
            currentImg.style.opacity = '1';
        }, 150);
    }

    function toggleSlPlayback() {
        if (!slSequence || slSequence.length === 0) return;
        
        if (isPlayingSl) {
            clearInterval(slPlaybackInterval);
            isPlayingSl = false;
            if (btnPlayPause) btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            if (slCurrentIndex >= slSequence.length) {
                slCurrentIndex = 0; // restart if at end
            }
            isPlayingSl = true;
            playSlSequence();
        }
    }

    if (btnPlayPause) {
        // remove old listener if any and add new
        const newBtnPlay = btnPlayPause.cloneNode(true);
        btnPlayPause.parentNode.replaceChild(newBtnPlay, btnPlayPause);
        newBtnPlay.addEventListener('click', toggleSlPlayback);
        // Note: we can't reliably update `btnPlayPause` variable references unless we reload or just modify existing
    }
    
    // Better hook for events
    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-play-pause')) toggleSlPlayback();
        if (e.target.closest('#btn-replay')) {
            if (slPlaybackInterval) clearInterval(slPlaybackInterval);
            slCurrentIndex = 0;
            isPlayingSl = true;
            playSlSequence();
        }
    });

    function resetVideo() {
        videoPlaceholder.style.display = 'flex';
        slVideo.style.display = 'none';
        const imgSequenceBlock = document.getElementById('sl-image-sequence');
        if (imgSequenceBlock) imgSequenceBlock.style.display = 'none';
        
        loadingOverlay.style.display = 'none';
        if (slPlaybackInterval) clearInterval(slPlaybackInterval);
        slSequence = [];
        isPlayingSl = false;
        
        videoStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Kutmoqda';
        videoStatus.className = 'status-badge';
        
        disableVideoControls();
    }

    function enableVideoControls() {
        // Find them freshly just in case
        const btnPlay = document.getElementById('btn-play-pause');
        const btnRep = document.getElementById('btn-replay');
        const spdSel = document.getElementById('speed-select');
        
        if (btnPlay) btnPlay.disabled = false;
        if (btnRep) btnRep.disabled = false;
        if (spdSel) spdSel.disabled = false;
        
        if (btnPlay) {
            btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    }

    function disableVideoControls() {
        const btnPlay = document.getElementById('btn-play-pause');
        const btnRep = document.getElementById('btn-replay');
        const spdSel = document.getElementById('speed-select');
        
        if (btnPlay) {
            btnPlay.disabled = true;
            btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        if (btnRep) btnRep.disabled = true;
        if (spdSel) spdSel.disabled = true;
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

// Bridge: global simulateTranslation triggers the scoped startTranslationMock via button click
function simulateTranslation() {
    const btn = document.getElementById('tarjima-qilish');
    if (btn) btn.click();
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
        statusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
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
            
            // Automatically launch translation via button click
            simulateTranslation();
        }, 2000);
        
        // Reset input to allow submitting the same file again if wanted
        input.value = '';
    }
}

// ============== SIGN TO TEXT LOGIC ==============

function resetSlResultAndLoad() {
    document.getElementById('sl-result-placeholder').style.display = 'none';
    document.getElementById('sl-result-content').style.display = 'none';
    document.getElementById('sl-result-loader').style.display = 'flex';
    
    document.getElementById('btn-read-aloud').disabled = true;
    document.getElementById('btn-copy-text').disabled = true;
    
    document.getElementById('sl-text-status').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Tahlil ketmoqda';
    document.getElementById('sl-text-status').style.backgroundColor = 'var(--bg-card)';
    document.getElementById('sl-text-status').style.color = 'var(--text-main)';
}

function showSlTextResult(text) {
    document.getElementById('sl-result-loader').style.display = 'none';
    document.getElementById('sl-result-content').style.display = 'block';
    
    const statusBadge = document.getElementById('sl-text-status');
    statusBadge.innerHTML = '<i class="fa-solid fa-check-circle"></i> Tayyor';
    statusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; 
    statusBadge.style.color = 'var(--success)';
    
    document.getElementById('btn-read-aloud').disabled = false;
    document.getElementById('btn-copy-text').disabled = false;
    
    document.getElementById('sl-result-content').innerHTML = `<span style="color:var(--primary);">"${text}"</span>`;
    window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Imo-ishora matnga muvaffaqiyatli o\'girildi!', type: 'success'}}));
}

let currentStream = null;

function toggleCameraScan() {
    const videoElem = document.getElementById('camera-stream');
    const placeholder = document.getElementById('camera-placeholder');
    const btnBox = document.getElementById('btn-toggle-camera');

    // If Camera is already ON, stop it
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
        
        videoElem.style.display = 'none';
        videoElem.srcObject = null;
        placeholder.style.display = 'block';
        
        // Reset button UI
        if(btnBox) {
            btnBox.innerHTML = 'Kamerani yoqish <i class="fa-solid fa-video"></i>';
        }
        window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Kamera o\'chirildi.', type: 'warning'}}));
        return;
    }

    // Attempt to start Camera
    window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Kameraga ruxsat so\'ralmoqda...', type: 'info'}}));
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                currentStream = stream;
                videoElem.srcObject = stream;
                videoElem.style.display = 'block';
                videoElem.play();
                
                placeholder.style.display = 'none';
                document.getElementById('sl-video-upload').value = '';
                
                if(btnBox) {
                    btnBox.innerHTML = 'Kamerani to\'xtatish <i class="fa-solid fa-video-slash"></i>';
                }
                
                resetSlResultAndLoad();
                
                // Mock API processing while camera is on
                setTimeout(() => {
                    if (currentStream) { // only show result if camera wasn't disabled yet
                        showSlTextResult("Xayrli kun, ishlaringiz yaxshimi?");
                    }
                }, 4000);
            })
            .catch((err) => {
                console.error("Kamera xatosi:", err);
                window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Kameraga ulanib bo\'lmadi! Ruxsatni sozlang.', type: 'error'}}));
            });
    } else {
        window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Brauzeringiz kamerani qo\'llab quvvatlamaydi.', type: 'error'}}));
    }
}

function simulateVideoSignScan(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        window.dispatchEvent(new CustomEvent('toast', {detail: {message: 'Fayl yuklandi. Tahlil boshlanmoqda...', type: 'success'}}));
        
        document.getElementById('camera-placeholder').innerHTML = `
            <div style="font-size: 3rem; color: var(--primary); margin-bottom: 15px;">
                <i class="fa-solid fa-video-slash"></i>
            </div>
            <h4>Fayl tahlil qilinmoqda...</h4>
            <p class="text-primary text-sm mt-2">${file.name}</p>
        `;
        
        resetSlResultAndLoad();
        
        // Mock processing
        setTimeout(() => {
            showSlTextResult("Bu " + file.name + " faylidan chiqarilgan matn namunasi.");
            document.getElementById('camera-placeholder').innerHTML = `
                <i class="fa-solid fa-video text-muted" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h4>Kamerangizni yoqing yoki tayyor fayl yuklang</h4>
                <p class="text-muted text-sm mt-2">Imo-ishorani kompyuter o'qiydi va uni matnga aylantiradi.</p>
            `;
            input.value = ''; // format it again
        }, 3000);
    }
}


// ======== HERO MOCKUP ANIMATION ENGINE ========
(function heroMockupAnimation() {
    const phaseMic = document.getElementById('hero-phase-mic');
    const phaseText = document.getElementById('hero-phase-text');
    const phaseVideo = document.getElementById('hero-phase-video');
    const typedText = document.getElementById('hero-typed-text');
    const statusDots = document.getElementById('hero-status-dots');
    const statusLabel = document.getElementById('hero-status-label');

    // Abort if elements not found (e.g. on about.html or learning.html)
    if (!phaseMic || !phaseText || !phaseVideo) return;

    const textToType = '"Assalomu alaykum"';
    const phases = [phaseMic, phaseText, phaseVideo];
    const statusLabels = [
        '1 / 3 — Nutqni yozib olish',
        '2 / 3 — Matnga o\'girish',
        '3 / 3 — Imo-ishora tarjimasi'
    ];

    function setActivePhase(index) {
        phases.forEach((p, i) => {
            if (i === index) {
                p.style.display = 'flex';
                setTimeout(() => p.classList.add('phase-active'), 50);
            } else {
                p.classList.remove('phase-active');
                setTimeout(() => { p.style.display = 'none'; }, 500);
            }
        });

        // Update status dots
        if (statusDots) {
            const dots = statusDots.querySelectorAll('.status-dot');
            dots.forEach((dot, i) => {
                if (i <= index) {
                    dot.style.borderColor = 'var(--primary)';
                    dot.style.background = 'var(--primary)';
                } else {
                    dot.style.borderColor = 'var(--border-color)';
                    dot.style.background = 'transparent';
                }
            });
        }

        if (statusLabel) {
            statusLabel.textContent = statusLabels[index];
        }
    }

    function typeText(callback) {
        if (!typedText) return callback();
        
        let charIndex = 0;
        typedText.innerHTML = '<span id="hero-text-cursor" style="display:inline-block;width:3px;height:35px;background:var(--primary);animation:blink-cursor 0.7s steps(1) infinite;margin-left:2px;"></span>';
        
        const cursor = typedText.querySelector('#hero-text-cursor');
        
        const interval = setInterval(() => {
            if (charIndex < textToType.length) {
                // Insert character before cursor
                const charSpan = document.createElement('span');
                charSpan.textContent = textToType[charIndex];
                typedText.insertBefore(charSpan, cursor);
                charIndex++;
            } else {
                clearInterval(interval);
                if (callback) setTimeout(callback, 800);
            }
        }, 100);
    }

    function runCycle() {
        // Phase 1: Microphone (2.5s)
        setActivePhase(0);

        setTimeout(() => {
            // Phase 2: Typing (wait for typing to finish)
            setActivePhase(1);
            setTimeout(() => {
                typeText(() => {
                    // Phase 3: Video (3s)
                    setTimeout(() => {
                        setActivePhase(2);
                        
                        // Wait, then restart
                        setTimeout(() => {
                            // Reset typed text for next cycle
                            if (typedText) {
                                typedText.innerHTML = '<span id="hero-text-cursor" style="display:inline-block;width:3px;height:35px;background:var(--primary);animation:blink-cursor 0.7s steps(1) infinite;margin-left:2px;"></span>';
                            }
                            runCycle();
                        }, 4000);
                    }, 500);
                });
            }, 600);
        }, 3000);
    }

    // Kick off after page loads
    setTimeout(() => {
        setActivePhase(0);
        phaseMic.classList.add('phase-active');
        setTimeout(runCycle, 100);
    }, 1500);
})();

// ======== CHROME EXTENSION PREVIEW ANIMATION ========
(function extPreviewAnimation() {
    const selectable = document.getElementById('ext-selectable');
    const cursor = document.getElementById('ext-cursor');
    const miniBtn = document.getElementById('ext-mini-btn');
    const popup = document.getElementById('ext-popup');

    if (!selectable || !cursor || !miniBtn || !popup) return;

    const selectableText = "Zamonaviy texnologiyalar jamiyatni rivojlantiradi.";
    
    // Build character spans
    function buildChars() {
        selectable.innerHTML = '';
        for (let i = 0; i < selectableText.length; i++) {
            const span = document.createElement('span');
            span.textContent = selectableText[i];
            span.style.transition = 'background 0.05s';
            span.style.borderRadius = '2px';
            span.dataset.index = i;
            selectable.appendChild(span);
        }
    }
    buildChars();

    function resetAll() {
        // Reset char highlights
        const chars = selectable.querySelectorAll('span');
        chars.forEach(ch => {
            ch.style.background = 'transparent';
            ch.style.color = 'var(--text-muted)';
        });
        // Hide cursor
        cursor.style.opacity = '0';
        cursor.style.left = '-10px';
        // Hide mini button
        miniBtn.style.display = 'none';
        // Hide popup
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }

    function selectCharsSequentially(callback) {
        const chars = selectable.querySelectorAll('span');
        const totalChars = chars.length;
        let i = 0;

        // Get selectable element width for cursor movement
        const lineWidth = selectable.offsetWidth;
        
        const interval = setInterval(() => {
            if (i < totalChars) {
                // Highlight character
                chars[i].style.background = 'rgba(99, 102, 241, 0.35)';
                chars[i].style.color = 'var(--text-main)';
                
                // Move cursor to track current character position
                const progress = (i + 1) / totalChars;
                cursor.style.left = (progress * lineWidth) + 'px';
                
                i++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 60);
    }

    function runExtCycle() {
        resetAll();

        // Step 1: Show cursor at the start of text (0.8s)
        setTimeout(() => {
            cursor.style.opacity = '1';
            cursor.style.left = '-5px';
        }, 800);

        // Step 2: Start selecting characters left to right (1.5s)
        setTimeout(() => {
            selectCharsSequentially(() => {
                // Step 3: Selection done, hide cursor, show UzSL button
                setTimeout(() => {
                    cursor.style.opacity = '0';
                    miniBtn.style.display = 'flex';
                }, 400);

                // Step 4: "Click" the button → popup appears
                setTimeout(() => {
                    miniBtn.style.display = 'none';
                    popup.style.opacity = '1';
                    popup.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 1800);

                // Step 5: Hold, then restart
                setTimeout(() => {
                    runExtCycle();
                }, 6000);
            });
        }, 1500);
    }

    // Kick off
    setTimeout(runExtCycle, 2500);
})();

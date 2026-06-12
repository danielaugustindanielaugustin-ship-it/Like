/**
 * Nova Application Controller
 * Manages UI interactions, voice commands, local vault storage, and visual animations.
 */
// Global State
const state = {
    activePersona: 'nova',
    apiKey: localStorage.getItem('nova_gemini_api_key') || '',
    chats: JSON.parse(localStorage.getItem('nova_chats')) || [],
    currentChatId: null,
    memories: JSON.parse(localStorage.getItem('nova_memories')) || [],
    voiceEnabled: false,
    selectedVoiceIndex: parseInt(localStorage.getItem('nova_voice_index')) || 0,
    recognitionActive: false
};
// Persona Configurations
const personas = {
    nova: {
        name: 'Nova',
        desc: 'Advanced Assistant Engine',
        avatar: '✦',
        theme: 'theme-nova'
    },
    astra: {
        name: 'Astra',
        desc: 'Creative Muse & Storyteller',
        avatar: '🎨',
        theme: 'theme-astra'
    },
    nexus: {
        name: 'Nexus',
        desc: 'Expert Code & Software Architect',
        avatar: '💻',
        theme: 'theme-nexus'
    },
    zen: {
        name: 'Zen',
        desc: 'Mindfulness & Clarity Coach',
        avatar: '🍃',
        theme: 'theme-zen'
    }
};
// DOM Elements
const elements = {
    body: document.body,
    particleCanvas: document.getElementById('particle-canvas'),
    sidebar: document.getElementById('sidebar'),
    menuBtn: document.getElementById('menu-btn'),
    closeSidebarBtn: document.getElementById('close-sidebar'),
    newChatBtn: document.getElementById('new-chat-btn'),
    historyList: document.getElementById('history-list'),
    personaCards: document.querySelectorAll('.persona-card'),
    activeAvatar: document.getElementById('active-avatar'),
    activePersonaName: document.getElementById('active-persona-name'),
    activePersonaDesc: document.getElementById('active-persona-desc'),
    connectionStatus: document.getElementById('connection-status'),
    statusText: document.getElementById('status-text'),
    messagesContainer: document.getElementById('messages-container'),
    welcomeScreen: document.getElementById('welcome-screen'),
    chatForm: document.getElementById('chat-form'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    voiceInputBtn: document.getElementById('voice-input-btn'),
    voiceOutputToggle: document.getElementById('voice-output-toggle'),
    voiceIcon: document.getElementById('voice-icon'),
    
    // Canvas Panel
    canvasPanel: document.getElementById('canvas-panel'),
    canvasTitleText: document.getElementById('canvas-title-text'),
    canvasCodeBlock: document.getElementById('canvas-code-block'),
    canvasCodeContent: document.getElementById('canvas-code-content'),
    canvasPreviewFrame: document.getElementById('canvas-preview-frame'),
    canvasCopyBtn: document.getElementById('canvas-copy-btn'),
    canvasPreviewBtn: document.getElementById('canvas-preview-btn'),
    canvasCloseBtn: document.getElementById('canvas-close-btn'),
    // Modals
    settingsModal: document.getElementById('settings-modal'),
    memoryModal: document.getElementById('memory-modal'),
    openSettingsBtn: document.getElementById('open-settings-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    openMemoryBtn: document.getElementById('open-memory-btn'),
    closeMemoryModalBtn: document.getElementById('close-memory-modal-btn'),
    apiKeyInput: document.getElementById('api-key-input'),
    saveKeyBtn: document.getElementById('save-key-btn'),
    voiceSelector: document.getElementById('voice-selector'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    clearMemoriesBtn: document.getElementById('clear-memories-btn'),
    newMemoryInput: document.getElementById('new-memory-input'),
    addMemoryBtn: document.getElementById('add-memory-btn'),
    memoryList: document.getElementById('memory-list')
};
// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
function initApp() {
    // 1. Set API Key into engine
    AIEngine.setApiKey(state.apiKey);
    updateConnectionStatusUI();
    if (state.apiKey) {
        elements.apiKeyInput.value = state.apiKey;
    }
    // 2. Initialize Visual Particle Background
    initParticles();
    // 3. Initialize Speech Synthesis Voices
    initSpeechVoices();
    // 4. Setup Event Listeners
    setupEventListeners();
    // 5. Render History & Setup Current Session
    renderHistory();
    createNewChatSession(true); // Soft init, doesn't force visual wipe if history exists
    // 6. Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
/* ========================================================================= */
/* 1. VISUAL SYSTEM: Particle Network Background                           */
/* ========================================================================= */
function initParticles() {
    const canvas = elements.particleCanvas;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const maxParticles = 60;
    const connectionDistance = 120;
    const mouse = { x: null, y: null, radius: 150 };
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            // Boundaries check
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            // Mouse interaction (gravity effect)
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x += (dx / distance) * force * 1.2;
                    this.y += (dy / distance) * force * 1.2;
                }
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#8b5cf6';
            ctx.globalAlpha = 0.5;
            ctx.fill();
        }
    }
    // Populate particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        // Draw connections
        ctx.globalAlpha = 0.08;
        const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#8b5cf6';
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}
/* ========================================================================= */
/* 2. CHAT SESSION MANAGEMENT & LOCAL STORAGE                                */
/* ========================================================================= */
function createNewChatSession(softInit = false) {
    if (softInit && state.chats.length > 0) {
        // Load the most recent session
        const sorted = [...state.chats].sort((a, b) => b.updatedAt - a.updatedAt);
        loadChatSession(sorted[0].id);
        return;
    }
    const newId = 'session_' + Date.now();
    const newChat = {
        id: newId,
        title: 'New Conversation',
        persona: state.activePersona,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    state.chats.push(newChat);
    saveChatsToLocalStorage();
    renderHistory();
    loadChatSession(newId);
}
function loadChatSession(id) {
    state.currentChatId = id;
    const chat = state.chats.find(c => c.id === id);
    if (!chat) return;
    // Set persona based on chat
    setPersona(chat.persona, false); // Switch theme but don't save back into chat state during loading
    // Reset layout
    elements.messagesContainer.innerHTML = '';
    
    if (chat.messages.length === 0) {
        elements.welcomeScreen.classList.remove('hidden');
        elements.messagesContainer.appendChild(elements.welcomeScreen);
    } else {
        elements.welcomeScreen.classList.add('hidden');
        chat.messages.forEach(msg => {
            appendMessageUI(msg.sender, msg.text, false);
        });
        scrollToBottom();
    }
    // Mark history item active
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });
    closeSidebarOnMobile();
}
function deleteChatSession(id, event) {
    if (event) event.stopPropagation();
    
    state.chats = state.chats.filter(c => c.id !== id);
    saveChatsToLocalStorage();
    renderHistory();
    if (state.currentChatId === id) {
        if (state.chats.length > 0) {
            loadChatSession(state.chats[0].id);
        } else {
            createNewChatSession();
        }
    }
}
function saveChatsToLocalStorage() {
    localStorage.setItem('nova_chats', JSON.stringify(state.chats));
}
function renderHistory() {
    elements.historyList.innerHTML = '';
    if (state.chats.length === 0) {
        elements.historyList.innerHTML = '<div class="empty-state">No past sessions</div>';
        return;
    }
    // Sort by updated time
    const sorted = [...state.chats].sort((a, b) => b.updatedAt - a.updatedAt);
    
    sorted.forEach(chat => {
        const item = document.createElement('div');
        item.className = `history-item ${chat.id === state.currentChatId ? 'active' : ''}`;
        item.dataset.id = chat.id;
        item.onclick = () => loadChatSession(chat.id);
        const icon = personas[chat.persona]?.avatar || '✦';
        item.innerHTML = `
            <span style="margin-right: 8px;">${icon}</span>
            <div class="history-item-title">${escapeHTML(chat.title)}</div>
            <button class="delete-history-btn" title="Delete session">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        `;
        // Attach event listener directly to delete button to stop propagation
        item.querySelector('.delete-history-btn').addEventListener('click', (e) => {
            deleteChatSession(chat.id, e);
        });
        elements.historyList.appendChild(item);
    });
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
/* ========================================================================= */
/* 3. CORE USER INTERFACE CONTROLLER                                         */
/* ========================================================================= */
function setPersona(personaKey, updateSession = true) {
    if (!personas[personaKey]) return;
    const persona = personas[personaKey];
    
    // Update State
    state.activePersona = personaKey;
    
    // Reset Body Theme Class
    Object.values(personas).forEach(p => {
        elements.body.classList.remove(p.theme);
    });
    elements.body.classList.add(persona.theme);
    // Update Header
    elements.activeAvatar.innerText = persona.avatar;
    elements.activePersonaName.innerText = persona.name;
    elements.activePersonaDesc.innerText = persona.desc;
    // Update Active Persona Card in Sidebar
    elements.personaCards.forEach(card => {
        card.classList.toggle('active', card.dataset.persona === personaKey);
    });
    // Update active chat session configuration if requested
    if (updateSession && state.currentChatId) {
        const chat = state.chats.find(c => c.id === state.currentChatId);
        if (chat) {
            chat.persona = personaKey;
            saveChatsToLocalStorage();
            renderHistory();
        }
    }
}
// Custom Markdown Simple HTML Parser
function parseMarkdown(text) {
    let parsed = escapeHTML(text);
    // Code blocks parser
    const codeBlockRegex = /```([a-zA-Z0-9\-]*)\n([\s\S]*?)```/g;
    parsed = parsed.replace(codeBlockRegex, (match, lang, code) => {
        const uniqueId = 'code_' + Math.random().toString(36).substring(2, 9);
        const cleanCode = code.trim();
        const displayLang = lang || 'code';
        // Add special "View in Canvas" button if it is HTML/CSS code or if it's an artifact block
        const isRenderable = displayLang === 'html' || displayLang === 'xml' || cleanCode.includes('<!DOCTYPE html>');
        const canvasButton = isRenderable 
            ? `<button class="code-action-btn" onclick="openCodeInCanvas('${uniqueId}', '${displayLang}')"><i data-lucide="layout-template" style="width: 13px; height: 13px;"></i> Open Canvas</button>` 
            : '';
        return `
            <div class="code-wrapper" id="${uniqueId}" data-code="${encodeURIComponent(cleanCode)}">
                <div class="code-header">
                    <span>// ${displayLang.toUpperCase()}</span>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        ${canvasButton}
                        <button class="code-action-btn" onclick="copyCodeFromWrapper('${uniqueId}')"><i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copy</button>
                    </div>
                </div>
                <pre><code class="language-${displayLang}">${cleanCode}</code></pre>
            </div>
        `;
    });
    // Bold replacement
    parsed = parsed.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
    // Italic replacement
    parsed = parsed.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/_([\s\S]*?)_/g, '<em>$1</em>');
    // Headers replacement
    parsed = parsed.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Convert remaining newlines into breaks
    parsed = parsed.split('\n').map(line => {
        if (line.trim().startsWith('<div') || line.trim().startsWith('</div') || line.trim().startsWith('<pre') || line.trim().startsWith('</pre') || line.trim().startsWith('<li') || line.trim().startsWith('<ol') || line.trim().startsWith('<ul')) {
            return line;
        }
        return `<p>${line}</p>`;
    }).join('');
    return parsed;
}
// Global helpers attached for dynamically generated code blocks
window.copyCodeFromWrapper = (wrapperId) => {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const code = decodeURIComponent(wrapper.dataset.code);
    navigator.clipboard.writeText(code).then(() => {
        const btn = wrapper.querySelector('button[onclick*="copyCode"]');
        if (btn) {
            btn.innerHTML = `<i data-lucide="check" style="width: 13px; height: 13px;"></i> Copied!`;
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                btn.innerHTML = `<i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copy`;
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        }
    });
};
window.openCodeInCanvas = (wrapperId, lang) => {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const code = decodeURIComponent(wrapper.dataset.code);
    showInCanvas(code, lang);
};
// Open in right-split canvas
let activeCanvasCode = '';
let activeCanvasLang = '';
function showInCanvas(code, lang) {
    activeCanvasCode = code;
    activeCanvasLang = lang;
    elements.canvasTitleText.innerText = `${lang.toUpperCase()} Artifact`;
    elements.canvasCodeContent.innerText = code;
    elements.canvasCodeBlock.classList.remove('hidden');
    elements.canvasPreviewFrame.classList.add('hidden');
    elements.canvasPanel.classList.add('active');
    // If HTML, toggle preview button showing
    if (lang === 'html' || lang === 'xml' || code.includes('<!DOCTYPE html>')) {
        elements.canvasPreviewBtn.classList.remove('hidden');
    } else {
        elements.canvasPreviewBtn.classList.add('hidden');
    }
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
function updateConnectionStatusUI() {
    const isOnline = AIEngine.isOnline();
    const indicator = elements.connectionStatus.querySelector('.status-indicator');
    
    if (isOnline) {
        indicator.className = 'status-indicator online';
        elements.statusText.innerText = 'Online Mode (Gemini)';
    } else {
        indicator.className = 'status-indicator local';
        elements.statusText.innerText = 'Local Mode';
    }
}
function appendMessageUI(sender, text, animate = true) {
    const messageNode = document.createElement('div');
    messageNode.className = `message ${sender}`;
    const icon = sender === 'user' ? '👤' : (personas[state.activePersona]?.avatar || '✦');
    const displayHTML = sender === 'user' ? escapeHTML(text) : parseMarkdown(text);
    messageNode.innerHTML = `
        <div class="msg-avatar">${icon}</div>
        <div class="msg-bubble">${displayHTML}</div>
    `;
    elements.messagesContainer.appendChild(messageNode);
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    scrollToBottom();
}
function appendTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant typing-node';
    indicator.innerHTML = `
        <div class="msg-avatar">${personas[state.activePersona]?.avatar || '✦'}</div>
        <div class="msg-bubble">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    elements.messagesContainer.appendChild(indicator);
    scrollToBottom();
    return indicator;
}
function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}
function toggleModal(modal, show) {
    modal.classList.toggle('active', show);
}
function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
    }
}
/* ========================================================================= */
/* 4. SPEECH SYNTHESIS & SPEECH RECOGNITION (TTS & STT)                      */
/* ========================================================================= */
let synthVoices = [];
function initSpeechVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    function populateVoiceList() {
        synthVoices = speechSynthesis.getVoices();
        elements.voiceSelector.innerHTML = '';
        
        synthVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang}) ${voice.default ? '[Default]' : ''}`;
            elements.voiceSelector.appendChild(option);
        });
        // Load saved settings
        if (state.selectedVoiceIndex < synthVoices.length) {
            elements.voiceSelector.value = state.selectedVoiceIndex;
        }
    }
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
}
function speakText(text) {
    if (!state.voiceEnabled || typeof speechSynthesis === 'undefined') return;
    // Stop speaking currently
    speechSynthesis.cancel();
    // Clean text from markdown formatting
    let cleanText = text.replace(/```[\s\S]*?```/g, '[Code Block omitted]'); // don't read raw code blocks
    cleanText = cleanText.replace(/[\*\#_`]/g, ''); // strip markdown tokens
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (synthVoices.length > 0 && state.selectedVoiceIndex < synthVoices.length) {
        utterance.voice = synthVoices[state.selectedVoiceIndex];
    }
    
    speechSynthesis.speak(utterance);
}
// Speech to Text (STT) setup
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        state.recognitionActive = true;
        elements.voiceInputBtn.classList.add('recording');
    };
    recognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        stopDictation();
    };
    recognition.onend = () => {
        stopDictation();
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.userInput.value = (elements.userInput.value + ' ' + transcript).trim();
        adjustTextareaHeight();
    };
}
function startDictation() {
    if (!recognition) {
        alert("Speech Recognition API is not supported in this browser.");
        return;
    }
    try {
        recognition.start();
    } catch (e) {
        stopDictation();
    }
}
function stopDictation() {
    state.recognitionActive = false;
    elements.voiceInputBtn.classList.remove('recording');
    if (recognition) {
        recognition.stop();
    }
}
/* ========================================================================= */
/* 5. MEMORY VAULT LOGIC                                                     */
/* ========================================================================= */
function renderMemories() {
    elements.memoryList.innerHTML = '';
    if (state.memories.length === 0) {
        elements.memoryList.innerHTML = '<div class="empty-state">No remembered facts yet. Try chatting with Nova!</div>';
        return;
    }
    state.memories.forEach((memory, index) => {
        const tag = document.createElement('div');
        tag.className = 'memory-tag';
        tag.innerHTML = `
            <span>${escapeHTML(memory)}</span>
            <button class="delete-memory-btn" onclick="deleteMemory(${index})" title="Forget fact">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
        `;
        elements.memoryList.appendChild(tag);
    });
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
window.deleteMemory = (index) => {
    state.memories.splice(index, 1);
    localStorage.setItem('nova_memories', JSON.stringify(state.memories));
    renderMemories();
};
function addMemoryFact(factText) {
    const clean = factText.trim();
    if (!clean) return;
    
    state.memories.push(clean);
    localStorage.setItem('nova_memories', JSON.stringify(state.memories));
    renderMemories();
}
/* ========================================================================= */
/* 6. MESSAGING ACTION LOGIC (Submit Prompt)                                 */
/* ========================================================================= */
async function handleFormSubmit(e) {
    if (e) e.preventDefault();
    
    const prompt = elements.userInput.value.trim();
    if (!prompt) return;
    // Reset Input Box
    elements.userInput.value = '';
    adjustTextareaHeight();
    
    // Wipe welcome screen if active
    if (!elements.welcomeScreen.classList.contains('hidden')) {
        elements.welcomeScreen.classList.add('hidden');
        elements.messagesContainer.innerHTML = '';
    }
    // Append User message to UI
    appendMessageUI('user', prompt);
    // Save user message to active chat session state
    const chat = state.chats.find(c => c.id === state.currentChatId);
    if (chat) {
        // If first message, rename chat title based on first query
        if (chat.messages.length === 0) {
            chat.title = prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt;
        }
        chat.messages.push({ sender: 'user', text: prompt });
        chat.updatedAt = Date.now();
        saveChatsToLocalStorage();
        renderHistory();
    }
    // Append Typing Indicator
    const typingNode = appendTypingIndicator();
    // Check for implicit facts inside prompt to store in local memory
    checkAndStoreFactsImplicit(prompt);
    try {
        // Query Engine
        const reply = await AIEngine.generateResponse(prompt, chat?.messages || [], state.activePersona, state.memories);
        
        // Remove typing node
        if (typingNode && typingNode.parentNode) {
            typingNode.parentNode.removeChild(typingNode);
        }
        // Append assistant message to UI
        appendMessageUI('assistant', reply);
        
        // Speak response if voiced
        speakText(reply);
        // Save reply to active session
        if (chat) {
            chat.messages.push({ sender: 'assistant', text: reply });
            chat.updatedAt = Date.now();
            saveChatsToLocalStorage();
        }
        // If Nexus code block output, auto-open code block in right pane if html
        const codeWrapper = elements.messagesContainer.querySelector('.message.assistant:last-child .code-wrapper');
        if (codeWrapper && state.activePersona === 'nexus') {
            const lang = codeWrapper.querySelector('code').className.replace('language-', '');
            const code = decodeURIComponent(codeWrapper.dataset.code);
            if (lang === 'html' || code.includes('<!DOCTYPE html>')) {
                showInCanvas(code, lang);
            }
        }
    } catch (err) {
        console.error(err);
        if (typingNode && typingNode.parentNode) {
            typingNode.parentNode.removeChild(typingNode);
        }
        appendMessageUI('assistant', `Forgive me, but I ran into a configuration block: ${err.message}`);
    }
}
// Watch user texts to log key facts
function checkAndStoreFactsImplicit(text) {
    const lowerText = text.toLowerCase();
    
    // Local extract matching
    const nameMatch = text.match(/(?:my name is|i am called|call me) ([a-zA-Z0-9\s]{2,15})/i);
    if (nameMatch) {
        addMemoryFact(`My name is ${nameMatch[1].trim()}`);
    }
    
    const factMatch = text.match(/(?:remember that|i like|i work as|i study) (.*)/i);
    if (factMatch) {
        addMemoryFact(`I ${factMatch[1].trim()}`);
    }
}
/* ========================================================================= */
/* 7. EVENT LISTENERS SETUP                                                  */
/* ========================================================================= */
function setupEventListeners() {
    // Mobile Sidebar controls
    elements.menuBtn.onclick = () => elements.sidebar.classList.add('active');
    elements.closeSidebarBtn.onclick = () => elements.sidebar.classList.remove('active');
    // Create New Session
    elements.newChatBtn.onclick = () => createNewChatSession();
    // Persona cards click binding
    elements.personaCards.forEach(card => {
        card.addEventListener('click', () => {
            setPersona(card.dataset.persona);
        });
    });
    // Form submit listener
    elements.chatForm.onsubmit = handleFormSubmit;
    // Textarea Enter key triggers send, Shift+Enter wraps lines
    elements.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit();
        }
    });
    // Textarea height adapter
    elements.userInput.addEventListener('input', adjustTextareaHeight);
    // Modals buttons binding
    elements.openSettingsBtn.onclick = () => toggleModal(elements.settingsModal, true);
    elements.closeSettingsBtn.onclick = () => toggleModal(elements.settingsModal, false);
    
    elements.openMemoryBtn.onclick = () => {
        renderMemories();
        toggleModal(elements.memoryModal, true);
    };
    elements.closeMemoryModalBtn.onclick = () => toggleModal(elements.memoryModal, false);
    // Save key action
    elements.saveKeyBtn.onclick = () => {
        const key = elements.apiKeyInput.value.trim();
        state.apiKey = key;
        localStorage.setItem('nova_gemini_api_key', key);
        AIEngine.setApiKey(key);
        updateConnectionStatusUI();
        alert("API Configuration updated successfully.");
        toggleModal(elements.settingsModal, false);
    };
    // Voice Selector Change
    elements.voiceSelector.onchange = () => {
        const index = parseInt(elements.voiceSelector.value);
        state.selectedVoiceIndex = index;
        localStorage.setItem('nova_voice_index', index);
    };
    // Clear Storage Actions
    elements.clearHistoryBtn.onclick = () => {
        if (confirm("Are you sure you want to delete all conversation history? This cannot be undone.")) {
            state.chats = [];
            localStorage.removeItem('nova_chats');
            createNewChatSession();
            toggleModal(elements.settingsModal, false);
        }
    };
    elements.clearMemoriesBtn.onclick = () => {
        if (confirm("Are you sure you want to clear the Memory Vault?")) {
            state.memories = [];
            localStorage.removeItem('nova_memories');
            renderMemories();
            toggleModal(elements.settingsModal, false);
        }
    };
    // Add Memory Manually
    elements.addMemoryBtn.onclick = () => {
        const text = elements.newMemoryInput.value.trim();
        if (text) {
            addMemoryFact(text);
            elements.newMemoryInput.value = '';
        }
    };
    elements.newMemoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            elements.addMemoryBtn.click();
        }
    });
    // Click outside to close modals
    window.onclick = (e) => {
        if (e.target === elements.settingsModal) toggleModal(elements.settingsModal, false);
        if (e.target === elements.memoryModal) toggleModal(elements.memoryModal, false);
    };
    // Canvas actions binding
    elements.canvasCloseBtn.onclick = () => {
        elements.canvasPanel.classList.remove('active');
    };
    elements.canvasCopyBtn.onclick = () => {
        navigator.clipboard.writeText(activeCanvasCode).then(() => {
            elements.canvasCopyBtn.innerHTML = `<i data-lucide="check"></i> Copied!`;
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => {
                elements.canvasCopyBtn.innerHTML = `<i data-lucide="copy"></i> Copy`;
                if (window.lucide) window.lucide.createIcons();
            }, 2000);
        });
    };
    // Preview / Code toggle
    let isPreviewActive = false;
    elements.canvasPreviewBtn.onclick = () => {
        isPreviewActive = !isPreviewActive;
        if (isPreviewActive) {
            elements.canvasPreviewBtn.innerHTML = `<i data-lucide="code"></i> Show Code`;
            elements.canvasCodeBlock.classList.add('hidden');
            elements.canvasPreviewFrame.classList.remove('hidden');
            // Inject current code into iframe context
            const doc = elements.canvasPreviewFrame.contentDocument || elements.canvasPreviewFrame.contentWindow.document;
            doc.open();
            doc.write(activeCanvasCode);
            doc.close();
        } else {
            elements.canvasPreviewBtn.innerHTML = `<i data-lucide="eye"></i> Preview`;
            elements.canvasCodeBlock.classList.remove('hidden');
            elements.canvasPreviewFrame.classList.add('hidden');
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };
    // Voice dictation triggers
    elements.voiceInputBtn.onclick = () => {
        if (state.recognitionActive) {
            stopDictation();
        } else {
            startDictation();
        }
    };
    // Voice speaking feedback toggle
    elements.voiceOutputToggle.onclick = () => {
        state.voiceEnabled = !state.voiceEnabled;
        if (state.voiceEnabled) {
            elements.voiceIcon.setAttribute('data-lucide', 'volume-2');
            elements.voiceOutputToggle.classList.add('recording');
            alert("Voice output enabled. Nova will speak its responses aloud.");
        } else {
            elements.voiceIcon.setAttribute('data-lucide', 'volume-x');
            elements.voiceOutputToggle.classList.remove('recording');
            if (typeof speechSynthesis !== 'undefined') {
                speechSynthesis.cancel();
            }
        }
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };
    // Chip prompt click binding
    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.onclick = () => {
            const promptText = chip.dataset.prompt;
            elements.userInput.value = promptText;
            adjustTextareaHeight();
            handleFormSubmit();
        };
    });
}
function adjustTextareaHeight() {
    const text = elements.userInput;
    text.style.height = 'auto';
    text.style.height = (text.scrollHeight) + 'px';
}
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

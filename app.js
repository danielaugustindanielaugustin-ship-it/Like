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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova // Next-Gen AI Companion</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
    <!-- Main Style Sheet -->
    <link rel="stylesheet" href="style.css">
</head>
<body class="theme-nova">
    <!-- Interactive Background Particles Canvas -->
    <canvas id="particle-canvas"></canvas>
    <div class="app-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <span class="logo-icon">✦</span>
                    <span class="logo-text">NOVA</span>
                </div>
                <button class="icon-btn close-sidebar-btn" id="close-sidebar" title="Close Sidebar">
                    <i data-lucide="chevrons-left"></i>
                </button>
            </div>
            <button class="new-chat-btn" id="new-chat-btn">
                <i data-lucide="plus"></i>
                <span>New Session</span>
            </button>
            <!-- Persona Select -->
            <div class="sidebar-section">
                <h3>AI Persona</h3>
                <div class="persona-grid">
                    <button class="persona-card active" data-persona="nova" title="Nova: Standard balanced AI assistant">
                        <div class="persona-icon nova-color">✦</div>
                        <div class="persona-name">Nova</div>
                    </button>
                    <button class="persona-card" data-persona="astra" title="Astra: Creative muse and ideator">
                        <div class="persona-icon astra-color">🎨</div>
                        <div class="persona-name">Astra</div>
                    </button>
                    <button class="persona-card" data-persona="nexus" title="Nexus: Software developer and coder">
                        <div class="persona-icon nexus-color">💻</div>
                        <div class="persona-name">Nexus</div>
                    </button>
                    <button class="persona-card" data-persona="zen" title="Zen: Calm therapist and coach">
                        <div class="persona-icon zen-color">🍃</div>
                        <div class="persona-name">Zen</div>
                    </button>
                </div>
            </div>
            <!-- History List -->
            <div class="sidebar-section history-section">
                <h3>Recent Sessions</h3>
                <div class="history-list" id="history-list">
                    <!-- Dynamic history items -->
                </div>
            </div>
            <!-- Sidebar Footer Buttons -->
            <div class="sidebar-footer">
                <button class="footer-btn" id="open-memory-btn" title="View Nova's learned facts about you">
                    <i data-lucide="brain"></i>
                    <span>Memory Vault</span>
                </button>
                <button class="footer-btn" id="open-settings-btn" title="Settings & Gemini API key">
                    <i data-lucide="settings"></i>
                    <span>Settings</span>
                </button>
            </div>
        </aside>
        <!-- Main Chat Area -->
        <main class="chat-area">
            <header class="chat-header">
                <div class="header-left">
                    <button class="icon-btn menu-btn" id="menu-btn" title="Open Sidebar">
                        <i data-lucide="menu"></i>
                    </button>
                    <div class="active-persona-info">
                        <span class="active-avatar" id="active-avatar">✦</span>
                        <div>
                            <h2 id="active-persona-name">Nova</h2>
                            <p id="active-persona-desc">Advanced Assistant Engine</p>
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <div class="connection-status" id="connection-status">
                        <span class="status-indicator local"></span>
                        <span class="status-text" id="status-text">Local Mode</span>
                    </div>
                </div>
            </header>
            <!-- Chat Message Container -->
            <section class="messages-container" id="messages-container">
                <!-- Welcome Screen -->
                <div class="welcome-screen" id="welcome-screen">
                    <div class="welcome-badge">✦ Interactive Companion</div>
                    <h1>How can I assist you today?</h1>
                    <p>I am Nova. Choose a persona in the sidebar or enter your Gemini API key in Settings to unlock fully-reasoned live processing.</p>
                    
                    <div class="suggested-prompts">
                        <button class="prompt-chip" data-prompt="Design a beautiful website banner using HTML/CSS">
                            <i data-lucide="palette"></i> Design a banner
                        </button>
                        <button class="prompt-chip" data-prompt="Write a poetic story about a star that forgot how to shine">
                            <i data-lucide="book-open"></i> Poetic story
                        </button>
                        <button class="prompt-chip" data-prompt="How can I handle stress and maintain productivity?">
                            <i data-lucide="smile"></i> Handle stress
                        </button>
                        <button class="prompt-chip" data-prompt="Create a quick JS script to reverse a string and format it">
                            <i data-lucide="code-xml"></i> Reverse string script
                        </button>
                    </div>
                </div>
            </section>
            <!-- Input Form -->
            <footer class="chat-input-area">
                <form id="chat-form" class="chat-form">
                    <button type="button" class="form-icon-btn" id="voice-input-btn" title="Voice Input (Speech-to-Text)">
                        <i data-lucide="mic"></i>
                    </button>
                    <textarea 
                        id="user-input" 
                        placeholder="Message Nova..." 
                        rows="1" 
                        required
                    ></textarea>
                    <div class="input-actions">
                        <button type="button" class="form-icon-btn" id="voice-output-toggle" title="Toggle Voice Output (Read Aloud)">
                            <i data-lucide="volume-2" id="voice-icon"></i>
                        </button>
                        <button type="submit" class="send-btn" id="send-btn" title="Send Message">
                            <i data-lucide="arrow-up"></i>
                        </button>
                    </div>
                </form>
            </footer>
        </main>
        <!-- Canvas / Artifact Visualizer Panel -->
        <section class="canvas-panel" id="canvas-panel">
            <div class="canvas-header">
                <div class="canvas-title">
                    <i data-lucide="code"></i>
                    <span id="canvas-title-text">Artifact Viewer</span>
                </div>
                <div class="canvas-actions">
                    <button class="canvas-btn" id="canvas-copy-btn" title="Copy Content">
                        <i data-lucide="copy"></i> Copy
                    </button>
                    <button class="canvas-btn" id="canvas-preview-btn" title="Toggle Live Preview">
                        <i data-lucide="eye"></i> Preview
                    </button>
                    <button class="icon-btn" id="canvas-close-btn" title="Close Panel">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            </div>
            <div class="canvas-body">
                <pre id="canvas-code-block"><code id="canvas-code-content" class="language-javascript"></code></pre>
                <iframe id="canvas-preview-frame" class="hidden"></iframe>
            </div>
        </section>
    </div>
    <!-- Modals Section -->
    
    <!-- 1. Settings Modal -->
    <div class="modal-overlay" id="settings-modal">
        <div class="modal">
            <div class="modal-header">
                <h2>Settings Panel</h2>
                <button class="icon-btn close-modal-btn" id="close-settings-btn">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="settings-group">
                    <label for="api-key-input">Gemini API Key</label>
                    <div class="input-with-action">
                        <input type="password" id="api-key-input" placeholder="AIzaSy...">
                        <button type="button" class="btn secondary" id="save-key-btn">Save Key</button>
                    </div>
                    <p class="help-text">Enter your Google Gemini API key to activate real AI responses. Your key is stored locally in your browser storage and is never uploaded elsewhere.</p>
                </div>
                <div class="settings-group">
                    <label for="voice-selector">Text-to-Speech Voice</label>
                    <select id="voice-selector">
                        <!-- Voices dynamically populated -->
                    </select>
                </div>
                <div class="settings-group">
                    <label>Manage Data</label>
                    <div class="btn-row">
                        <button class="btn danger" id="clear-history-btn">Clear Chat History</button>
                        <button class="btn danger" id="clear-memories-btn">Clear Memory Vault</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- 2. Memory Vault Modal -->
    <div class="modal-overlay" id="memory-modal">
        <div class="modal">
            <div class="modal-header">
                <h2>Memory Vault</h2>
                <button class="icon-btn close-modal-btn" id="close-memory-modal-btn">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="help-text-large">Nova remembers core details about you across sessions to provide more personalized assistance. You can review or edit what Nova has learned below.</p>
                
                <div class="memory-input-group">
                    <input type="text" id="new-memory-input" placeholder="Add a new fact about yourself (e.g. 'I am learning Python')">
                    <button class="btn primary" id="add-memory-btn">Add Fact</button>
                </div>
                <div class="memory-list" id="memory-list">
                    <!-- Dynamic memory tags -->
                    <div class="empty-state">No remembered facts yet. Try chatting with Nova or adding a fact above!</div>
                </div>
            </div>
        </div>
    </div>
    <!-- Lucide Icons Library -->
    <script src="https://cdn.jsdelivr.net/npm/lucide/dist/umd/lucide.min.js"></script>
    <!-- AI Core Engine -->
    <script src="ai-engine.js"></script>
    <!-- Application Logic -->
    <script src="app.js"></script>
</body>
</html>
/* Global Variables & Reset */
:root {
    --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-mono: 'JetBrains Mono', Consolas, monospace;
    
    /* Global System Colors */
    --danger: #ef4444;
    --danger-hover: #dc2626;
    --success: #10b981;
    
    /* Default Nova Theme */
    --accent: #8b5cf6;
    --accent-glow: rgba(139, 92, 246, 0.4);
    --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    --bg-app: #09090b;
    --bg-panel: rgba(18, 18, 24, 0.75);
    --bg-input: rgba(30, 30, 40, 0.6);
    --border-color: rgba(255, 255, 255, 0.08);
    --border-active: rgba(139, 92, 246, 0.4);
    --text-primary: #f4f4f5;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    --glass-blur: blur(16px);
    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    --transition-speed: 0.3s;
}
/* Theme Adaptations */
body.theme-astra {
    --accent: #ec4899;
    --accent-glow: rgba(236, 72, 153, 0.4);
    --accent-gradient: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
    --border-active: rgba(236, 72, 153, 0.4);
}
body.theme-nexus {
    --accent: #06b6d4;
    --accent-glow: rgba(6, 182, 212, 0.4);
    --accent-gradient: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    --border-active: rgba(6, 182, 212, 0.4);
}
body.theme-zen {
    --accent: #14b8a6;
    --accent-glow: rgba(20, 184, 166, 0.4);
    --accent-gradient: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
    --border-active: rgba(20, 184, 166, 0.4);
}
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: var(--font-sans);
    background-color: var(--bg-app);
    color: var(--text-primary);
    overflow: hidden;
    height: 100vh;
    width: 100vw;
}
/* Background Particle Canvas */
#particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}
/* App Main Layout Grid */
.app-container {
    display: flex;
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
/* Glassmorphism Common Style */
.glass-panel {
    background: var(--bg-panel);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--border-color);
    box-shadow: var(--glass-shadow);
}
/* Sidebar Design */
.sidebar {
    width: 280px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 12, 0.85);
    backdrop-filter: var(--glass-blur);
    border-right: 1px solid var(--border-color);
    z-index: 10;
    transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar-header {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.logo {
    display: flex;
    align-items: center;
    gap: 10px;
}
.logo-icon {
    font-size: 1.5rem;
    color: var(--accent);
    filter: drop-shadow(0 0 8px var(--accent));
    animation: pulse-glow 3s infinite ease-in-out;
}
.logo-text {
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 2px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.new-chat-btn {
    margin: 0 20px 20px 20px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}
.new-chat-btn:hover {
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 12px var(--accent-glow);
}
.sidebar-section {
    padding: 0 20px;
    margin-bottom: 24px;
    flex-shrink: 0;
}
.sidebar-section.history-section {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}
.sidebar-section h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    margin-bottom: 12px;
}
/* Persona Selection Grid */
.persona-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}
.persona-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px 8px;
    cursor: pointer;
    text-align: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.persona-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}
.persona-card.active {
    background: rgba(139, 92, 246, 0.06);
    border-color: var(--accent);
    box-shadow: inset 0 0 10px rgba(139, 92, 246, 0.1);
}
.persona-icon {
    font-size: 1.3rem;
    margin-bottom: 6px;
}
.persona-name {
    font-size: 0.8rem;
    font-weight: 500;
}
/* Colors for persona buttons */
.nova-color { color: #8b5cf6; }
.astra-color { color: #ec4899; }
.nexus-color { color: #06b6d4; }
.zen-color { color: #10b981; }
/* History List style */
.history-list {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 5px;
}
.history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
    margin-bottom: 6px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    border: 1px solid transparent;
    transition: all 0.2s ease;
}
.history-item:hover {
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-primary);
    border-color: var(--border-color);
}
.history-item.active {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    border-color: var(--border-color);
}
.history-item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
    margin-right: 10px;
}
.delete-history-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
}
.history-item:hover .delete-history-btn {
    opacity: 1;
}
.delete-history-btn:hover {
    color: var(--danger);
}
/* Sidebar Footer Buttons */
.sidebar-footer {
    padding: 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.footer-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-secondary);
    padding: 10px 14px;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.footer-btn:hover {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-primary);
    border-color: var(--accent);
}
.footer-btn i {
    width: 16px;
    height: 16px;
}
/* Main Chat Container Area */
.chat-area {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(13, 13, 17, 0.8);
    backdrop-filter: var(--glass-blur);
    z-index: 5;
    position: relative;
}
/* Chat Header */
.chat-header {
    height: 70px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
.active-persona-info {
    display: flex;
    align-items: center;
    gap: 12px;
}
.active-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--accent-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 0 12px var(--accent-glow);
}
.active-persona-info h2 {
    font-size: 0.95rem;
    font-weight: 700;
}
.active-persona-info p {
    font-size: 0.75rem;
    color: var(--text-muted);
}
.menu-btn {
    display: none; /* Desktop hidden, shown in mobile */
}
/* Connection status chip */
.connection-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.02);
    font-size: 0.75rem;
}
.status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}
.status-indicator.local {
    background-color: var(--text-muted);
}
.status-indicator.online {
    background-color: var(--success);
    box-shadow: 0 0 8px var(--success);
}
.status-text {
    color: var(--text-secondary);
}
/* Message Area styling */
.messages-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}
/* Welcome Screen */
.welcome-screen {
    max-width: 600px;
    margin: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
}
.welcome-badge {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--accent);
}
.welcome-screen h1 {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.5px;
}
.welcome-screen p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
}
.suggested-prompts {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 10px;
    width: 100%;
}
.prompt-chip {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    font-weight: 500;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease;
}
.prompt-chip:hover {
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-primary);
}
.prompt-chip i {
    width: 16px;
    height: 16px;
    color: var(--accent);
}
/* Chat bubble structures */
.message {
    display: flex;
    gap: 16px;
    max-width: 80%;
    animation: fade-in-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
}
.message.assistant {
    align-self: flex-start;
}
.msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    flex-shrink: 0;
}
.message.user .msg-avatar {
    background: #27272a;
    border: 1px solid var(--border-color);
}
.message.assistant .msg-avatar {
    background: var(--accent-gradient);
    box-shadow: 0 0 8px var(--accent-glow);
}
.msg-bubble {
    padding: 14px 18px;
    border-radius: 16px;
    font-size: 0.95rem;
    line-height: 1.55;
}
.message.user .msg-bubble {
    background: var(--accent-gradient);
    color: #fff;
    border-top-right-radius: 4px;
}
.message.assistant .msg-bubble {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    border-top-left-radius: 4px;
}
/* Markdown parsing nodes inside assistant bubble */
.msg-bubble code {
    font-family: var(--font-mono);
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    border: 1px solid rgba(255, 255, 255, 0.05);
}
.msg-bubble pre {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    background: #09090b;
}
.msg-bubble pre code {
    display: block;
    padding: 14px;
    overflow-x: auto;
    background: transparent;
    border: none;
}
.code-header {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border-color);
    padding: 6px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
}
.code-action-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-sans);
}
.code-action-btn:hover {
    color: var(--text-primary);
}
.msg-bubble p {
    margin-bottom: 8px;
}
.msg-bubble p:last-child {
    margin-bottom: 0;
}
/* Typing Indicator Animation */
.typing-indicator {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 20px;
}
.typing-dot {
    width: 6px;
    height: 6px;
    background: var(--text-secondary);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
/* Interactive Input Panel */
.chat-input-area {
    padding: 20px 24px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
}
.chat-form {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 8px 14px;
    transition: all 0.25s ease;
}
.chat-form:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 14px var(--accent-glow);
}
.chat-form textarea {
    flex-grow: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    resize: none;
    max-height: 120px;
    padding: 6px 0;
}
.chat-form textarea::placeholder {
    color: var(--text-muted);
}
.form-icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}
.form-icon-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}
.form-icon-btn.recording {
    color: var(--danger);
    background: rgba(239, 68, 68, 0.1);
    animation: pulse-red 1.5s infinite;
}
.input-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}
.send-btn {
    background: var(--accent-gradient);
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 8px var(--accent-glow);
}
.send-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 12px var(--accent-glow);
}
/* Icon Buttons General */
.icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}
.icon-btn:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
}
/* Split-screen Canvas / Artifacts Panel */
.canvas-panel {
    width: 500px;
    height: 100%;
    border-left: 1px solid var(--border-color);
    background: rgba(15, 15, 20, 0.9);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    z-index: 8;
    transition: transform var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(100%);
    position: absolute;
    right: 0;
    top: 0;
}
.canvas-panel.active {
    transform: translateX(0);
    position: relative;
}
.canvas-header {
    height: 70px;
    padding: 0 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}
.canvas-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    font-weight: 700;
}
.canvas-title i {
    color: var(--accent);
}
.canvas-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}
.canvas-btn {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 6px 12px;
    color: var(--text-secondary);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}
.canvas-btn:hover {
    color: var(--text-primary);
    border-color: var(--accent);
}
.canvas-body {
    flex-grow: 1;
    overflow: auto;
    position: relative;
    background: #09090b;
}
.canvas-body pre {
    margin: 0;
    padding: 20px;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
    background: transparent;
}
.canvas-body iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #ffffff;
}
.hidden {
    display: none !important;
}
/* Modals Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
}
.modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}
.modal {
    width: 480px;
    max-width: 90%;
    background: rgba(18, 18, 24, 0.9);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    box-shadow: var(--glass-shadow);
    transform: translateY(20px);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}
.modal-overlay.active .modal {
    transform: translateY(0);
}
.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.modal-header h2 {
    font-size: 1.15rem;
    font-weight: 700;
}
.modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.settings-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.settings-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
}
.settings-group input, .settings-group select {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-family: var(--font-sans);
    outline: none;
    font-size: 0.9rem;
    width: 100%;
}
.settings-group input:focus, .settings-group select:focus {
    border-color: var(--accent);
}
.input-with-action {
    display: flex;
    gap: 8px;
}
.help-text {
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.4;
}
.help-text-large {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.5;
}
.btn {
    padding: 10px 16px;
    border-radius: 10px;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}
.btn.primary {
    background: var(--accent-gradient);
    color: #fff;
    box-shadow: 0 0 8px var(--accent-glow);
}
.btn.primary:hover {
    box-shadow: 0 0 12px var(--accent-glow);
}
.btn.secondary {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border-color);
    color: var(--text-primary);
}
.btn.secondary:hover {
    background: rgba(255, 255, 255, 0.08);
}
.btn.danger {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
    color: #f87171;
}
.btn.danger:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
}
.btn-row {
    display: flex;
    gap: 10px;
}
/* Memory Vault Details */
.memory-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}
.memory-input-group input {
    flex-grow: 1;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-family: var(--font-sans);
    outline: none;
    font-size: 0.88rem;
}
.memory-input-group input:focus {
    border-color: var(--accent);
}
.memory-list {
    max-height: 280px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 5px;
}
.memory-tag {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 0.88rem;
    color: var(--text-secondary);
}
.memory-tag span {
    word-break: break-word;
}
.delete-memory-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
}
.delete-memory-btn:hover {
    color: var(--danger);
}
.empty-state {
    text-align: center;
    color: var(--text-muted);
    padding: 24px 0;
    font-size: 0.88rem;
}
/* Animations */
@keyframes pulse-glow {
    0%, 100% {
        opacity: 0.8;
        filter: drop-shadow(0 0 4px var(--accent));
    }
    50% {
        opacity: 1;
        filter: drop-shadow(0 0 12px var(--accent));
    }
}
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
}
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes pulse-red {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }
    50% {
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    }
}
/* Custom Scrollbars */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
}
/* Responsive Adaptation */
@media (max-width: 992px) {
    .canvas-panel {
        position: fixed;
        width: 100%;
        height: 50%;
        bottom: 0;
        top: auto;
        left: 0;
        border-left: none;
        border-top: 1px solid var(--border-color);
        transform: translateY(100%);
    }
    .canvas-panel.active {
        transform: translateY(0);
    }
}
@media (max-width: 768px) {
    .menu-btn {
        display: flex;
    }
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        transform: translateX(-100%);
    }
    .sidebar.active {
        transform: translateX(0);
    }
    .suggested-prompts {
        grid-template-columns: 1fr;
    }
    .message {
        max-width: 90%;
    }
}

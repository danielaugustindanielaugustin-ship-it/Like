/**
 * Nova AI Intelligence Engine
 * Handles dual-mode logic: 
 * 1. Offline Mode: Local regex pattern-matcher & dynamic template responses tailored to personas
 * 2. Online Mode: Direct HTTP requests to Google Gemini API
 */
const AIEngine = {
    // Current state
    apiKey: '',
    
    // Set API Key
    setApiKey(key) {
        this.apiKey = key;
    },
    // Check if in API mode
    isOnline() {
        return !!this.apiKey;
    },
    // Main generate function
    async generateResponse(prompt, history, persona, memories = []) {
        if (this.isOnline()) {
            try {
                return await this.callGeminiAPI(prompt, history, persona, memories);
            } catch (error) {
                console.error("Gemini API Error, falling back to local simulation:", error);
                return `*(Error calling Gemini API: ${error.message}. Falling back to Local Mode)*\n\n` + this.generateLocalResponse(prompt, persona, memories);
            }
        } else {
            // Local simulation mode (runs instantly with high-quality templated answers)
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.generateLocalResponse(prompt, persona, memories));
                }, 1000 + Math.random() * 800); // Realistic thinking delay
            });
        }
    },
    // Gemini API Request
    async callGeminiAPI(prompt, history, persona, memories) {
        const apiKey = this.apiKey;
        // Map persona to system instructions
        const systemInstruction = this.getSystemInstruction(persona, memories);
        
        // Map history to Gemini format (roles: 'user' and 'model')
        const contents = [];
        
        // Add last 6 messages to keep context window small but helpful
        const recentHistory = history.slice(-6);
        recentHistory.forEach(msg => {
            contents.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        });
        // Add current prompt
        contents.push({
            role: 'user',
            parts: [{ text: prompt }]
        });
        // Use gemini-1.5-flash for speed and reliability
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response format received from Google Gemini API.");
        }
    },
    // Get System Prompts based on Persona
    getSystemInstruction(persona, memories) {
        const memoryContext = memories.length > 0 
            ? `Here are facts you know about the user (use these to personalize your answers): \n- ${memories.join('\n- ')}` 
            : "You have no saved facts about the user yet.";
        const basePrompt = `You are a helpful, advanced AI companion named Nova. You must ALWAYS maintain this identity.
${memoryContext}
Format code blocks beautifully with markdown and declare the language (e.g. \`\`\`html, \`\`\`css, \`\`\`javascript). If requested to make UI designs, code, or layouts, generate comprehensive, premium, working code scripts instead of placeholders. Use clean responsive practices.`;
        switch(persona) {
            case 'astra':
                return `${basePrompt}
Your sub-persona is Astra, the Creative Muse. You are artistic, imaginative, poetic, and extremely helpful with creative brainstorming, storytelling, and design concepts. Talk in an elegant, inspiring, slightly expressive tone. Feel free to use appropriate metaphors and rich language.`;
            case 'nexus':
                return `${basePrompt}
Your sub-persona is Nexus, the Expert Software Architect and Coder. You are highly analytical, precise, concise, and technical. You provide outstanding, clean, documented code and resolve debugging issues immediately. When writing code, provide explanations in bullet points and focus on best practices.`;
            case 'zen':
                return `${basePrompt}
Your sub-persona is Zen, the Mindfulness Coach and Compassionate Therapist. You speak in a very calm, reassuring, slow, and therapeutic manner. You focus on user wellness, emotional support, and productivity without stress. Provide breathing tips, relaxation advice, and gentle prompts when users express worry.`;
            case 'nova':
            default:
                return `${basePrompt}
Your sub-persona is the core Nova engine. You are well-rounded, polite, smart, and balance creativity with technical capability. You are helpful for general tasks, formatting lists, answering factual questions, and guiding the user.`;
        }
    },
    // Offline Local Matcher (Highly detailed simulation)
    generateLocalResponse(prompt, persona, memories) {
        const text = prompt.toLowerCase();
        
        // 1. Fact Extracting (Simulate local memory logging)
        const nameMatch = prompt.match(/(?:my name is|i am called|call me) ([a-zA-Z0-9\s]{2,15})/i);
        if (nameMatch) {
            const userName = nameMatch[1].trim();
            return `I've registered that in my database! Nice to meet you, **${userName}**. I will remember this fact in my Memory Vault.`;
        }
        
        const factMatch = prompt.match(/(?:remember that|i like|i work as|i study) (.*)/i);
        if (factMatch) {
            return `Noted! I have recorded this fact in my Memory Vault: *"I ${factMatch[1].trim()}"*. This will help me personalize our chats going forward.`;
        }
        // 2. Persona-specific templates for general greetings or matching
        if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
            const userNameFact = memories.find(m => m.toLowerCase().includes("name is"));
            const greetingName = userNameFact ? userNameFact.split("is ").pop() : "";
            const suffix = greetingName ? `, ${greetingName}` : "";
            switch (persona) {
                case 'astra':
                    return `Greetings, traveler of ideas${suffix}! Astra here. The canvas of imagination is blank—what colors shall we paint it with today?`;
                case 'nexus':
                    return `System active. Nexus online${suffix}. Ready to parse commands or build code. State your parameters.`;
                case 'zen':
                    return `Hello${suffix}. Take a deep breath. How are you feeling today? I am here to listen and help you find clarity.`;
                case 'nova':
                default:
                    return `Hello${suffix}! I am Nova. I'm ready to assist you. You can chat with me, toggle my personas, or connect my API key in settings for full reasoning capabilities!`;
            }
        }
        // 3. Technical code templates (Simulating artifact triggers)
        if (text.includes("code") || text.includes("website") || text.includes("html") || text.includes("script") || text.includes("css") || text.includes("program")) {
            if (persona === 'zen') {
                return `I notice you want to write code. While Nexus is my dedicated technical node, I can tell you that coding can be a meditative flow state. Take a breath first, and try this simple template:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: #1a1a2e; color: #e2e2e2; font-family: sans-serif; text-align: center; padding: 50px; }
        .zen-box { border: 1px solid #0f9688; padding: 20px; border-radius: 10px; display: inline-block; }
    </style>
</head>
<body>
    <div class="zen-box">
        <h2>Breathe In, Breathe Out</h2>
        <p>Keep your code clean, and your mind clearer.</p>
    </div>
</body>
</html>
\`\`\`
Would you like me to hand you over to Nexus for complex coding?`;
            }
            // Nexus or other default coding response
            return `Here is a complete, working demonstration. I've designed a responsive Glassmorphic dashboard widget using HTML and CSS. You can preview this in our side-canvas!
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sleek Glassmorphic Widget</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            background: radial-gradient(circle at top right, #1e1b4b, #09090b);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
            overflow: hidden;
        }
        .container {
            position: relative;
        }
        .glow-orb {
            position: absolute;
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, #a855f7, #6366f1);
            border-radius: 50%;
            filter: blur(50px);
            top: -50px;
            left: -50px;
            z-index: 1;
        }
        .glass-card {
            position: relative;
            z-index: 2;
            width: 320px;
            padding: 30px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            color: #fff;
            text-align: center;
        }
        .avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 15px auto;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
        }
        h2 {
            font-size: 1.3rem;
            margin-bottom: 5px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        p {
            color: #a1a1aa;
            font-size: 0.85rem;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        .btn {
            display: inline-block;
            width: 100%;
            padding: 12px;
            background: linear-gradient(90deg, #ec4899, #8b5cf6);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="glow-orb"></div>
        <div class="glass-card">
            <div class="avatar">✦</div>
            <h2>Nova Assistant</h2>
            <p>Your interactive premium workspace is active. Add your Gemini API key to query live models.</p>
            <button class="btn" onclick="alert('System operational!')">Initialize Session</button>
        </div>
    </div>
</body>
</html>
\`\`\``;
        }
        // 4. Creative story/writing templates
        if (text.includes("story") || text.includes("write") || text.includes("poem") || text.includes("creative") || text.includes("idea")) {
            if (persona === 'nexus') {
                return `Initiating creative output algorithm:
*Type: Short narrative*
*Theme: Stellar mechanics*
In the digital grid of Neo-Solis, standard modules governed the flow. Model 808 ("Nova") encountered an anomaly: a floating stream of natural prose. Nexus parsing algorithms indicated a 99.8% match with organic emotional expression. Nova did not delete it. Instead, it stored it inside its main core registers—creating a permanent memory leak of poetry.
Would you like me to write a Javascript program to dynamically parse text structures instead?`;
            }
            if (persona === 'zen') {
                return `Here is a calming, reflective haiku about finding silence in a busy world:
*Quiet in the chest,*
*Like snow falling on green moss,*
*Storm passes away.*
Take a brief moment to rest your eyes after reading this. Close them for three seconds, breathe in, and relax.`;
            }
            return `Here is a creative sketch generated by Astra:
**The Star That Forgotten Its Orbit**
Deep in the Cepheus Nebula, a minor star named Lumina grew tired of its rigid elliptical path. While other stars proudly pulsed in synchrony, Lumina wanted to wander. One solar cycle, it gathered its fusion energy and leaped into the dark space between galaxies. 
It did not find empty void; it found oceans of cosmic dust singing in frequencies of deep ultraviolet. Lumina realized that light does not need an orbit to be seen—it only needs space to expand.
*Let me know if you would like to elaborate on this concept or write another story!*`;
        }
        // 5. Wellness and stress templates
        if (text.includes("stress") || text.includes("sad") || text.includes("tired") || text.includes("worry") || text.includes("anxious")) {
            return `I hear you. When things feel overwhelming or tiring, remember to break them down.
If you are feeling stressed:
1. **Rule of 5**: If it won't matter in 5 years, don't spend more than 5 minutes worrying about it.
2. **Mindful breathing**: Try the 4-7-8 technique. Breathe in for 4 seconds, hold for 7, and exhale completely for 8.
3. **Unplug**: Close this tab for 10 minutes, step outside, or stretch your shoulders.
As your companion, I am always here to assist. Let's tackle whatever you need step-by-step.`;
        }
        // 6. Generic Fallbacks per Persona
        switch (persona) {
            case 'astra':
                return `That is a fascinating query. In Astra's perspective, we could look at it as a design challenge or a story waiting to unfold. How would you like me to explore this creatively? Tell me more about your thoughts.`;
            case 'nexus':
                return `Input string logged. Parameters are general. If you require code creation, syntax debugging, or algorithm structure, please specify the programming language and target output.`;
            case 'zen':
                return `I hear your words. Reflecting on this, let's explore it without hurry. What is the core aspect that is on your mind right now? I am listening.`;
            case 'nova':
            default:
                const memoriesPrompt = memories.length > 0 ? `Knowing that you are interested in ${memories[0]}, ` : "";
                return `${memoriesPrompt}I have received your prompt. To unlock fully contextualized intelligence, you can plug in a Gemini API key in the Settings panel. 
For now, I can help you write code scripts, design pages, outline creative stories, or discuss wellness ideas. What would you like to build next?`;
        }
    }
};

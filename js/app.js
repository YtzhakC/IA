// Variables globales para almacenar los datos
let appData = null

// Elementos del DOM
const elements = {
    loginScreen: document.getElementById("loginScreen"),
    dashboard: document.getElementById("dashboard"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    logoutBtnMobile: document.getElementById("logoutBtnMobile"),
    sportCards: document.querySelectorAll(".sport-card"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    modalContent: document.getElementById("modalContent"),
    closeModal: document.getElementById("closeModal"),
    chatInput: document.getElementById("chatInput"),
    sendBtn: document.getElementById("sendBtn"),
    chatMessages: document.getElementById("chatMessages"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
    chatInterface: document.querySelector(".chat-interface"),
    menuBtn: document.getElementById("menuBtn"),
    sidebar: document.querySelector(".sidebar"),
    sidebarOverlay: document.querySelector(".sidebar-overlay"),
    mobileNavLinks: document.querySelectorAll(".mobile-nav-link"),
}

// Cargar datos desde JSON (ruta dinámica compatible con Render)
async function loadData() {
    try {
        const response = await fetch(`${window.location.origin}/data.json`)
        appData = await response.json()
        console.log("Datos cargados exitosamente")
    } catch (error) {
        console.error("Error al cargar los datos:", error)
        appData = {
            sportsInfo: {},
            players: [],
        }
    }
}

// Funciones principales
const app = {
    handleLogin(e) {
        e.preventDefault()
        const password = document.getElementById("passwordInput").value

        if (password.trim()) {
            elements.loginScreen.classList.add("hidden")
            elements.dashboard.classList.remove("hidden")

            elements.dashboard.style.opacity = "0"
            setTimeout(() => {
                elements.dashboard.style.transition = "opacity 0.5s ease"
                elements.dashboard.style.opacity = "1"
            }, 100)
        }
    },

    handleLogout() {
        elements.dashboard.classList.add("hidden")
        elements.loginScreen.classList.remove("hidden")
        document.getElementById("passwordInput").value = ""
    },

    handleSportClick(e) {
        const sport = e.currentTarget.dataset.sport
        const info = appData.sportsInfo[sport]

        if (info) {
            elements.modalTitle.textContent = info.title
            elements.modalContent.innerHTML = info.content
            elements.modalOverlay.classList.remove("hidden")
            document.body.style.overflow = "hidden"
        }
    },

    closeModal() {
        elements.modalOverlay.classList.add("hidden")
        document.body.style.overflow = "auto"
    },

    async sendMessage() {
        const message = elements.chatInput.value.trim()
        if (!message) return

        this.addMessage(message, "user")
        elements.chatInput.value = ""

        this.addMessage("Espera un momento...", "bot")
        try {
            const aiResponse = await this.fetchGeminiResponse(message)
            this.replaceLastBotMessage(aiResponse)
        } catch (error) {
            console.error("Error al obtener respuesta de Gemini:", error)
            this.replaceLastBotMessage("Lo siento, hubo un problema al contactar con el asistente.")
        }
    },

    addMessage(text, sender) {
        const messageDiv = document.createElement("div")
        messageDiv.className = `message ${sender}-message`
        messageDiv.style.maxWidth = "100%"
        messageDiv.style.overflowWrap = "break-word"
        messageDiv.style.wordBreak = "break-word"

        const icon = document.createElement("i")
        icon.className = sender === "bot" ? "fas fa-robot" : "fas fa-user"

        const span = document.createElement("span")
        span.style.display = "block"
        span.style.whiteSpace = "pre-wrap"
        span.style.wordWrap = "break-word"
        span.style.overflowWrap = "break-word"

        if (sender === "bot") {
            const codeBlockRegex = /```([\s\S]*?)```/g;
            if (codeBlockRegex.test(text)) {
                const parts = text.split(codeBlockRegex);
                parts.forEach((part, index) => {
                    if (index % 2 === 1) { // Es un bloque de código
                        const pre = document.createElement('pre');
                        pre.className = 'code-block';
                        const code = document.createElement('code');
                        code.textContent = part.trim();
                        pre.appendChild(code);
                        span.appendChild(pre);
                    } else { // Es texto normal
                        const textNode = document.createElement('span');
                        textNode.innerHTML = this.convertMarkdownToHTML(part);
                        span.appendChild(textNode);
                    }
                });
            } else {
                span.innerHTML = this.convertMarkdownToHTML(text);
            }
        } else {
            span.textContent = text;
        }

        messageDiv.appendChild(icon)
        messageDiv.appendChild(span)

        elements.chatMessages.appendChild(messageDiv)
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight
    },

    replaceLastBotMessage(newText) {
        const messages = elements.chatMessages.querySelectorAll(".bot-message span")
        if (messages.length > 0) {
            const lastSpan = messages[messages.length - 1];
            lastSpan.innerHTML = ''; // Limpiar contenido anterior

            const codeBlockRegex = /```([\s\S]*?)```/g;
            if (codeBlockRegex.test(newText)) {
                const parts = newText.split(codeBlockRegex);
                parts.forEach((part, index) => {
                    if (index % 2 === 1) { // Es un bloque de código
                        const pre = document.createElement('pre');
                        pre.className = 'code-block';
                        const code = document.createElement('code');
                        code.textContent = part.trim();
                        pre.appendChild(code);
                        lastSpan.appendChild(pre);
                    } else { // Es texto normal
                        const textNode = document.createElement('span');
                        textNode.innerHTML = this.convertMarkdownToHTML(part);
                        lastSpan.appendChild(textNode);
                    }
                });
            } else {
                lastSpan.innerHTML = this.convertMarkdownToHTML(newText);
            }
        }
    },

    convertMarkdownToHTML(markdownText) {
        let html = markdownText

        html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        // Se elimina el reemplazo de ``` para manejarlo por separado
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
        html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
        html = html.replace(/^##### (.*)$/gm, "<h5>$1</h5>")
        html = html.replace(/^#### (.*)$/gm, "<h4>$1</h4>")
        html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>")
        html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>")
        html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>")
        html = html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<img src='$2' alt='$1' style='max-width:100%;height:auto;'>")
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank'>$1</a>")
        html = html.replace(/^\s*[-*+] (.*)$/gm, "<li>$1</li>")
        html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
        html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>")
        html = html.replace(/(<li>.*<\/li>)/gs, "<ol>$1</ol>")
        html = html.replace(/\n/g, "<br>")

        return html
    },

    async fetchGeminiResponse(userMessage) {
        const apiKey = window.GEMINI_API_KEY || "AIzaSyD3vxPUThZOi20m8i2UdjzW8hdGGg9iSG0"
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

        const requestBody = {
            contents: [{ parts: [{ text: userMessage }] }]
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) throw new Error("Error en la solicitud a Gemini")

        const data = await response.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta."
    },

    toggleFullscreen() {
        const isFullscreen = elements.chatInterface.classList.contains('fullscreen')
        const fullscreenBtn = elements.fullscreenBtn
        const icon = fullscreenBtn.querySelector('i')
        
        if (isFullscreen) {
            // Salir de pantalla completa
            elements.chatInterface.classList.remove('fullscreen')
            icon.className = 'fas fa-expand'
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Pantalla completa'
            document.body.style.overflow = 'auto'
        } else {
            // Entrar en pantalla completa
            elements.chatInterface.classList.add('fullscreen')
            icon.className = 'fas fa-compress'
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Salir'
            document.body.style.overflow = 'hidden'
        }
        
        // Scroll al final después de cambiar el tamaño
        setTimeout(() => {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight
        }, 100)
    },

    toggleSidebar() {
        elements.sidebar.classList.toggle('active');
        elements.sidebarOverlay.classList.toggle('hidden');
        if (elements.sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    },

    setupNavigation() {
        // Configurar navegación del sidebar (desktop)
        document.querySelectorAll(".sidebar nav a").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault()
                document.querySelectorAll(".sidebar nav a").forEach((l) => l.classList.remove("active"))
                link.classList.add("active")
                
                const targetId = link.getAttribute("href")
                if (targetId && targetId !== "#") {
                    const targetElement = document.querySelector(targetId)
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" })
                    }
                }
            })
        })

        // Configurar navegación móvil
        elements.mobileNavLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault()
                elements.mobileNavLinks.forEach((l) => l.classList.remove("active"))
                link.classList.add("active")
                
                const targetId = link.getAttribute("href")
                if (targetId && targetId !== "#") {
                    const targetElement = document.querySelector(targetId)
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" })
                    }
                }
            })
        })

        window.addEventListener("scroll", this.updateActiveNavigation.bind(this))
    },

    updateActiveNavigation() {
        const sections = document.querySelectorAll("section[id]")
        const sidebarLinks = document.querySelectorAll(".sidebar nav a")
        const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")

        let current = ""
        sections.forEach((section) => {
            const sectionTop = section.offsetTop
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute("id")
            }
        })

        // Actualizar navegación del sidebar
        sidebarLinks.forEach((link) => {
            link.classList.remove("active")
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active")
            }
        })

        // Actualizar navegación móvil
        mobileNavLinks.forEach((link) => {
            link.classList.remove("active")
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active")
            }
        })
    },

    setupEventListeners() {
        elements.loginForm.addEventListener("submit", this.handleLogin.bind(this))
        elements.logoutBtn.addEventListener("click", this.handleLogout.bind(this))
        
        // Botón de logout móvil
        if (elements.logoutBtnMobile) {
            elements.logoutBtnMobile.addEventListener("click", this.handleLogout.bind(this))
        }
        
        elements.sportCards.forEach((card) => card.addEventListener("click", this.handleSportClick.bind(this)))
        elements.closeModal.addEventListener("click", this.closeModal.bind(this))
        elements.modalOverlay.addEventListener("click", (e) => {
            if (e.target === elements.modalOverlay) this.closeModal()
        })
        elements.sendBtn.addEventListener("click", this.sendMessage.bind(this))
        elements.chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage()
        })
        elements.fullscreenBtn.addEventListener("click", this.toggleFullscreen.bind(this))
        
        // Eventos para el menú móvil (solo si existe)
        if (elements.menuBtn) {
            elements.menuBtn.addEventListener("click", this.toggleSidebar.bind(this));
        }
        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.addEventListener("click", this.toggleSidebar.bind(this));
        }

        // Escape key para salir de pantalla completa
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && elements.chatInterface.classList.contains('fullscreen')) {
                this.toggleFullscreen()
            }
        })
    },

    async init() {
        await loadData()
        this.setupEventListeners()
        this.setupNavigation()

        elements.dashboard.classList.add("hidden")
        console.log("Aplicación inicializada correctamente")
    },
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    app.init()
})

// Exportar para uso global si es necesario
window.SportsApp = app

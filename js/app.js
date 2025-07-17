// Variables globales para almacenar los datos
let appData = null

// Sistema de contraseñas múltiples
const passwordManager = {
    passwords: ["Johangomez14"], // Contraseña inicial
    
    // Verificar si una contraseña existe
    verifyPassword(password) {
        return this.passwords.includes(password)
    },
    
    // Agregar una nueva contraseña
    addPassword(newPassword) {
        if (!this.passwords.includes(newPassword)) {
            this.passwords.push(newPassword)
            this.saveToLocalStorage()
            return true
        }
        return false
    },
    
    // Cargar contraseñas desde localStorage
    loadFromLocalStorage() {
        const savedPasswords = localStorage.getItem('dashboardPasswords')
        if (savedPasswords) {
            const parsedPasswords = JSON.parse(savedPasswords)
            // Mantener la contraseña inicial si no está en las guardadas
            if (!parsedPasswords.includes("Johangomez14")) {
                parsedPasswords.unshift("Johangomez14")
            }
            this.passwords = parsedPasswords
        }
    },
    
    // Guardar contraseñas en localStorage
    saveToLocalStorage() {
        localStorage.setItem('dashboardPasswords', JSON.stringify(this.passwords))
    }
}

// Elementos del DOM
const elements = {
    loginScreen: document.getElementById("loginScreen"),
    dashboard: document.getElementById("dashboard"),
    loginForm: document.getElementById("loginForm"),
    logoutBtn: document.getElementById("logoutBtn"),
    logoutBtnMobile: document.getElementById("logoutBtnMobile"),
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
        console.log("Cargando datos desde:", `${window.location.origin}/data.json`)
        const response = await fetch(`${window.location.origin}/data.json`)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        appData = await response.json()
        console.log("Datos cargados exitosamente:", appData)
        console.log("Sports info disponible:", Object.keys(appData.sportsInfo || {}))
    } catch (error) {
        console.error("Error al cargar los datos:", error)
        console.log("Usando datos por defecto")
        
        // Datos por defecto si no se puede cargar el JSON
        appData = {
            sportsInfo: {
                futbol: {
                    title: "Fútbol - El Deporte Rey",
                    content: "<div class='sport-info'><h3>Fútbol</h3><p>El fútbol es el deporte más popular del mundo. Se juega entre dos equipos de once jugadores cada uno y el objetivo es marcar goles en la portería contraria.</p></div>"
                },
                volleyball: {
                    title: "Volleyball - Deporte de Precisión",
                    content: "<div class='sport-info'><h3>Volleyball</h3><p>El volleyball es un deporte de equipo que se juega en una cancha dividida por una red. Cada equipo intenta hacer que el balón toque el suelo del campo contrario.</p></div>"
                },
                basketball: {
                    title: "Basketball - El Espectáculo del Deporte",
                    content: "<div class='sport-info'><h3>Basketball</h3><p>El basketball es un deporte de equipo que se juega en una cancha con dos canastas. El objetivo es anotar más puntos que el equipo contrario.</p></div>"
                }
            },
            players: [],
        }
    }
}

// Funciones principales
const app = {
    handleLogin(e) {
        e.preventDefault()
        const password = document.getElementById("passwordInput").value.trim()

        if (password) {
            if (passwordManager.verifyPassword(password)) {
                // Contraseña correcta, mostrar dashboard
                elements.loginScreen.classList.add("hidden")
                elements.dashboard.classList.remove("hidden")

                elements.dashboard.style.opacity = "0"
                setTimeout(() => {
                    elements.dashboard.style.transition = "opacity 0.5s ease"
                    elements.dashboard.style.opacity = "1"
                    
                    // Configurar sport cards después de que el dashboard esté visible
                    this.setupSportCards()
                }, 100)
                
                // Limpiar el campo de contraseña
                document.getElementById("passwordInput").value = ""
            } else {
                // Contraseña incorrecta, mostrar mensaje de error
                this.showLoginError("Contraseña incorrecta. Inténtalo de nuevo.")
            }
        }
    },

    showLoginError(message) {
        // Buscar si ya existe un mensaje de error
        let errorDiv = document.querySelector(".login-error")
        
        if (!errorDiv) {
            // Crear el div de error si no existe
            errorDiv = document.createElement("div")
            errorDiv.className = "login-error"
            errorDiv.style.cssText = `
                color: #ff6b6b;
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid rgba(255, 107, 107, 0.3);
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 15px;
                text-align: center;
                font-size: 14px;
                animation: shake 0.5s ease-in-out;
            `
            
            // Agregar animación de shake
            const style = document.createElement("style")
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `
            document.head.appendChild(style)
            
            // Insertar antes del formulario
            const loginForm = document.getElementById("loginForm")
            loginForm.parentNode.insertBefore(errorDiv, loginForm)
        }
        
        errorDiv.textContent = message
        errorDiv.style.display = "block"
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            errorDiv.style.display = "none"
        }, 3000)
    },

    showPasswordManager() {
        // Crear modal para gestión de contraseñas
        const passwordModal = document.createElement("div")
        passwordModal.className = "password-modal-overlay"
        passwordModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `
        
        const modalContent = document.createElement("div")
        modalContent.style.cssText = `
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            color: #e0e0e0;
        `
        
        modalContent.innerHTML = `
            <h2 style="margin-bottom: 20px; color: #4fc3f7;">
                <i class="fas fa-key"></i> Gestión de Contraseñas
            </h2>
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Contraseñas Activas: ${passwordManager.passwords.length}</h3>
                <div style="max-height: 100px; overflow-y: auto; background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 10px; margin-bottom: 20px;">
                    ${passwordManager.passwords.map(pass => `
                        <div style="padding: 5px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-family: monospace;">
                            ${'*'.repeat(pass.length)}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Agregar Nueva Contraseña</h3>
                <div style="margin-bottom: 15px;">
                    <input type="password" id="currentPasswordInput" placeholder="Contraseña actual" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.05);
                        color: #e0e0e0;
                        margin-bottom: 10px;
                    ">
                </div>
                <div style="margin-bottom: 15px;">
                    <input type="password" id="newPasswordInput" placeholder="Nueva contraseña" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.05);
                        color: #e0e0e0;
                        margin-bottom: 10px;
                    ">
                </div>
                <div style="margin-bottom: 15px;">
                    <input type="password" id="confirmPasswordInput" placeholder="Confirmar nueva contraseña" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.05);
                        color: #e0e0e0;
                    ">
                </div>
                <div id="passwordMessage" style="margin-bottom: 15px; font-size: 14px; min-height: 20px;"></div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="addPasswordBtn" style="
                    background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    <i class="fas fa-plus"></i> Agregar
                </button>
                <button id="closePasswordModal" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: #e0e0e0;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    <i class="fas fa-times"></i> Cerrar
                </button>
            </div>
        `
        
        passwordModal.appendChild(modalContent)
        document.body.appendChild(passwordModal)
        
        // Event listeners para el modal
        document.getElementById("addPasswordBtn").addEventListener("click", () => {
            const currentPassword = document.getElementById("currentPasswordInput").value.trim()
            const newPassword = document.getElementById("newPasswordInput").value.trim()
            const confirmPassword = document.getElementById("confirmPasswordInput").value.trim()
            const messageDiv = document.getElementById("passwordMessage")
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                messageDiv.style.color = "#ff6b6b"
                messageDiv.textContent = "Por favor, completa todos los campos."
                return
            }
            
            if (!passwordManager.verifyPassword(currentPassword)) {
                messageDiv.style.color = "#ff6b6b"
                messageDiv.textContent = "La contraseña actual es incorrecta."
                return
            }
            
            if (newPassword !== confirmPassword) {
                messageDiv.style.color = "#ff6b6b"
                messageDiv.textContent = "Las contraseñas nuevas no coinciden."
                return
            }
            
            if (newPassword.length < 6) {
                messageDiv.style.color = "#ff6b6b"
                messageDiv.textContent = "La contraseña debe tener al menos 6 caracteres."
                return
            }
            
            if (passwordManager.addPassword(newPassword)) {
                messageDiv.style.color = "#4fc3f7"
                messageDiv.textContent = "¡Contraseña agregada exitosamente!"
                
                // Actualizar contador en el botón principal
                this.updatePasswordCounter()
                
                // Limpiar campos
                document.getElementById("currentPasswordInput").value = ""
                document.getElementById("newPasswordInput").value = ""
                document.getElementById("confirmPasswordInput").value = ""
                
                // Actualizar la lista de contraseñas en el modal
                setTimeout(() => {
                    document.body.removeChild(passwordModal)
                    this.showPasswordManager()
                }, 1500)
            } else {
                messageDiv.style.color = "#ff6b6b"
                messageDiv.textContent = "Esta contraseña ya existe."
            }
        })
        
        document.getElementById("closePasswordModal").addEventListener("click", () => {
            document.body.removeChild(passwordModal)
        })
        
        // Cerrar modal al hacer clic fuera
        passwordModal.addEventListener("click", (e) => {
            if (e.target === passwordModal) {
                document.body.removeChild(passwordModal)
            }
        })
    },

    handleLogout() {
        elements.dashboard.classList.add("hidden")
        elements.loginScreen.classList.remove("hidden")
        document.getElementById("passwordInput").value = ""
        
        // Ocultar cualquier mensaje de error que pueda estar visible
        const errorDiv = document.querySelector(".login-error")
        if (errorDiv) {
            errorDiv.style.display = "none"
        }
    },

    handleSportClick(e) {
        console.log("Sport card clicked!")
        e.preventDefault()
        e.stopPropagation()
        
        const sport = e.currentTarget.dataset.sport
        console.log("Sport selected:", sport)
        console.log("appData:", appData)
        
        if (!appData || !appData.sportsInfo) {
            console.error("appData or sportsInfo not loaded")
            return
        }
        
        const info = appData.sportsInfo[sport]
        console.log("Sport info:", info)

        if (info) {
            console.log("Opening modal for sport:", sport)
            
            // Verificar que los elementos del modal existan
            if (!elements.modalTitle || !elements.modalContent || !elements.modalOverlay) {
                console.error("Modal elements not found")
                return
            }
            
            elements.modalTitle.textContent = info.title
            elements.modalContent.innerHTML = info.content
            elements.modalOverlay.classList.remove("hidden")
            document.body.style.overflow = "hidden"
            
            console.log("Modal opened successfully")
        } else {
            console.error("No info found for sport:", sport)
            console.log("Available sports:", Object.keys(appData.sportsInfo))
        }
    },

    closeModal() {
        console.log("Closing modal")
        if (elements.modalOverlay) {
            elements.modalOverlay.classList.add("hidden")
        }
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
        
        // Botón de gestión de contraseñas
        const managePasswordsBtn = document.getElementById("managePasswordsBtn")
        if (managePasswordsBtn) {
            managePasswordsBtn.addEventListener("click", this.showPasswordManager.bind(this))
        }
        
        // Obtener sport cards dinámicamente y agregar event listeners
        this.setupSportCards()
        
        // Event listeners para el modal
        if (elements.closeModal) {
            elements.closeModal.addEventListener("click", this.closeModal.bind(this))
        }
        
        if (elements.modalOverlay) {
            elements.modalOverlay.addEventListener("click", (e) => {
                if (e.target === elements.modalOverlay) this.closeModal()
            })
        }
        
        if (elements.sendBtn) {
            elements.sendBtn.addEventListener("click", this.sendMessage.bind(this))
        }
        
        if (elements.chatInput) {
            elements.chatInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.sendMessage()
            })
        }
        
        if (elements.fullscreenBtn) {
            elements.fullscreenBtn.addEventListener("click", this.toggleFullscreen.bind(this))
        }
        
        // Eventos para el menú móvil (solo si existe)
        if (elements.menuBtn) {
            elements.menuBtn.addEventListener("click", this.toggleSidebar.bind(this));
        }
        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.addEventListener("click", this.toggleSidebar.bind(this));
        }

        // Escape key para salir de pantalla completa
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && elements.chatInterface && elements.chatInterface.classList.contains('fullscreen')) {
                this.toggleFullscreen()
            }
        })
    },

    setupSportCards() {
        // Obtener sport cards dinámicamente para evitar problemas de inicialización
        const sportCards = document.querySelectorAll(".sport-card")
        console.log("Sport cards encontradas:", sportCards.length)
        
        sportCards.forEach((card, index) => {
            console.log(`Configurando card ${index}:`, card.dataset.sport)
            card.addEventListener("click", this.handleSportClick.bind(this))
        })
    },

    async init() {
        // Cargar contraseñas guardadas
        passwordManager.loadFromLocalStorage()
        
        await loadData()
        this.setupEventListeners()
        this.setupNavigation()

        elements.dashboard.classList.add("hidden")
        
        // Mostrar contador de contraseñas en el botón
        this.updatePasswordCounter()
        
        // Verificar que los elementos del modal existan
        console.log("Modal elements check:")
        console.log("modalOverlay:", elements.modalOverlay)
        console.log("modalTitle:", elements.modalTitle)
        console.log("modalContent:", elements.modalContent)
        console.log("closeModal:", elements.closeModal)
        
        console.log("Aplicación inicializada correctamente")
        console.log("Contraseñas cargadas:", passwordManager.passwords.length)
    },

    updatePasswordCounter() {
        const managePasswordsBtn = document.getElementById("managePasswordsBtn")
        if (managePasswordsBtn) {
            const span = managePasswordsBtn.querySelector("span")
            if (span) {
                const count = passwordManager.passwords.length
                span.textContent = `Gestionar Contraseñas (${count})`
            }
        }
    },

    // Método para probar el modal manualmente
    testModal() {
        console.log("Testing modal...")
        if (elements.modalOverlay) {
            elements.modalTitle.textContent = "Prueba del Modal"
            elements.modalContent.innerHTML = "<p>Este es un test del modal</p>"
            elements.modalOverlay.classList.remove("hidden")
            document.body.style.overflow = "hidden"
            console.log("Modal test opened")
        } else {
            console.error("Modal overlay not found!")
        }
    },
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    app.init()
})

// Exportar para uso global si es necesario
window.SportsApp = app
window.testModal = () => app.testModal()
window.elements = elements
window.appData = () => appData

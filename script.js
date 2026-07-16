document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const sections = document.querySelectorAll('section, footer');
    
    // Chatbot Logic
    const chatFab = document.getElementById('chat-fab');
    const chatClose = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const chatFabIcon = document.getElementById('chat-fab-icon');
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');

    const toggleChat = () => {
        const isHidden = chatWindow.classList.contains('hidden-chat');
        if (isHidden) {
            chatWindow.classList.remove('hidden-chat');
            chatFabIcon.textContent = 'close';
        } else {
            chatWindow.classList.add('hidden-chat');
            chatFabIcon.textContent = 'chat';
        }
    };

    chatFab.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = chatForm.querySelector('input');
        const message = input.value.trim();
        if (message) {
            // Add User Message
            const userMsgDiv = document.createElement('div');
            userMsgDiv.className = 'flex gap-3 max-w-[85%] ml-auto flex-row-reverse';
            userMsgDiv.innerHTML = `
                <div class="bg-primary-container p-3 rounded-2xl rounded-tr-none shadow-sm text-white">
                    <p class="font-body-md text-sm">${message}</p>
                </div>
            `;
            chatMessages.appendChild(userMsgDiv);
            input.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simple auto-reply mock
            setTimeout(() => {
                const aiMsgDiv = document.createElement('div');
                aiMsgDiv.className = 'flex gap-3 max-w-[85%]';
                aiMsgDiv.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-primary text-sm">smart_toy</span>
                    </div>
                    <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant">
                        <p class="font-body-md text-sm text-on-surface">Thank you for your message! Our team will get back to you shortly regarding "${message}".</p>
                    </div>
                `;
                chatMessages.appendChild(aiMsgDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    });

    // Mobile Menu Elements
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');
    const mobileDrawer = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Mobile Menu Logic
    const openMenu = () => {
        mobileOverlay.classList.remove('hidden');
        setTimeout(() => {
            mobileDrawer.classList.remove('hidden-drawer');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        mobileDrawer.classList.add('hidden-drawer');
        setTimeout(() => {
            mobileOverlay.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) closeMenu();
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Header Scroll Behavior
    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('h-16', isScrolled);
        header.classList.toggle('h-20', !isScrolled);
        header.classList.toggle('shadow-md', isScrolled);
    });

    // Scroll Spy Implementation
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove('nav-link-active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('nav-link-active');
                        }
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section.id) observer.observe(section);
    });

    // Smooth Scroll for Internal Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerOffset = window.innerWidth < 768 ? 64 : 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });
});
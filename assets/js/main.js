/* ===================================================================
 * main.js - Lógica Global
 * =================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Gerenciamento de Autenticação ---
    const updateAuthUI = () => {
        const user = api.getCurrentUser();
        const authNavLinks = document.getElementById('auth-nav-links');
        
        // Caminhos
        const isInAdmin = window.location.pathname.includes('/admin/');
        const rootPath = isInAdmin ? '../' : './';
        const adminPath = isInAdmin ? './' : './admin/';

        if (authNavLinks) {
            if (user) {
                // --- USUÁRIO LOGADO ---
                const greeting = api.isAdmin() ? 'Olá, Admin' : `Olá, ${user.name.split(' ')[0]}`;
                let adminButton = '';

                if (api.isAdmin()) {
                    // Botão Admin com classes responsivas corretas
                    adminButton = `<a href="${adminPath}index.html" class="btn btn-secondary btn-sm fw-bold px-3 py-2 w-100 w-lg-auto text-nowrap">Admin</a>`;
                }
                
                // Injeta o HTML com a estrutura Flexbox correta e classes w-lg-auto
                authNavLinks.innerHTML = `
                    <span class="text-white align-self-center d-none d-lg-inline fw-bold text-nowrap me-3 small">${greeting}</span>
                    
                    <div class="d-flex flex-column flex-lg-row gap-2 w-100 justify-content-end align-items-stretch align-items-lg-center">
                        ${adminButton}
                        <a href="${rootPath}dashboard.html" class="btn btn-primary btn-sm fw-bold px-3 py-2 w-100 w-lg-auto text-nowrap">Minha Conta</a>
                        <button id="auth-logout-btn" class="btn btn-outline-light btn-sm px-3 py-2 w-100 w-lg-auto">Sair</button>
                    </div>
                `;
                
                // Listener do Logout
                document.getElementById('auth-logout-btn').addEventListener('click', () => {
                    api.logout();
                    window.location.href = `${rootPath}index.html`;
                });
                
            } else {
                // --- USUÁRIO DESLOGADO (Padrão) ---
                authNavLinks.innerHTML = `
                    <a href="${rootPath}login.html" class="btn btn-secondary btn-sm fw-bold px-4 py-2 w-100 w-lg-auto">Login / Cadastro</a>
                `;
            }
        }
    };

    // --- Proteção de Rotas ---
    const protectRoute = () => {
        const user = api.getCurrentUser();
        const path = window.location.pathname;
        const isInAdmin = path.includes('/admin/');
        const rootPath = isInAdmin ? '../' : './';
        
        let page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        let redirectTarget = page;

        if (isInAdmin && page !== 'index.html') redirectTarget = 'admin/' + page;
        else if (isInAdmin) redirectTarget = 'admin/';

        const loginUrl = `${rootPath}login.html?redirect=${encodeURIComponent(redirectTarget)}`;
        
        if (path.includes('/dashboard.html') && !user) window.location.href = loginUrl;
        
        if (isInAdmin) {
            if (!user) window.location.href = loginUrl;
            else if (!api.isAdmin()) {
                alert('Acesso negado.');
                window.location.href = `${rootPath}dashboard.html`;
            }
        }
    };
    
    // --- Lógica do Header (Busca) ---
    const initHeaderControls = () => {
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = document.getElementById('search-input').value;
                const rootPath = window.location.pathname.includes('/admin/') ? '../' : './';
                window.location.href = `${rootPath}events.html?search=${encodeURIComponent(query)}`;
            });
        }
        updateAuthUI(); 
    };
    
    // --- Lógica dos Modais (Footer) ---
    const initModalTriggers = () => {
        const modalTriggers = document.querySelectorAll('.modal-trigger');
        const modalCloses = document.querySelectorAll('.modal-close');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = e.target.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if(modal) modal.style.display = 'block';
            });
        });

        modalCloses.forEach(close => {
            close.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if(modal) modal.style.display = 'none';
            });
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    };

    // --- Inicialização ---
    protectRoute();
    initHeaderControls();
    initModalTriggers();
});
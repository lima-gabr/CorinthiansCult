/* ===================================================================
 * main.js - Lógica Global (Versão Corrigida para Deploy Estático)
 * =================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Gerenciamento de Autenticação (RNF5) ---
    const updateAuthUI = () => {
        const user = api.getCurrentUser();
        const authNavLinks = document.getElementById('auth-nav-links');
        
        // 1. Define os caminhos base
        const isInAdmin = window.location.pathname.includes('/admin/');
        const rootPath = isInAdmin ? '../' : './';
        const adminPath = isInAdmin ? './' : './admin/';

        console.log(`[Auth] User: ${user ? user.email : 'null'} | InAdmin: ${isInAdmin}`); // Debug
        
        if (authNavLinks) {
            if (user) {
                // --- USUÁRIO ESTÁ LOGADO ---
                let greeting = '';
                let adminLinkHTML = ''; // Link do painel Admin

                if (api.isAdmin()) {
                    // É Admin
                    greeting = 'Olá, Admin'; 
                    adminLinkHTML = `<a href="${adminPath}index.html" class="btn btn-secondary">Admin</a>`;
                } else {
                    // É Cliente
                    greeting = `Olá, ${user.name}`; 
                }
                
                authNavLinks.innerHTML = `
                    <span style="align-self: center;">${greeting}</span>
                    ${adminLinkHTML}
                    <a href="${rootPath}dashboard.html" class="btn btn-primary">Minha Conta</a>
                    <button id="auth-logout-btn" class="btn btn-secondary">Sair</button>
                `;
                
                document.getElementById('auth-logout-btn').addEventListener('click', () => {
                    api.logout();
                    window.location.href = `${rootPath}index.html`; // Redireciona para a raiz
                });
                
            } else {
                // --- USUÁRIO ESTÁ DESLOGADO ---
                authNavLinks.innerHTML = `<a href="${rootPath}login.html" class="btn btn-secondary" id="auth-login-btn">Login / Cadastro</a>`;
            }
        }
    };

    // --- Proteção de Rotas (RNF5) ---
    const protectRoute = () => {
        const user = api.getCurrentUser();
        const path = window.location.pathname;
        const isInAdmin = path.includes('/admin/');
        
        const rootPath = isInAdmin ? '../' : './';
        
        let page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        let redirectTarget = page;

        if (isInAdmin && page !== 'index.html') {
            redirectTarget = 'admin/' + page;
        } else if (isInAdmin) {
            redirectTarget = 'admin/';
        }

        const loginUrl = `${rootPath}login.html?redirect=${encodeURIComponent(redirectTarget)}`;
        
        // Protege Dashboard
        if (path.includes('/dashboard.html') && !user) {
            window.location.href = loginUrl;
        }
        
        // Protege Admin
        if (isInAdmin) {
            if (!user) {
                window.location.href = loginUrl;
            } else if (!api.isAdmin()) {
                alert('Acesso negado. Você não é um administrador.');
                window.location.href = `${rootPath}dashboard.html`;
            }
        }
    };
    
    // --- Lógica do Header (Busca RF1.4) ---
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
        // Chamada crucial que conserta o header
        updateAuthUI(); 
    };
    
    // --- Lógica do Footer (Modais RF7) ---
    const initModalTriggers = () => {
        const modalTriggers = document.querySelectorAll('.modal-trigger');
        const modalCloses = document.querySelectorAll('.modal-close');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = e.target.getAttribute('data-modal');
                document.getElementById(modalId).style.display = 'block';
            });
        });

        modalCloses.forEach(close => {
            close.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                document.getElementById(modalId).style.display = 'none';
            });
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    };

    // --- Execução Principal ---
    protectRoute();
    initHeaderControls();
    initModalTriggers();
});
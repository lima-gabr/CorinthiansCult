/* ===================================================================
 * auth.js - Lógica de Autenticação (RF2)
 * =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');

    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    
    // Links de alternância
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        forgotForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
    
    const showLogin = (e) => {
        if(e) e.preventDefault();
        loginForm.style.display = 'block';
        forgotForm.style.display = 'none';
        registerForm.style.display = 'none';
    };
    document.getElementById('show-login').addEventListener('click', showLogin);
    document.getElementById('show-login-from-forgot').addEventListener('click', showLogin);

    document.getElementById('show-forgot').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        forgotForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
    
    // --- Lógica de Login (RF2.1) ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const result = api.login(email, password);
        
        if (result.success) {
            alert('Login realizado com sucesso!');
            
            const urlParams = new URLSearchParams(window.location.search);
            const redirectFromUrl = urlParams.get('redirect');
            
            let destinationUrl;

            if (redirectFromUrl) {
                // O redirectFromUrl (ex: 'admin/index.html') já está no formato correto
                destinationUrl = redirectFromUrl;
            } 
            else if (result.user.role === 'admin') {
                destinationUrl = './admin/index.html'; // CORREÇÃO EXPLÍCITA
            } 
            else {
                destinationUrl = './dashboard.html';
            }
            
            window.location.href = destinationUrl;

        } else {
            loginError.textContent = result.message;
            loginError.style.display = 'block';
        }
    });

    // --- Lógica de Cadastro (RF2.3) ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // ... (código de validação) ...
        
        const result = api.register(name, email, password);
        
        if (result.success) {
            alert('Cadastro realizado com sucesso! Você já está logado.');
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || './dashboard.html';
            window.location.href = redirectUrl;
        } else {
            registerError.textContent = result.message;
            registerError.style.display = 'block';
        }
    });
    
    // ... (resto do arquivo auth.js) ...
});
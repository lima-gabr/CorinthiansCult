/* ===================================================================
 * auth.js - Lógica de Autenticação (RF2)
 * (Atualizado com Validações e Caminhos Relativos)
 * =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos dos Formulários
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form');

    // Elementos de Erro/Sucesso
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const forgotError = document.getElementById('forgot-error');
    const forgotSuccess = document.getElementById('forgot-success');
    
    // --- Alternância de Telas (Toggle) ---
    
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
        if(loginError) loginError.style.display = 'none';
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const result = api.login(email, password);
        
        if (result.success) {
            // RNF3 - Feedback
            // alert('Login realizado com sucesso!'); // Opcional, removido para fluxo mais rápido
            
            const urlParams = new URLSearchParams(window.location.search);
            const redirectFromUrl = urlParams.get('redirect');
            
            let destinationUrl;

            // 1. Prioridade: Redirecionamento vindo da URL (ex: tentativa de compra)
            if (redirectFromUrl) {
                destinationUrl = redirectFromUrl;
            } 
            // 2. Se for Admin
            else if (result.user.role === 'admin') {
                destinationUrl = './admin/index.html'; 
            } 
            // 3. Padrão: Dashboard do Cliente
            else {
                destinationUrl = './dashboard.html';
            }
            
            window.location.href = destinationUrl;

        } else {
            if(loginError) {
                loginError.textContent = result.message;
                loginError.style.display = 'block';
            } else {
                alert(result.message);
            }
        }
    });

    // --- Lógica de Cadastro (RF2.3) ---
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(registerError) registerError.style.display = 'none';
        
        // Captura dos valores (CORREÇÃO: Adicionado aqui)
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const passwordConfirm = document.getElementById('reg-password-confirm').value;
        const cep = (document.getElementById('reg-cep') && document.getElementById('reg-cep').value) || '';
        
        // Validação
        if (password !== passwordConfirm) {
            if(registerError) {
                registerError.textContent = 'As senhas não coincidem.';
                registerError.style.display = 'block';
            } else { alert('As senhas não coincidem.'); }
            return;
        }
        
        if (password.length < 6) {
             if(registerError) {
                registerError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
                registerError.style.display = 'block';
             } else { alert('Senha muito curta.'); }
             return;
        }
        
        const result = api.register(name, email, password, cep);
        
        if (result.success) {
            alert('Cadastro realizado com sucesso! Você já está logado.');
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || './dashboard.html';
            window.location.href = redirectUrl;
        } else {
            if(registerError) {
                registerError.textContent = result.message;
                registerError.style.display = 'block';
            } else { alert(result.message); }
        }
    });
    
    // --- Lógica "Esqueci a Senha" (RF2.2 Simulado) ---
    
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(forgotError) forgotError.style.display = 'none';
        if(forgotSuccess) forgotSuccess.style.display = 'none';
        
        const email = document.getElementById('forgot-email').value;
        
        // Simulação de envio
        console.log(`[SIMULAÇÃO] Solicitação de redefinição de senha para: ${email}`);
        
        if(forgotSuccess) {
            forgotSuccess.textContent = 'Se este e-mail existir, instruções foram enviadas.';
            forgotSuccess.style.display = 'block';
        } else {
            alert('Instruções enviadas (simulado).');
        }
        
        forgotForm.reset();
    });
    // --- CEP Lookup (ViaCEP) for Registration Form ---
    const regCepInput = document.getElementById('reg-cep');
    const regCepBtn = document.getElementById('reg-cep-lookup');
    const regCepError = document.getElementById('reg-cep-error');
    const regAddressEl = document.getElementById('reg-address');

    const lookupRegCep = async () => {
        if (!regCepInput) return;
        regCepError.style.display = 'none';
        regAddressEl.value = '';
        let cepVal = (regCepInput.value || '').replace(/\D/g, '');
        if (!cepVal || cepVal.length !== 8) {
            regCepError.textContent = 'CEP inválido (use 8 dígitos).';
            regCepError.style.display = 'block';
            return;
        }

        try {
            regCepBtn.disabled = true;
            regCepBtn.textContent = 'Buscando...';
            const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
            const data = await res.json();
            if (data.erro) {
                regCepError.textContent = 'CEP não encontrado.';
                regCepError.style.display = 'block';
            } else {
                regAddressEl.value = `${data.logradouro || ''}${data.bairro ? ', ' + data.bairro : ''} - ${data.localidade || ''}/${data.uf || ''}`;
            }
        } catch (err) {
            regCepError.textContent = 'Erro ao buscar CEP.';
            regCepError.style.display = 'block';
        } finally {
            regCepBtn.disabled = false;
            regCepBtn.textContent = 'Buscar';
        }
    };

    if (regCepBtn) regCepBtn.addEventListener('click', lookupRegCep);
    if (regCepInput) regCepInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); lookupRegCep(); } });
    
});
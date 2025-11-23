/* ===================================================================
 * admin.js - Lógica do Painel de Administração (RF3, RF8)
 * (Atualizado com Bootstrap e Caminhos Relativos para GitHub Pages)
 * =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Rota: /admin/index.html (Tabela de Eventos)
    if (document.getElementById('admin-events-tbody')) {
        loadAdminDashboard();
    }
    
    // Rota: /admin/event-form.html (Formulário)
    if (document.getElementById('event-form')) {
        initEventForm();
    }
});

// --- Lógica do Dashboard (RF8) ---
function loadAdminDashboard() {
    const tbody = document.getElementById('admin-events-tbody');
    const exportBtn = document.getElementById('export-csv-btn');
    
    const report = api.getAdminReport(); // RF8.1
    
    if (report.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhum evento cadastrado.</td></tr>';
        return;
    }
    
    tbody.innerHTML = report.map(event => {
        // Lógica de cores para o Badge do Bootstrap
        let badgeClass = 'bg-secondary';
        if (event.status === 'Disponível') badgeClass = 'bg-success';
        else if (event.status === 'Esgotado') badgeClass = 'bg-danger';
        else if (event.status === 'Em breve') badgeClass = 'bg-primary';
        else if (event.status === 'Pré-venda') badgeClass = 'bg-info text-dark';

        return `
        <tr>
            <td class="fw-bold">${event.title}</td>
            <td>${event.category}</td>
            <td class="text-center">${event.sold}</td>
            <td class="text-center">${event.total}</td>
            <td class="text-center"><span class="badge ${badgeClass}">${event.status}</span></td>
            <td class="text-end">
                <a href="./event-form.html?id=${event.id}" class="btn btn-sm btn-outline-primary me-1">Editar</a>
                <button class="btn btn-sm btn-outline-danger btn-delete-event" data-id="${event.id}">Excluir</button>
            </td>
        </tr>
        `;
    }).join('');
    
    // Adiciona listeners aos botões de exclusão da tabela
    addDeleteEventListeners();

    // RF8.3 - Exportar CSV (Simulado)
    if(exportBtn) {
        exportBtn.addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "ID,Titulo,Categoria,Vendidos,Total,Status\r\n";
            
            report.forEach(row => {
                csvContent += `${row.id},"${row.title}",${row.category},${row.sold},${row.total},${row.status}\r\n`;
            });
            
            console.log("--- SIMULAÇÃO EXPORTAR CSV (RF8.3) ---");
            console.log(csvContent);
            alert('CSV Simulado gerado no console (F12).');
        });
    }
}

// Função auxiliar para deletar eventos da lista
function addDeleteEventListeners() {
    document.querySelectorAll('.btn-delete-event').forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja EXCLUIR este evento? Esta ação não pode ser desfeita.')) {
                const result = api.deleteEvent(eventId);
                if (result.success) {
                    // Recarrega a tabela sem recarregar a página
                    loadAdminDashboard();
                } else {
                    alert(`Erro ao excluir: ${result.message}`);
                }
            }
        });
    });
}


// --- Lógica do Formulário de Evento (RF3) ---
function initEventForm() {
    const form = document.getElementById('event-form');
    const formTitle = document.getElementById('event-form-title');
    const deleteBtn = document.getElementById('delete-event-btn');
    const errorEl = document.getElementById('form-error');
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    let isEditMode = false;
    
    // RF3.4 - Modo Edição: Carrega dados existentes
    if (eventId) {
        isEditMode = true;
        const event = api.getEventById(eventId);
        
        if (event) {
            formTitle.textContent = `Editando: ${event.title}`;
            deleteBtn.style.display = 'inline-block'; // Mostra botão de excluir
            
            // Preenche o formulário
            document.getElementById('event-id').value = event.id;
            document.getElementById('titulo').value = event.title;
            document.getElementById('categoria').value = event.category;
            document.getElementById('descricao').value = event.description;
            document.getElementById('local_nome').value = event.local_nome;
            document.getElementById('local_endereco').value = event.local_endereco;
            document.getElementById('data').value = event.date;
            document.getElementById('hora').value = event.time;
            document.getElementById('quantidade_total').value = event.quantity_total;
            document.getElementById('preco_inteira').value = event.price_inteira;
            document.getElementById('preco_meia').value = event.price_meia;
            document.getElementById('idioma').value = event.idioma;
            document.getElementById('classificacao').value = event.classificacao;
            document.getElementById('trailer_url').value = event.trailer_url || '';
            document.getElementById('imagem_capa').value = event.imagem_capa;
            document.getElementById('status').value = event.status;
            // Preenche CEP se disponível
            if (document.getElementById('cep')) document.getElementById('cep').value = event.cep || '';
        } else {
            alert('Evento não encontrado!');
            // CORRIGIDO: Caminho relativo
            window.location.href = './index.html';
        }
    }
    
    // Listener do Submit (Create ou Update)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if(errorEl) errorEl.style.display = 'none';
        
        // RNF3 - Validação
        if (!form.checkValidity()) {
            if(errorEl) {
                errorEl.textContent = 'Por favor, preencha todos os campos obrigatórios.';
                errorEl.style.display = 'block';
            }
            form.classList.add('was-validated'); // Classe Bootstrap para feedback visual
            return;
        }
        
        const formData = new FormData(form);
        const eventData = {};
        
        for (let [key, value] of formData.entries()) {
            if (['quantity_total', 'price_inteira', 'price_meia'].includes(key)) {
                eventData[key] = parseFloat(value);
            } else {
                eventData[key] = value;
            }
        }
        
        let result;
        if (isEditMode) {
            // RF3.4 - Update
            result = api.updateEvent(eventId, eventData);
        } else {
            // RF3.1 - Create
            result = api.createEvent(eventData);
        }
        
        if (result.success) {
            alert('Evento salvo com sucesso!');
            // CORRIGIDO: Caminho relativo para voltar à lista
            window.location.href = './index.html';
        } else {
            if(errorEl) {
                errorEl.textContent = `Erro ao salvar: ${result.message}`;
                errorEl.style.display = 'block';
            }
        }
    });
    
    // RF3.4 - Listener de Exclusão (Botão dentro do form)
    if(deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja EXCLUIR este evento? Esta ação não pode ser desfeita.')) {
                const result = api.deleteEvent(eventId);
                if (result.success) {
                    alert('Evento excluído com sucesso.');
                    // CORRIGIDO: Caminho relativo
                    window.location.href = './index.html';
                } else {
                    alert(`Erro ao excluir: ${result.message}`);
                }
            }
        });
    }

    // --- CEP Lookup (ViaCEP) ---
    const cepInput = document.getElementById('cep');
    const cepBtn = document.getElementById('cep-lookup-btn');
    const cepError = document.getElementById('cep-error');

    const lookupCep = async () => {
        if (!cepInput) return;
        cepError.style.display = 'none';
        let cep = (cepInput.value || '').replace(/\D/g, '');
        if (!cep || cep.length !== 8) {
            cepError.textContent = 'CEP inválido (use 8 dígitos).';
            cepError.style.display = 'block';
            return;
        }

        try {
            cepBtn.disabled = true;
            cepBtn.textContent = 'Buscando...';
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) {
                cepError.textContent = 'CEP não encontrado.';
                cepError.style.display = 'block';
            } else {
                const address = `${data.logradouro || ''}${data.bairro ? ', ' + data.bairro : ''} - ${data.localidade || ''}/${data.uf || ''}`;
                const addrEl = document.getElementById('local_endereco');
                if (addrEl) addrEl.value = address;
            }
        } catch (err) {
            cepError.textContent = 'Erro ao buscar CEP.';
            cepError.style.display = 'block';
        } finally {
            cepBtn.disabled = false;
            cepBtn.textContent = 'Buscar';
        }
    };

    if (cepBtn) cepBtn.addEventListener('click', lookupCep);
    if (cepInput) cepInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); lookupCep(); } });
}
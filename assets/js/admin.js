/* ===================================================================
 * admin.js - Lógica do Painel de Administração (RF3, RF8)
 * =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Rota: /admin/index.html
    if (document.getElementById('admin-events-tbody')) {
        loadAdminDashboard();
    }
    
    // Rota: /admin/event-form.html
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
        tbody.innerHTML = '<tr><td colspan="6">Nenhum evento cadastrado.</td></tr>';
        return;
    }
    
    tbody.innerHTML = report.map(event => `
        <tr>
            <td>${event.title}</td>
            <td>${event.category}</td>
            <td>${event.sold}</td> <td>${event.total}</td>
            <td><span classclass="event-status-tag ${event.status.toLowerCase().replace(' ', '-')}">${event.status}</span></td>
            <td>
                <a href="/admin/event-form.html?id=${event.id}" class="btn btn-secondary" style="padding: 0.25rem 0.5rem;">Editar</a>
            </td>
        </tr>
    `).join('');
    
    // RF8.3 - Exportar CSV (Simulado)
    exportBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Titulo,Categoria,Vendidos,Total,Status\r\n";
        
        report.forEach(row => {
            csvContent += `${row.id},"${row.title}",${row.category},${row.sold},${row.total},${row.status}\r\n`;
        });
        
        // Simula o download
        console.log("--- SIMULAÇÃO EXPORTAR CSV (RF8.3) ---");
        console.log(csvContent);
        alert('CSV Simulado gerado no console (F12).');
        
        // Código real para download:
        // var encodedUri = encodeURI(csvContent);
        // var link = document.createElement("a");
        // link.setAttribute("href", encodedUri);
        // link.setAttribute("download", "relatorio_eventos.csv");
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    });
}


// --- Lógica do Formulário de Evento (RF3) ---
function initEventForm() {
    const form = document.getElementById('event-form');
    const formTitle = document.getElementById('event-form-title');
    const eventIdInput = document.getElementById('event-id');
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
            formTitle.textContent = `Editando Evento: ${event.title}`;
            deleteBtn.style.display = 'inline-block';
            
            // Preenche o formulário (Apêndice 10)
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
        } else {
            alert('Evento não encontrado!');
            window.location.href = '/admin/';
        }
    }
    
    // Listener do Submit (Create ou Update)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        
        // RNF3 - Validação
        if (!form.checkValidity()) {
            errorEl.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            errorEl.style.display = 'block';
            return;
        }
        
        const formData = new FormData(form);
        const eventData = {};
        
        // Converte FormData para Objeto (necessário para os campos do Apêndice 10)
        // E converte números
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
            window.location.href = '/admin/';
        } else {
            errorEl.textContent = `Erro ao salvar: ${result.message}`;
            errorEl.style.display = 'block';
        }
    });
    
    // RF3.4 - Listener de Exclusão
    deleteBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja EXCLUIR este evento? Esta ação não pode ser desfeita.')) {
            const result = api.deleteEvent(eventId);
            if (result.success) {
                alert('Evento excluído com sucesso.');
                window.location.href = '/admin/';
            } else {
                alert(`Erro ao excluir: ${result.message}`);
            }
        }
    });
}
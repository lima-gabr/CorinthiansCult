/* ===================================================================
 * API.js - Backend Simulado (localStorage)
 * Gerencia todas as entidades: User, Event, Purchase
 * =================================================================== */

const ApiService = () => {
    
    // --- Helpers Internos ---
    
    const _get = (key) => JSON.parse(localStorage.getItem(key) || '[]');
    const _set = (key, data) => localStorage.setItem(key, JSON.stringify(data));
    const _generateId = () => Math.random().toString(36).substr(2, 9);
    
    const _initDB = () => {
        // Inicializa o DB com dados de mock se estiver vazio
        if (_get('db_users').length === 0) {
            _set('db_users', [
                { id: 'admin', name: 'Admin', email: 'admin@cult.com', password: 'admin', role: 'admin' },
                { id: 'user1', name: 'Usuário Padrão', email: 'user@cult.com', password: '123', role: 'customer' }
            ]);
        }
        
        if (_get('db_events').length === 0) {
            _set('db_events', [
                {
                    id: 'evt1', title: 'Show de Rock Clássico', category: 'Shows',
                    description: 'Uma noite com os maiores clássicos do rock.',
                    local_nome: 'Arena Principal', local_endereco: 'Av. das Nações, 1000',
                    date: '2025-11-30', time: '20:00',
                    quantity_total: 500, quantity_sold: 150,
                    price_inteira: 200, price_meia: 100,
                    idioma: 'N/A', classificacao: '16 anos',
                    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    imagem_capa: 'https://placehold.co/600x400/504375/FFF?text=Show+de+Rock',
                    status: 'Disponível' // RF1.2
                },
                {
                    id: 'evt2', title: 'Palestra: O Futuro da IA', category: 'Palestras',
                    description: 'Discussão sobre os avanços da Inteligência Artificial.',
                    local_nome: 'Centro de Convenções', local_endereco: 'Rua da Tecnologia, 50',
                    date: '2025-12-05', time: '19:00',
                    quantity_total: 100, quantity_sold: 100,
                    price_inteira: 50, price_meia: 25,
                    idioma: 'Português', classificacao: 'Livre',
                    trailer_url: '',
                    imagem_capa: 'https://placehold.co/600x400/39324d/FFF?text=Palestra+IA',
                    status: 'Esgotado' // RF3.2
                },
                {
                    id: 'evt3', title: 'Filme: Aventura Espacial', category: 'Filmes',
                    description: 'Uma jornada épica por novas galáxias.',
                    local_nome: 'Cinema Central', local_endereco: 'Shopping da Cidade, Sala 3',
                    date: '2025-11-15', time: '18:00',
                    quantity_total: 80, quantity_sold: 0,
                    price_inteira: 60, price_meia: 30,
                    idioma: 'Dublado/Legendado', classificacao: '12 anos',
                    trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    imagem_capa: 'https://placehold.co/600x400/1a1a1a/FFF?text=Filme+Espacial',
                    status: 'Em breve' // RF1.2, RF3.3
                }
            ]);
        }
    };
    
    // --- API de Autenticação (RF2) ---
    
    const login = (email, password) => {
        const users = _get('db_users');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Simula sessão (RNF5)
            const sessionData = { id: user.id, name: user.name, email: user.email, role: user.role, cep: user.cep || '' };
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
            return { success: true, user: sessionData };
        }
        return { success: false, message: 'E-mail ou senha inválidos.' };
    };
    
    const register = (name, email, password, cep = '') => {
        const users = _get('db_users');
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Este e-mail já está cadastrado.' };
        }
        
        const newUser = {
            id: _generateId(),
            name, email, password,
            role: 'customer', // Padrão
            cep: cep || ''
        };
        
        users.push(newUser);
        _set('db_users', users);
        
        // Loga automaticamente após o cadastro
        return login(email, password);
    };
    
    const logout = () => {
        localStorage.removeItem('currentUser');
    };
    
    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    };
    
    const isAdmin = () => {
        const user = getCurrentUser();
        return user && user.role === 'admin';
    };

    // --- API de Eventos (RF1, RF3, RF4) ---

    const getEvents = (filters = {}) => {
        let events = _get('db_events');
        
        // RF1.4 / RF4.1 - Filtros
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            events = events.filter(e => 
                e.title.toLowerCase().includes(searchTerm) ||
                e.description.toLowerCase().includes(searchTerm) ||
                e.local_nome.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.category && filters.category !== 'Todos') {
            events = events.filter(e => e.category === filters.category);
        }
        if (filters.location) {
            // Simulação de filtro de localização (RF1.3)
            // Em um app real, isso usaria Estado/Cidade. Aqui filtramos por endereço.
            events = events.filter(e => e.local_endereco.toLowerCase().includes(filters.location.toLowerCase()));
        }

        // RF4.2 - Ordenação
        if (filters.sortBy === 'date') {
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (filters.sortBy === 'price') {
            events.sort((a, b) => a.price_inteira - b.price_inteira);
        }
        
        return events;
    };

    const getEventById = (id) => {
        return _get('db_events').find(e => e.id === id);
    };

    // RF3.1 - Cadastro de Evento
    const createEvent = (eventData) => {
        if (!isAdmin()) return { success: false, message: 'Acesso negado.' };

        const events = _get('db_events');
        const newEvent = {
            ...eventData,
            id: _generateId(),
            quantity_sold: 0 // Valor inicial
        };
        events.push(newEvent);
        _set('db_events', events);
        return { success: true, event: newEvent };
    };

    // RF3.4 - Edição de Evento
    const updateEvent = (eventId, eventData) => {
        if (!isAdmin()) return { success: false, message: 'Acesso negado.' };

        let events = _get('db_events');
        const index = events.findIndex(e => e.id === eventId);
        
        if (index > -1) {
            // Mantém IDs e dados de venda, atualiza o resto
            const originalEvent = events[index];
            events[index] = {
                ...originalEvent, // Preserva id, quantity_sold
                ...eventData      // Sobrescreve com novos dados do form
            };
            _set('db_events', events);
            return { success: true, event: events[index] };
        }
        return { success: false, message: 'Evento não encontrado.' };
    };
    
    // RF3.4 - Remoção de Evento
    const deleteEvent = (eventId) => {
        if (!isAdmin()) return { success: false, message: 'Acesso negado.' };
        
        let events = _get('db_events');
        events = events.filter(e => e.id !== eventId);
        _set('db_events', events);
        return { success: true };
    };
    
    // --- API de Compra (RF5) ---
    
    // RF5.8 - Pagamento Simulado
    const purchaseTicket = (userId, eventId, tickets) => {
        const event = getEventById(eventId);
        if (!event) return { success: false, message: 'Evento não encontrado.' };
        
        const user = getCurrentUser();
        if (!user || user.id !== userId) return { success: false, message: 'Usuário não autenticado.'};
        
        const totalTicketsToBuy = (tickets.inteira || 0) + (tickets.meia || 0);
        const availableTickets = event.quantity_total - (event.quantity_sold || 0);
        
        // RF3.2 - Controle de disponibilidade
        if (totalTicketsToBuy > availableTickets) {
            return { success: false, message: 'Ingressos esgotados ou quantidade indisponível.' };
        }
        
        // Atualiza evento
        event.quantity_sold = (event.quantity_sold || 0) + totalTicketsToBuy;
        if (event.quantity_sold === event.quantity_total) {
            event.status = 'Esgotado';
        }
        updateEvent(eventId, event); // Usa a função de update (já com check de admin, mas aqui é o user)
                                     // Vamos simplificar e atualizar direto (remove o check de admin do updateEvent)
        
        let events = _get('db_events');
        const index = events.findIndex(e => e.id === eventId);
        if (index > -1) events[index] = event;
        _set('db_events', events);

        // Cria registro de Compra (RNF7)
        const purchases = _get('db_purchases');
        const newPurchase = {
            id: _generateId(),
            userId: userId,
            eventId: eventId,
            eventTitle: event.title,
            tickets: tickets,
            total_price: (tickets.inteira * event.price_inteira) + (tickets.meia * event.price_meia),
            purchase_date: new Date().toISOString(),
            status: 'Confirmado'
        };
        purchases.push(newPurchase);
        _set('db_purchases', purchases);
        
        return { success: true, purchase: newPurchase };
    };

    // RF2.5 - Histórico de Compras
    const getPurchaseHistory = (userId) => {
        return _get('db_purchases').filter(p => p.userId === userId).reverse();
    };

    // RF2.5 - Cancelar Compra (Simulado)
    const cancelPurchase = (purchaseId) => {
        let purchases = _get('db_purchases');
        const index = purchases.findIndex(p => p.id === purchaseId);
        
        if (index > -1) {
            const purchase = purchases[index];
            
            // 1. Marca a compra como cancelada
            purchase.status = 'Cancelado';
            purchases[index] = purchase;
            _set('db_purchases', purchases);

            // 2. Devolve os ingressos ao estoque (RF3.2)
            const event = getEventById(purchase.eventId);
            if (event) {
                const totalTicketsCancelled = (purchase.tickets.inteira || 0) + (purchase.tickets.meia || 0);
                event.quantity_sold -= totalTicketsCancelled;
                
                if (event.status === 'Esgotado') {
                    event.status = 'Disponível';
                }
                
                let events = _get('db_events');
                const eventIndex = events.findIndex(e => e.id === event.id);
                if (eventIndex > -1) events[eventIndex] = event;
                _set('db_events', events);
            }
            return { success: true };
        }
        return { success: false, message: 'Compra não encontrada.' };
    };
    
    // --- API de Notificações (RF6) ---
    
    // RF6.1 - "Notifique-me"
    const requestNotification = (userId, eventId) => {
        const history = _get('db_notifications');
        
        if (history.some(n => n.userId === userId && n.eventId === eventId)) {
            return { success: false, message: 'Você já solicitou notificação.' };
        }
        
        history.push({ id: _generateId(), userId, eventId, date: new Date().toISOString() });
        _set('db_notifications', history);
        
        // Simula o envio de e-mail (RF6.1)
        console.log(`[SIMULAÇÃO] E-mail de notificação agendado para ${userId} sobre o evento ${eventId}`);
        
        return { success: true, message: 'Você será notificado!' };
    };

    // --- API Admin (RF8) ---
    
    // RF8.1, RF8.2 - Relatório Simples
    const getAdminReport = () => {
        const events = getEvents();
        return events.map(e => ({
            id: e.id,
            title: e.title,
            category: e.category,
            sold: e.quantity_sold || 0,
            total: e.quantity_total,
            status: e.status
        }));
    };

    // --- Recomendações (Filtragem por Conteúdo) ---
    // Retorna até `limit` eventos na mesma categoria do último evento comprado
    // pelo usuário, excluindo eventos que o usuário já comprou.
    const getRecommendationsForUser = (userId, limit = 3) => {
        if (!userId) return [];

        const history = getPurchaseHistory(userId); // mais recentes primeiro
        if (!history || history.length === 0) return [];

        // Categoria do último evento comprado
        const lastPurchase = history[0];
        const lastEvent = getEventById(lastPurchase.eventId);
        if (!lastEvent || !lastEvent.category) return [];
        const targetCategory = lastEvent.category;

        // IDs comprados pelo usuário
        const purchasedIds = new Set(history.map(h => h.eventId));

        // Filtra eventos por categoria e não comprados ainda
        const candidates = getEvents().filter(e =>
            e.category === targetCategory && !purchasedIds.has(e.id) && e.status !== 'Esgotado'
        );

        return candidates.slice(0, limit);
    };

    // --- Inicialização ---
    _initDB();
    
    // Public API
    return {
        login,
        register,
        logout,
        getCurrentUser,
        isAdmin,
        getEvents,
        getEventById,
        createEvent,
        updateEvent,
        deleteEvent,
        purchaseTicket,
        getPurchaseHistory,
        cancelPurchase,
        requestNotification,
        getAdminReport,
        // Recomendações
        getRecommendationsForUser
    };
};

// Instancia a API para ser usada globalmente
const api = ApiService();
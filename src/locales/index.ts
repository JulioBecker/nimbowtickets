export type Language = 'pt' | 'en' | 'es';

type Dictionary = Record<string, string>;

export const locales: Record<Language, Dictionary> = {
  pt: {
    // Header
    'header.searchPlaceholder': 'Buscar eventos, shows, teatros...',
    'header.myTickets': 'Meus Ingressos',
    'header.login': 'ENTRAR',
    'header.clientPanel': 'Painel do Cliente',
    'header.producerArea': 'Área do Produtor',
    'header.logout': 'Sair',
    'header.regions': 'Todas as Regiões',
    
    // Landing Page
    'landing.featured.title': 'Eventos que vão bombar',
    'landing.featured.buy': 'Compre seu ingresso',
    'landing.stats.activeEvents': 'Eventos ativos',
    'landing.stats.ticketsSold': 'Ingressos vendidos',
    'landing.stats.averageRating': 'Avaliação média',
    'landing.stats.lowestFee': 'Menor comissão',
    'landing.agenda.title': 'Agenda da semana',
    'landing.agenda.seeAll': 'Ver todos',
    'landing.producer.chip': 'PARA PRODUTORES DE EVENTOS',
    'landing.producer.title': 'Venda seus ingressos com segurança',
    'landing.producer.subtitle': 'Cadastre seu evento, defina preços e comece a vender em minutos. Painel completo, suporte dedicado e pagamento garantido.',
    'landing.producer.feeTitle': 'Taxa de comissão',
    'landing.producer.feeSubtitle': 'Mais baixa do mercado',
    'landing.producer.button': 'Cadastrar Evento',
    'landing.producer.info': 'Cadastro gratuito · Pagamento em 24h',
    'landing.brands.title': 'Grandes eventos confiam na Nimbow',
    
    // Cookies
    'cookies.message': 'Nós utilizamos cookies para melhorar a sua experiência, analisar o tráfego do site e personalizar conteúdo. Ao continuar navegando, você concorda com o uso de cookies.',
    'cookies.accept': 'Aceitar e Fechar'
  },
  en: {
    // Header
    'header.searchPlaceholder': 'Search events, shows, theaters...',
    'header.myTickets': 'My Tickets',
    'header.login': 'LOGIN',
    'header.clientPanel': 'Client Dashboard',
    'header.producerArea': 'Producer Area',
    'header.logout': 'Logout',
    'header.regions': 'All Regions',
    
    // Landing Page
    'landing.featured.title': 'Trending Events',
    'landing.featured.buy': 'Get your ticket',
    'landing.stats.activeEvents': 'Active Events',
    'landing.stats.ticketsSold': 'Tickets Sold',
    'landing.stats.averageRating': 'Average Rating',
    'landing.stats.lowestFee': 'Lowest Fee',
    'landing.agenda.title': 'Weekly Agenda',
    'landing.agenda.seeAll': 'See All',
    'landing.producer.chip': 'FOR EVENT PRODUCERS',
    'landing.producer.title': 'Sell your tickets safely',
    'landing.producer.subtitle': 'Register your event, set prices, and start selling in minutes. Complete dashboard, dedicated support, and guaranteed payouts.',
    'landing.producer.feeTitle': 'Commission Rate',
    'landing.producer.feeSubtitle': 'Lowest in the market',
    'landing.producer.button': 'Register Event',
    'landing.producer.info': 'Free registration · 24h payouts',
    'landing.brands.title': 'Major events trust Nimbow',
    
    // Cookies
    'cookies.message': 'We use cookies to improve your experience, analyze site traffic, and personalize content. By continuing to browse, you agree to our use of cookies.',
    'cookies.accept': 'Accept & Close'
  },
  es: {
    // Header
    'header.searchPlaceholder': 'Buscar eventos, shows, teatros...',
    'header.myTickets': 'Mis Entradas',
    'header.login': 'ENTRAR',
    'header.clientPanel': 'Panel de Cliente',
    'header.producerArea': 'Área de Productor',
    'header.logout': 'Salir',
    'header.regions': 'Todas las Regiones',
    
    // Landing Page
    'landing.featured.title': 'Eventos en tendencia',
    'landing.featured.buy': 'Compra tu entrada',
    'landing.stats.activeEvents': 'Eventos activos',
    'landing.stats.ticketsSold': 'Entradas vendidas',
    'landing.stats.averageRating': 'Calificación promedio',
    'landing.stats.lowestFee': 'La comisión más baja',
    'landing.agenda.title': 'Agenda semanal',
    'landing.agenda.seeAll': 'Ver todos',
    'landing.producer.chip': 'PARA PRODUCTORES DE EVENTOS',
    'landing.producer.title': 'Vende tus entradas con seguridad',
    'landing.producer.subtitle': 'Registra tu evento, define precios y comienza a vender en minutos. Panel completo, soporte dedicado y pago garantizado.',
    'landing.producer.feeTitle': 'Tasa de comisión',
    'landing.producer.feeSubtitle': 'La más baja del mercado',
    'landing.producer.button': 'Registrar Evento',
    'landing.producer.info': 'Registro gratis · Pagos en 24h',
    'landing.brands.title': 'Grandes eventos confían en Nimbow',
    
    // Cookies
    'cookies.message': 'Utilizamos cookies para mejorar su experiencia, analizar el tráfico del sitio web y personalizar el contenido. Al continuar navegando, usted acepta el uso de cookies.',
    'cookies.accept': 'Aceptar y Cerrar'
  }
};

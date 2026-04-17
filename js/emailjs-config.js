// EmailJS Configuration
const emailjsConfig = {
    sonia: {
        serviceID: 'service_jwkxgrm',
        templateID: 'template_gaqvy95',
        publicKey: 'sUT_mezeXvnOxkvVI',
        toEmail: 'de58390@miescuela.pr'
    },
    maricarmen: {
        serviceID: 'service_tl36rip',
        templateID: 'template_pck97ew',
        publicKey: 'SCqXLNS1v8MCpsAit',
        toEmail: 'de85494@miescuela.pr'
    },
    karem: {
        serviceID: 'service_3xbuvck',
        templateID: 'template_prewukp',
        publicKey: 'JEnP4Ol_npOF0u1zF',
        toEmail: 'de156358@miescuela.pr'
    },
    janelys: {
        serviceID: 'service_kkgfbkh',
        templateID: 'template_8xrudkm',
        publicKey: 'X-1xy2n2m5N47ACld',
        toEmail: 'de167251@miescuela.pr'
    },
    karem_ts: {
        serviceID: 'service_3xbuvck',
        templateID: 'template_prewukp',
        publicKey: 'JEnP4Ol_npOF0u1zF',
        toEmail: 'de156358@miescuela.pr'
    },
    janelys_ts: {
        serviceID: 'service_kkgfbkh',
        templateID: 'template_8xrudkm',
        publicKey: 'X-1xy2n2m5N47ACld',
        toEmail: 'de167251@miescuela.pr'
    },
    psicologo: {
        serviceID: 'service_tsl1ikj',
        templateID: 'template_r9ru3zj',
        publicKey: '0fOfcEG1uHW5tB2Nb',
        toEmail: 'de161266@miescuela.pr'
    }
};

// Initialize EmailJS - Se inicializará con la public key específica en cada envío
(function() {
    // EmailJS se inicializa automáticamente cuando se usa emailjs.send() con la publicKey
    console.log('EmailJS configurado para todos los servicios');
})();

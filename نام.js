module.exports = {
    command: 'روح_نام',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;

        await sock.sendMessage(chatId, { text: `اه انا بقول برضو كده روحي نامي / روح نام 👺!` });
    }
};
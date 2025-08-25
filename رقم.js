module.exports = {
    command: 'رقم',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;

        const randomNumber = Math.floor(Math.random() * 100) + 1;

        await sock.sendMessage(chatId, { text: `🎲 رقمك العشوائي هو: *${randomNumber}*` });
    }
};
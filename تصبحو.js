module.exports = {
    command: 'سلام',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;

        await sock.sendMessage(chatId, { text: `تروح وتيجي بي السلامه ❤️‍🩹!` });
    }
};
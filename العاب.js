const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

// Helper function to decode JIDs
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

// Object to store active games in groups (you'd need a more persistent storage for production)
const activeGames = {};

module.exports = {
    command: 'العاب',
    description: 'تشغيل ألعاب متنوعة داخل المجموعة.',
    usage: '.العاب [اسم_اللعبة]',
    category: 'games',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || groupJid);
            const senderLid = sender.split('@')[0];
            const args = msg.message.extendedTextMessage?.text.split(' ').slice(1) || msg.message.conversation.split(' ').slice(1);
            const gameType = args[0] ? args[0].toLowerCase() : null;

            if (!groupJid.endsWith('@g.us'))
                return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

            // You might want to restrict game access based on eliteNumbers or other permissions
            if (!eliteNumbers.includes(senderLid))
                return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

            // --- Game Logic ---
            // This is where you'll define and manage different games.
            // For simplicity, I'm using a basic switch-case, but for many games,
            // you'd want to import separate game modules.

            switch (gameType) {
                case 'تخمين_الارقام':
                    // Check if a game is already active in this group
                    if (activeGames[groupJid]) {
                        return await sock.sendMessage(groupJid, { text: '❗ هناك لعبة قيد التشغيل بالفعل في هذه المجموعة. يرجى انتظار انتهائها أو استخدام أمر الإيقاف.' }, { quoted: msg });
                    }

                    // Start "Guess the Number" game
                    const randomNumber = Math.floor(Math.random() * 100) + 1; // Number between 1 and 100
                    activeGames[groupJid] = {
                        type: 'تخمين_الارقام',
                        numberToGuess: randomNumber,
                        attempts: 0,
                        players: new Set(),
                        startTime: Date.now()
                    };

                    await sock.sendMessage(groupJid, {
                        text: `🎉 بدأت لعبة "تخمين الأرقام"!` +
                              `\nتخمّن رقمًا بين 1 و 100.` +
                              `\nأرسل تخمينك بـ \`.تخمين [الرقم]\`.` +
                              `\nلديك 60 ثانية للبدء.`
                    }, { quoted: msg });

                    // Set a timeout to end the game if no one plays
                    setTimeout(async () => {
                        if (activeGames[groupJid] && activeGames[groupJid].type === 'تخمين_الارقام' && activeGames[groupJid].players.size === 0) {
                            await sock.sendMessage(groupJid, { text: '🙁 لم يقم أحد بالتخمين. تم إنهاء لعبة "تخمين الأرقام".' }, { quoted: msg });
                            delete activeGames[groupJid];
                        }
                    }, 60 * 1000); // 60 seconds

                    break;

                case 'اسم_اللعبة_الثانية':
                    // Example for another game
                    await sock.sendMessage(groupJid, { text: 'جاري بدء اللعبة الثانية...' }, { quoted: msg });
                    // Add game logic for the second game here
                    break;

                case 'قائمة':
                case 'مساعدة':
                case 'help':
                    const availableGames = Object.keys(module.exports.games || {}).join(', '); // Not yet implemented, will be added below
                    await sock.sendMessage(groupJid, {
                        text: `ألعاب متاحة:\n` +
                              `1. تخمين_الارقام: خمن الرقم الصحيح.\n` +
                              // Add more games here as you implement them
                              `\nلاستخدام لعبة، اكتب: .العاب [اسم_اللعبة]`
                    }, { quoted: msg });
                    break;

                default:
                    if (gameType) {
                        return await sock.sendMessage(groupJid, { text: `❗ لم يتم العثور على لعبة باسم "${gameType}".` }, { quoted: msg });
                    } else {
                        // If no game type is specified, show general help
                        await sock.sendMessage(groupJid, {
                            text: `أهلاً بك في قسم الألعاب! 🎮` +
                                  `\nللبدء، اختر لعبة من القائمة أدناه أو اكتب \`.العاب قائمة\` لرؤية كل الألعاب المتاحة.` +
                                  `\n\nلاستخدام لعبة، اكتب: \`.العاب [اسم_اللعبة]\`` +
                                  `\n\n**الألعاب المقترحة:**` +
                                  `\n- \`تخمين_الارقام\`: لعبة بسيطة لتخمين رقم.`
                                  // Add more suggestions here
                        }, { quoted: msg });
                    }
                    break;
            }

        } catch (error) {
            console.error('❌ خطأ في أمر الألعاب:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${error.message || error.toString()}`
            }, { quoted: msg });
        }
    },

    // --- In-Game Interaction (for "Guess the Number" example) ---
    // This is a crucial part for interactive games. You'll need to listen for messages
    // and route them to the correct game handler.
    // For this example, I'm adding a new property to the module.exports
    // to handle game-specific messages. In a more complex bot, this would be
    // handled by a separate message listener that checks `activeGames`.

    // You'll need to modify your main message processing loop to call this
    // function if a game is active in the group and the message matches a game command.
    async handleGameMessage(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const sender = decode(msg.key.participant || groupJid);
        const senderLid = sender.split('@')[0];
        const text = msg.message.extendedTextMessage?.text || msg.message.conversation;

        const activeGame = activeGames[groupJid];

        if (activeGame && activeGame.type === 'تخمين_الارقام') {
            const match = text.match(/^\.تخمين (\d+)$/);
            if (match) {
                const guess = parseInt(match[1]);

                if (isNaN(guess) || guess < 1 || guess > 100) {
                    return await sock.sendMessage(groupJid, { text: '❗ يرجى تخمين رقم بين 1 و 100.' }, { quoted: msg });
                }

                activeGame.attempts++;
                activeGame.players.add(senderLid); // Track active players

                if (guess === activeGame.numberToGuess) {
                    await sock.sendMessage(groupJid, {
                        text: `🎉 تهانينا يا @${senderLid}! لقد خمنت الرقم الصحيح (${activeGame.numberToGuess}) في ${activeGame.attempts} محاولات!` +
                              `\nانتهت اللعبة.`,
                        mentions: [sender]
                    }, { quoted: msg });
                    delete activeGames[groupJid]; // End the game
                } else if (guess < activeGame.numberToGuess) {
                    await sock.sendMessage(groupJid, { text: `أقل! حاول رقمًا أكبر. (محاولة رقم ${activeGame.attempts})` }, { quoted: msg });
                } else {
                    await sock.sendMessage(groupJid, { text: `أكثر! حاول رقمًا أصغر. (محاولة رقم ${activeGame.attempts})` }, { quoted: msg });
                }
            } else if (text === '.إيقاف_اللعبة' || text === '.انهاء_اللعبة') {
                // Allow elite numbers or the sender who started the game to stop it
                // For simplicity, allowing any elite number to stop
                if (eliteNumbers.includes(senderLid)) {
                    await sock.sendMessage(groupJid, { text: 'تم إنهاء اللعبة الحالية.' }, { quoted: msg });
                    delete activeGames[groupJid];
                } else {
                    await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية إنهاء اللعبة.' }, { quoted: msg });
                }
            }
        }
    }
};

// IMPORTANT: You need to integrate the `handleGameMessage` function into your bot's
// main message processing logic. For example, in your `index.js` or wherever
// you handle incoming messages, you'd add something like this:

/*
// In your message handling loop (e.g., in `events.js` or `index.js`)
const { gamesCommand } = require('./commands/games'); // Assuming games.js is in 'commands' folder

sock.ev.on('messages.upsert', async chatUpdate => {
    // ... other message processing ...

    const msg = chatUpdate.messages[0];
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

    const groupJid = msg.key.remoteJid;
    const text = msg.message.extendedTextMessage?.text || msg.message.conversation;

    // Check if there's an active game and if the message should be handled by it
    if (activeGames[groupJid] && (text.startsWith('.تخمين') || text === '.إيقاف_اللعبة' || text === '.انهاء_اللعبة')) {
        await gamesCommand.handleGameMessage(sock, msg);
        return; // Consume the message if it was handled by the game
    }

    // ... continue with other command processing ...
});
*/
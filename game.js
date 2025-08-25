const { delay } = require('@whiskeysockets/baileys');

// تخزين جلسات اللعبة
const gameSessions = new Map();

const getDisplayNumber = (jid) => `@+${jid.split('@')[0]}`;

module.exports = {
    command: 'لعب',
    description: 'بدء لعبة حجر-ورقة-مقص بين شخصين',
    usage: '.لعب @منشن1 @منشن2',
    category: 'ترفيه',

    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (mentionedJids.length !== 2) {
            return await sock.sendMessage(groupJid, {
                text: '❗ يرجى عمل منشن لشخصين\nمثال: .لعب @الشخص1 @الشخص2'
            }, { quoted: msg });
        }

        // استبعاد البوت
        const botJid = sock.user.id;
        const players = mentionedJids.filter(jid => jid !== botJid);

        if (players.length < 2) {
            return await sock.sendMessage(groupJid, {
                text: '❗ يجب اختيار شخصين حقيقيين (لا يمكن اختيار البوت)'
            }, { quoted: msg });
        }

        // إنشاء جلسة
        const gameId = `${groupJid}-${Date.now()}`;
        gameSessions.set(gameId, {
            players,
            choices: {},
            status: 'waiting'
        });

        // إرسال رسالة بدء اللعبة مع أرقام طبيعية مع @+
        await sock.sendMessage(groupJid, {
            text: `🎮 بدأت لعبة حجر-ورقة-مقص بين:
${players.map(jid => `- ${getDisplayNumber(jid)}`).join('\n')}

📩 تم إرسال خيارات اللعب في الخاص.`,
            mentions: players
        }, { quoted: msg });

        let failedPlayers = [];
        for (const playerJid of players) {
            try {
                await sock.sendMessage(playerJid, {
                    text: 'اختر حركتك للعبة:',
                    buttons: [
                        { buttonId: 'rock', buttonText: { displayText: 'حجر 🪨' }, type: 1 },
                        { buttonId: 'paper', buttonText: { displayText: 'ورقة 📄' }, type: 1 },
                        { buttonId: 'scissors', buttonText: { displayText: 'مقص ✂️' }, type: 1 }
                    ]
                });
                gameSessions.get(gameId).choices[playerJid] = null;
            } catch (err) {
                console.error(`❌ فشل إرسال للاعب ${playerJid}`, err);
                failedPlayers.push(playerJid);
            }
        }

        if (failedPlayers.length > 0) {
            await sock.sendMessage(groupJid, {
                text: `❌ لا يمكن إرسال للخاص مع:\n${failedPlayers.map(jid => `- ${getDisplayNumber(jid)}`).join('\n')}\nيرجى إرسال "مرحبا" للبوت في الخاص أولا.`,
                mentions: failedPlayers
            });
            gameSessions.delete(gameId);
            return;
        }

        // بدء المؤقت 30 ثانية
        setTimeout(async () => {
            const session = gameSessions.get(gameId);
            if (!session || session.status !== 'waiting') return;

            const missingPlayers = players.filter(p => session.choices[p] === null);
            if (missingPlayers.length > 0) {
                await sock.sendMessage(groupJid, {
                    text: `⏱ انتهى الوقت! اللاعبون الذين لم يختاروا:\n${missingPlayers.map(jid => `- ${getDisplayNumber(jid)}`).join('\n')}`,
                    mentions: missingPlayers
                });
                gameSessions.delete(gameId);
            }
        }, 30000);
    }
};

// معالج أزرار اللاعبين
module.exports.handleGameChoice = async (sock, msg) => {
    try {
        const playerJid = msg.key.remoteJid;
        if (!playerJid.endsWith('@s.whatsapp.net')) return;

        const choice = msg.message?.buttonsResponseMessage?.selectedButtonId;
        if (!choice) return;

        for (const [gameId, session] of gameSessions.entries()) {
            if (session.players.includes(playerJid) && session.status === 'waiting') {
                session.choices[playerJid] = choice;

                await sock.sendMessage(playerJid, {
                    text: `✅ تم تسجيل اختيارك: ${getChoiceName(choice)}`
                });

                const allChosen = session.players.every(p => session.choices[p] !== null);
                if (allChosen) {
                    session.status = 'completed';
                    await announceWinner(sock, gameId);
                    gameSessions.delete(gameId);
                }
                break;
            }
        }
    } catch (err) {
        console.error('خطأ في معالجة الاختيار:', err);
    }
};

async function announceWinner(sock, gameId) {
    const session = gameSessions.get(gameId);
    if (!session) return;

    const [p1, p2] = session.players;
    const c1 = session.choices[p1];
    const c2 = session.choices[p2];

    let result = calculateResult(c1, c2);

    let txt = `🎮 نتائج اللعبة:\n\n`;
    txt += `${getDisplayNumber(p1)}: ${getChoiceName(c1)}\n`;
    txt += `${getDisplayNumber(p2)}: ${getChoiceName(c2)}\n\n`;

    if (result === 'draw') txt += '🏆 نتيجة: تعادل!';
    else if (result === 'player1') txt += `🏆 الفائز: ${getDisplayNumber(p1)}!`;
    else txt += `🏆 الفائز: ${getDisplayNumber(p2)}!`;

    await sock.sendMessage(gameId.split('-')[0], {
        text: txt,
        mentions: [p1, p2]
    });
}

function calculateResult(c1, c2) {
    if (c1 === c2) return 'draw';
    const rules = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    return rules[c1] === c2 ? 'player1' : 'player2';
}

function getChoiceName(choice) {
    return {
        rock: 'حجر 🪨',
        paper: 'ورقة 📄',
        scissors: 'مقص ✂️'
    }[choice] || choice;
}
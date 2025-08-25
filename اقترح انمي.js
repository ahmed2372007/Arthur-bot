module.exports = {
    command: 'اقترح',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;

        const animeSuggestions = [
            "🔹 Attack on Titan (شونين/أكشن)",
            "🔹 Death Note (نفسي/غموض)",
            "🔹 Demon Slayer (أكشن/فانتازيا)",
            "🔹 One Piece (مغامرات/كوميديا)",
            "🔹 Jujutsu Kaisen (شياطين/مدرسة)",
            "🔹 Hunter x Hunter (مغامرة/أكشن)",
            "🔹 Tokyo Ghoul (رعب/نفسي)",
            "🔹 Naruto (ننجا/شونين)",
            "🔹 Your Name (رومانسي/دراما)",
            "🔹 A Silent Voice (دراما/مدرسي)",
            "🔹 Steins;Gate (خيال علمي/غموض)",
            "🔹 Erased (غموض/سفر عبر الزمن)",
            "🔹 Code Geass (أكشن/ذكاء)",
            "🔹 Parasyte (رعب/أكشن)",
            "🔹 The Promised Neverland (تشويق/هروب)",
            "🔹 Chainsaw Man (أكشن/رعب)",
            "🔹 Black Clover (سحر/شونين)",
            "🔹 Vinland Saga (تاريخي/حربي)",
            "🔹 Blue Lock (رياضي/كرة قدم)",
            "🔹 Haikyuu!! (رياضي/كرة طائرة)",
            "🔹 Kuroko no Basket (رياضي/كرة سلة)",
            "🔹 Re:Zero (إيسيكاي/نفسي)",
            "🔹 No Game No Life (ألعاب/إيسيكاي)",
            "🔹 Mob Psycho 100 (قوى خارقة)",
            "🔹 One Punch Man (أكشن/كوميديا)",
            "🔹 Spy x Family (كوميدي/تجسس)",
            "🔹 Horimiya (رومانسي/مدرسي)",
            "🔹 Toradora! (رومانسي/كوميدي)",
            "🔹 Clannad (دراما/رومانسي)",
            "🔹 Anohana (دراما/مؤثر)",
            "🔹 Made in Abyss (مغامرة/غموض)",
            "🔹 Dr. Stone (علم/بقاء)",
            "🔹 Ousama Ranking (خيال/طفولي جميل)",
            "🔹 Boku no Hero Academia (أبطال/مدرسة)",
            "🔹 Mashle (كوميدي/سحر)",
            "🔹 Classroom of the Elite (مدرسي/نفسي)",
            "🔹 Hellsing Ultimate (رعب/مصاصين دماء)",
            "🔹 Noragami (فانتازيا/كوميدي)",
            "🔹 Fairy Tail (مغامرة/سحر)",
            "🔹 Bleach (أرواح/أكشن)",
            "🔹 Psycho-Pass (نفسي/شرطة)",
            "🔹 The Rising of the Shield Hero (إيسيكاي/فانتازيا)",
            "🔹 Solo Leveling (أكشن/اصدار جديد)",
            "🔹 Frieren: Beyond Journey's End (دراما/فانتازيا)",
            "🔹 Zom 100 (كوميدي/زومبي)",
            "🔹 Hyouka (مدرسي/غموض)",
            "🔹 Welcome to the NHK (نفسي/مظلم)",
            "🔹 Great Pretender (احتيال/كوميديا)",
            "🔹 Devilman Crybaby (نفسي/رعب)",
            "🔹 Akudama Drive (أكشن/سايبربانك)",
            "🔹 Banana Fish (جريمة/دراما)",
            "🔹 Erased (سفر عبر الزمن/غموض)",
            "🔹 Monster (جريمة/غموض/نفسي)"
            // يمكنك تضيف أكثر براحتك 🔥
        ];

        const randomAnime = animeSuggestions[Math.floor(Math.random() * animeSuggestions.length)];

        await sock.sendMessage(chatId, {
            text: `🎬 أنصحك تشوف:\n\n${randomAnime}`
        });
    }
};
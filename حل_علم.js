module.exports = {
    command: 'حل_علم',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        const countries = [
            { name: "مصر", flag: "🇪🇬" },
            { name: "السعودية", flag: "🇸🇦" },
            { name: "فلسطين", flag: "🇵🇸" },
            { name: "الجزائر", flag: "🇩🇿" },
            { name: "المغرب", flag: "🇲🇦" },
            { name: "تونس", flag: "🇹🇳" },
            { name: "لبنان", flag: "🇱🇧" },
            { name: "الأردن", flag: "🇯🇴" },
            { name: "الإمارات", flag: "🇦🇪" },
            { name: "البحرين", flag: "🇧🇭" },
            { name: "الكويت", flag: "🇰🇼" },
            { name: "قطر", flag: "🇶🇦" },
            { name: "عُمان", flag: "🇴🇲" },
            { name: "العراق", flag: "🇮🇶" },
            { name: "سوريا", flag: "🇸🇾" },
            { name: "اليمن", flag: "🇾🇪" },
            { name: "الولايات المتحدة", flag: "🇺🇸" },
            { name: "المملكة المتحدة", flag: "🇬🇧" },
            { name: "فرنسا", flag: "🇫🇷" },
            { name: "ألمانيا", flag: "🇩🇪" },
            { name: "إيطاليا", flag: "🇮🇹" },
            { name: "إسبانيا", flag: "🇪🇸" },
            { name: "البرتغال", flag: "🇵🇹" },
            { name: "تركيا", flag: "🇹🇷" },
            { name: "اليونان", flag: "🇬🇷" },
            { name: "أوكرانيا", flag: "🇺🇦" },
            { name: "روسيا", flag: "🇷🇺" },
            { name: "الصين", flag: "🇨🇳" },
            { name: "الهند", flag: "🇮🇳" },
            { name: "كوريا الجنوبية", flag: "🇰🇷" },
            { name: "اليابان", flag: "🇯🇵" },
            { name: "إندونيسيا", flag: "🇮🇩" },
            { name: "الفلبين", flag: "🇵🇭" },
            { name: "ماليزيا", flag: "🇲🇾" },
            { name: "أستراليا", flag: "🇦🇺" },
            { name: "كندا", flag: "🇨🇦" },
            { name: "البرازيل", flag: "🇧🇷" },
            { name: "الأرجنتين", flag: "🇦🇷" },
            { name: "المكسيك", flag: "🇲🇽" },
            { name: "جنوب أفريقيا", flag: "🇿🇦" },
            { name: "نيجيريا", flag: "🇳🇬" },
            { name: "كينيا", flag: "🇰🇪" },
            { name: "السودان", flag: "🇸🇩" },
            { name: "إثيوبيا", flag: "🇪🇹" },
            { name: "الصومال", flag: "🇸🇴" },
            { name: "تشاد", flag: "🇹🇩" },
            { name: "ليبيا", flag: "🇱🇾" },
            { name: "موريتانيا", flag: "🇲🇷" },
            { name: "جيبوتي", flag: "🇩🇯" }
        ];

        const regex = /🌍 خمن اسم الدولة من العلم التالي:\s*(\p{Emoji}+)/u;
        const match = text.match(regex);

        if (!match) {
            await sock.sendMessage(chatId, {
                text: "❌ لم أتمكن من استخراج العلم من الرسالة.\nتأكد أنك كتبت الأمر بهذا الشكل:\n`.حل_علم 🌍 خمن اسم الدولة من العلم التالي: 🇫🇷`"
            });
            return;
        }

        const flag = match[1];

        const country = countries.find(c => c.flag === flag);

        if (!country) {
            await sock.sendMessage(chatId, {
                text: "❌ لم أجد هذا العلم في قاعدة البيانات.\nتأكد أنك نسخت الرسالة كاملة زي ما وصلت من أمر `.علم` بالضبط."
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: `✅ اسم الدولة هو: *${country.name}*`
        });
    }
};
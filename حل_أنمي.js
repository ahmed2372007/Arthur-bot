const animeQuestions = [
    { question: "❓ من هو قائد قراصنة قبعة القش؟", answer: "لوفي" },
    { question: "❓ ما اسم القطة في أنمي Sailor Moon؟", answer: "لونا" },
    { question: "❓ من هو والد غوكو؟", answer: "باردوك" },
    { question: "❓ ما اسم الشينيغامي في ديث نوت؟", answer: "ريوك" },
    { question: "❓ كم عدد كرات التنين في دراغون بول؟", answer: "7" },
    { question: "❓ من هو أول مستخدم لمانجيكيو شارينغان؟", answer: "إيتاتشي" },
    { question: "❓ من هو أفضل صديق لـ ناروتو؟", answer: "ساسكي" },
    { question: "❓ ما اسم أخ ليفاي بالتبني في هجوم العمالقة؟", answer: "كين" },
    { question: "❓ من هو مؤسس طوكيو مانجي؟", answer: "ميكي" },
    { question: "❓ من هو قاتل نيي في ون بيس؟", answer: "أكاينو" },
    { question: "❓ ما اسم منظمة القتلة في القناص؟", answer: "العناكب" },
    { question: "❓ من هو معلم غون في القناص؟", answer: "كايتو" },
    { question: "❓ من هو ملك النمل في هنتر x هنتر؟", answer: "ميرويم" },
    { question: "❓ من هو شقيق إدوارد إلريك؟", answer: "ألفونسو" },
    { question: "❓ من هو أمير السايانز؟", answer: "فيجيتا" },
    { question: "❓ من هو تلميذ كاكاشي الأقوى؟", answer: "ناروتو" },
    { question: "❓ ما اسم حبيب ناروتو؟", answer: "هيناتا" },
    { question: "❓ ما اسم القط في فيري تيل؟", answer: "هابي" },
    { question: "❓ ما اسم سيف إيتشيغو؟", answer: "زنغتسو" },
    { question: "❓ ما اسم من يستخدم عين الرينغان؟", answer: "ناغاتو" },
    { question: "❓ من هو الكابتن في أنمي كوروكو؟", answer: "تيتسويا" },
    { question: "❓ ما اسم أخ إيتاتشي؟", answer: "ساسكي" },
    { question: "❓ من هو زعيم منظمة الأكاتسوكي؟", answer: "باين" },
    { question: "❓ من هو أقوى شخصية في أنمي ون بنش مان؟", answer: "سايتاما" },
    { question: "❓ ما اسم أنمي فيه دفتر يقتل الأشخاص؟", answer: "ديث نوت" },
    { question: "❓ من هو قاتل والدي إيرين؟", answer: "زيك" },
    { question: "❓ من هو عم لوفي؟", answer: "غارب" },
    { question: "❓ ما اسم البطل في أنمي طوكيو غول؟", answer: "كانيكي" },
    { question: "❓ ما اسم الفتاة التي تساعد إيرين؟", answer: "ميكاسا" },
    { question: "❓ من هو ملك القراصنة؟", answer: "غول دي روجر" },
    { question: "❓ ما اسم الأنمي الذي فيه سايتاما؟", answer: "ون بنش مان" },
    { question: "❓ من هو صديق غون المفضل؟", answer: "كيلوا" },
    { question: "❓ ما اسم الأنمي الذي فيه تانجيرو؟", answer: "قاتل الشياطين" },
    { question: "❓ من هي أخت تانجيرو؟", answer: "نيزوكو" },
    { question: "❓ من هو أقوى هاشيرا؟", answer: "يوتشييرو" },
    { question: "❓ ما اسم الشيطان الذي يملك سيف في قاتل الشياطين؟", answer: "موزان" },
    { question: "❓ ما اسم أول عملاق ظهر في هجوم العمالقة؟", answer: "العملاق المدرع" },
    { question: "❓ ما اسم أنمي فيه نوتا بوك للقتل؟", answer: "ديث نوت" },
    { question: "❓ من هو قائد فريق فيري تيل؟", answer: "ناتسو" },
    { question: "❓ ما اسم شقيق زورو بالتدريب؟", answer: "كوزابورو" },
    { question: "❓ ما اسم المنظمة التي يقودها دون كيهوتي؟", answer: "الدونكيهوتي" },
    { question: "❓ ما اسم الفتاة التي تستخدم الجليد في فيري تيل؟", answer: "غراي" },
    { question: "❓ من هو صاحب القبضة النارية في ون بيس؟", answer: "آيس" },
    { question: "❓ ما اسم عملاق المطرقة؟", answer: "لارا تايبير" }
];

module.exports = {
    command: 'حل_انمي',
    async execute(sock, m) {
        const chatId = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        const regex = /🎌 سؤال أنمي:\n(❓.+?)\n/u;
        const match = text.match(regex);

        if (!match) {
            await sock.sendMessage(chatId, {
                text: "❌ لم أستطع استخراج السؤال.\nتأكد إنك نسخت الرسالة كاملة زي ما وصلتك من أمر `.انمي`."
            });
            return;
        }

        const question = match[1].trim();

        const found = animeQuestions.find(q => q.question.trim() === question);

        if (!found) {
            await sock.sendMessage(chatId, {
                text: "❌ لم أجد هذا السؤال في قاعدة البيانات.\nتأكد إنك نسخت السؤال بالضبط."
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: `✅ الإجابة الصحيحة هي: *${found.answer}*`
        });
    }
};
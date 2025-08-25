const triviaGames = {};

const questions = [
  { q: 'ما هي عاصمة مصر؟', a: 'القاهرة' },
  { q: 'ما هو أكبر كوكب في المجموعة الشمسية؟', a: 'المشتري' },
  { q: 'كم عدد أيام الأسبوع؟', a: '7' },
  { q: 'من هو مخترع المصباح الكهربائي؟', a: 'توماس إديسون' },
  { q: 'ما هي لغة البرمجة المستخدمة في تطوير هذا البوت؟', a: 'جافاسكريبت' },
  { q: 'ما هو الحيوان الذي يرمز له بالذكاء؟', a: 'دلفين' },
  { q: 'ما هي العملة الرسمية في اليابان؟', a: 'الين' },
  { q: 'ما اسم أطول نهر في العالم؟', a: 'النيل' },
  { q: 'في أي قارة تقع مصر؟', a: 'أفريقيا' },
  { q: 'ما هو اسم أكبر محيط في العالم؟', a: 'المحيط الهادئ' },
  { q: 'ما هي عاصمة فرنسا؟', a: 'باريس' },
  { q: 'ما هو العنصر الكيميائي الذي يرمز له بالرمز O؟', a: 'الأكسجين' },
  { q: 'كم عدد القارات في العالم؟', a: '7' },
  { q: 'ما هو أسرع حيوان بري؟', a: 'الفهد' },
  { q: 'ما هي اللغة الرسمية في البرازيل؟', a: 'البرتغالية' },
  { q: 'من هو مؤلف رواية "الأمير الصغير"؟', a: 'أنطوان دو سانت إكزوبيري' },
  { q: 'ما هو عدد ألوان قوس قزح؟', a: '7' },
  { q: 'ما هو أكبر محيط في العالم؟', a: 'المحيط الهادئ' },
  { q: 'ما هي عاصمة اليابان؟', a: 'طوكيو' },
  { q: 'ما هو أطول جبل في العالم؟', a: 'إيفرست' },
  { q: 'من هو أول رئيس للولايات المتحدة؟', a: 'جورج واشنطن' },
  { q: 'ما هو اسم الكوكب الأحمر؟', a: 'المريخ' },
  { q: 'ما هو أكبر حيوان على وجه الأرض؟', a: 'الحوت الأزرق' },
  { q: 'ما هو اسم أطول نهر في أفريقيا؟', a: 'النيل' },
  { q: 'كم عدد اللاعبين في فريق كرة القدم؟', a: '11' },
  { q: 'ما هو اسم العملة في الولايات المتحدة؟', a: 'الدولار' },
  { q: 'ما هو أسرع طائر في العالم؟', a: 'الصقر' },
  { q: 'من هو مكتشف أمريكا؟', a: 'كريستوفر كولومبوس' },
  { q: 'ما هو أكبر قارة من حيث المساحة؟', a: 'آسيا' },
  { q: 'ما هي أصغر دولة في العالم؟', a: 'الفاتيكان' },
  { q: 'ما هو عدد الكواكب في النظام الشمسي؟', a: '8' },
  { q: 'ما هو اسم البحيرة الأكبر في العالم؟', a: 'بحيرة سوبيريور' },
  { q: 'ما هي عاصمة السعودية؟', a: 'الرياض' },
  { q: 'ما هو اسم أطول نهر في آسيا؟', a: 'اليانغتسي' },
  { q: 'ما هو أكبر صحراء في العالم؟', a: 'الصحراء الكبرى' },
  { q: 'من هو مؤسس شركة مايكروسوفت؟', a: 'بيل غيتس' },
  { q: 'ما هي لغة البرمجة المستخدمة لتطوير تطبيقات أندرويد؟', a: 'جافا' },
  { q: 'ما هو عدد أسنان الإنسان البالغ؟', a: '32' },
  { q: 'ما هو اسم أطول نهر في أمريكا الجنوبية؟', a: 'الأمازون' },
  { q: 'ما هو أكبر كوكب قزم في النظام الشمسي؟', a: 'بلوتو' },
  { q: 'ما هو اسم العاصمة البريطانية؟', a: 'لندن' },
  { q: 'ما هو أسرع حيوان بحري؟', a: 'سمك الشراع' },
  { q: 'ما هو اسم أشهر لوحة رسمها ليوناردو دافنشي؟', a: 'الموناليزا' },
  { q: 'ما هو اسم الحيوان الوطني في أستراليا؟', a: 'الكنغر' },
  { q: 'كم عدد أسابيع السنة؟', a: '52' },
  { q: 'ما هو اسم البحر الذي يفصل بين السعودية ومصر؟', a: 'البحر الأحمر' },
  { q: 'ما هي وحدة قياس شدة الصوت؟', a: 'الديسيبل' },
  { q: 'من هو مؤلف مسرحية "روميو وجولييت"؟', a: 'وليام شكسبير' },
  { q: 'ما هو اسم القارة التي تقع فيها البرازيل؟', a: 'أمريكا الجنوبية' },
  { q: 'ما هي العملة الرسمية في مصر؟', a: 'الجنيه' },
];

module.exports = {
  command: 'سؤالل',
  description: 'لعبة سؤال وجواب تفاعلية',
  category: 'ألعاب',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    if (triviaGames[chatId]) {
      return sock.sendMessage(chatId, { text: '❌ هناك سؤال جاري الآن، رجاءً أجبوا عليه أولاً.\n\n--𝑷𝑼𝑼𝑵𝒀' }, { quoted: msg });
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    triviaGames[chatId] = { answer: question.a.toLowerCase(), timeout: null };

    await sock.sendMessage(chatId, { text: `❓ السؤال: ${question.q}\nلديك 20 ثانية للإجابة!\n\n--𝑷𝑼𝑼𝑵𝒀` }, { quoted: msg });

    let answered = false;

    const handler = async ({ messages }) => {
      const reply = messages[0];
      if (!reply.message) return;

      const from = reply.key.remoteJid;
      if (from !== chatId || reply.key.fromMe) return;

      const userAnswer =
        reply.message.conversation ||
        reply.message.extendedTextMessage?.text;

      if (!userAnswer) return;

      const correctAnswer = triviaGames[chatId].answer;

      if (userAnswer.trim().toLowerCase() === correctAnswer) {
        answered = true;
        await sock.sendMessage(chatId, { text: `✅ إجابة صحيحة! الإجابة هي: *${question.a}*\n\n--𝑷𝑼𝑼𝑵𝒀` }, { quoted: reply });
        clearTimeout(triviaGames[chatId].timeout);
        delete triviaGames[chatId];
        sock.ev.off('messages.upsert', handler);
      } else {
        await sock.sendMessage(chatId, { text: `❌ إجابة خاطئة، حاول مرة أخرى.\n\n--𝑷𝑼𝑼𝑵𝒀` }, { quoted: reply });
      }
    };

    sock.ev.on('messages.upsert', handler);

    triviaGames[chatId].timeout = setTimeout(async () => {
      if (!answered) {
        await sock.sendMessage(chatId, { text: `⏰ انتهى الوقت! الإجابة الصحيحة هي: *${question.a}*\n\n--𝑷𝑼𝑼𝑵𝒀` }, { quoted: msg });
      }
      delete triviaGames[chatId];
      sock.ev.off('messages.upsert', handler);
    }, 20000);
  }
};
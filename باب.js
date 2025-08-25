const userStates = {}; // حفظ حالة اللعبة لكل لاعب

module.exports = {
  command: 'بوابه',
  description: 'لعبة بوابة الواقع الغامضة',
  category: 'العاب',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    userStates[sender] = { stage: 'start' };

    await sock.sendMessage(chatId, {
      text: `🌀 *تم فتح بوابة غامضة...*\nهل ترغب بالدخول؟\nاكتب *نعم* للمتابعة أو *لا* للخروج.`
    });
  },

  async continueGame(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').toLowerCase().trim();

    if (!userStates[sender]) return false;

    const state = userStates[sender];

    switch (state.stage) {
      case 'start':
        if (text === 'نعم') {
          userStates[sender].stage = 'chooseDoor';
          await sock.sendMessage(chatId, {
            text:
`🎴 أمامك ثلاث بوابات:
1️⃣ الأحمر
2️⃣ الأزرق
3️⃣ الأسود

اكتب رقم الباب أو لونه لاختيارك.`
          });
        } else {
          delete userStates[sender];
          await sock.sendMessage(chatId, { text: '🚪 تم إغلاق البوابة... إلى اللقاء!' });
        }
        return true;

      case 'chooseDoor':
        if (['1', 'احمر', 'الأحمر', 'red'].some(v => text.includes(v))) {
          userStates[sender].stage = 'red_path';
          await sock.sendMessage(chatId, { text: '🔴 دخلت عالم الرجل المقنع، هل تريد الاقتراب (1) أم الهروب (2)؟' });
        } else if (['2', 'ازرق', 'الأزرق', 'blue'].some(v => text.includes(v))) {
          userStates[sender].stage = 'blue_path';
          await sock.sendMessage(chatId, { text: '🔵 وقفت أمام شجرة بيضاء تتحدث، هل تستمع لهمساتها (1) أم تتجاهلها وتمشي (2)؟' });
        } else if (['3', 'اسود', 'الأسود', 'black'].some(v => text.includes(v))) {
          userStates[sender].stage = 'black_path';
          await sock.sendMessage(chatId, { text: '⚫ دخلت عالم الظلال، هل تبحث عن المراقب (1) أم تختبئ بصمت (2)؟' });
        } else {
          await sock.sendMessage(chatId, { text: '❌ اختيار غير معروف. اكتب رقم الباب أو لونه (1، 2، 3).' });
        }
        return true;

      case 'red_path':
        if (text === '1') {
          await sock.sendMessage(chatId, { text: '👤 اقتربت من الرجل المقنع، لكنه اختفى فجأة... النهاية: صراع مع الخيال.' });
        } else if (text === '2') {
          await sock.sendMessage(chatId, { text: '🏃‍♂️ هربت من الرجل المقنع، وعادت البوابة للإغلاق. النهاية: نجوت.' });
        } else {
          await sock.sendMessage(chatId, { text: '❌ اكتب 1 أو 2 فقط.' });
          return true;
        }
        delete userStates[sender];
        return true;

      case 'blue_path':
        if (text === '1') {
          await sock.sendMessage(chatId, { text: '🌳 استمعت لهمسات الشجرة، وتعلمت سر الوجود. النهاية: التنوير.' });
        } else if (text === '2') {
          await sock.sendMessage(chatId, { text: '❄️ تجاهلتها... وتاهت بك الغابة للأبد. النهاية: ضياع.' });
        } else {
          await sock.sendMessage(chatId, { text: '❌ اكتب 1 أو 2 فقط.' });
          return true;
        }
        delete userStates[sender];
        return true;

      case 'black_path':
        if (text === '1') {
          await sock.sendMessage(chatId, { text: '🔦 وجدت المراقب... وكان نسخة منك من المستقبل! النهاية: مفاجأة الزمن.' });
        } else if (text === '2') {
          await sock.sendMessage(chatId, { text: '🌫️ اختبأت في الظلال، لكن الظلال احتوتك... النهاية: الاختفاء الأبدي.' });
        } else {
          await sock.sendMessage(chatId, { text: '❌ اكتب 1 أو 2 فقط.' });
          return true;
        }
        delete userStates[sender];
        return true;

      default:
        delete userStates[sender];
        return false;
    }
  }
};
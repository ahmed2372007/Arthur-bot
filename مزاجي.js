const path = require('path');
const fs = require('fs');

const moods = [
  {
    from: 6,
    to: 12,
    text: "☀️ صباحك أمل ونور! يوم جميل ينتظرك.",
    image: path.join(__dirname, '../media/morning.jpg'),
    audio: path.join(__dirname, '../media/morning.mp3')
  },
  {
    from: 12,
    to: 17,
    text: "💼 أنت تصنع يومك! استغل وقتك جيدًا.",
    image: path.join(__dirname, '../media/afternoon.jpg'),
    audio: path.join(__dirname, '../media/afternoon.mp3')
  },
  {
    from: 17,
    to: 24,
    text: "🌙 خذ نفسًا، الأمور بسيطة. مساء هاديء.",
    image: path.join(__dirname, '../media/evening.jpg'),
    audio: path.join(__dirname, '../media/evening.mp3')
  },
  {
    from: 0,
    to: 6,
    text: "🕊️ اللهم اطمئنانًا لا يزول، صباح الخير يا بطل.",
    image: path.join(__dirname, '../media/night.jpg'),
    audio: path.join(__dirname, '../media/night.mp3')
  }
];

function getCurrentMood() {
  const hour = new Date().getHours();
  return moods.find(m => {
    if (m.from <= hour && hour < m.to) return true;
    if (m.from > m.to) return hour >= m.from || hour < m.to;
    return false;
  }) || moods[0];
}

module.exports = {
  category: 'tools',
  command: ['مزاجي'],
  description: 'يرسل مزاج تلقائي حسب الوقت مع صورة وصوت',
  group: false,
  async execute(conn, m) {
    try {
      const mood = getCurrentMood();

      const chatId = m.chat || m.key.remoteJid;
      if (!chatId) throw new Error('معرف المحادثة غير موجود');

      await conn.sendMessage(chatId, { text: mood.text });

      if (fs.existsSync(mood.image)) {
        await conn.sendMessage(chatId, { image: { url: mood.image }, caption: '🌈 صورة المزاج' });
      }

      if (fs.existsSync(mood.audio)) {
        await conn.sendMessage(chatId, { audio: { url: mood.audio }, mimetype: 'audio/mpeg' });
      }
    } catch (error) {
      console.error('حدث خطأ في أمر المزاجي:', error);
      const chatId = m.chat || m.key.remoteJid || '';
      if (chatId) {
        await conn.sendMessage(chatId, { text: `❌ حدث خطأ: ${error.message}` });
      }
    }
  }
};
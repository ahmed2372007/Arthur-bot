const fs = require('fs');
const path = require('path');

// مسارات الملفات
const messagesPath = path.join(__dirname, '..', 'data', 'loveMessages.json');
const statePath = path.join(__dirname, '..', 'data', 'loveState.json');

// تحميل العبارات واختيار واحدة بدون تكرار
function loadRandomMessage() {
  const allMessages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

  let remainingMessages = [];

  if (fs.existsSync(statePath)) {
    remainingMessages = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  }

  // إذا ما فيه عبارات متبقية، نعيد تعبئة القائمة
  if (!Array.isArray(remainingMessages) || remainingMessages.length === 0) {
    remainingMessages = [...allMessages];
  }

  // اختيار عشوائي
  const index = Math.floor(Math.random() * remainingMessages.length);
  const selected = remainingMessages.splice(index, 1)[0];

  // حفظ المتبقي
  fs.writeFileSync(statePath, JSON.stringify(remainingMessages, null, 2));

  return selected;
}

module.exports = {
  command: 'احبك',
  description: 'أمر كيوت يعبّر عن الحب 🩷',
  category: 'fun',

  async execute(sock, msg, args, commandInfo) {
    const senderName = msg.pushName || 'يا قلبي';
    const imagePath = path.join(__dirname, '..', 'media', 'love.gif');

    // تحميل الرسالة واستبدال الاسم
    let message = loadRandomMessage();
    message = message.replace('{name}', senderName);

    if (fs.existsSync(imagePath)) {
      const media = fs.readFileSync(imagePath);
      await sock.sendMessage(msg.key.remoteJid, {
        video: media,
        gifPlayback: true,
        caption: message
      }, { quoted: msg });
    } else {
      await sock.sendMessage(msg.key.remoteJid, {
        text: message
      }, { quoted: msg });
    }
  }
};
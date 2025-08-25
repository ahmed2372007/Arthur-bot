const fs = require('fs');
const path = require('path');

const welcomeFile = path.join(__dirname, '..', 'welcome.json');

// تحميل حالة الترحيب
function loadWelcomeStatus() {
  if (!fs.existsSync(welcomeFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(welcomeFile, 'utf8'));
  } catch {
    return {};
  }
}

// حفظ حالة الترحيب
function saveWelcomeStatus(data) {
  fs.writeFileSync(welcomeFile, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'ترحيب',
  category: 'مجموعة',
  description: 'تفعيل أو تعطيل الترحيب التلقائي في المجموعة',
  usage: '.ترحيب',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    if (!from.endsWith('@g.us')) {
      await sock.sendMessage(from, { text: 'هذا الأمر خاص بالمجموعات فقط.' });
      return;
    }

    let welcomeStatus = loadWelcomeStatus();

    if (welcomeStatus[from]) {
      welcomeStatus[from] = false;
      saveWelcomeStatus(welcomeStatus);
      await sock.sendMessage(from, { text: 'تم تعطيل الترحيب التلقائي في هذه المجموعة.' });
    } else {
      welcomeStatus[from] = true;
      saveWelcomeStatus(welcomeStatus);
      await sock.sendMessage(from, { text: 'تم تفعيل الترحيب التلقائي في هذه المجموعة. مرحبًا بالأعضاء الجدد!' });
    }
  }
};
const fs = require('fs');
const welcomeStatusPath = './welcome-status.json';

// تحميل حالة التفعيل
function loadWelcomeStatus() {
  if (!fs.existsSync(welcomeStatusPath)) return {};
  return JSON.parse(fs.readFileSync(welcomeStatusPath, 'utf8'));
}

// حفظ حالة التفعيل
function saveWelcomeStatus(data) {
  fs.writeFileSync(welcomeStatusPath, JSON.stringify(data, null, 2));
}

const welcomeStatus = loadWelcomeStatus();

module.exports = {
  name: 'الترحيب',
  events: ['group-participants.update'],
  async handle(sock, event) {
    const metadata = await sock.groupMetadata(event.id);
    const groupId = event.id;

    if (event.action === 'add' && welcomeStatus[groupId]) {
      for (const user of event.participants) {
        const mention = '@' + user.split('@')[0];
        await sock.sendMessage(groupId, {
          text: `*❯ نورت ✨❤‍🩹* ${mention}`,
          mentions: [user],
        });
      }
    }
  },
  commands: [
    {
      command: 'تفعيل',
      description: 'تفعيل الترحيب التلقائي',
      async execute(sock, msg) {
        const groupId = msg.key.remoteJid;
        welcomeStatus[groupId] = true;
        saveWelcomeStatus(welcomeStatus);
        await sock.sendMessage(groupId, {
          text: '✅ تم تفعيل الترحيب التلقائي',
        }, { quoted: msg });
      },
    },
    {
      command: 'ايقاف',
      description: 'إيقاف الترحيب التلقائي',
      async execute(sock, msg) {
        const groupId = msg.key.remoteJid;
        delete welcomeStatus[groupId];
        saveWelcomeStatus(welcomeStatus);
        await sock.sendMessage(groupId, {
          text: '🛑 تم إيقاف الترحيب التلقائي',
        }, { quoted: msg });
      },
    },
  ],
};
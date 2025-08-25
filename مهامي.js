const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/tasks.json');

if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}));

function load() {
  return JSON.parse(fs.readFileSync(file));
}

module.exports = {
  command: 'مهامي',
  category: 'الدراسة',
  description: 'عرض المهام الدراسية',
  usage: '.مهامي',
  execute: async (sock, msg, args) => {
    const sender = msg.key.remoteJid;
    const tasks = load()[sender] || [];

    if (tasks.length === 0) {
      return sock.sendMessage(sender, { text: '📭 لا توجد مهام مسجلة.' }, { quoted: msg });
    }

    const list = tasks.map(t => `🔹 *${t.text}*\n🔑 ${t.id}`).join('\n\n');
    await sock.sendMessage(sender, {
      text: `📚 *مهامك الحالية:*\n\n${list}`
    }, { quoted: msg });
  }
};
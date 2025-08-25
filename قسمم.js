const { getPlugins } = require('../handlers/plugins.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'قسم',
  command: ['قسم'],
  category: 'tools',
  description: 'يعرض أوامر فئة حسب رقمها في قائمة .اوامر',
  hidden: false,
  async execute(sock, msg) {
    try {
      const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const args = body.trim().split(' ').slice(1);
      const sender = msg.key.participant || msg.key.remoteJid;

      if (args.length === 0 || isNaN(args[0])) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ يرجى كتابة رقم الفئة. مثال:\n.قسم 1`,
          mentions: [sender]
        }, { quoted: msg });
      }

      const index = parseInt(args[0]) - 1;
      const plugins = getPlugins();
      const categories = {};

      Object.values(plugins).forEach(plugin => {
        if (plugin.hidden) return;
        const cat = plugin.category?.toLowerCase() || 'others';
        if (!categories[cat]) categories[cat] = [];

        let display = '';
        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
        display += `╭── ❍ ${cmds.map(c => `\`${c}\``).join(' | ')}`;
        if (plugin.description) display += `\n│ 📌 ${plugin.description}`;
        display += `\n╰───────────────\n`;
        categories[cat].push(display);
      });

      const catNames = Object.keys(categories);
      if (index < 0 || index >= catNames.length) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ لا توجد فئة بهذا الرقم. اختر من 1 إلى ${catNames.length}`,
          mentions: [sender]
        }, { quoted: msg });
      }

      const selectedCat = catNames[index];
      const commandList = categories[selectedCat].join('\n');

      const caption = `📂 *أوامر الفئة رقم ${index + 1} - ${selectedCat}*\n\n${commandList}`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: caption,
        mentions: [sender]
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ قسم Error:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء عرض القسم.`
      }, { quoted: msg });
    }
  }
};
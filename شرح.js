const path = require('path');
const { getPlugins } = require('../handlers/plugins');

module.exports = {
  command: ['شرح'],
  description: 'يعرض شرحًا مفصلًا لكل أمر متاح بإيموجيات نيازك وألعاب',
  async execute(sock, msg) {
    try {
      const plugins = getPlugins();
      if (!plugins || Object.keys(plugins).length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '☄️ لا توجد أوامر متاحة حاليًا.',
        }, { quoted: msg });
      }

      let menu = '⭐ *دليل الأوامر السحرية:* ⭐\n\n';

      for (const cmdName in plugins) {
        const plugin = plugins[cmdName];
        const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];

        for (const cmd of commands) {
          if (!cmd || typeof cmd !== 'string') continue;

          menu += `━━━━━━━━━━━♡\n`;
          menu += `♦ *الأمر:*  *.${cmd}*\n`;
          menu += `⚡ *الفئة:*  ${plugin. category || 'غير مصنفة'}\n`;
          menu += `💥 *الوصف:* ${plugin.description || 'لا يوجد وصف'}\n`;
          menu += `━━━━━━━━━━━━♡\n\n`;
        }
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: menu
      }, { quoted: msg });

    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '💥 حدث خطأ أثناء عرض الشرح.'
      }, { quoted: msg });
      console.error(err);
    }
  }
};
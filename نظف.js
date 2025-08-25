const fs = require('fs').promises;
const path = require('path');
const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'نظف',
  description: '🧹 حذف النسخ الاحتياطية (.bak) للملفات المعدلة.',
  category: 'ادارة',

  async execute(sock, msg, args = []) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const remoteJid = msg.key.remoteJid;

    if (!(await isElite(sender))) {
      return sock.sendMessage(remoteJid, { text: '❌ هذا الأمر للنخبة فقط.' }, { quoted: msg });
    }

    const baseDir = path.resolve('./');
    let deletedCount = 0;

    async function cleanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // تجاهل مجلدات معينة
          if (['node_modules', '.git', 'ملف_الاتصال'].includes(entry.name)) continue;
          await cleanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.bak')) {
          const originalName = entry.name.replace(/\.bak$/, '');
          const originalPath = path.join(dir, originalName);

          try {
            await fs.access(originalPath); // الملف الأصلي موجود
            await fs.unlink(fullPath); // نحذف النسخة .bak
            deletedCount++;
          } catch {
            // إذا لم يكن الملف الأصلي موجود، نترك نسخة .bak
          }
        }
      }
    }

    await cleanDirectory(baseDir);

    return sock.sendMessage(remoteJid, {
      text: deletedCount
        ? `🧹 تم حذف ${deletedCount} نسخة احتياطية (.bak).`
        : '✅ لا توجد نسخ احتياطية لحذفها.'
    }, { quoted: msg });
  }
};
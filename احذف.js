const fs = require('fs').promises;
const path = require('path');
const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'احذف',
  description: '🗑️ حذف ملف من البوت.',
  category: 'ادارة',

  async execute(sock, msg, args = []) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const remoteJid = msg.key.remoteJid;

    if (!(await isElite(sender))) {
      return sock.sendMessage(remoteJid, { text: '❌ هذا الأمر للنخبة فقط.' }, { quoted: msg });
    }

    let inputText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    inputText = inputText.replace(/^\.?احذف\s?/, '').trim();

    if (!inputText) {
      return sock.sendMessage(remoteJid, { text: '✍️ اكتب: احذف [اسم الملف أو رقم/رقم]' }, { quoted: msg });
    }

    const baseDir = path.resolve('./');

    // الحصول على جميع المجلدات
    const allFolders = await fs.readdir(baseDir);
    const folderList = [];

    for (const f of allFolders) {
      const folderPath = path.join(baseDir, f);
      try {
        const stat = await fs.stat(folderPath);
        if (
          stat.isDirectory() &&
          !['node_modules', '.git', 'ملف_الاتصال'].includes(f)
        ) {
          folderList.push(f);
        }
      } catch {}
    }

    // الملفات في الجذر
    const rootFiles = (await fs.readdir(baseDir)).filter(f =>
      f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.env')
    );

    let filePath = null;
    let fileName = null;

    if (/^\d+\/[^\/]+$/.test(inputText)) {
      const [folderIndexRaw, fileRefRaw] = inputText.split('/');
      const folderIndex = parseInt(folderIndexRaw) - 1;
      if (folderIndex < 0 || folderIndex >= folderList.length)
        return sock.sendMessage(remoteJid, { text: '❌ رقم المجلد غير صحيح.' }, { quoted: msg });

      const folder = folderList[folderIndex];
      const folderPath = path.join(baseDir, folder);
      const files = (await fs.readdir(folderPath)).filter(f => f.endsWith('.js') || f.endsWith('.json'));

      if (/^\d+$/.test(fileRefRaw)) {
        const fileIndex = parseInt(fileRefRaw) - 1;
        if (fileIndex < 0 || fileIndex >= files.length)
          return sock.sendMessage(remoteJid, { text: '❌ رقم الملف غير صحيح داخل المجلد.' }, { quoted: msg });

        fileName = files[fileIndex];
        filePath = path.join(folderPath, fileName);
      } else {
        // اسم ملف (مع أو بدون .js)
        let fileNameGuess = fileRefRaw;
        const isPlugin = folder.toLowerCase().includes('بلوجن') || folder.toLowerCase().includes('plugin');
        if (!fileNameGuess.endsWith('.js') && isPlugin) fileNameGuess += '.js';

        const match = files.find(f => f.toLowerCase() === fileNameGuess.toLowerCase());
        if (!match) {
          return sock.sendMessage(remoteJid, {
            text: `❌ لا يوجد ملف باسم "${fileRefRaw}" داخل المجلد ${folder}.`
          }, { quoted: msg });
        }

        fileName = match;
        filePath = path.join(folderPath, fileName);
      }

    } else if (/^\d+$/.test(inputText)) {
      const index = parseInt(inputText) - 1 - folderList.length;
      if (index >= 0 && index < rootFiles.length) {
        fileName = rootFiles[index];
        filePath = path.join(baseDir, fileName);
      }
    } else {
      // البحث بالاسم في الجذر والمجلدات
      const match = rootFiles.find(f =>
        f.toLowerCase() === inputText.toLowerCase() || f.toLowerCase() === `${inputText}.js`
      );

      if (match) {
        fileName = match;
        filePath = path.join(baseDir, match);
      } else {
        for (const folder of folderList) {
          const folderPath = path.join(baseDir, folder);
          const files = (await fs.readdir(folderPath)).filter(f => f.endsWith('.js') || f.endsWith('.json'));
          const found = files.find(f =>
            f.toLowerCase() === inputText.toLowerCase() || f.toLowerCase() === `${inputText}.js`
          );
          if (found) {
            fileName = found;
            filePath = path.join(folderPath, found);
            break;
          }
        }
      }
    }

    if (!filePath || !(await exists(filePath))) {
      return sock.sendMessage(remoteJid, { text: `❌ الملف غير موجود.` }, { quoted: msg });
    }

    await fs.unlink(filePath);
    return sock.sendMessage(remoteJid, {
      text: `🗑️ تم حذف الملف:\n\`\`\`${path.relative(baseDir, filePath)}\`\`\``
    }, { quoted: msg });
  }
};

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
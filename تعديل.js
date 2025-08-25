const fs = require('fs').promises;
const path = require('path');
const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'تعديل',
  category: 'ادارة',
  description: '✏️ تعديل أي ملف في البوت عن طريق الرد على كود جديد.',

  async execute(sock, msg, args = []) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const remoteJid = msg.key.remoteJid;

    if (!(await isElite(sender))) {
      return sock.sendMessage(remoteJid, { text: '❌ هذا الأمر مخصص للنخبة فقط.' }, { quoted: msg });
    }

    try {
      let messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      if (messageText.startsWith('.تعديل')) {
        messageText = messageText.substring('.تعديل'.length).trim();
        args = messageText.split(/\s+/).filter(Boolean);
      }

      const inputText = args[0];
      if (!inputText) {
        return sock.sendMessage(remoteJid, {
          text: '✍️ اكتب: `.تعديل [اسم أو رقم/اسم أو رقم]` ورد على الكود الجديد.',
        }, { quoted: msg });
      }

      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const newCode = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;
      if (!newCode) {
        return sock.sendMessage(remoteJid, { text: '⚠️ من فضلك رد على الكود الجديد.' }, { quoted: msg });
      }

      const baseDir = path.resolve('./');

      // 🗂️ احصل على المجلدات الصالحة
      const allFolders = await fs.readdir(baseDir);
      const folders = [];
      for (const f of allFolders) {
        const stat = await fs.stat(path.join(baseDir, f));
        if (stat.isDirectory() && !['node_modules', '.git', 'ملف_الاتصال'].includes(f)) {
          folders.push(f);
        }
      }

      const rootFiles = (await fs.readdir(baseDir)).filter(f =>
        f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.env')
      );

      let filePath = null;

      // دعم: رقم/رقم أو رقم/اسم
      if (/^\d+\/.+/.test(inputText)) {
        const [folderIndexRaw, filePartRaw] = inputText.split('/');
        const folderIndex = parseInt(folderIndexRaw) - 1;
        const folderName = folders[folderIndex];
        if (!folderName) {
          return sock.sendMessage(remoteJid, { text: '❌ رقم المجلد غير صحيح.' }, { quoted: msg });
        }

        const folderPath = path.join(baseDir, folderName);
        const allFiles = await fs.readdir(folderPath);
        const validFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.json'));

        // إذا filePart رقم
        if (/^\d+$/.test(filePartRaw)) {
          const fileIndex = parseInt(filePartRaw) - 1;
          const targetFile = validFiles[fileIndex];
          if (!targetFile) {
            return sock.sendMessage(remoteJid, { text: '❌ رقم الملف غير موجود داخل المجلد.' }, { quoted: msg });
          }
          filePath = path.join(folderPath, targetFile);
        } else {
          // اسم الملف
          let fileName = filePartRaw;
          if (!fileName.endsWith('.js')) fileName += '.js';
          const found = validFiles.find(f => f.toLowerCase() === fileName.toLowerCase());
          if (!found) {
            return sock.sendMessage(remoteJid, { text: `❌ الملف "${fileName}" غير موجود داخل المجلد.` }, { quoted: msg });
          }
          filePath = path.join(folderPath, found);
        }

      } else if (/^\d+$/.test(inputText)) {
        // رقم ملف من الجذر
        const index = parseInt(inputText) - 1 - folders.length;
        if (index >= 0 && index < rootFiles.length) {
          filePath = path.join(baseDir, rootFiles[index]);
        }

      } else {
        // اسم ملف من الجذر
        let fileName = inputText;
        if (!fileName.endsWith('.js')) fileName += '.js';
        const found = rootFiles.find(f => f.toLowerCase() === fileName.toLowerCase());
        if (found) filePath = path.join(baseDir, found);
      }

      if (!filePath || !(await fileExists(filePath))) {
        return sock.sendMessage(remoteJid, { text: `❌ لم يتم العثور على الملف المطلوب.` }, { quoted: msg });
      }

      // 💾 نسخة احتياطية
      await fs.copyFile(filePath, `${filePath}.bak`);

      // ✏️ كتابة التعديل
      await fs.writeFile(filePath, newCode, 'utf8');

      return sock.sendMessage(remoteJid, {
        text: `✅ تم تعديل الملف: \n\`\`\`${path.relative(baseDir, filePath)}\`\`\`\n💾 تم حفظ نسخة احتياطية .bak`,
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      return sock.sendMessage(remoteJid, {
        text: '❌ حدث خطأ أثناء محاولة تعديل الملف.',
      }, { quoted: msg });
    }
  }
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
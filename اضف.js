const fs = require('fs').promises;
const path = require('path');
const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'اضف',
  description: '📥 إنشاء ملف جديد داخل مجلد معين بناءً على ملف موجود أو من الرد.',
  category: 'ادارة',

  async execute(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const remoteJid = msg.key.remoteJid;

    if (!(await isElite(sender))) {
      return sock.sendMessage(remoteJid, {
        text: '❌ هذا الأمر مخصص للنخبة فقط.'
      }, { quoted: msg });
    }

    const fullText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const inputText = fullText.replace(/^\.?اضف\s*/i, '').trim();

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const newContent = quoted?.conversation || quoted?.extendedTextMessage?.text;

    if (!inputText || !newContent) {
      return sock.sendMessage(remoteJid, {
        text: '✍️ الصيغة: اضف [رقم_مجلد/اسم أو رقم] [اسم_جديد]\nأو: اضف [رقم_مجلد] [اسم_جديد]\n⚠️ يجب الرد على رسالة تحتوي على الكود الجديد.'
      }, { quoted: msg });
    }

    const baseDir = path.resolve('./');
    const all = await fs.readdir(baseDir);
    const folders = [];

    for (const item of all) {
      const stat = await fs.stat(path.join(baseDir, item));
      if (stat.isDirectory() && !['node_modules', '.git', 'ملف_الاتصال'].includes(item)) {
        folders.push(item);
      }
    }

    const parts = inputText.trim().split(/\s+/);
    if (parts.length < 2) {
      return sock.sendMessage(remoteJid, {
        text: '❌ يرجى كتابة رقم المجلد واسم الملف الجديد مثل: اضف 6 نظف'
      }, { quoted: msg });
    }

    const ref = parts[0];
    const newName = parts[1].trim();

    if (!/^\d+(\/.+)?$/.test(ref)) {
      return sock.sendMessage(remoteJid, {
        text: '❌ المرجع غير صحيح، يجب أن يكون مثل: 6 أو 6/2 أو 6/اسم'
      }, { quoted: msg });
    }

    const [folderIndexRaw, fileRefRaw] = ref.split('/');
    const folderIndex = parseInt(folderIndexRaw) - 1;
    if (folderIndex < 0 || folderIndex >= folders.length) {
      return sock.sendMessage(remoteJid, {
        text: '❌ رقم المجلد غير صحيح.'
      }, { quoted: msg });
    }

    const selectedFolder = folders[folderIndex];
    const folderPath = path.join(baseDir, selectedFolder);
    const files = (await fs.readdir(folderPath)).filter(f => f.endsWith('.js') || f.endsWith('.json'));

    let ext = '.js'; // الافتراضي

    // إذا تم تحديد ملف مرجع
    if (fileRefRaw) {
      if (/^\d+$/.test(fileRefRaw)) {
        const fileIndex = parseInt(fileRefRaw) - 1;
        if (fileIndex >= 0 && fileIndex < files.length) {
          ext = path.extname(files[fileIndex]) || '.js';
        } else {
          return sock.sendMessage(remoteJid, {
            text: '❌ رقم الملف داخل المجلد غير صحيح.'
          }, { quoted: msg });
        }
      } else {
        let fileName = fileRefRaw;
        if (!fileName.endsWith('.js')) fileName += '.js';
        const match = files.find(f => f.toLowerCase() === fileName.toLowerCase());
        if (!match) {
          return sock.sendMessage(remoteJid, {
            text: `❌ لا يوجد ملف باسم "${fileRefRaw}" داخل المجلد.`
          }, { quoted: msg });
        }
        ext = path.extname(match) || '.js';
      }
    } else {
      // إذا لم يحدد ملف مرجع وتمت الإضافة داخل مجلد اسمه 'البلوجن' أو 'plugins'
      if (['البلوجن', 'plugins', 'بلوجن'].includes(selectedFolder.toLowerCase())) {
        ext = '.js';
      }
    }

    const finalFileName = `${newName}${ext}`;
    const targetPath = path.join(folderPath, finalFileName);

    await fs.writeFile(targetPath, newContent, 'utf8');

    return sock.sendMessage(remoteJid, {
      text: `✅ تم إنشاء الملف:\n\`\`\`${selectedFolder}/${finalFileName}\`\`\``
    }, { quoted: msg });
  }
};
const fs = require('fs');
const path = require('path');
const { eliteNumbers } = require('../haykala/elite.js');

module.exports = {
  command: ['ملفات'],
  description: '📁 عرض المجلدات + تحميل ملف معين برقم أو اسم أو رقم/رقم أو رقم/اسم',
  category: 'developer',

  async execute(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    if (!eliteNumbers.includes(senderNumber)) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ هذا الأمر مخصص للنخبة فقط.' }, { quoted: msg });
    }

    const baseDir = path.resolve('./');
    const input = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const inputText = input.split(' ').slice(1).join(' ').trim();

    const folders = fs.readdirSync(baseDir).filter(f =>
      fs.statSync(path.join(baseDir, f)).isDirectory() &&
      !['node_modules', '.git', 'ملف_الاتصال'].includes(f)
    );
    const rootFiles = fs.readdirSync(baseDir).filter(f =>
      fs.statSync(path.join(baseDir, f)).isFile() &&
      (f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.env'))
    );

    const allItems = [...folders.map(f => ({ type: 'folder', name: f })), ...rootFiles.map(f => ({ type: 'file', name: f }))];

    // === عرض كل الملفات والمجلدات
    if (!inputText) {
      const list = allItems.map((item, i) => `│ ${i + 1}. ${item.type === 'folder' ? '📁' : '📄'} ${item.name}`).join('\n');
      return sock.sendMessage(msg.key.remoteJid, {
        text: `
📦 *محتويات البوت:*
${list}

✍️ اكتب:
- فتح [رقم أو اسم مجلد] 🔍
- ملفات [اسم أو رقم ملف] 📄
- ملفات [رقم_مجلد/رقم_ملف أو اسم_ملف] 📂
        `.trim()
      }, { quoted: msg });
    }

    // === دعم 6/80 أو 6/عدد
    if (/^\d+\/.+/.test(inputText)) {
      const [folderIndexRaw, filePartRaw] = inputText.split('/');
      const folderIndex = parseInt(folderIndexRaw) - 1;

      if (folderIndex < 0 || folderIndex >= folders.length) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ رقم المجلد غير صحيح.' }, { quoted: msg });
      }

      const selectedFolder = folders[folderIndex];
      const folderPath = path.join(baseDir, selectedFolder);
      const filesInFolder = fs.readdirSync(folderPath).filter(f => f.endsWith('.js') || f.endsWith('.json'));

      let selectedFile = '';

      if (/^\d+$/.test(filePartRaw)) {
        const fileIndex = parseInt(filePartRaw) - 1;
        if (fileIndex < 0 || fileIndex >= filesInFolder.length) {
          return sock.sendMessage(msg.key.remoteJid, { text: '❌ رقم الملف غير موجود داخل المجلد.' }, { quoted: msg });
        }
        selectedFile = filesInFolder[fileIndex];
      } else {
        let fileName = filePartRaw;
        if (!fileName.endsWith('.js')) fileName += '.js';
        const match = filesInFolder.find(f => f.toLowerCase() === fileName.toLowerCase());
        if (!match) {
          return sock.sendMessage(msg.key.remoteJid, { text: `❌ لا يوجد ملف باسم "${fileName}" داخل المجلد.` }, { quoted: msg });
        }
        selectedFile = match;
      }

      const filePath = path.join(folderPath, selectedFile);
      const fileBuffer = fs.readFileSync(filePath);
      const fileContent = fileBuffer.toString();

      // إرسال الملف
      await sock.sendMessage(msg.key.remoteJid, {
        document: fileBuffer,
        fileName: `${selectedFolder}/${selectedFile}`,
        mimetype: 'text/plain'
      }, { quoted: msg });

      // إرسال المحتوى كنص
      return sock.sendMessage(msg.key.remoteJid, {
        text: `📄 *محتوى الملف ${selectedFile}:*\n\n` + '```js\n' + fileContent.trim().slice(0, 4000) + '\n```'
      }, { quoted: msg });
    }

    // === دعم ملفات الجذر: بالرقم أو الاسم
    const filesOnly = allItems.filter(f => f.type === 'file').map(f => f.name);
    let selectedFile = '';

    if (/^\d+$/.test(inputText)) {
      const index = parseInt(inputText) - 1 - folders.length;
      if (index >= 0 && index < filesOnly.length) {
        selectedFile = filesOnly[index];
      }
    } else {
      const match = filesOnly.find(f => f.toLowerCase().includes(inputText.toLowerCase()));
      if (match) selectedFile = match;
    }

    if (!selectedFile) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: `❌ لم يتم العثور على الملف "${inputText}".`
      }, { quoted: msg });
    }

    const filePath = path.join(baseDir, selectedFile);
    const fileBuffer = fs.readFileSync(filePath);
    const fileContent = fileBuffer.toString();

    // إرسال الملف
    await sock.sendMessage(msg.key.remoteJid, {
      document: fileBuffer,
      fileName: selectedFile,
      mimetype: 'text/plain'
    }, { quoted: msg });

    // إرسال المحتوى كنص
    return sock.sendMessage(msg.key.remoteJid, {
      text: `📄 *محتوى الملف ${selectedFile}:*\n\n` + '```js\n' + fileContent.trim().slice(0, 4000) + '\n```'
    }, { quoted: msg });
  }
};
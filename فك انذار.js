const fs = require('fs');
const path = require('path');

const WARNINGS_FILE = path.join(__dirname, '../data/warnings.json'); // عدّل المسار حسب مكان تخزينك

// تحميل بيانات الإنذارات
function loadWarnings() {
  if (!fs.existsSync(WARNINGS_FILE)) {
    fs.writeFileSync(WARNINGS_FILE, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(WARNINGS_FILE));
}

// حفظ بيانات الإنذارات
function saveWarnings(data) {
  fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'فك',
  category: 'admin',
  description: 'إزالة إنذار واحد من عضو في المجموعة (للمشرفين فقط).',

  async execute(sock, msg, args = []) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: msg });
    }

    // جلب بيانات المجموعة
    let groupMetadata;
    try {
      groupMetadata = await sock.groupMetadata(chatId);
    } catch (e) {
      return sock.sendMessage(chatId, { text: '❌ لم أتمكن من جلب بيانات المجموعة.' }, { quoted: msg });
    }

    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;

    // التحقق من أن المرسل مشرف أو مسؤول في المجموعة
    const senderObj = groupMetadata.participants.find(p => p.id === sender);
    if (!senderObj || (senderObj.admin !== 'admin' && senderObj.admin !== 'superadmin')) {
      return sock.sendMessage(chatId, { text: '❌ يجب أن تكون مشرفًا لتنفيذ هذا الأمر.' }, { quoted: msg });
    }

    // الحصول على الجهة التي تريد إزالة إنذارها (من منشن أو رد أو رقم)
    let target;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const contextParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (mentioned?.length > 0) {
      target = mentioned[0];
    } else if (contextParticipant) {
      target = contextParticipant;
    } else if (args.length > 0) {
      // دعم رقم فقط بدون @s.whatsapp.net
      const number = args[0].replace(/[^0-9]/g, '');
      target = number + '@s.whatsapp.net';
    } else {
      return sock.sendMessage(chatId, { text: '❌ يجب منشن العضو أو الرد عليه أو كتابة رقمه.' }, { quoted: msg });
    }

    // تحقق أن العضو موجود في المجموعة
    const targetObj = groupMetadata.participants.find(p => p.id === target);
    if (!targetObj) {
      return sock.sendMessage(chatId, { text: '❌ العضو غير موجود في المجموعة.' }, { quoted: msg });
    }

    // تحميل الإنذارات وتحديثها
    let warnings = loadWarnings();
    if (!warnings[chatId]) warnings[chatId] = {};
    if (!warnings[chatId][target]) {
      return sock.sendMessage(chatId, { text: '❌ العضو ليس لديه إنذارات.' }, { quoted: msg });
    }

    // تقليل إنذار واحد فقط
    warnings[chatId][target]--;
    if (warnings[chatId][target] < 0) warnings[chatId][target] = 0;

    saveWarnings(warnings);

    const count = warnings[chatId][target];

    // رسالة تأكيد فك الإنذار
    const msgText = `✅ تم إزالة إنذار واحد من @${target.split('@')[0]}.\n⚠️ عدد الإنذارات الحالي: ${count}`;

    await sock.sendMessage(chatId, {
      text: msgText,
      mentions: [target]
    }, { quoted: msg });
  }
};
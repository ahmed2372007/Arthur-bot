// const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');
const { addKicked } = require('../haykala/dataUtils.js');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const insults = [
  "يا عديم الفائدة، حتى الظل يهرب منك!",
  "ذكاءك يضيع في الهواء زي دخان الشيشة!",
  "مستواك أقل من الصفر، حتى الآلة الحاسبة ترفضك!",
  "يا وجه النحس، حتى الحظ يتهرب منك!",
  "لو كان في مسابقة أغبى شخص، كنت خسرت لأنك حتى ما تعرف تخسر!",
  "يا وجه النحس، حتى الحظ يتهرب منك! 💀",
  "ذكاءك ضايع بين السطور، حتى جوجل ما يلقاك! 🤦‍♂️",
  "لو كان في جائزة للغباء، كنت بتفوز بدون منافسة! 🏆🤡",
  "يا عديم الفائدة، حتى الظل يهرب منك! 🕳️",
  "كلامك أقل من الصفر، حتى الآلة الحاسبة ترفضك! 🧮🚫",
  "يا ثقيل الدم، حتى الصبر زهق منك! 🐌",
  "وجودك مثل الواي فاي الضعيف، يرفع الضغط بس! 📶😤",
  "لو في مسابقة أغبى شخص، كنت بتخسر لأنك حتى ما تعرف تخسر! 😂",
  "يا وجه النكد، حتى الشمس تغيب لو شافتك! 🌥️",
  "كل ما تتكلم، الذكاء ينقص في العالم! 🌎⬇️",
  "يا قليل القيمة، حتى الريال يتهرب منك! 💸",
  "مستواك تحت الأرض، حتى الديدان تضحك عليك! 🪱",
  "يا عالة على البشرية، حتى الروبوتات ترفضك! 🤖🚫",
  "كلامك مثل الإعلانات المزعجة، الكل يسوي له سكيب! ⏩",
  "يا وجه النحس، حتى المرآة ترفض تعكسك! 🪞🙈"
];

module.exports = {
  command: 'هينه',
  description: 'رد على الرسائل بتشبيهات قوية',
  usage: '.هينه',
  category: 'تسلية',
  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;
      const sender = decode(msg.key.participant || groupJid);
      const senderLid = sender.split('@')[0];
      if (!groupJid.endsWith('@g.us')) return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });
      if (!eliteNumbers.includes(senderLid)) return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });
      const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.conversation.includes("@") && extractMentionedUser(msg.message.conversation);
      if (mentionedJid) {
        const insult = insults[Math.floor(Math.random() * insults.length)];
        await sock.sendMessage(msg.key.remoteJid, { text: `@${mentionedJid.split('@')[0]} ${insult}`, mentions: [mentionedJid] }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: '❗ يرجى ذكر المستخدم الذي تريد الإهانته.' }, { quoted: msg });
      }
    } catch (error) {
      console.error('❌ خطأ في أمر هينه:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${error.message || error.toString()}` }, { quoted: msg });
    }
  }
};

function extractMentionedUser(text) {
  const match = text.match(/@(\d+)/);
  return match ? `${match}@s.whatsapp.net` : null;
}

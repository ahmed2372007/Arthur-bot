const opinions = [
  "رايي انه ممتاز 👍",
  "ممكن يحتاج تحسين شوي 🤔",
  "ما أعتقد انه فكرة جيدة 😕",
  "وايد حلو وماشي الحال 🔥",
  "حاول مرة ثانية يمكن تتحسن 🤨",
  "أعتقد انه ممتاز جداً 👌",
  "مبهم شوي، وضح أكثر 🙃",
  "فكرة جديدة وابداعية 👏",
  "هذا الكلام يحتاج إعادة نظر 😐",
  "مقنع وأعجبني 👍",
];

module.exports = {
  command: 'شرايك',
  description: 'يعطيك رأي عشوائي بالكلام اللي تكتبه أو بالرسالة المردودة عليها',
  usage: '.شرايك <نص أو رد على رسالة>',
  category: 'تسلية',
  async execute(sock, msg) {
    try {
      const textMsg = msg.message.conversation || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';
      if (!textMsg.toLowerCase().startsWith('.شرايك')) {
        return;
      }
      let text = textMsg.substring('.شرايك'.length).trim();
      if (!text && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.quotedMessage) {
        const quotedMsg = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quotedMsg.conversation) text = quotedMsg.conversation;
        else if (quotedMsg.extendedTextMessage) text = quotedMsg.extendedTextMessage.text;
        else text = "";
      }
      if (!text) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: 'اكتب بعد الأمر كلام أو رد على رسالة عشان أعطيك رأيي.',
        }, { quoted: msg });
      }
      const opinion = opinions[Math.floor(Math.random() * opinions.length)];
      await sock.sendMessage(msg.key.remoteJid, {
        text: `📢 رأيي في كلامك:\n\n"${text}"\n\n${opinion}`,
      }, { quoted: msg });
    } catch (error) {
      console.error('❌ خطأ في أمر شرايك:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message || error.toString()}`,
      }, { quoted: msg });
    }
  },
};
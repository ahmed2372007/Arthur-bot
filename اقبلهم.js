const fs = require('fs');

// دالة تأخير بسيطة
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  command: ['اقبلهم'],
  description: 'يقبل كل طلبات الانضمام دفعة واحدة (بحد أقصى 200).',
  category: 'المجموعات',

  async execute(sock, msg) {
    try {
      const groupId = msg.key.remoteJid;

      const imagePath = 'imagee.jpeg';
      const hasImage = fs.existsSync(imagePath);
      const imageBuffer = hasImage ? fs.readFileSync(imagePath) : null;

      const reply = async (text) => {
        await sock.sendMessage(groupId, {
          text,
          contextInfo: {
            externalAdReply: {
              title: 'قبول الطلبات',
              body: 'تمت الموافقة على الجميع 🤝',
              thumbnail: imageBuffer,
              mediaType: 1,
              sourceUrl: 'https://t.me/YourChannel',
              renderLargerThumbnail: false,
              showAdAttribution: true
            }
          }
        }, { quoted: msg });
      };

      let joinRequestList = await sock.groupRequestParticipantsList(groupId);

      if (!joinRequestList || joinRequestList.length === 0) {
        return reply('📭 لا توجد طلبات حالياً.');
      }

      // حد أقصى 200 فقط
      joinRequestList = joinRequestList.slice(0, 200);

      for (const request of joinRequestList) {
        await sock.groupRequestParticipantsUpdate(groupId, [request.jid], 'approve');
        await sleep(150); // تأخير 150 ملي ثانية بين كل طلب لتفادي الحظر
      }

      return reply('*منوࢪين*');

    } catch (error) {
      console.error(error);
      return await sock.sendMessage(msg.key.remoteJid, { text: '❌ حصل خطأ أثناء قبول الطلبات.' }, { quoted: msg });
    }
  }
};
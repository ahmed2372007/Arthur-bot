// احلى كود من عمو اسكانور 
const audios = ['sounds/AUDIO_1.mp3', 'sounds/AUDIO_2.mp3', 'sounds/AUDIO_3.mp3', 'sounds/AUDIO_4.mp3', 'sounds/AUDIO_5.mp3'];

module.exports = {
  command: ['فويس'],
  description: 'يرسل أوديو عشوائي مع منشن خفي للكل.',
  category: 'أدوات',

  async execute(sock, msg, args = []) {
    try {
      const chatId = msg.key.remoteJid;
      // جلب كل أعضاء الجروب
      const metadata = await sock.groupMetadata(chatId);
      const allMembers = metadata.participants.map(p => p.id);

      const randomAudio = audios[Math.floor(Math.random() * audios.length)];
      await sock.sendMessage(
        chatId,
        { audio: { url: randomAudio }, mimetype: 'audio/mp4', mentions: allMembers },
        { quoted: msg }
      );
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء إرسال الأوديو!' }, { quoted: msg });
    }
  }
};
module.exports = {
  command: "صراحة",
  category: "ترفيه",
  description: "يعطيك سؤال صراحة عشوائي",
  usage: "صراحه",
  execute: async (sock, msg) => {
    const questions = [
      "🫢 من هو أكثر شخص تشتاق له؟",
      "💭 هل هناك سر تخفيه عن أعز أصدقائك؟",
      "❤️ هل تحب شخصًا لا يعرف أنك تحبه؟",
      "🙄 متى كانت آخر مرة بكيت فيها؟",
      "🔥 لو طلب منك تحذف شخص من حياتك، مين بيكون؟",
      "🕊️ لو تقدر ترجع للماضي، أي لحظة بتغيّرها؟",
      "🤫 هل سبق وكذبت على شخص تحبه؟",
      "💔 هل تم كسر قلبك من قبل؟",
      "😏 هل تعتبر نفسك شخص غامض؟",
      "🤨 هل فكرت يومًا بالابتعاد عن كل شيء؟"
    ];

    const random = questions[Math.floor(Math.random() * questions.length)];

    await sock.sendMessage(msg.key.remoteJid, {
      text: `🗯️ سؤال صراحة:\n\n${random}`
    }, { quoted: msg });
  }
};
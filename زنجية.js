module.exports = {
  command: 'زنجية',
  description: 'يحسب نسبة الزنجية ويعطي رد غزل أو سخرية حسب النسبة 🔞',
  category: 'fun',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!mentionedJid) {
      return sock.sendMessage(chatId, { text: '⚠️ منشن شخص أولًا مثل: زنجية @شخص' }, { quoted: msg });
    }

    const percentage = Math.floor(Math.random() * 101);
    let replyMessage = `نسبة زنجية @${mentionedJid.split('@')[0]} هي ${percentage}%\n\n`;

    const flirtyQuotes = [
      "بياضك مو طبيعي... الشمس تستحي منك 🤍☀️.",
      "5%؟ انتي نقطة لبن ساحت فوق جمر، صوتك يتعب القلب 🫦🔥.",
      "10%؟ تخيلتك تهمسي، نسيت الدنيا وتنفستك شهقة 🥵.",
      "15%؟ وجهك مرآة ناعمة، بس أفكاري عنك مو بريئة 🫠.",
      "20%؟ وجودك مثل شرشف ناعم على جسد مشتعل 🔞.",
      "انتي بياضك يدوّخ.. أحسك حلم نازل من بين الغيوم 😶‍🌫️.",
      "فيك هدوء ناعم، بس تخليني أتخيل صخب ما ينقال 😏.",
      "حضورك مثل لمسة أولى ع الجسد، بدون كلام 🥴.",
      "شفتك؟ جسمي تكلّم قبل عقلي 💋.",
      "كل شي فيك أبيض، إلا أفكاري عنك 😩."
    ];

    const roastReplies = [
      "25%؟ فيك شوكولا خفيف، بس باين على أصلك 😭.",
      "30%؟ تمشي فالظل ويصير أغمق 💀.",
      "35%؟ جلدك يلمع تحت الشمس بس مو من النظافة 😭.",
      "40%؟ انت سواد ناعم، خفيف بس يلسع 😈.",
      "45%؟ لونك بين الفحم والكاكاو ☠️.",
      "50%؟ نصك عبد، نصك تائه 🤷🏿‍♂️.",
      "60%؟ محتاج فلتر يفتّحك، مو كاميرا 🫣.",
      "70%؟ الشمس تعتبرك تهديد مباشر 🥵.",
      "80%؟ الظلمة تحس بالغيرة منك 🌚.",
      "90%؟ فيك من أفريقيا أكثر من الطبول 🥁.",
      "95%؟ جدك كان طبال رسمي في قبيلة 🦍.",
      "100%؟ انت فحم ناطق، اسكت يالعبد زنجي 🦶🏿."
    ];

    if (percentage <= 20) {
      const flirty = flirtyQuotes[Math.floor(Math.random() * flirtyQuotes.length)];
      replyMessage += flirty;
    } else {
      const roast = roastReplies[Math.floor(Math.random() * roastReplies.length)];
      replyMessage += roast;
    }

    await sock.sendMessage(chatId, {
      text: replyMessage,
      mentions: [mentionedJid]
    }, { quoted: msg });
  }
};
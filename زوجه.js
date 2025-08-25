module.exports = {
  command: "زوجه",
  description: "زوّج شخص بمنشنه لأي حد عشوائي في الجروب 👰🤵",
  category: "fun",

  async execute(sock, m) {
    const chatId = m.key.remoteJid;
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!chatId.endsWith("@g.us")) {
      return sock.sendMessage(chatId, { text: "❌ هذا الأمر يعمل فقط في الجروبات." }, { quoted: m });
    }

    if (!mentioned || mentioned.length === 0) {
      return sock.sendMessage(chatId, { text: "❌ منشن الشخص اللي عايز تزوجه.\nمثال: `.زوجه @1234567890`" }, { quoted: m });
    }

    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata.participants.filter(p => !p.admin && p.id !== sock.user.id);
    const target = mentioned[0];

    const others = participants.filter(p => p.id !== target);
    if (others.length < 2) {
      return sock.sendMessage(chatId, { text: "❌ مش كفاية ناس في الجروب عشان نختار عروسة 😅" }, { quoted: m });
    }

    const shuffled = others.sort(() => 0.5 - Math.random());
    const [partner, officiant] = shuffled;

    const partnerId = partner.id;
    const officiantId = officiant.id;

    const mahrList = [
      "مهره 10 قلوب حب ❤️",
      "مهره 5 كيلو شوكولاتة 🍫",
      "مهره 100 كرتونة بيبسي 🥤",
      "مهره سبيس تون 24/7 📺",
      "مهره جولة في كوكب الناميك 🌌",
      "مهره كوفي يومي لمدة شهر ☕",
      "مهره حفظ أنمي ناروتو كامل 🎥",
      "مهره لايكات يومية لمدة سنة 👍",
      "مهره بيت في عالم ون بيس 🏝️",
      "مهره 100 وردة من الحب الحقيقي 🌹"
    ];

    const selectedMahr = mahrList[Math.floor(Math.random() * mahrList.length)];

    const message = `
💍 تم تزويج شخص في الجروب بأمر من القائد 😂

👰‍♀️ العروسة/العريس: @${partnerId.split("@")[0]}
🤵‍♂️ الطرف الآخر: @${target.split("@")[0]}

📜 المأذون: *𝑅𝐼𝐶𝐿𝑋* المعروف بـ @${officiantId.split("@")[0]}

🎁 المهر: ${selectedMahr}

🎊 ألف مبروك للزوجين المجبرين 😂  
🔔 أتمنى لكم حياة سعيدة ما بين المسجات والطقطقة ✨  
`;

    await sock.sendMessage(chatId, {
      text: message,
      mentions: [partnerId, target, officiantId]
    }, { quoted: m });
  }
};
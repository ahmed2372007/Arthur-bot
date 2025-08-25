module.exports = {
  name: 'تحرمش',
  command: ['تحرمش'],
  category: 'الوناسة',
  description: 'يولد كلام وسخ +18 ويمنشن الشخص اللي رديت عليه أو منشنته 😈',
  args: [],
  hidden: false,

  execute: async (sock, m, args) => {
    const groupId = m.key.remoteJid;

    // اجمع كل اللي ممكن يكونوا مستهدفين
    let targets = [];
    const quoted = extractQuotedJid(m);
    if (quoted) targets.push(quoted);

    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    targets.push(...mentions);

    // إزالة التكرار
    targets = [...new Set(targets)];

    if (targets.length === 0) {
      return sendMessage(sock, groupId, '❌ لازم ترد على رسالة أو تمنشن حد عشان أتحرمش عليه 😏');
    }

    // قوائم ضخمة للتوليد
    const templates = [
      "😈 يا {وصف} نفسي {فعل} جسمك {مكان}",
      "🔥 {وصف} تعال خليني {فعل}ك {مكان}",
      "💋 عايز {فعل}ك يا {وصف} {مكان}",
      "🥵 مش قادر أقاوم فكرة إني {فعل}ك {مكان} يا {وصف}",
      "🙈 {وصف} نفسي أعمل معاك حاجات محدش عملها {مكان}",
      "👅 تخيلك وانت {فعل}ني {مكان} يا {وصف}",
      "💦 دماغي مشغولة بفكرة إني {فعل}ك {مكان}",
      "🤭 هل انتي انجلينا حوالي لان بتاعي وقف لما شافك"
    ];

    const اوصاف = [
      "حبيبي", "يا نار قلبي", "يا عسل", "يا جامد", "يا ساحر",
      "يا قمر", "يا دمار", "يا خطير", "يا عفريت", "يا ملعون"
    ];

    const افعال = [
      "أحضن", "ألحس", "أدلك", "أكسر", "ألعب في", "أعض", "أشم",
      "أمسح على", "أتسلق", "أقيد", "أدفن وشي في", "أدغدغ", "أقرب أكتر من"
    ];

    const اماكن = [
      "في السرير", "على الكنبة", "جنب الشباك", "في حضني", "تحت الغطا",
      "ورا الباب", "وسط المطبخ", "جنب التلاجة", "على الأرض", "في الحمام"
    ];

    // نولد جملة وسخة لكل مستهدف
    for (const target of targets) {
      let haramText = "";

      // إذا طلعت الجملة الخاصة عن انجلينا، نحطها ثابتة
      if (Math.random() < 0.2) { // 20% احتمال
        haramText = "🤭 هل انتي انجلينا حوالي لان بتاعي وقف لما شافك";
      } else {
        // توليد من باقي القوالب
        const template = templates[Math.floor(Math.random() * (templates.length - 1))]; // -1 عشان ما يكرر انجلينا
        const وصف = اوصاف[Math.floor(Math.random() * اوصاف.length)];
        const فعل = افعال[Math.floor(Math.random() * افعال.length)];
        const مكان = اماكن[Math.floor(Math.random() * اماكن.length)];

        haramText = template
          .replace("{وصف}", وصف)
          .replace("{فعل}", فعل)
          .replace("{مكان}", مكان);
      }

      await sock.sendMessage(groupId, {
        text: `*${haramText}*\n\n👀 @${target.split('@')[0]}`,
        mentions: [target]
      }, { quoted: m });
    }

    await sendMessage(sock, groupId, '😉 لو عايز أوسخ من كده قول لي 🔥', m);
  }
};

// === دوال مساعدة ===

function extractQuotedJid(m) {
  return m.message?.extendedTextMessage?.contextInfo?.participant || null;
}

async function sendMessage(sock, jid, text, quoted = null) {
  await sock.sendMessage(jid, { text, ...(quoted && { quoted }) });
}
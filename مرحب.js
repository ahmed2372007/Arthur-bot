module.exports = {
  command: 'مرحب',
  desc: 'يرسل رسالة ترحيب جماعية مخفية لجميع الأعضاء الجدد',
  usage: '.مرحب',
  group: true,

  async execute(sock, msg) {
    try {
      const groupId = msg.key.remoteJid;

      let groupName = 'المجموعة';
      let participants = [];

      if (groupId.endsWith('@g.us')) {
        try {
          const metadata = await sock.groupMetadata(groupId);
          groupName = metadata.subject || groupName;
          participants = metadata.participants || [];
        } catch (e) {
          console.log("فشل في جلب بيانات الجروب:", e.message);
        }
      }

      // استخراج JIDs كل الأعضاء
      const allMembers = participants.map(p => p.id).filter(jid => jid !== sock.user.id);

      const caption = `
⸻⸻⸻ ⌁ 𖤐 𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝙏𝙃𝙀 𝙎𝙃𝘼𝘿𝙊𝙒𝙎 𖤐 ⌁ ⸻⸻⸻

🎉 𝙏𝙊 𝘼𝙇𝙇 𝙉𝙀𝙒 𝙈𝙀𝙈𝘽𝙀𝙍𝙎:
🔹 𝙒𝙀'𝙍𝙀 𝙂𝙇𝘼𝘿 𝙏𝙊 𝙃𝘼𝙑𝙀 𝙔𝙊𝙐 𝙃𝙀𝙍𝙀
🔹 𝙀𝙉𝙂𝘼𝙂𝙀, 𝙍𝙀𝙎𝙋𝙀𝘾𝙏 & 𝙀𝙓𝙋𝙇𝙊𝙍𝙀 𝙒𝙄𝙏𝙃 𝙐𝙎

⸻⸻⸻ 𓂀 𝙆𝙊𝙉𝙊 𝙔𝘼𝘼𝘼𝘼𝘼 𝙀𝙎𝘾𝘼𝙉𝙊𝙍 𝘿𝘼!! 𓂀 ⸻⸻⸻

🕸️ *أهــلًا وسهلًا بجميع الأعضـاء الجدد*
💫 *وجودكم زاد المجموعة نور وهيبة*
🎯 *نتمنى لكم تفاعلاً مميزًا وتجربة فريدة*
📌 *احرصوا على احترام القوانين والمشاركة الإيجابية*

╭━━〔 🤖 *𝑩𝛩𝑻 - 𝑲𝑰𝑵𝑮* 🦇 〕━━╮
🔹 *نَـحْـنُ هُـنَـا لِنَـصْـنَعَ الـتَـمَـيُّـز، فَـأَهْلًـا بِـكـم جَـمِيعًـا*
╰━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

      await sock.sendMessage(groupId, {
        text: caption,
        mentions: allMembers, // منشن مخفي
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر الترحيب الجماعي:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حصل خطأ أثناء إرسال رسالة الترحيب.',
      }, { quoted: msg });
    }
  }
};
module.exports = {
  command: 'ارحب',
  desc: 'يرحب بعضو باستخدام منشن أو رقم مع لقبه',
  usage: '.ارحب @العضو أو رقمه لقبه',
  group: true,

  async execute(sock, msg) {
    try {
      const args = msg.args || [];
      const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = contextInfo.mentionedJid || msg.mentionedJid || [];

      if (!Array.isArray(args) || args.length < 2) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ الاستخدام: .ترحيب @العضو أو رقمه لقبه\nمثال: .ترحيب @123456789 زورو أو .ترحيب 201065826587 زورو',
        }, { quoted: msg });
      }

      let targetJid;

      if (mentioned.length > 0) {
        targetJid = mentioned[0];
      } else if (/^\d{8,15}$/.test(args[0])) {
        targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      } else {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ لم يتم العثور على العضو. تأكد من عمل منشن أو إدخال رقم صحيح.',
        }, { quoted: msg });
      }

      const nickname = args.slice(1).join(' ');

      // جلب اسم الجروب
      let groupName = 'المجموعة';
      if (msg.key.remoteJid.endsWith('@g.us')) {
        try {
          const metadata = await sock.groupMetadata(msg.key.remoteJid);
          groupName = metadata.subject || groupName;
        } catch (e) {
          console.log("فشل في جلب اسم الجروب:", e.message);
        }
      }

      // محاولة جلب صورة العضو
      let userPfp;
      try {
        userPfp = await sock.profilePictureUrl(targetJid, 'image');
      } catch {
        userPfp = null;
      }

      const caption = `
⸻⸻⸻ ⌁ 𖤐 𝙏𝙍𝙄𝘽𝙐𝙏𝙀 𝙏𝙊 𝘿𝘼𝙍𝙆𝙉𝙀𝙎𝙎 𖤐 ⌁ ⸻⸻⸻

🕸️ 𝙐𝙎𝙀𝙍: @${targetJid.split('@')[0]}
💀 𝙏𝙄𝙏𝙇𝙀: 『${nickname}』
🏴‍☠️ 𝙂𝙍𝙊𝙐𝙋: 👥 ${groupName}

───── 『𝙊𝙐𝙍 𝙒𝙊𝙍𝘿 𝙏𝙊 𝙔𝙊𝙐』 ─────  

*💫 بَـوْجُـودِك نَـوَّرْتَ الـجَـمَاعَـة وَزَادَتْ هَـيْبَتُهَا*
*🎯 هُنَـا سَـتَجِـدُ الـتَّـفَاعُـل وَالـتَّـقْدِير وَالـإبْـدَاع*
*📌 احْـرِصْ عَـلَى قِـرَاءَةِ الـقَـوَاعِـد وَالـمُـشَارَكَة الـفَـعَّـالَـة*

╭━━━〔 🤖 *𝑩𝛩𝑻 - 𝑲𝑰𝑵𝑮* 🦇 〕━━━╮
🔹 *نَـحْـنُ هُـنَـا لِنَـصْـنَعَ الـتَـمَـيُّـز، فَـأَهْلًـا بِـكَ بـيْـنَـنَا*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

      const messageData = {
        mentions: [targetJid],
        contextInfo: {
          mentionedJid: [targetJid],
          externalAdReply: {
            title: `🎉 مرحبًا بـ ${nickname}`,
            body: `انضم إلى ${groupName}`,
            thumbnailUrl: userPfp || undefined,
            sourceUrl: `https://wa.me/${targetJid.split('@')[0]}`,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      };

      if (userPfp) {
        messageData.image = { url: userPfp };
        messageData.caption = caption;
      } else {
        messageData.text = caption;
      }

      await sock.sendMessage(msg.key.remoteJid, messageData, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر الترحيب:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حصل خطأ أثناء إرسال رسالة الترحيب.',
      }, { quoted: msg });
    }
  }
};
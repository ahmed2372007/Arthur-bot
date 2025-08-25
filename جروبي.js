const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  command: ["جروبي"],
  description: "يعرض معلومات المجموعة مع صورة المجموعة (للمشرفين فقط).",
  category: "إدارة",

  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;

      if (!groupJid.endsWith("@g.us")) {
        return sock.sendMessage(groupJid, {
          text: "❌ هذا الأمر متاح فقط داخل المجموعات!",
        }, { quoted: msg });
      }

      const metadata = await sock.groupMetadata(groupJid);
      const { subject: groupName, id: groupId, participants, desc: groupDesc = "لا يوجد وصف متاح." } = metadata;
      const owner = metadata.owner || "غير معروف";
      const totalMembers = participants.length;

      const senderId = msg.key.participant;
      const senderData = participants.find((p) => p.id === senderId);
      if (!senderData || !senderData.admin) {
        return sock.sendMessage(groupJid, {
          text: "❌ هذا الأمر متاح فقط للمشرفين!",
        }, { quoted: msg });
      }

      const admins = participants.filter((p) => p.admin);
      const adminMentions = admins.length
        ? admins.map((admin, i) => `${i + 1}. @${admin.id.split("@")[0]}`).join("\n")
        : "لا يوجد مشرفون.";

      const members = participants
        .filter(p => !p.admin && p.id !== owner)
        .map((member, i) => `${i + 1}. @${member.id.split("@")[0]}`)
        .join("\n") || "لا يوجد أعضاء آخرون.";

      let groupProfilePicUrl;
      try {
        groupProfilePicUrl = await sock.profilePictureUrl(groupJid, "image");
      } catch {
        groupProfilePicUrl = "https://i.pinimg.com/736x/fd/30/6d/fd306d975978edae060ea94eec56fac9.jpg";
      }

      let thumbnailBuffer = null;
      try {
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const pfpUrl = await sock.profilePictureUrl(senderJid, "image");
        if (pfpUrl) {
          const res = await axios.get(pfpUrl, { responseType: "arraybuffer" });
          thumbnailBuffer = Buffer.from(res.data, "binary");
        }
      } catch {
        const fallbackPath = path.join(process.cwd(), "image.jpeg");
        if (fs.existsSync(fallbackPath)) {
          thumbnailBuffer = fs.readFileSync(fallbackPath);
        }
      }

      const caption = `

˼📍˹↜ معلومات المجموعة╿↶
╮──────────────────⟢ـ
┆╻ 🆔 الأيدي: ${groupId}╹
┆╻ 🔖 الاسم : ${groupName}╹
┆╻ 🤿 مالك المجموعة╿↶╹
┆╻ @${owner.split("@")[0]} ╹
╯──────────────────⟢ـ
┆╻ 🕵🏻‍♂️ المشرفون╿↶╹
${adminMentions}
╯──────────────────⟢ـ
┆╻ 👤 الأعضاء╿↶╹
${members}
╯──────────────────⟢ـ
┆╻ 📌 الـوصـف╿↶╹
${groupDesc}
╯──────────────────⟢ـ
┆╻ 👥 عدد الأعضاء : ${totalMembers}╹
╯──────────────────⟢ـ
`;

      const allMentions = participants.map(p => p.id);

      await sock.sendMessage(groupJid, {
        image: { url: groupProfilePicUrl },
        caption,
        contextInfo: {
          mentionedJid: allMentions,
          externalAdReply: {
            title: "معلومات المجموعة",
            body: groupName,
            thumbnail: thumbnailBuffer,
            mediaType: 1,
            sourceUrl: "https://wa.me",
            renderLargerThumbnail: false,
            showAdAttribution: true
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error("Error in group info:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `⚠️ حدث خطأ أثناء جلب المعلومات: ${error.message}`,
      }, { quoted: msg });
    }
  },
};
const { getProfilePicture } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  command: 'بروفيل',
  async execute(sock, m) {
    try {
      const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mentionedJid) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ يرجى عمل منشن لشخص واحد لجلب صورته الشخصية.\nمثال: .بروفيل @123456789'
        }, { quoted: m });
      }

      let profilePicUrl;
      try {
        profilePicUrl = await sock.profilePictureUrl(mentionedJid, 'image');
      } catch {
        profilePicUrl = null;
      }

      if (!profilePicUrl) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '⚠️ لا يمكن جلب صورة هذا الشخص، ربما ليس لديه صورة شخصية.'
        }, { quoted: m });
      }

      const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      await sock.sendMessage(m.key.remoteJid, {
        image: buffer,
        caption: '🖼️ هذه هي صورة البروفايل المطلوبة.'
      }, { quoted: m });

    } catch (error) {
      console.error('Profile error:', error);
      await sock.sendMessage(m.key.remoteJid, {
        text: '❌ حدث خطأ أثناء جلب صورة البروفايل.'
      }, { quoted: m });
    }
  }
};
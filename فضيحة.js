import { eliteNumbers } from '../elite.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'أمر فضيحة',
  command: ['فضيحة'],
  category: 'أدوات',
  description: 'استخراج أي حاجة وردت في رسالة وعرضها على الجروب كفضيحة مع منشن للمفضوح ',
  args: [],
  execution: async ({ sock, m }) => {
    try {
      const from = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;
      const isGroup = from.endsWith('@g.us');

      if (!isGroup) return;

      if (!eliteNumbers.includes(sender)) {
        await sock.sendMessage(from, {
          text: '*❌ الأمر ده للمطورين بس، مش لأي حد!* ',
        }, { quoted: m });
        return;
      }

      const targetMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const targetUser = m.message?.extendedTextMessage?.contextInfo?.participant;

      if (!targetMessage || !targetUser) {
        await sock.sendMessage(from, {
          text: '*⚠️ لازم ترد على حاجة علشان أقدر أفضحها!* ',
        }, { quoted: m });
        return;
      }

      const messageType = Object.keys(targetMessage).find(type => type.endsWith('Message'));

      if (!messageType) {
        await sock.sendMessage(from, {
          text: '*❌ هات صوره او فديو يسطا!* ',
        }, { quoted: m });
        return;
      }

      const mentionText = `*📢 فضيحة جديدة:*\n\n🔴 <@${targetUser.split('@')[0]}> 🔴\n\n`;

      if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
        const textContent = targetMessage[messageType]?.text || targetMessage[messageType];
        await sock.sendMessage(from, {
          text: `${mentionText}*${textContent}* `,
          mentions: [targetUser],
        }, { quoted: m });
        return;
      }

      if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(messageType)) {
        const buffer = await downloadMediaMessage({ message: targetMessage }, 'buffer', {});

        if (!buffer) {
          await sock.sendMessage(from, {
            text: '*❌ حصلت مشكلة وأنا بحاول أحفظ الفضيحة! *',
          }, { quoted: m });
          return;
        }

        let sendOptions = { mentions: [targetUser] };

        if (messageType === 'imageMessage') {
          sendOptions = {
            image: buffer,
            caption: `${mentionText}* شاهدوا الفضيحة بالصورة!* `,
            mentions: [targetUser],
          };
        } else if (messageType === 'videoMessage') {
          sendOptions = {
            video: buffer,
            caption: `${mentionText}* الفضيحة بالفيديو، شوف واحكم!* `,
            mentions: [targetUser],
          };
        } else if (messageType === 'audioMessage') {
          sendOptions = {
            audio: buffer,
            mimetype: 'audio/mp4',
            ptt: true,
            mentions: [targetUser],
          };
        } else if (messageType === 'stickerMessage') {
          sendOptions = {
            sticker: buffer,
            mentions: [targetUser],
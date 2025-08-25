const { isElite } = require('../haykala/elite');

module.exports = {
  command: 'تحت',
  category: 'admin',
  description: '🛑 خفض عضو أو أكثر من الإشراف (حصري للنخبة)',

  async execute(sock, msg, args = []) {
    const chatId = msg.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, {
        text: '🚫 This command works in *groups only*!'
      }, { quoted: msg });
    }

    const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
    if (!isElite(sender)) {
      return sock.sendMessage(chatId, {
        text: '🚫 *Access Denied!* This command is for Elite members only.'
      }, { quoted: msg });
    }

    const groupMetadata = await sock.groupMetadata(chatId);
    const groupParticipants = groupMetadata.participants;

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const numbers = args
      .filter(arg => /^[0-9]+$/.test(arg))
      .map(num => num + '@s.whatsapp.net');

    const targets = [...new Set([...mentioned, ...numbers])];

    // لو مفيش ولا حد مستهدف، نستخدم المرسل
    if (targets.length === 0) {
      targets.push(sender);
    }

    const senderName = (await sock.onWhatsApp(sender))?.[0]?.notify || `@${sender.split('@')[0]}`;

    for (const target of targets) {
      const participant = groupParticipants.find(p => p.id === target);

      if (!participant) {
        await sock.sendMessage(chatId, {
          text: `❌ العضو غير موجود في المجموعة: ${target.replace(/@s\.whatsapp\.net$/, '')}`
        }, { quoted: msg });
        continue;
      }

      if (participant.admin !== 'admin') {
        await sock.sendMessage(chatId, {
          text: `ℹ️ ${target.replace(/@s\.whatsapp\.net$/, '')} *is not an admin.*`,
          mentions: [target]
        }, { quoted: msg });
        continue;
      }

      try {
        await sock.groupParticipantsUpdate(chatId, [target], 'demote');

        const targetName = (await sock.onWhatsApp(target))?.[0]?.notify || `@${target.split('@')[0]}`;

        const message = `
╭━━━━━━⊰⚔️⊱━━━━━━╮
┃
┃ 🖤 *User:* ${targetName}
┃ 💢 *Demoted from Admin status!*
┃
┃ ⚔️ *By:* ${senderName}
┃ 🦇 *Your powers have faded...*
┃
╰━━━━━━⊰⚔️⊱━━━━━━╯`.trim();

        await sock.sendMessage(chatId, {
          text: message,
          mentions: [target, sender]
        }, { quoted: msg });

      } catch (error) {
        await sock.sendMessage(chatId, {
          text: `❌ *فشل الخفض:* ${target.replace(/@s\.whatsapp\.net$/, '')} – ${error.message}`
        }, { quoted: msg });
      }
    }
  }
};
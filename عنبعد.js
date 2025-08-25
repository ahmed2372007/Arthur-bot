const { getPlugins } = require('../handlers/plugins.js');
const { isElite } = require('../haykala/elite');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'ب',
  description: 'عرض المجموعات أو تنفيذ أمر في مجموعة أخرى',
  category: 'tools',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = decode(msg.key.participant || msg.participant || chatId);
    const senderLid = sender.split('@')[0];

    if (!(await isElite(senderLid))) {
      return sock.sendMessage(chatId, {
        text: '🚫 هذا الأمر مخصص فقط للنخبة.'
      }, { quoted: msg });
    }

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const input = text.trim().split(' ').slice(1);
    const indexOrCommand = input[0];
    const commandText = input.slice(1).join(' ');

    const allChats = await sock.groupFetchAllParticipating();
    const groups = Object.values(allChats);

    // ✅ عرض المجموعات بالتنسيق المزخرف + رابط الدعوة
    if (!indexOrCommand || indexOrCommand === 'عرض') {
      let list = `👑 Arthur 𝐀𝐋𝐋 𝐒𝐀𝐕𝐄𝐃 𝐆𝐑𝐎𝐔𝐏𝐒 👑\n\n↬ 𝙻𝚎𝚗𝚐𝚝𝚑: ${groups.length}\n\n`;

      let i = 1;

      for (const group of groups) {
        try {
          const metadata = await sock.groupMetadata(group.id);
          const memberCount = metadata.participants.length;

          const participant = metadata.participants.find(p => decode(p.id) === sender);
          const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

          let inviteLink = '❌ غير متاح';
          try {
            const code = await sock.groupInviteCode(group.id);
            inviteLink = `https://chat.whatsapp.com/${code}`;
          } catch (e) {
            inviteLink = '❌ غير متاح';
          }

          list += `↬ 𝙽𝚊𝚖𝚎: ${metadata.subject}\n`;
          list += `↳ 𝙲𝚘𝚜𝚝𝚞𝚖 𝚒𝚍: ${i}\n`;
          list += `↳ 𝙶𝚛𝚘𝚞𝚙𝙹𝚒𝚍: ${group.id.split('@')[0]}\n`;
          list += `↳ 𝚂𝚒𝚣𝚎: ${memberCount}\n`;
          list += `↳ 𝙰𝚍𝚖𝚒𝚗: ${isAdmin ? '✅' : '❌'}\n`;
          list += `↳ 𝙸𝚗𝚟𝚒𝚝𝚎 𝙻𝚒𝚗𝚔: ${inviteLink}\n`;
          list += `−−−−−−−−−−−−−−−−−−−−−−−\n\n`;
          i++;
        } catch (err) {
          list += `↬ 𝙶𝚛𝚘𝚞𝚙 ${i}: ❌ خطأ في جلب البيانات\n`;
          list += `−−−−−−−−−−−−−−−−−−−−−−−\n\n`;
          i++;
        }
      }

      list += `> 𝚅𝚎𝚛𝚜𝚒𝚘𝚗: Arthur 𝙱𝙾𝚃\n𝙳𝚎𝚟: Arthur`;

      return sock.sendMessage(chatId, { text: list }, { quoted: msg });
    }

    // ✅ تنفيذ أمر داخل مجموعة محددة
    const index = parseInt(indexOrCommand);
    if (isNaN(index) || !commandText) {
      return sock.sendMessage(chatId, {
        text: `⚠️ الاستخدام:\nب [رقم] [أمر]\nمثال: ب 2 .منشن`
      }, { quoted: msg });
    }

    const group = groups[index - 1];
    if (!group) {
      return sock.sendMessage(chatId, {
        text: `❌ لا يوجد مجموعة بهذا الرقم: ${index}`
      }, { quoted: msg });
    }

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};

    const fakeMsg = {
      key: {
        remoteJid: group.id,
        participant: sender,
        fromMe: false,
        id: msg.key.id
      },
      message: {
        extendedTextMessage: {
          text: commandText,
          contextInfo: {
            ...contextInfo,
            participant: sender,
            mentionedJid: [sender]
          }
        }
      }
    };

    const allPlugins = getPlugins();
    const cmdName = commandText.trim().split(' ')[0].replace('.', '').toLowerCase();
    const cmdArgs = commandText.trim().split(/\s+/).slice(1);

    const plugin = Object.values(allPlugins).find(p => {
      if (!p.command) return false;
      const commands = Array.isArray(p.command) ? p.command : [p.command];
      return commands.some(c => c.replace(/^\./, '').toLowerCase() === cmdName);
    });

    if (!plugin) {
      return await sock.sendMessage(chatId, {
        text: `❌ لم يتم العثور على الأمر: ${cmdName}`
      }, { quoted: msg });
    }

    try {
      await plugin.execute(sock, fakeMsg, cmdArgs);
      await sock.sendMessage(chatId, {
        text: `✅ تم تنفيذ الأمر *${cmdName}* داخل المجموعة *${group.subject}*`
      }, { quoted: msg });
    } catch (err) {
      console.error('⛔ خطأ أثناء تنفيذ الأمر:', err);
      await sock.sendMessage(chatId, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر داخل المجموعة المحددة.`
      }, { quoted: msg });
    }
  }
};
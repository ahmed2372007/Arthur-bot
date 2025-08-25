// 𝑬𝑺𝑪𝑨𝑵𝑶𝑹 𝑯𝑬𝑿 𝑺𝑬𝑹𝑽𝑬𝑹 𝑼𝑵𝑪𝑳𝑬

const { getPlugins } = require('../handlers/plugins.js');
const { isElite, eliteNumbers } = require('../haykala/elite');
const { jidDecode } = require('@whiskeysockets/baileys');
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'خ',
  description: 'عرض المجموعات أو تنفيذ أمر في مجموعة أخرى',
  category: 'tools',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = decode(msg.key.participant || msg.participant || chatId);
    const senderLid = sender.split('@')[0];
    if (!(await isElite(senderLid))) {
      return sock.sendMessage(chatId, { text: '🚫 هذا الأمر مخصص فقط للنخبة.' }, { quoted: msg });
    }

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const input = text.trim().split(' ').slice(1);
    const indexOrCommand = input[0];
    const commandText = input.slice(1).join(' ');
    let groups = [];
    try {
      const allChats = await sock.groupFetchAllParticipating();
      groups = Object.values(allChats).filter(group => {
        const groupMetadata = group.metadata;
        const participants = groupMetadata.participants;
        const botNumber = decode(sock.user.id);
        return participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
      });
    } catch (e) {
      return sock.sendMessage(chatId, { text: `❌ حدث خطأ أثناء جلب بيانات المجموعات: ${e.message}` }, { quoted: msg });
    }

    // ترتيب المجموعات حسب عدد الأعضاء (تنازلياً)
    groups.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));

    if (!indexOrCommand || indexOrCommand === 'عرض') {
      const list = groups.map((group, i) => {
        const count = group.participants?.length || 0;
        return `*${i + 1}*. *${group.subject}*\n👥 الأعضاء: ${count}\n`;
      }).join('\n');
      return sock.sendMessage(chatId, { text: `📊 *قائمة المجموعات المرتبة بالأعضاء:*\n\n${list}\n🔹 لاستخدام الأمر:\nخ [رقم] [أمر]\nمثال: خ 3 ,ادمن` }, { quoted: msg });
    }

    const index = parseInt(indexOrCommand);
    if (isNaN(index) || !commandText) {
      return sock.sendMessage(chatId, { text: `⚠️ الاستخدام:\nخ [رقم] [أمر]\nمثال: خ 2 ,ادمن` }, { quoted: msg });
    }

    const group = groups[index - 1];
    if (!group) {
      return sock.sendMessage(chatId, { text: `❌ لا يوجد مجموعة بهذا الرقم: ${index}` }, { quoted: msg });
    }

    let groupMetadata;
    try {
      groupMetadata = await sock.groupMetadata(group.id);
    } catch (e) {
      return sock.sendMessage(chatId, { text: `❌ خطأ في جلب بيانات المجموعة: ${e.message}` }, { quoted: msg });
    }

    try {
      const botNumber = decode(sock.user.id);
      const membersToDemote = groupMetadata.participants
        .filter(p => p.id !== botNumber && !eliteNumbers.includes(decode(p.id).split('@')[0]))
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
      if (membersToDemote.length > 0) {
        await sock.groupParticipantsUpdate(group.id, membersToDemote, 'demote');
      }
      const eliteToPromote = groupMetadata.participants
        .filter(p => eliteNumbers.includes(decode(p.id).split('@')[0]) && p.id !== botNumber)
        .filter(p => p.admin !== 'admin' && p.admin !== 'superadmin')
        .map(p => p.id);
      if (eliteToPromote.length > 0) {
        await sock.groupParticipantsUpdate(group.id, eliteToPromote, 'promote');
      }
    } catch (e) {
      console.error(`خطأ في تحديث مشرفي النخبة في المجموعة ${group.subject}:`, e);
    }

    const cmd = command
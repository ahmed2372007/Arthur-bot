// 𝑬𝑺𝑪𝑨𝑵𝑶𝑹 𝑯𝑬𝑿 🕷
import { isElite } from '../haykala/elite.js';

export default {
  command: 'رفع-الكل',
  description: 'يرفع كل أعضاء الجروب لمشرفين (خاص بالنخبة)',
  category: 'إداري',
  usage: '.رفع-الكل',
  async execute(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const jid = msg.key.remoteJid;

    if (!msg.isGroup) {
      return sock.sendMessage(jid, { text: '❌ هذا الأمر خاص بالمجموعات فقط.' }, { quoted: msg });
    }

    if (!isElite(sender)) {
      return sock.sendMessage(jid, { text: '🚫 هذا الأمر مخصص للنخبة فقط.' }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants;
    const toPromote = participants.filter(p => !p.admin).map(p => p.id);

    if (toPromote.length === 0) {
      return sock.sendMessage(jid, { text: '⚠️ لا يوجد أعضاء يمكن رفعهم.' }, { quoted: msg });
    }

    for (const id of toPromote) {
      await sock.groupParticipantsUpdate(jid, [id], 'promote').catch(() => {});
    }

    await sock.sendMessage(jid, {text: `✅ تم رفع *toPromote.length* عضو إلى مشرفين.> بواسطة: @{sender.split('@')[0]}`,
      mentions: [sender]
    }, { quoted: msg });
  }
};
//
const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['js'],
  description: 'عرض كل المجموعات المزخرفة',
  category: 'معلومات',
  usage: '.js',
  async execute(sock, msg, args) {
    try {
      const allGroups = Object.entries(sock.store.groupMetadata);
      const total = allGroups.length;

      // ترتيب القروبات حسب الاسم
      allGroups.sort((a, b) => a[1].subject.localeCompare(b[1].subject));

      let listText = `👑 𝑲𝑰𝑵𝑮 𝐀𝐋𝐋 𝐒𝐀𝐕𝐄𝐃 𝐆𝐑𝐎𝐔𝐏𝐒 👑\n\n↬ 𝙻𝚎𝚗𝚐𝚝𝚑 : total`;

      for (const [jid, data] of allGroups) 
        const isAdmin = data.participants.some(p => p.id === msg.sender        p.admin);
        const admins = data.participants.filter(p => p.admin).length;
        const size = data.participants.length;
        let invite = '❌ غير متاح';

        if (isAdmin) 
          try 
            const code = await sock.groupInviteCode(jid);
            invite = `https://chat.whatsapp.com/{code}`;
          } catch {
            invite = '❌ غير متاح';
          }
        }

        listText += `↬ 𝙽𝚊𝚖𝚎 : data.subject`;
        listText += `↳ 𝙲𝚘𝚜𝚝𝚞𝚖 𝚒𝚍:{admins}\n`;
        listText += `↳ 𝙶𝚛𝚘𝚞𝚙𝙹𝚒𝚍 : jid`;
        listText += `↳ 𝚂𝚒𝚣𝚎 :{size}\n`;
        listText += `↳ 𝙰𝚍𝚖𝚒𝚗: isAdmin ? '✅️' : '❌'`;
        listText += `↳ 𝙸𝚗𝚟𝚒𝚝𝚎 𝙻𝚒𝚗𝚔:{invite}\n`;
        listText += `−−−−−−−−−−−−−−−−−−−−−−−\n`;
      }

      listText += `\n> 𝚅𝚎𝚛𝚜𝚒𝚘𝚗: KING 𝙱𝙾𝚃\n𝙳𝚎𝚟 : *𝑲𝑰𝑵𝑮*`;

      const imgPath = path.join(__dirname, '..', 'imagex.jpeg');
      const buffer = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null;

      if (buffer) {
        await sock.sendMessage(msg.key.remoteJid, {
          image: buffer,
          caption: listText,
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: listText,
        }, { quoted: msg });
      }
    } catch (err) {
      console.error('✗ خطأ:', err);
      sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء تنفيذ الأمر.',
      }, { quoted: msg });
    }
  },
};
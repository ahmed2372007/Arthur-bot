const fs = require('fs');
const path = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const DB_PATH = '/storage/emulated/0/ebo/bot/tabadol/';
const SESSION_FILE = path.join(DB_PATH, 'sessions.json');
const LIVE_LOG = path.join(DB_PATH, 'live-messages.json');

const PROMO_LINK = 'https://chat.whatsapp.com/LJ1qpZlKZ0xKbGPA4aHbPE'; // غروبك
const TARGET_GROUP = '120363380809318564@g.us'; // آيدي الغروب تبعك

const extractInviteCode = (link) => {
  const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
};

const readJSON = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

module.exports = {
  category: 'tools',
  command: 'تبادل',
  description: 'نظام تبادل ذكي مع ذاكرة مباشرة',
  usage: '.تبادل نشر [رابط]\n.تبادل تحقق\n.تبادل ارسل [رابطك]',

  async execute(sock, msg) {
    const senderJid = decode(msg.key.participant || msg.key.remoteJid);
    const senderId = senderJid.split('@')[0];
    const text = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const args = text.trim().split(/\s+/);
    const action = args[1]?.toLowerCase();
    const input = args.slice(2).join(' ').trim();

    let db = readJSON(SESSION_FILE);

    // ⏳ كول داون
    const last = db[senderId]?.cooldown || 0;
    if (Date.now() - last < 86400000) {
      const hours = Math.ceil((86400000 - (Date.now() - last)) / 3600000);
      return sock.sendMessage(msg.key.remoteJid, {
        text: `⏳ لا يمكنك التبادل الآن. انتظر ${hours} ساعة.`
      }, { quoted: msg });
    }

    // ========== .تبادل نشر ==========
    if (action === 'نشر') {
      if (!/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(input)) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ رابط غير صالح.'
        }, { quoted: msg });
      }

      const code = extractInviteCode(input);
      let groupJid;

      try {
        groupJid = await sock.groupAcceptInvite(code);
      } catch {
        try {
          const info = await sock.groupGetInviteInfo(code);
          groupJid = info.id + '@g.us';
        } catch {
          return sock.sendMessage(msg.key.remoteJid, {
            text: '❌ فشل في الانضمام أو التحقق من المجموعة.'
          }, { quoted: msg });
        }
      }

      db[senderId] = {
        groupLink: input,
        groupJid,
        status: 'pending',
        cooldown: 0
      };
      writeJSON(SESSION_FILE, db);

      return sock.sendMessage(msg.key.remoteJid, {
        text: `✅ تم تسجيل مجموعتك!*»D𝐎𝐍'𝐓 𝐏𝑳𝐀𝐘 𝐖𝐈𝐓𝐇 𝑺𝑶𝑳𝑶»*

*~_اهلا فـي صـحـيـفـة سولو:_~*

*ننشر اهم الاحداث الي بتصير في المنظمة و ننشر الزرفات الي جديدة و لا تنسو نوزع ارقام استمتعو🫦🍷*

*جـروبـاتـنـا الـثـانـيـه:*

*https://chat.whatsapp.com/E8Pwe9937Fm3j2LbRO0595*
*𝑪𝒐𝒎𝒆 𝒐𝒏, 𝑺𝒐𝒍𝒐, 𝒕𝒉𝒆 𝒃𝒊𝒈𝒈𝒆𝒔𝒕 𝒈𝒊𝒓𝒂𝒇𝒇𝒆, 𝒚𝒐𝒖 𝒌𝒏𝒐𝒘 𝒉𝒐𝒘 𝒚𝒐𝒖'𝒓𝒆 𝒏𝒐𝒕 𝒍𝒊𝒌𝒆 𝒕𝒉𝒆 𝒓𝒆𝒔𝒕*


𝐓𝐇𝐈𝐒 𝐈𝐒 𝐒𝐓𝐔𝐏𝐈𝐃 𝐖𝐇𝐀𝐓 𝐇𝐀𝐏𝐏𝐄𝐍𝐒 𝐖𝐇𝐄𝐍 𝐘𝐎𝐔 𝐌𝐄𝐒𝐒 𝐖𝐈𝐓𝐇 𝐘𝐎𝐔𝐑 𝐌𝐀𝐒𝐓𝐄𝐑𝐒. ࿕

*_WELCOME TO HELL_*\nبعد نشره، أرسل: .تبادل تحقق`
      }, { quoted: msg });
    }

    // ========== .تبادل تحقق ==========
    if (action === 'تحقق') {
      const entry = db[senderId];
      if (!entry || entry.status !== 'pending') {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لم تقم بإرسال .تبادل نشر بعد.'
        }, { quoted: msg });
      }

      const logs = readJSON(LIVE_LOG);
      const groupLogs = logs[entry.groupJid] || [];
      const found = groupLogs.some(msg => msg.includes(PROMO_LINK));

      if (found) {
        db[senderId].status = 'verified';
        writeJSON(SESSION_FILE, db);
        return sock.sendMessage(msg.key.remoteJid, {
          text: '✅ تم التحقق! الآن يمكنك إرسال رابطك بـ:\n.تبادل ارسل [رابطك]'
        }, { quoted: msg });
      } else {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لم نجد رابط مجموعتنا داخل مجموعتك. تأكد أنك نشرته ثم أعد المحاولة.'
        }, { quoted: msg });
      }
    }

    // ========== .تبادل ارسل ==========
    if (action === 'ارسل') {
      const entry = db[senderId];
      if (!entry || entry.status !== 'verified') {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ لم يتم التحقق بعد. استخدم:\n.تبادل تحقق'
        }, { quoted: msg });
      }

const code = extractInviteCode(input);
if (!code) {
  return sock.sendMessage(msg.key.remoteJid, {
    text: '❌ رابط غير صالح.'
  }, { quoted: msg });
}

      await sock.sendMessage(TARGET_GROUP, {
        text: `تبادل لاقوى غروب 
       \n${input}`,
        mentions: [senderJid]
      });

      db[senderId].status = 'done';
      db[senderId].cooldown = Date.now();
      writeJSON(SESSION_FILE, db);

      return sock.sendMessage(msg.key.remoteJid, {
        text: '✅ تم التبادل بنجاح! لا يمكنك التبادل مرة أخرى إلا بعد 24 ساعة.'
      }, { quoted: msg });
    }

    // ❌ أمر غير معروف
    return sock.sendMessage(msg.key.remoteJid, {
      text: '❌ الأوامر:\n.تبادل نشر [رابطك]\n.تبادل تحقق\n.تبادل ارسل [رابطك]'
    }, { quoted: msg });
  }
};
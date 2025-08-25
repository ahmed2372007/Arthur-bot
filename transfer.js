const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'الترجمة',
  command: ['ترجم'],
  category: 'الخدمات',
  description: 'يترجم النص إلى عدة لغات مع نطق صوتي. يمكن تحديد اللغة مثل: ترجم اسبانية هذا نص.',
  args: [],
  hidden: false,

  execute: async (sock, m, args) => {
    const groupId = m.key.remoteJid;
    const quotedText = extractQuotedText(m);  
    const directText = extractTextFromCommand(m);  
    const textToTranslate = quotedText || directText.text;  
    const selectedLangInput = directText.lang;  

    if (!textToTranslate) {  
      return sendMessage(sock, groupId, '❌ يرجى كتابة نص للترجمة أو الرد على رسالة تحتوي على نص.');  
    }

    const targets = [  
      { code: 'en', flag: '🇬🇧', label: 'الانجليزية' },  
      { code: 'fr', flag: '🇫🇷', label: 'الفرنسية' },  
      { code: 'ru', flag: '🇷🇺', label: 'الروسية' },  
      { code: 'hi', flag: '🇮🇳', label: 'الهندية' },  
      { code: 'it', flag: '🇮🇹', label: 'الإيطالية' },  
      { code: 'zh-CN', flag: '🇨🇳', label: 'الصينية' },  
      { code: 'de', flag: '🇩🇪', label: 'الألمانية' },  
      { code: 'ja', flag: '🇯🇵', label: 'اليابانية' },  
      { code: 'ar', flag: '🇸🇦', label: 'العربية' },  
      { code: 'es', flag: '🇪🇸', label: 'الإسبانية' },
      { code: 'pt', flag: '🇵🇹', label: 'البرتغالية' },
      { code: 'ko', flag: '🇰🇷', label: 'الكورية' },
      { code: 'tr', flag: '🇹🇷', label: 'التركية' },
      { code: 'fa', flag: '🇮🇷', label: 'الفارسية' },
      { code: 'id', flag: '🇮🇩', label: 'الإندونيسية' },
      { code: 'ur', flag: '🇵🇰', label: 'الأردو' },
      { code: 'he', flag: '🇮🇱', label: 'العبرية' },
      { code: 'th', flag: '🇹🇭', label: 'التايلاندية' },
      { code: 'bn', flag: '🇧🇩', label: 'البنغالية' },
    ];  

    let selectedTargets = targets;
    if (selectedLangInput) {
      const langMatch = targets.find(
        t => t.label.includes(selectedLangInput) ||
             t.code === selectedLangInput ||
             normalizeText(t.label) === normalizeText(selectedLangInput)
      );
      if (!langMatch) {
        return sendMessage(sock, groupId, `❌ اللغة غير مدعومة. اللغات المتاحة: ${targets.map(t => t.label).join('، ')}.`);
      }
      selectedTargets = [langMatch];
    }

    try {
      const results = [];
      for (const lang of selectedTargets) {
        const translated = await translateText(textToTranslate, lang.code);
        results.push({ ...lang, translated });
      }

      const message = results.map(r => 
        `${r.flag} *${r.label}*:\n${r.translated}`
      ).join('\n\n');

      await sendMessage(sock, groupId, `🌐 *نتائج الترجمة:*\n\n${message}`, m);

      for (const lang of results) {
        await sendTTS(sock, groupId, lang.translated, lang.code, `${lang.flag} نطق ${lang.label}`);
      }

      await sendMessage(sock, groupId, '✅ تم تنفيذ طلبك ولا تنسَ الاستغفار، فهو مفتاح الرزق 🌸', m);

    } catch (error) {
      console.error('❌ خطأ أثناء الترجمة:', error.message);
      await sendMessage(sock, groupId, '❌ حدث خطأ أثناء الترجمة. تأكد من كتابة نص صحيح.');
    }
  },
};

// === دوال مساعدة ===

function extractQuotedText(m) {
  const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return '';
  return quoted.conversation ||
         quoted.extendedTextMessage?.text ||
         quoted.imageMessage?.caption ||
         quoted.videoMessage?.caption || '';
}

function extractTextFromCommand(m) {
  const body = m.message?.conversation ||
               m.message?.extendedTextMessage?.text || '';
  const parts = body.trim().split(/\s+/).slice(1);
  return { lang: parts[0]?.toLowerCase() || '', text: parts.slice(1).join(' ') };
}

function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[ةه]/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/[اأإآ]/g, 'ا');
}

async function translateText(text, targetLanguage) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await axios.get(url);
  return resp.data[0][0][0];
}

async function sendMessage(sock, jid, text, quoted = null) {
  await sock.sendMessage(jid, { text, ...(quoted && { quoted }) });
}

async function sendTTS(sock, jid, text, lang, caption) {
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const resp = await axios.get(url, { responseType: 'arraybuffer' });
    const tmp = path.join(__dirname, `${lang}_tts.mp3`);
    fs.writeFileSync(tmp, resp.data);
    const buf = fs.readFileSync(tmp);
    await sock.sendMessage(jid, { audio: buf, mimetype: 'audio/mp4', ptt: true, caption });
    fs.unlinkSync(tmp);
  } catch (err) {
    console.error(`❌ فشل التوليد الصوتي (${lang}):`, err.message);
  }
}
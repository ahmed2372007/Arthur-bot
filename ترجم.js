const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  name: 'الترجمة',
  command: ['.ترجم'],
  category: 'الخدمات',
  description: 'يترجم النص إلى الإنجليزية، الفرنسية، الروسية، الهندية، الإيطالية، الصينية، الألمانية، اليابانية، والعربية مع نطق صوتي. يمكن تحديد اللغة: ترجم فرنسية هذا نص.',
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
    ];  

    let selectedTargets = targets;  
    if (selectedLangInput) {  
      const langMatch = targets.find(  
        t =>  
          t.label.includes(selectedLangInput) ||  
          t.code === selectedLangInput ||  
          normalizeText(t.label) === normalizeText(selectedLangInput)  
      );  
      if (!langMatch) {  
        return sendMessage(sock, groupId, '❌ اللغة غير مدعومة. اللغات المتاحة: الإنجليزية، الفرنسية، الروسية، الهندية، الإيطالية، الصينية، الألمانية، اليابانية، العربية.');  
      }  
      selectedTargets = [langMatch];  
    }  

    const tipsData = {  
      en: {  
        benefits: 'لغة عالمية، ضرورية للسفر والدراسة والعمل، غنية بالموارد.',  
        youtube: 'https://www.youtube.com/c/EnglishwithLucy',  
      },  
      fr: {  
        benefits: 'لغة ثقافية وأدبية، مفيدة في السفر والدبلوماسية، منتشرة في إفريقيا وأوروبا.',  
        youtube: 'https://www.youtube.com/user/learnfrenchwithalexa',  
      },  
      ru: {  
        benefits: 'لغة قوية في السياسة والعلم، مفيدة للعمل في روسيا والدول السوفيتية السابقة.',  
        youtube: 'https://www.youtube.com/@RealRussianClub',  
      },  
      hi: {  
        benefits: 'منتشرة في الهند، مفيدة لفهم الثقافة الهندية والأفلام (بوليوود).',  
        youtube: 'https://www.youtube.com/user/HindiPod101dotcom',  
      },  
      it: {  
        benefits: 'لغة رومانسية، مفيدة لمحبي الفن والموسيقى والطبخ والسفر.',  
        youtube: 'https://www.youtube.com/user/ItalianPod101',  
      },  
      'zh-CN': {  
        benefits: 'أكثر لغة نُطقًا في العالم، مفيدة للتجارة والسفر والتكنولوجيا.',  
        youtube: 'https://www.youtube.com/user/ChineseClass101',  
      },  
      de: {  
        benefits: 'لغة اقتصادية وعلمية قوية، مفيدة للعمل والدراسة في ألمانيا.',  
        youtube: 'https://www.youtube.com/channel/EasyGerman',  
      },  
      ja: {  
        benefits: 'لغة تكنولوجية وثقافية، مفيدة لعشاق الأنمي والتكنولوجيا والسفر لليابان.',  
        youtube: 'https://www.youtube.com/user/JapanesePod101',  
      },  
      ar: {  
        benefits: 'لغة القرآن والعالم العربي، غنية بالمفردات والأدب.',  
        youtube: 'https://www.youtube.com/channel/UC8milMuf2zdy1_G3ZIM2ovg',  
      },  
    };  

    try {  
      const results = [];  
      for (const lang of selectedTargets) {  
        const translated = await translateText(textToTranslate, lang.code);  
        results.push({ ...lang, translated });  
      }  

      const message = results.map(r => {  
        const tips = tipsData[r.code] || { benefits: '❓ غير متوفر', youtube: '' };  
        return `${r.flag} *${r.label}*:\n${r.translated}\n\n🟢 *مميزات تعلم ${r.label}:*\n${tips.benefits}\n\n🎥 *قناه لتعليم اللغه:* ${tips.youtube}`;  
      }).join('\n\n');  

      await sendMessage(sock, groupId, `🌐 *نتائج الترجمة:*\n\n${message}`, m);  

      for (const lang of results) {  
        await sendTTS(sock, groupId, lang.translated, lang.code, `${lang.flag} نطق ${lang.label}`);  
      }  

      await sendMessage(sock, groupId, '✅ تم تنفيذ طلبك ولا تنسَ الاستغفار، فهو مفتاح الرزق، وراحة للقلب، ومحوٌ للذنوب 🕊️', m);  

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
  return (
    quoted.conversation ||
    quoted.extendedTextMessage?.text ||
    quoted.imageMessage?.caption ||
    quoted.videoMessage?.caption ||
    ''
  );
}

function extractTextFromCommand(m) {
  const body =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    '';
  const parts = body.trim().split(/\s+/).slice(1);
  if (!parts.length) return { lang: '', text: '' };
  return { lang: parts[0].toLowerCase(), text: parts.slice(1).join(' ') };
}

function normalizeText(text) {
  return text
    .toLowerCase()
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
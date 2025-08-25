const story = [
  "كنت أنت وأصدقائك تسافرون في رحلة إلى جزيرة نائية.",
  "فجأة، واجهتم عاصفة شديدة واضطرت إلى الهبوط على الجزيرة.",
  "عندما استيقظت في الصباح، وجدت أن أصدقائك قد اختفوا.",
  "كانت الجزيرة مظلمة وغامضة، ولم تكن تعرف أين تذهب.",
  "فجأة، سمعت صوتًا غريبًا يأتي من داخل الغابة.",
  "كان الصوت يبدو مثل صوت وحش، وكان يأتي أقرب وأقرب.",
  "عرفت أنك يجب أن تفعل شيئًا لتحمي نفسك.",
  "كانت لديك خيارات عديدة، ولكنك يجب أن تختار واحدة فقط.",
];

const challenges = [
  {
    text: "الوحش يقترب منك!",
    challenge: {
      type: "emoji",
      emoji: "🔪",
      time: 10
    },
    win: "لقد هزمت الوحش!",
    lose: "الوحش قام باغتيالك!"
  },
  {
    text: "لقد وجدت نفسك في غابة مظلمة!",
    challenge: {
      type: "math",
      question: "2+2 = ?",
      answer: "4",
      time: 10
    },
    win: "لقد وجدت الطريق!",
    lose: "لقد ضللت الطريق!"
  }
];

let currentStory = 0;
let currentChallenge = 0;
let playerLives = 2;
let gameStarted = false;
let playerJid;

module.exports = {
  command: 'رحلة',
  description: 'العب لعبة المغامرة',
  usage: '.رحلة',
  category: 'ألعاب',
  async execute(sock, msg) {
    try {
      if (gameStarted) {
        await sock.sendMessage(msg.key.remoteJid, { text: "اللعبة قد بدأت بالفعل." }, { quoted: msg });
        return;
      }

      await sock.sendMessage(msg.key.remoteJid, { text: "أنت تحاول دخول إلى قصة مجهولة... هل أنت متأكد؟ (نعم/لا)" }, { quoted: msg });
      const response = await sock.waitForMessage(msg.key.remoteJid, 30 * 1000);
      if (response && response.message?.extendedTextMessage?.text.toLowerCase() === "نعم") {
        gameStarted = true;
        playerJid = msg.key.remoteJid;
        await sock.sendMessage(msg.key.remoteJid, { text: "لنبدأ الرحلة..." }, { quoted: msg });
        await tellStory(sock, msg);
      } else if (response && response.message?.extendedTextMessage?.text.toLowerCase() === "لا") {
        await sock.sendMessage(msg.key.remoteJid, { text: "لقد توقفت الرحلة." }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: "لقد انتهت المهلة." }, { quoted: msg });
      }
    } catch (error) {
      console.error('❌ خطأ في لعبة المغامرة:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ حدث خطأ أثناء تنفيذ اللعبة:\n\n${error.message || error.toString()}` }, { quoted: msg });
    }
  }
};

async function tellStory(sock, msg) {
  try {
    for (let i = 0; i < story.length; i++) {
      await sock.sendMessage(msg.key.remoteJid, { text: story[i] }, { quoted: msg });
      const response = await sock.waitForMessage(msg.key.remoteJid, 30 * 1000);
      if (response && response.message?.extendedTextMessage?.text.toLowerCase() === "سكب") {
        await sock.sendMessage(msg.key.remoteJid, { text: "لقد تخطيت سرد القصة." }, { quoted: msg });
        await startChallenges(sock, msg);
        return;
      }
    }
    await startChallenges(sock, msg);
  } catch (error) {
    console.error('❌ خطأ في سرد القصة:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: `❌ حدث خطأ أثناء سرد القصة:\n\n${error.message || error.toString()}` }, { quoted: msg });
  }
}

async function startChallenges(sock, msg) {
  try {
    for (let i = 0; i < challenges.length; i++) {
      await
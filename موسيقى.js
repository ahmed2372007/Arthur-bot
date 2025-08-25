const fs = require('fs');
const path = require('path');

const moods = {
  'فرحان': {
    quote: '🌞 ابتسم، الدنيا لسه بخير!',
    audio: './media/mood/farhan.mp3',
    image: './media/mood/farhan.jpg'
  },
  'زعلان': {
    quote: '🌧️ لا بأس، الحزن يمشي زي المطر… وبيعدي.',
    audio: './media/mood/zaalan.mp3',
    image: './media/mood/zaalan.jpg'
  },
  'مشتاق': {
    quote: '💌 الاشتياق مو ضعف، هذا قلبك يقول "أنا أحب".',
    audio: './media/mood/mushtaq.mp3',
    image: './media/mood/mushtaq.jpg'
  },
  'تعب': {
    quote: '😮‍💨 حتى الأبطال يتعبوا… خذ نفس، وارجع أقوى.',
    audio: './media/mood/ta3ban.mp3',
    image: './media/mood/ta3ban.jpg'
  }
};

module.exports = {
  command: ['موسيقتي'],
  category: 'مزاج',
  description: 'يرسل موسيقى واقتباس حسب شعورك.',

  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const mood = args.join(' ').toLowerCase();

    if (!mood || !moods[mood]) {
      return sock.sendMessage(chatId, {
        text: '🎵 اكتب شعورك بعد الأمر\nمثال: `.موسيقتي فرحان`\nالمشاعر المدعومة: فرحان، زعلان، مشتاق، تعب'
      });
    }

    const content = moods[mood];

    // إرسال الصورة والاقتباس
    if (fs.existsSync(content.image)) {
      await sock.sendMessage(chatId, {
        image: fs.readFileSync(content.image),
        caption: content.quote
      });
    } else {
      await sock.sendMessage(chatId, { text: content.quote });
    }

    // إرسال الموسيقى
    if (fs.existsSync(content.audio)) {
      await sock.sendMessage(chatId, {
        audio: fs.readFileSync(content.audio),
        mimetype: 'audio/mp4',
        ptt: false
      });
    } else {
      await sock.sendMessage(chatId, {
        text: '❌ لم أجد الموسيقى المطلوبة 😔'
      });
    }
  }
};
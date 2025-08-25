const moment = require('moment-timezone');

module.exports = {
  command: 'اجنبية',
  description: 'يعرض الوقت في بعض الدول الأجنبية',
  async execute(client, msg) {
    const countries = [
      ['🇺🇸 أمريكا (نيويورك)', 'America/New_York'],
      ['🇬🇧 بريطانيا (لندن)', 'Europe/London'],
      ['🇫🇷 فرنسا (باريس)', 'Europe/Paris'],
      ['🇩🇪 ألمانيا (برلين)', 'Europe/Berlin'],
      ['🇯🇵 اليابان (طوكيو)', 'Asia/Tokyo'],
      ['🇨🇳 الصين (بكين)', 'Asia/Shanghai'],
      ['🇰🇷 كوريا الجنوبية (سيول)', 'Asia/Seoul'],
      ['🇷🇺 روسيا (موسكو)', 'Europe/Moscow'],
      ['🇮🇳 الهند (دلهي)', 'Asia/Kolkata'],
      ['🇧🇷 البرازيل (ساو باولو)', 'America/Sao_Paulo'],
      ['🇨🇦 كندا (تورنتو)', 'America/Toronto'],
      ['🇦🇺 أستراليا (سيدني)', 'Australia/Sydney'],
      ['🇹🇷 تركيا (إسطنبول)', 'Europe/Istanbul'],
      ['🇮🇹 إيطاليا (روما)', 'Europe/Rome'],
      ['🇪🇸 إسبانيا (مدريد)', 'Europe/Madrid']
    ];

    let text = '🌍 الوقت الآن في بعض الدول الأجنبية:\n\n';

    for (let [name, zone] of countries) {
      const time = moment().tz(zone).format('hh:mm A - YYYY/MM/DD');
      text += `${name}: ${time}\n`;
    }

    await client.sendMessage(msg.key.remoteJid, { text });
  }
};
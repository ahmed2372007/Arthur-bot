const moment = require('moment-timezone');

module.exports = {
  command: 'اوقات',
  description: 'يعرض الوقت في الدول العربية',
  async execute(client, msg) {
    const countries = [
      ['🇸🇦 السعودية', 'Asia/Riyadh'],
      ['🇪🇬 مصر', 'Africa/Cairo'],
      ['🇦🇪 الإمارات', 'Asia/Dubai'],
      ['🇶🇦 قطر', 'Asia/Qatar'],
      ['🇰🇼 الكويت', 'Asia/Kuwait'],
      ['🇮🇶 العراق', 'Asia/Baghdad'],
      ['🇱🇧 لبنان', 'Asia/Beirut'],
      ['🇯🇴 الأردن', 'Asia/Amman'],
      ['🇸🇾 سوريا', 'Asia/Damascus'],
      ['🇩🇿 الجزائر', 'Africa/Algiers'],
      ['🇲🇦 المغرب', 'Africa/Casablanca'],
      ['🇹🇳 تونس', 'Africa/Tunis'],
      ['🇴🇲 عمان', 'Asia/Muscat'],
      ['🇧🇭 البحرين', 'Asia/Bahrain'],
      ['🇵🇸 فلسطين', 'Asia/Gaza'],
      ['🇸🇩 السودان', 'Africa/Khartoum'],
      ['🇱🇾 ليبيا', 'Africa/Tripoli'],
      ['🇲🇷 موريتانيا', 'Africa/Nouakchott'],
      ['🇰🇲 جزر القمر', 'Indian/Comoro'],
      ['🇩🇯 جيبوتي', 'Africa/Djibouti']
    ];

    let text = '🕒 الوقت الآن في بعض الدول العربية:\n\n';

    for (let [name, zone] of countries) {
      const time = moment().tz(zone).format('hh:mm A - YYYY/MM/DD');
      text += `${name}: ${time}\n`;
    }

    await client.sendMessage(msg.key.remoteJid, { text });
  }
};
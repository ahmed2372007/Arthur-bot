import Starlights from "@StarlightsTeam/Scraper"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply('🖼️ من فضلك أدخل اسم الصورة التي تريد البحث عنها.\n\n📌 مثال:\n' + `> *${usedPrefix + command}* قطة كيوت`)
  }

  const prohibited = [
    'caca','polla','porno','porn','gore','cum','semen','puta','puto','culo',
    'putita','putito','pussy','hentai','pene','coño','asesinato','zoofilia',
    'mia khalifa','desnudo','desnuda','cuca','chocha','muertos','pornhub',
    'xnxx','xvideos','teta','vagina','marsha may','misha cross','sexmex',
    'furry','furro','furra','xxx','rule34','panocha','pedofilia','necrofilia',
    'pinga','horny','ass','nude','popo','nsfw','femdom','futanari','erofeet',
    'sexo','sex','yuri','ero','ecchi','blowjob','anal','ahegao','pija','verga',
    'trasero','violation','violacion','bdsm','cachonda','+18','cp','mia marin',
    'lana rhoades','cogiendo','cepesito','hot','buceta','xxx','rule','r u l e'
  ];

  if (prohibited.some(word => text.toLowerCase().includes(word))) {
    return m.reply('🚫 توقف عن البحث عن أشياء غير لائقة، هذا سلوك مرفوض!').then(_ => m.react('✖️'))
  }

  await m.react('🕓') // جاري البحث...

  try {
    let { dl_url } = await Starlights.GoogleImage(text)
    await conn.sendFile(m.chat, dl_url, 'thumbnail.jpg', `✅ *نتيجة البحث:* ${text}`, m)
    await m.react('✅')
  } catch (error) {
    await m.react('✖️')
    await m.reply('⚠️ حدث خطأ أثناء محاولة جلب الصورة.')
  }
}

handler.help = ['صورة *<بـحث>*']
handler.tags = ['search']
handler.command = ['صورة']
handler.register = true

export default handler
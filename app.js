const axios = require('axios');
const fs = require('fs');

async function translate(text){
  const min = 5000,max = 15000;
  const rand = (Math.round((Math.random()*(max - min)) +min));
  await sleep(rand);
  try{
    res = await axios.get(URL+encodeURIComponent(text))
    const trans = ((res.data.sentences&&res.data.sentences[0])||{}).trans;
    console.log('sleep  ',rand);
    console.log('--------------------');
    console.info(text,'\t\t---->\t\t',trans,'\n');
    console.log('--------------------');
    return (trans ? trans : text);
  }
  catch(e){
    failed = true;
    console.info('-----------\n');
    console.error('Error :',e.message,'\n')
    console.info(text);
    console.info('\n-----------\n');
    return text;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//starting point
const subFile = fs.readFileSync('sub.srt');
const api = 'https://translate.googleapis.com/translate_a/single?client=gtx&';
const sourceLanguage = 'en';
const targetLanguage = 'ml';
const URL = api+'sl='+sourceLanguage+'&tl='+targetLanguage+'&hl=en-GB&dt=t&dt=bd&dj=1&source=icon&tk=553196.553196&q=';
let failed = false;

(async function() {
  const file = await subFile.toString();
  const ogArray = file.split('\n\r\n');
  const ogObje=[];
  for (let index = 0; index < ogArray.length; index++) {
    const item = ogArray[index];
    const count = item.split('\r\n')[0];
    const duration = item.split('\r\n')[1];
    const temp = count+'\r\n'+duration+'\r\n';
    const content = item.substring(temp.length).replace(/[\n|\r]/g,' ');
    const translatedContent = await translate(content);
    if(failed)break;
    ogObje.push({
      count,
      duration,
      content:translatedContent
    });
    await fs.appendFileSync('output.srt','\n'+count+'\n'+duration+'\n'+translatedContent+'\n');
  }
 
  const sub=ogObje.map(el=>'\n'+el.count+'\n'+el.duration+'\n'+el.content).join('\n');
  await fs.writeFileSync('out.srt',sub);
  console.log('-------------- completed -----------');
})();
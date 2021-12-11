// const puppeteer = require('puppeteer');
// var global_browser;
// var isBrowserReady = false;
// (async () => {
//   global_browser = await puppeteer.launch({
//     args: ["--no-sandbox"],
// });
//   isBrowserReady = true;
// })();

// exports.getMovieLink = async (req,res) => {
//   var timeout;
//   const page = await global_browser.newPage();
//   try {
//   timeout = setTimeout(()=>{
//     page.close();
//     console.log("Timeout!")
//     res.status(408).json({msg: "Timeout!"})
//   },120000);
//   console.log(req.query.url);
//   await page.goto(req.query.url,{
//     waitUntil: 'networkidle0',
//   });
//   var pageContent = await page.content();
//   var pageTitle = await page.title();
//   pageTitle = await page.$eval("head > meta[property='og:keywords']", element => element.content);
//   var image = await page.$eval("head > meta[property='og:image']", element => element.content);
//   var index1 = pageContent.search('http://grab.nguonhd.co/embed/')
//   var iframeSrc = pageContent.substring(index1,pageContent.length);
//   iframeSrc = iframeSrc.substring(0,iframeSrc.search(`"`));
//   iframeSrc = iframeSrc.replace(/&amp;/g,'&');
//   await page.setRequestInterception(true)
//   page.on('request', (request) => {
//     if (request.url().search(/((.mp4)|(.m3u8)|(.mov))/g) !== -1) {
//       page.close();
//       clearTimeout(timeout)
//        if (request.url().search('.m3u8') !== -1) {
//         res.status(200).json({url: request.url(),type: "m3u8",title:pageTitle, image: image});
//       } else {
//         res.status(200).json({url: request.url(),type: "mp4",title:pageTitle, image: image});
//       }
//     }
//     request.continue()
//   })
//   await page.goto(iframeSrc,{
//     waitUntil: 'networkidle0',
//   });
//   await page.evaluate(()=>{
//     jwplayer().play();
//   },1000);

//   } catch (err) {
//     console.log(err);
//     page.close();
//     clearTimeout(timeout)
//     res.status(500).json({msg: "Internal Server Error"})
//   }
// }

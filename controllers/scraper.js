const puppeteer = require('puppeteer');
var global_browser;
var isBrowserReady = false;
(async () => {
  global_browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/google-chrome"
});
  isBrowserReady = true;
})();

exports.getMovieLink = async (req,res) => {
  var timeout;
  try {
  timeout = setTimeout(()=>{
    page2.close();
    page.close();
    console.log("Timeout!")
    res.status(408).json({msg: "Timeout!"})
  },120000);
  const page = await global_browser.newPage();
  await page.goto(req.query.url,{
    waitUntil: 'networkidle0',
  });
  var pageContent = await page.content();
  var pageTitle = await page.title();
  var index1 = pageContent.search('http://grab.nguonhd.co/embed/')
  var iframeSrc = pageContent.substring(index1,pageContent.length);
  iframeSrc = iframeSrc.substring(0,iframeSrc.search(`"`));
  iframeSrc = iframeSrc.replace(/&amp;/g,'&');
  var page2 = await global_browser.newPage();
  await page2.setRequestInterception(true)

  page2.on('request', (request) => {
    console.log(request.url());
    if (request.url().search(/((.mp4)|(.m3u8)|(.mov))/g) !== -1) {
      console.log("Link:", request.url())
      page2.close();
      page.close();
      clearTimeout(timeout)
       if (request.url().search('.m3u8') !== -1) {
        res.status(200).json({url: request.url(),type: "m3u8",title:pageTitle});
      } else {
        res.status(200).json({url: request.url(),type: "mp4",title:pageTitle});
      }
    }
    request.continue()
  })
  console.log(iframeSrc);
  await page2.goto(iframeSrc,{
    waitUntil: 'networkidle0',
  });
  await page2.evaluate(()=>{
    jwplayer().play();
  },1000);

  } catch (err) {
    console.log(err);
    page2.close();
    page.close();
    clearTimeout(timeout)
    res.status(500).json({msg: "Internal Server Error"})
  }
}

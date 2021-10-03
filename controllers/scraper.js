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
  try {
  const page = await global_browser.newPage();
  await page.goto(req.query.url);
  var pageContent = await page.content();
  var index1 = pageContent.search('http://grab.nguonhd.co/embed/')
  var iframeSrc = pageContent.substring(index1,index1+1000);
  iframeSrc = iframeSrc.substring(0,iframeSrc.search(`"`));
  iframeSrc = iframeSrc.replace(/&amp;/g,'&');
  var page2 = await global_browser.newPage();
  await page2.setRequestInterception(true)

  page2.on('request', (request) => {
    console.log(request.url());
    if (request.url().search(/((.mp4)|(.m3u8)|(.mov))/g) !== -1) {
      console.log("Link:", request.url())
      res.status(200).json({url: request.url()});
      page2.close();
      page.close();
    }
    request.continue()
  })
  await page2.goto(iframeSrc,{
    waitUntil: 'networkidle0',
  });
  await page2.evaluate(()=>{
    jwplayer().play();
  },1000);

  } catch (err) {
    console.log(err);
    res.status(500).json({msg: "Internal Server Error"})
  }
}

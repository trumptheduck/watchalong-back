const yt = require('youtube-search-without-api-key');
exports.search = async (req,res) => {
  try {
    console.log(req.query.query);
    const videos = await yt.search(req.query.query);
    console.log(videos);
    res.status(200).json({data: videos});
  } catch (err) {
    console.log("Internal Server Error!");
    res.status(500).json({msg: "Internal Server Error!"});
  }

}
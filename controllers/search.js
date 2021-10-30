const youtubesearchapi=require('youtube-search-api');
exports.search = async (req,res) => {
  try {
    console.log(req.query.query);
    var videos;
    await youtubesearchapi.GetListByKeyword(req.query.query,false).then(value => videos = value);
    var list = [];
    videos.items.forEach(item => {
      list.push({
        id: item?.id,
        channelTitle: item?.channelTitle,
        isLive: item?.isLive,
        title: item?.title,
        thumbnail: Array.isArray(item?.thumbnail?.thumbnails)?item?.thumbnail?.thumbnails[0]:undefined,
        length: item?.length?.simpleText,
        type: item?.type,
      })
    })
    var result = {
      items: list,
      nextPage: videos.nextPage
    }
    res.status(200).json({data: result});
  } catch (err) {
    console.log(err);
    res.status(500).json({msg: "Internal Server Error!"});
  }
}

exports.nextPage = async (req,res) => {
  try {
    var videos;
    await youtubesearchapi.NextPage(req.body.nextPage,false).then(value => videos = value);
    var list = [];
    videos.items.forEach(item => {
      list.push({
        id: item?.id,
        channelTitle: item?.channelTitle,
        isLive: item?.isLive,
        title: item?.title,
        thumbnail: Array.isArray(item?.thumbnail?.thumbnails)?item?.thumbnail?.thumbnails[0]:undefined,
        length: item?.length?.simpleText,
        type: item?.type,
      })
    })
    var result = {
      items: list,
      nextPage: videos.nextPage
    }
    res.status(200).json({data: result});
  } catch (err) {
    console.log(err);
    res.status(500).json({msg: "Internal Server Error!"});
  }
}
const express = require('express');
const app = express()
const http = require('http').Server(app);
const httpPort = 80;
const indexRoutes = require("./routes/index.js")
const cors = require("cors")
const rooms = [];
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const path = require("path")

function makeid(length) {
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')))
// app.use(indexRoutes);
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend'))
})
app.use((req,res,next)=>{
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'))
})
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'))
})

///////////////////////////////////////////////////////////////

io.on("connection", socket => {
  var currentRoom = null;
  var username = null;
  var hasJoined = false;
  var currentUser = {
    name: username,
    id: socket.id,
    time: 0,
    status: 0,
    isHost: false,
    isAdmin: false,
  }
  // or with emit() and custom event names
  console.log("User connected! | UUID:",socket.id)
  socket.on("room:create",(name)=>{
    if (!hasJoined) {
      username = name;
      currentUser.name = name;
      currentUser.isAdmin = true;
      currentRoom = {
        id: makeid(6),
        members: [currentUser],
        playlist: [],
        nowPlaying: null,
        host: currentUser
      }
      rooms.push(currentRoom);
      socket.join(currentRoom.id);
      socket.emit("room:status",currentRoom)
      hasJoined = true;
    } else {
      socket.emit("room:status",false)
    }
  })
  socket.on("room:join",(data)=>{
    if (!hasJoined) {
      console.log(data,data.name,data.id);
      currentUser.name = data.name;
      currentRoom = rooms.find(room => room.id == data.id)
      console.log(rooms,currentRoom)
      if (currentRoom?.id !== undefined) {
        socket.join(currentRoom.id);
        currentRoom.members.push(currentUser)
        socket.emit("room:status",currentRoom)
        hasJoined = true;
      } else {
        socket.emit("room:status",false)
      }
    } else {
      socket.emit("room:status",false)
    }
  })
  socket.on("room:joinStatus:get",()=>{
    socket.emit("room:joinStatus:post",hasJoined)
  })
  socket.on("room:playlist:get",() => {
    socket.to(currentRoom.id).emit("room:data:post",currentRoom);
  })
  socket.on('room:playlist:add',(data)=>{
    currentRoom.playlist.push({video: data, host: socket.id});
    socket.to(currentRoom.id).emit("room:data:post",currentRoom);
  })
  socket.on('room:playlist:delete',(index)=>{
    currentRoom.playlist.splice(index,1);
    socket.to(currentRoom.id).emit("room:data:post",currentRoom);
  })
  socket.on('room:playlist:swap',(index1,index2)=>{
    var middle = currentRoom.playlist[index1];
    currentRoom.playlist[index1] = currentRoom.playlist[index2];
    currentRoom.playlist[index2] = middle;
    socket.to(currentRoom.id).emit("room:data:post",currentRoom);
  })
  socket.on('room:playlist:next',()=>{
    currentRoom.nowPlaying = currentRoom.playlist[0];
    currentRoom.playlist.splice(0,1);
    currentRoom.members.forEach(member => {
      if (currentRoom.nowPlaying.host == member.id) {
        member.isHost = true;
        currentRoom.host = member;
      } else {
        member.isHost = false;
      }
    })
    socket.to(currentRoom.id).emit("room:playlist:play",currentRoom.nowPlaying);
    socket.to(currentRoom.id).emit("room:data:post",currentRoom);
  })
  socket.on("room:message:post", (msg)=> {
    socket.to(currentRoom.id).emit("room:message:get", {
      username: username,
      message: msg
    })
  })
  socket.on("room:data:get",()=>{
    socket.emit("room:data:post",currentRoom)
  })
  socket.on("room:data:update",(time,status)=>{
    currentUser.time = time;
    currentUser.status = status;
  })
  socket.on("room:id:get",()=>{
    socket.emit("room:id:post",socket.id)
  })
  socket.emit("message", "Connected!");
  // handle the event sent with socket.send()
  socket.on("message", (data) => {
    console.log(data);
  });
  //Handle disconnection
  socket.on('disconnect',()=>{
    console.log('User disconnected! | UUID: ',socket.id);
    if (hasJoined) {
      console.log("Username: ",username," | Room: ", currentRoom.id);
      if (currentRoom.members.length < 2) {
        rooms.splice(rooms.indexOf(currentRoom),1);
        console.log(rooms);
      } else {
        var member = currentRoom.members.find(member => member.id == socket.id);
        var index = currentRoom.members.indexOf(member);
        if (member.isAdmin) {
          currentRoom.members[index+1].isAdmin = true;
        }
        currentRoom.members.splice(index,1);
        console.log(currentRoom.members);
      }
    }
  })
});

///////////////////////////////////////////////////////////////
http.listen(httpPort, function () {
  console.log(`Listening on port ${httpPort}!`)
})

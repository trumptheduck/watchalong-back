
const rooms = [];

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

class User {
  constructor(id,name) {
    this.id = id;
    this.name = name;
    this.time = 0;
    this.status = 0;
    this.isHost = false;
    this.isAdmin = false;
    this.online = true;
  }
}
exports.registerHandler = (io)=>{
  io.on("connection", socket => {
    console.log("Socket connected! | UUID:",socket.id)

    var currentRoom = null;
    var hasJoined = false;
    var currentUser = null;
    //Handle client reconnection, in case user reload the page, or if user experience a bad connection
    socket.on("room:reconnect",(id,roomID)=>{
      currentRoom = rooms.find(room => room.id == roomID);
      if (currentRoom?.members !== undefined) {
        currentUser = currentRoom.members.find(member => member.id == id);
        if (currentUser?.id!== undefined) {
          console.log("Reconnecting as: ", currentUser.name);
          socket.join(currentRoom.id);
          hasJoined = true;
          currentUser.online = true;
          clearTimeout(currentUser.timeout);
          socket.emit("room:reconnected",currentRoom);
        }
      }
      else socket.emit("room:joinStatus:post",hasJoined);
    })
    socket.on("room:disconnect",()=>{
      if (currentRoom.members.length < 2) {
        rooms.splice(rooms.indexOf(currentRoom),1);
        console.log("Rooms: ", rooms);
      } else {
        var member = currentRoom.members.find(member => member.id == currentUser.id);
        var index = currentRoom.members.indexOf(member);
        if (member.isAdmin) {
          currentRoom.members[index+1].isAdmin = true;
        }
        currentRoom.members.splice(index,1);
        console.log("Members: ",currentRoom.members);
      }
    })
    socket.on("room:create",(name,id)=>{
      if (!hasJoined) {
        currentUser = new User(id,name)
        currentUser.isAdmin = true;
        currentUser.online = true;
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
        currentRoom = rooms.find(room => room.id == data.roomID)
        if (currentRoom?.id !== undefined) {
          currentUser = new User(data.id,data.name);
          currentUser.online = true;
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
    socket.on('room:playlist:add',(data,type)=>{
      currentRoom.playlist.push({video: data,type: type, host: currentUser.id});
      socket.to(currentRoom.id).emit("room:data:post",currentRoom);
      console.log(currentRoom);
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
      socket.emit("room:data:post",currentRoom)
    })
    socket.on("room:id:get",()=>{
      socket.emit("room:id:post",currentUser.id)
    })
    socket.emit("message", "Connected!");
    // handle the event sent with socket.send()
    socket.on("message", (data) => {
      console.log(data);
    });
    //Handle disconnection
    socket.on('disconnect',()=>{
      console.log('Socket disconnected! | UUID: ',socket.id);
      if (hasJoined) {
        console.log("Username: ",currentUser.name," | Room: ", currentRoom.id);
        currentUser.online = false;
      }
    })
  });
  
}

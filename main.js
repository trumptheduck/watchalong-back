const express = require('express');
const app = express()
const http = require('http').Server(app);
const httpPort = 80;
const indexRoutes = require("./routes/index.js")
const roomHandler = require("./handlers/room")
const cors = require("cors")
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const path = require("path")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')))
app.use(indexRoutes);
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend'))
})
app.use((req,res,next)=>{
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'))
})
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'))
})

roomHandler.registerHandler(io);
/////////// PUPPETEER //////////////////

///////////////////////////////////////////////////////////////
http.listen(httpPort, function () {
  console.log(`Listening on port ${httpPort}!`)
})

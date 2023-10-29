import express from 'express';
import {Server} from 'socket.io';
let connections = [];
let players = [];

function Ball(){
  this.x = 750/2;
  this.y = 600/2;
  var r = Math.floor(Math.random(2));
  this.xv = (r === 0) ? -1 : 1;
  this.yv = 1;

  this.move = function(){
    if(this.y < 1)
      this.yv = 1;
    if(this.y >= 600)
      this.yv = -1;
    this.y += this.yv;
    this.x += this.xv;
  }
}

let ball = new Ball();

function Player(id, data) {
  this.id = id;
  this.x = data.x;
  this.y = data.y;
  this.v = data.v;
  this.w = data.w;
  this.h = data.h;
  this.p = data.p;
}

const app = express();
const server = app.listen(3000);
app.use(express.static('public'));

const getCounter = () => {
  io.sockets.emit('getCounter', connections.length);
}

const heartBeat = () => {
  io.sockets.emit('heartBeat', players);
}

const showBallGame = (ball) => {
  const {x, y, xv, yv} = ball;
  io.sockets.emit('showBallGame', {
    x,
    y,
    xv,
    yv
  });
}

setInterval(() => {
  heartBeat();
  showBallGame(ball);
}, 10)

console.log('Server running 🚀');

const io = new Server(server);
io.on('connection', (socket) => {
  if(connections.length >= 2) return;
  connections.push(socket);
  getCounter();
  socket.on('start', (data) => {
    console.log(`User ${socket.id} connected! Total: ${connections.length}`)
    const p = new Player(socket.id, data)
    if(players.find(player => player.id === socket.id)) return;
    players.push(p);
  })

  socket.on('update', (data) => {
    const currentPlayer = players.find(player => player.id === socket.id)
    if(currentPlayer) {
      currentPlayer.x = data.x;
      currentPlayer.y = data.y;
      currentPlayer.v = data.v;
      currentPlayer.w = data.w;
      currentPlayer.h = data.h;
      currentPlayer.p = data.p;
    }
  })

  socket.on('show_ball', () => {
    showBallGame(ball);
  })

  socket.on('move_ball', (data) => {
    if(data) {
      ball.xv = data.xv ?? ball.xv
      ball.xv = data.xv ?? ball.xv
    } else {
      ball.move();
    }
  })

  socket.on('restart', () => {
    ball = new Ball();
  })

  socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
  });
})
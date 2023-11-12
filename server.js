import express from 'express';
import {Server} from 'socket.io';
let connections = [];
let players = [];

//Classe para instanciar a bola e salvar sua posição no lado do servidor
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

//Instancia uma nova bola quando o servidor é iniciado
let ball = new Ball();

//Classe para salvar as posições de cada player salvos dentro de um array de players[]
function Player(id, data) {
  this.id = id;
  this.x = data.x;
  this.y = data.y;
  this.v = data.v;
  this.w = data.w;
  this.h = data.h;
  this.p = data.p;
}

//Iniciar a configuração do servidor
const app = express();
const server = app.listen(3000);
app.use(express.static('public'));

//Função que retorna a quantidade de jogadores conectados no servidor
const getCounter = (id) => {
  io.sockets.emit('getCounter', {connectionsLength: connections.length, socketId: id});
}

//Função que atualiza o client com o status atual dos players
const heartBeat = () => {
  io.sockets.emit('heartBeat', players);
}

//Função que envia uma mensagem ao client alertando que o player atual não poderá
//jogar pois o servidor está cheio
const connectionFull = (id) => {
  console.log("Tentativa de conexão. Erro: SERVIDOR CHEIO!");
  io.sockets.emit('connectionFull', {socketId: id});
}

//Função que envia ao client o status da bola
const showBallGame = (ball) => {
  const {x, y, xv, yv} = ball;
  io.sockets.emit('showBallGame', {
    x,
    y,
    xv,
    yv
  });
}

//Latência do servidor, atualizando os clients a cada 8ms
setInterval(() => {
  heartBeat();
  showBallGame(ball);
}, 8)

console.log('Server running 🚀 at http://localhost:3000');

const io = new Server(server);
//Abre conexão socket
io.on('connection', (socket) => {
  //Alerta o usuário que está tentando se conectar que o servidor está cheio
  if(connections.length >= 2) return connectionFull(socket.id);

  //Adiciona uma nova conexão ao array de conexões
  connections.push(socket);
  getCounter(socket.id); //Envia status de conexões para o client

  //Monitora o evento disconnect e avisa aos clients sobre a desconexão de um 
  // player, resetando a partida (minimo de players: 2)
  socket.on('disconnect', () => {
    io.sockets.emit('reset');
    players = players.filter(player => player.id !== socket.id); 
    connections = connections.filter(connection => connection.id !== socket.id); 

    console.log('Cliente desconectado!');
  });

  //Monitora o evento start e salva os estados dos usuários
  socket.on('start', (data) => {
    console.log(`Usuário ${socket.id} conectado! Total: ${connections.length}`)
    const p = new Player(socket.id, data)
    if(players.find(player => player.id === socket.id)) return;
    players.push(p);
  })

  //Monitora o evento update a atualiza as posições dos usuários a cada movimento
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

  //Quando solicitado, envia os dados de posição da bola do server -> client
  socket.on('show_ball', () => {
    showBallGame(ball);
  })

  //Monitora o evento move_ball e move a bola no servidor
  socket.on('move_ball', (data) => {
    if(data) {
      ball.xv = data.xv ?? ball.xv
      ball.xv = data.xv ?? ball.xv
    } else {
      ball.move();
    }
  })

  //Monitora o evento restart e reseta a bola para o centro do jogo
  socket.on('restart', () => {
    ball = new Ball();
  })

  //Monitora o evento de erro para eventuais problemas de conexão
  socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
  });

  socket.on("ping", (callback) => {
    callback();
  });
})
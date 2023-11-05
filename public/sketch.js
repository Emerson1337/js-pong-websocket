let p;
var b;
var balls = [];
var socket;
var lastPos;
var go = false;
var counter = 0;
var players = [];

function setup(){
    //Inicia conexão com o servidor
    socket = io.connect("http://localhost:3000");
    createCanvas(750,600); //Cria a interface do jogo

    //Primeiro evento emitido pelo servidor, alertando o numero de conexões
    //e com base nela, o player é criado
    socket.on('getCounter', (data) => {
      counter = data.connectionsLength;
      if(p === undefined) {
        if(counter % 2 === 0)
          p = new Player(0);
        else
          p = new Player(width);
      }
      
      var data = {
        x: p.x,
        y: p.y,
        v: p.v,
        w: p.w,
        h: p.h,
        p: p.p,
      }

      //Envia os dados do player criado para o servidor
      socket.emit('start', data);
      go = false;

      //Caso haja 2 players, o game é iniciado
      if(counter == 2) {
        const elem = document.getElementById("userMessage");
        let time = 3;

        const timeoutId = setInterval(() => {
          elem.textContent = `O JOGO INICIARÁ EM: ${time}`
          time--;
        }, 1000);

        setTimeout(() => {
          clearTimeout(timeoutId);
          go = true;
          elem.textContent = ''
        }, 4000);
      }

      update(); //atualiza o servidor novamente dos dados do player
    });
    
    //Recebe os dados atuais dos players do server, para posicionar a posição
    //do adversário
    socket.on('heartBeat', (data) => {
      players = data;
    });


    //Recebe as coordenadas da bola e a desenha nos clients
    socket.on('showBallGame', (data) => {
      b = new Ball(data);
      b.show()
    });

    //Valida se o usuário que está tentando se conectar tentou entrar
    //em uma partida full (com 2 players já conectados)
    socket.on('connectionFull', (data) => {
      if(data.socketId === socket.id) {
        const elem = document.getElementById("userMessage");
        elem.textContent = `O SERVIDOR SUPORTA NO MÁXIMO 2 JOGADORES E AGORA ESTÁ LOTADO. TENTE NOVAMENTE MAIS TARDE!`
      }
    });

    //Reinicia o jogo caso o oponente se desconecte, tornano o servidor livre p/
    //entrada de um novo oponente
    socket.on('reset', () => {
      console.log('RESET!!');
      const elem = document.getElementById("userMessage");
      elem.textContent = `OPONENTE DESCONECTADO! INICIANDO UM NOVO LOBBY...`

      setTimeout(() => {
        window.location.reload();
      }, 4000);
    });
}

function restartGame() {
  socket.emit('restart'); //Solicita o servidor para reiniciar o jogo
}

//Função chamada pelo canvas a cada movimento do mouse
function draw(){
    background(0);
    rect(width/2,0,10,600)
    textSize(48);
    fill(0, 102, 153);
    if(go === true) {
      p.show();
      p.move();
      socket.emit('show_ball'); //Solicita que as informações da bola sejam enviadas ao client
      socket.emit('move_ball'); //Solicita que a bola mova-se
      players.map(player => {
        //Informa para onde deseja movimentar a bola em caso de colisão da barra com a bola
        if(b.collision(player))
          if(player.x == 0)
            socket.emit('move_ball', {xv: 1});
          else
            socket.emit('move_ball', {xv: -1});
        const id = player.id;
  
        if(id !== socket.id) {
          fill(255, 0, 0);
          rectMode(CENTER);
          rect(player.x, player.y, player.w, player.h)
        }
      });

      update();
    }
}

//Atualiza o servidor com os dados do player do client
function update() {
  var data = {
    x: p.x,
    y: p.y,
    v: p.v,
    w: p.w,
    h: p.h,
    p: p.p,
  }

  socket.emit('update', data);
}

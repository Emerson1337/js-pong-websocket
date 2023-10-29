var p;
var b;
var balls = [];
var socket;
// var a;
var lastPos;
var go = false;
var counter = 0;
var players = [];

function setup(){
    socket = io.connect("http://localhost:3000");
    createCanvas(750,600);
    socket.on('getCounter', (data) => {
      counter = data;
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
  
      socket.emit('start', data);
      
      if(counter == 2) {
        go = true;
      }

      test();
    });
    
    socket.on('heartBeat', (data) => {
      players = data;
    });

    socket.on('showBallGame', (data) => {
      b = new Ball(data);
      b.show()
    });
}

function restartGame() {
  socket.emit('restart');
}

function draw(){
    background(0);
    rect(width/2,0,10,600)
    textSize(48);
    fill(0, 102, 153);
    // text(p.points, 30, 40);
    // text(a.points, width - 80, 40);
    if(go === true) {
      p.show();
      p.move();
      socket.emit('show_ball');
      socket.emit('move_ball');
      players.map(player => {
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

      test();
    }
}

function test() {
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


// function throwBall(){
//     if(balls.length > 0)
//       b = balls.pop();
//     else {
//       showWinner();
//       alert("Do you want to play again?");
//       window.location.reload();
//     }
// }

// function showWinner(){
//   background(0);
//   textSize(80);
//   fill(0, 102, 153);
//   if(p.points > a.points)
//     text("YOU WIN", width/2 - 100, height/2);
//   else if(a.points > p.points)
//     text("YOU LOSE", width/2 - 100, height/2);
//   else
//     text("TIE", width/2 -100, height/2);

// }

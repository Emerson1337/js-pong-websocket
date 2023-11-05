function Ball({
  x,
  y,
  xv,
  yv
}){
  this.x = x;
  this.y = y;
  var r = floor(random(2));
  this.xv = xv;
  this.yv = yv;

  this.show = function(){
    ellipse(this.x,this.y,15,15);
  }

  this.restart = function(){
    this.x = width/2;
    this.y = height/2;
  }

  this.move = function(){
    if(this.y < 1)
      this.yv = 1;
    if(this.y >= height)
      this.yv = -1;
    this.y += this.yv;
    this.x += this.xv;
  }

  this.collision = function(p){
      var d = dist(this.x,this.y,p.x,p.y);
      var r = floor(random(2));
      if(d < 15 + 20){
        if(r === 1)
            if(this.y-p.y < 0)
              this.yv = 1;
            else if(this.y - p.y == 0)
              this.yv = 0;
            else
              this.yv = -1;
        return true;
      }
      else
        return false;
  }
}

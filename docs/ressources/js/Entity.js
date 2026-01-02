/* ===========================
   SUPER RIJODA - BASE ENTITY
   =========================== */

// ------- Sprite class (globale) -------
class Sheet {
  constructor(src, spec){
    this.img = new Image();
    this.ready = false;

    // retrieve properties from spec
    Object.assign(this, spec);

    this.img.onload = () => {
      this.ready = true;
      // if frame width/height not set, compute them
      if (!this.fw) this.fw = this.img.width  / this.cols;
      if (!this.fh) this.fh = this.img.height / this.rows;
    };
    this.img.src = src;

    this.anim = 'idle';   // current animation
    this.i    = 0;        // index of current frame
    this.t    = 0;        // intern timer
    this.fps  = 12;       // frames per second
  }

  set(name){
    if (this.anim !== name){
      this.anim = name;
      this.i = 0;
      this.t = 0;
    }
  }

  // advance animation
  step(dt, speed = 1){
    const frames = this.seq[this.anim] || [0];
    if (frames.length < 2) return;  // only one frame, no need to animate

    this.t += dt * this.fps * speed;
    if (this.t >= 1){
      this.t = 0;
      this.i = (this.i + 1) % frames.length;
    }
  }

  // draw current frame at (x,y) with size (w,h)
  draw(x, y, w, h){
    if (!this.ready) return;
    const frames = this.seq[this.anim] || [0];
    const idx = frames[this.i] ?? 0;
    const col = idx % this.cols;
    const row = Math.floor(idx / this.cols);

    // draw the frame
    ctx.drawImage(
      this.img,
      col * this.fw, row * this.fh, this.fw, this.fh,
      x, y, w, h
    );
  }
}

// ------- Entities Class -------
class Entity{
  constructor(x,y,w,h){ this.x=x; this.y=y; this.w=w; this.h=h; this.dx=0; this.dy=0; this.onGround=false; }
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
}

// ------- Coin Class -------
class Coin{
  constructor(x,y){
    this.x=x; this.y=y; this.w=32; this.h=32; this.taken=false;
    this.sheet=new Sheet(ASSETS.coins,SHEETS.coin);
  }

  // get bounding rectangle
  rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }

  update(dt){
    if(!this.taken){
      this.sheet.set('spin');
      this.sheet.step(dt,1.0);
    }
  }

  draw(){
    if(!this.taken) this.sheet.draw(this.x-Game.camX,this.y,this.w,this.h);
  }
}
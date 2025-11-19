class Enemy extends Entity{
  constructor(x,y){
    super(x,y,64,64);
    this.sheet=new Sheet(ASSETS.enemy,SHEETS.enemy);
    this.dir=Math.random()<.5?-1:1; this.speed=1.4; this.dead=false;
  }
  update(dt,L){
    if(this.dead) return;
    this.dx=this.speed*this.dir; this.dy+=Game.gravity;
    this.x+=this.dx; this.y+=this.dy;

    for(const p of L.platforms){
      if(AABB(this.rect(),p)){
        if(this.dy>0 && this.y+this.h-this.dy<=p.y){ this.y=p.y-this.h; this.dy=0; }
        else { this.dir*=-1; this.dx=0; }
      }
    }
    this.x=clamp(this.x,0,Game.worldW-this.w);
    this.y=Math.min(this.y,Game.worldH-this.h);

    this.sheet.set('walk'); this.sheet.step(dt,.8);
  }
  draw(){ if(!this.dead) this.sheet.draw(this.x-Game.camX,this.y,this.w,this.h); }
}
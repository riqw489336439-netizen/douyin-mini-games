export type Vec={x:number,y:number};

export interface ShadowCatLevel {
  id:number;
  realSwitches:number;
  shadowSwitches:number;
  lightGates:number;
  dualExit:boolean;
  movingShadow:boolean;
  timeLimit:number;
}

export class Core {
  real:Vec={x:-220,y:155};
  shadow:Vec={x:-220,y:-155};
  light=0;
  realActivated=0;
  shadowActivated=0;
  elapsed=0;
  finished=false;

  constructor(public level:ShadowCatLevel){ }

  move(dx:number,dy:number){
    if(this.finished)return;
    this.real.x+=dx; this.real.y+=dy;
    // 影子与现实猫保持镜像运动，形成独立于其他游戏的核心机制。
    this.shadow.x+=dx; this.shadow.y-=dy;
  }

  tick(dt:number){
    if(this.finished)return;
    this.elapsed+=Math.max(0,dt);
  }

  toggleLight(){
    if(this.finished)return;
    this.light=1-this.light;
  }

  activateReal(){this.realActivated=Math.min(this.level.realSwitches,this.realActivated+1);}
  activateShadow(){this.shadowActivated=Math.min(this.level.shadowSwitches,this.shadowActivated+1);}

  canExit(realAtExit:boolean,shadowAtExit:boolean){
    const switchesReady=this.realActivated>=this.level.realSwitches && this.shadowActivated>=this.level.shadowSwitches;
    const exitReady=this.level.dualExit ? realAtExit&&shadowAtExit : realAtExit||shadowAtExit;
    return switchesReady&&exitReady;
  }

  complete(realAtExit:boolean,shadowAtExit:boolean){
    if(!this.canExit(realAtExit,shadowAtExit))return false;
    this.finished=true;
    return true;
  }

  isTimedOut(){return this.level.timeLimit>0&&this.elapsed>=this.level.timeLimit&&!this.finished;}
}

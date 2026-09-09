export type Vec={x:number,y:number};

export type ShadowMode='mirror'|'lag'|'light-shift';

export interface ShadowCatLevel {
  id:number;
  realSwitches:number;
  shadowSwitches:number;
  lightGates:number;
  dualExit:boolean;
  movingShadow:boolean;
  shadowMode:ShadowMode;
  shadowLagSteps:number;
  lightShift:number;
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
  moves=0;
  private realDone=new Set<number>();
  private shadowDone=new Set<number>();
  private shadowQueue:Vec[]=[];

  constructor(public level:ShadowCatLevel){ }

  private clamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v));}

  move(dx:number,dy:number){
    if(this.finished)return;
    this.real.x=this.clamp(this.real.x+dx,-300,300);
    this.real.y=this.clamp(this.real.y+dy,-250,250);
    this.moves++;

    const mirrored={x:dx,y:-dy};
    if(this.level.shadowMode==='lag'){
      this.shadowQueue.push(mirrored);
      if(this.shadowQueue.length>this.level.shadowLagSteps){
        const step=this.shadowQueue.shift()!;
        this.applyShadowStep(step);
      }
      return;
    }

    // 光照偏移只改变影子相对现实猫的“目标偏移”，而不是每走一步无限累计漂移。
    this.applyShadowStep(mirrored);
  }

  private applyShadowStep(step:Vec){
    this.shadow.x=this.clamp(this.shadow.x+step.x,-300,300);
    this.shadow.y=this.clamp(this.shadow.y+step.y,-250,250);
    if(this.level.shadowMode==='light-shift'){
      const desired=this.clamp(this.real.x+(this.light?this.level.lightShift:-this.level.lightShift),-300,300);
      this.shadow.x=desired;
    }
  }

  toggleLight(){
    if(this.finished)return;
    this.light=1-this.light;
    if(this.level.shadowMode==='light-shift'){
      this.shadow.x=this.clamp(this.real.x+(this.light?this.level.lightShift:-this.level.lightShift),-300,300);
    }
  }

  flushShadowLag(){
    if(this.finished||this.level.shadowMode!=='lag')return false;
    const step=this.shadowQueue.shift();
    if(!step)return false;
    this.applyShadowStep(step);
    return true;
  }

  pendingShadowSteps(){return this.shadowQueue.length;}

  tick(dt:number){
    if(this.finished)return;
    this.elapsed+=Math.max(0,dt);
  }

  activateReal(index?:number){
    if(index===undefined){ this.realActivated=Math.min(this.level.realSwitches,this.realActivated+1); return true; }
    if(index<0||index>=this.level.realSwitches||this.realDone.has(index))return false;
    this.realDone.add(index); this.realActivated=this.realDone.size; return true;
  }

  activateShadow(index?:number){
    if(index===undefined){ this.shadowActivated=Math.min(this.level.shadowSwitches,this.shadowActivated+1); return true; }
    if(index<0||index>=this.level.shadowSwitches||this.shadowDone.has(index))return false;
    this.shadowDone.add(index); this.shadowActivated=this.shadowDone.size; return true;
  }

  isRealDone(index:number){return this.realDone.has(index);}
  isShadowDone(index:number){return this.shadowDone.has(index);}

  canExit(realAtExit:boolean,shadowAtExit:boolean){
    const switchesReady=this.realActivated>=this.level.realSwitches && this.shadowActivated>=this.level.shadowSwitches;
    const lagReady=this.level.shadowMode!=='lag'||this.shadowQueue.length===0;
    const exitReady=this.level.dualExit ? realAtExit&&shadowAtExit : realAtExit||shadowAtExit;
    return switchesReady&&lagReady&&exitReady;
  }

  complete(realAtExit:boolean,shadowAtExit:boolean){
    if(!this.canExit(realAtExit,shadowAtExit))return false;
    this.finished=true;
    return true;
  }

  isTimedOut(){return this.level.timeLimit>0&&this.elapsed>=this.level.timeLimit&&!this.finished;}
}

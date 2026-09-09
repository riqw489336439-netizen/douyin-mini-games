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

  move(dx:number,dy:number){
    if(this.finished)return;
    const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
    this.real.x=clamp(this.real.x+dx,-300,300);
    this.real.y=clamp(this.real.y+dy,-250,250);
    this.moves++;

    const mirrored={x:dx,y:-dy};
    if(this.level.shadowMode==='lag'){
      this.shadowQueue.push(mirrored);
      if(this.shadowQueue.length>this.level.shadowLagSteps){
        const step=this.shadowQueue.shift()!;
        this.shadow.x=clamp(this.shadow.x+step.x,-300,300);
        this.shadow.y=clamp(this.shadow.y+step.y,-250,250);
      }
      return;
    }

    const shift=this.level.shadowMode==='light-shift'?(this.light?this.level.lightShift:-this.level.lightShift):0;
    this.shadow.x=clamp(this.shadow.x+mirrored.x+shift,-300,300);
    this.shadow.y=clamp(this.shadow.y+mirrored.y,-250,250);
  }

  tick(dt:number){
    if(this.finished)return;
    this.elapsed+=Math.max(0,dt);
  }

  toggleLight(){
    if(this.finished)return;
    this.light=1-this.light;
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

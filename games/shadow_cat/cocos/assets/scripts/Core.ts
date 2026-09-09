import { ShadowLayout } from './ShadowLayout';

export type Vec={x:number,y:number};
export type ShadowMode='mirror'|'lag'|'light-shift';
export interface ShadowCatLevel { id:number;realSwitches:number;shadowSwitches:number;lightGates:number;dualExit:boolean;movingShadow:boolean;shadowMode:ShadowMode;shadowLagSteps:number;lightShift:number;timeLimit:number; }

export class Core {
  real:Vec={x:-220,y:ShadowLayout.REAL_Y};
  shadow:Vec={x:-220,y:ShadowLayout.SHADOW_Y};
  light=0; realActivated=0; shadowActivated=0; elapsed=0; finished=false; moves=0;
  private realDone=new Set<number>(); private shadowDone=new Set<number>(); private shadowQueue:Vec[]=[];
  constructor(public level:ShadowCatLevel){}

  private clamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v));}
  private clampX(v:number){return this.clamp(v,ShadowLayout.WORLD_MIN_X,ShadowLayout.WORLD_MAX_X);}
  private clampY(v:number){return this.clamp(v,ShadowLayout.WORLD_MIN_Y,ShadowLayout.WORLD_MAX_Y);}

  move(dx:number,dy:number){
    if(this.finished)return;
    const oldX=this.real.x,oldY=this.real.y;
    this.real.x=this.clampX(oldX+dx);
    this.real.y=this.clampY(oldY+dy);
    const actualDx=this.real.x-oldX,actualDy=this.real.y-oldY;
    if(actualDx===0&&actualDy===0)return;
    this.moves++;
    const mirrored={x:actualDx,y:-actualDy};
    if(this.level.shadowMode==='lag'){
      this.shadowQueue.push(mirrored);
      if(this.shadowQueue.length>this.level.shadowLagSteps){const step=this.shadowQueue.shift()!;this.applyShadowStep(step);}
      return;
    }
    this.applyShadowStep(mirrored);
  }

  private applyShadowStep(step:Vec){
    this.shadow.x=this.clampX(this.shadow.x+step.x);
    this.shadow.y=this.clampY(this.shadow.y+step.y);
    if(this.level.shadowMode==='light-shift'){
      this.shadow.x=this.clampX(this.real.x+(this.light?this.level.lightShift:-this.level.lightShift));
    }
  }

  toggleLight(){
    if(this.finished)return;
    this.light=1-this.light;
    if(this.level.shadowMode==='light-shift'){
      this.shadow.x=this.clampX(this.real.x+(this.light?this.level.lightShift:-this.level.lightShift));
    }
  }

  flushShadowLag(){if(this.finished||this.level.shadowMode!=='lag')return false;const step=this.shadowQueue.shift();if(!step)return false;this.applyShadowStep(step);return true;}
  pendingShadowSteps(){return this.shadowQueue.length;}
  tick(dt:number){if(this.finished)return;this.elapsed+=Math.max(0,dt);}
  activateReal(index?:number){if(index===undefined){this.realActivated=Math.min(this.level.realSwitches,this.realActivated+1);return true;}if(index<0||index>=this.level.realSwitches||this.realDone.has(index))return false;this.realDone.add(index);this.realActivated=this.realDone.size;return true;}
  activateShadow(index?:number){if(index===undefined){this.shadowActivated=Math.min(this.level.shadowSwitches,this.shadowActivated+1);return true;}if(index<0||index>=this.level.shadowSwitches||this.shadowDone.has(index))return false;this.shadowDone.add(index);this.shadowActivated=this.shadowDone.size;return true;}
  isRealDone(index:number){return this.realDone.has(index);}
  isShadowDone(index:number){return this.shadowDone.has(index);}
  canExit(realAtExit:boolean,shadowAtExit:boolean){const switchesReady=this.realActivated>=this.level.realSwitches&&this.shadowActivated>=this.level.shadowSwitches;const lagReady=this.level.shadowMode!=='lag'||this.shadowQueue.length===0;const exitReady=this.level.dualExit?realAtExit&&shadowAtExit:realAtExit||shadowAtExit;return switchesReady&&lagReady&&exitReady;}
  complete(realAtExit:boolean,shadowAtExit:boolean){if(!this.canExit(realAtExit,shadowAtExit))return false;this.finished=true;return true;}
  isTimedOut(){return this.level.timeLimit>0&&this.elapsed>=this.level.timeLimit&&!this.finished;}
}

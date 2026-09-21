import { Core, Vec } from './Core';
import { ShadowLayout, realExitPos, realSwitchPos, shadowExitPos, shadowSwitchPos } from './ShadowLayout';

export interface InteractionResult {changed:boolean;completed:boolean;realAtExit:boolean;shadowAtExit:boolean;message:string;}
const near=(a:Vec,b:Vec,r:number)=>Math.hypot(a.x-b.x,a.y-b.y)<=r;

export class InteractionResolver {
  constructor(private core:Core){}
  private isLightGated(index:number){return index<this.core.level.lightGates;}
  private lightAllows(index:number){return !this.isLightGated(index)||this.core.light===(index%2);}

  interact():InteractionResult{
    let changed=false;const notes:string[]=[];
    for(let i=0;i<this.core.level.realSwitches;i++){
      if(this.core.isRealDone(i))continue;
      if(near(this.core.real,realSwitchPos(i,this.core.level.realSwitches),ShadowLayout.SWITCH_RADIUS)){
        if(!this.lightAllows(i)){notes.push(`现实机关 ${i+1} 需要切换光照`);continue;}
        if(this.core.activateReal(i)){changed=true;notes.push(`现实机关 ${i+1} 已激活`);}
      }
    }
    for(let i=0;i<this.core.level.shadowSwitches;i++){
      if(this.core.isShadowDone(i))continue;
      if(near(this.core.shadow,shadowSwitchPos(i,this.core.level.shadowSwitches),ShadowLayout.SWITCH_RADIUS)){
        if(!this.lightAllows(i)){notes.push(`影子机关 ${i+1} 需要切换光照`);continue;}
        if(this.core.activateShadow(i)){changed=true;notes.push(`影子机关 ${i+1} 已激活`);}
      }
    }
    const realAtExit=near(this.core.real,realExitPos(),ShadowLayout.EXIT_RADIUS);
    const shadowAtExit=near(this.core.shadow,shadowExitPos(),ShadowLayout.EXIT_RADIUS);
    const completed=this.core.canExit(realAtExit,shadowAtExit);
    if(!changed&&!completed&&!notes.length)notes.push('附近没有可互动机关');
    if(completed)notes.push('出口条件已满足');
    return{changed,completed,realAtExit,shadowAtExit,message:notes.join(' · ')};
  }
}

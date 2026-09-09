import { Core, Vec } from './Core';

export interface InteractionResult {
  changed:boolean;
  completed:boolean;
  message:string;
}

const near=(a:Vec,b:Vec,r=58)=>Math.hypot(a.x-b.x,a.y-b.y)<=r;

export class InteractionResolver {
  constructor(private core:Core){}

  private switchX(index:number,count:number){
    if(count<=1)return -40;
    const span=220;
    return -110 + index*(span/(count-1));
  }

  private realSwitch(index:number):Vec{
    return {x:this.switchX(index,this.core.level.realSwitches),y:155};
  }

  private shadowSwitch(index:number):Vec{
    return {x:this.switchX(index,this.core.level.shadowSwitches),y:-155};
  }

  private lightAllows(index:number){
    if(this.core.level.lightGates<=0)return true;
    // 中后期机关交替要求明/暗状态，形成实际玩法差异。
    return this.core.light===(index%2);
  }

  interact(){
    let changed=false;
    const notes:string[]=[];

    for(let i=0;i<this.core.level.realSwitches;i++){
      if(this.core.isRealDone(i))continue;
      if(near(this.core.real,this.realSwitch(i))){
        if(!this.lightAllows(i)){ notes.push('现实机关需要切换光照'); continue; }
        if(this.core.activateReal(i)){ changed=true; notes.push(`现实机关 ${i+1} 已激活`); }
      }
    }

    for(let i=0;i<this.core.level.shadowSwitches;i++){
      if(this.core.isShadowDone(i))continue;
      if(near(this.core.shadow,this.shadowSwitch(i))){
        if(!this.lightAllows(i)){ notes.push('影子机关需要切换光照'); continue; }
        if(this.core.activateShadow(i)){ changed=true; notes.push(`影子机关 ${i+1} 已激活`); }
      }
    }

    const realExit=near(this.core.real,{x:260,y:155},64);
    const shadowExit=near(this.core.shadow,{x:260,y:-155},64);
    const completed=this.core.canExit(realExit,shadowExit);

    if(!changed&&!completed&&!notes.length){
      notes.push('附近没有可互动机关');
    }
    if(completed) notes.push('出口条件已满足');

    return {changed,completed,message:notes.join(' · ')} as InteractionResult;
  }
}

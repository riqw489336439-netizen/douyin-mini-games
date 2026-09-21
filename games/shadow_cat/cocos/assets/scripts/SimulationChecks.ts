import { Core } from './Core';
import { SHADOW_CAT_LEVELS } from './LevelData';
import { InteractionResolver } from './InteractionResolver';

export interface SimulationResult { level:number; pass:boolean; actions:number; detail:string; }

function switchX(index:number,count:number){
  if(count<=1)return -40;
  return -110 + index*(220/(count-1));
}

function moveToX(core:Core,target:number){
  let actions=0;
  while(Math.abs(core.real.x-target)>24&&actions<40){
    core.move(core.real.x<target?36:-36,0);
    actions++;
  }
  return actions;
}

/**
 * 以“玩家逐步移动→切光→互动→前往出口”的方式模拟 30 关主路径。
 * 这是纯逻辑回归，不等同于 Cocos Creator/真机触控验收。
 */
export function runHumanPathSimulation():SimulationResult[]{
  return SHADOW_CAT_LEVELS.map(level=>{
    const core=new Core(level);
    const resolver=new InteractionResolver(core);
    let actions=0;

    const max=Math.max(level.realSwitches,level.shadowSwitches);
    for(let i=0;i<max;i++){
      const targets:number[]=[];
      if(i<level.realSwitches)targets.push(switchX(i,level.realSwitches));
      if(i<level.shadowSwitches)targets.push(switchX(i,level.shadowSwitches));
      for(const target of [...new Set(targets)]){
        actions+=moveToX(core,target);
        const required=i%2;
        if(level.lightGates>0&&core.light!==required){core.toggleLight();actions++;}
        resolver.interact(); actions++;
      }
    }

    actions+=moveToX(core,260);
    const exit=resolver.interact(); actions++;
    const pass=core.realActivated===level.realSwitches &&
      core.shadowActivated===level.shadowSwitches && exit.completed;

    return {
      level:level.id,
      pass,
      actions,
      detail:pass?'switches and exit reachable':'main path failed',
    };
  });
}

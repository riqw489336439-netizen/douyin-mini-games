import { SHADOW_CAT_LEVELS } from './LevelData';

export interface CheckResult { name:string; pass:boolean; detail:string; }

export function runShadowCatStaticChecks():CheckResult[]{
  const results:CheckResult[]=[];
  results.push({name:'level-count',pass:SHADOW_CAT_LEVELS.length===30,detail:`levels=${SHADOW_CAT_LEVELS.length}`});
  const ids=SHADOW_CAT_LEVELS.map(v=>v.id);
  results.push({name:'level-ids',pass:ids.every((v,i)=>v===i+1),detail:`first=${ids[0]},last=${ids[ids.length-1]}`});
  results.push({name:'time-limit',pass:SHADOW_CAT_LEVELS.every(v=>v.timeLimit>=0),detail:'all timeLimit >= 0'});
  results.push({name:'switch-count',pass:SHADOW_CAT_LEVELS.every(v=>v.realSwitches>=1&&v.shadowSwitches>=1),detail:'both worlds always have objectives'});
  results.push({name:'mechanic-ramp',pass:SHADOW_CAT_LEVELS.some(v=>v.lightGates>0)&&SHADOW_CAT_LEVELS.some(v=>v.dualExit)&&SHADOW_CAT_LEVELS.some(v=>v.movingShadow),detail:'light/dual-exit/moving-shadow all introduced'});
  return results;
}

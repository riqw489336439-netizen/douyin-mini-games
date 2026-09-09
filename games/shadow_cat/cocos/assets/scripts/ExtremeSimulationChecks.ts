import { Core } from './Core';
import { GameFlow } from './GameFlow';
import { getShadowCatLevel } from './LevelData';
import { SaveState } from './SaveState';

export interface ExtremeCheck {name:string;pass:boolean;detail:string;}

export function runExtremeSimulationChecks():ExtremeCheck[]{
  const out:ExtremeCheck[]=[];

  const corrupt:any={
    version:999,
    unlockedLevel:9999,
    bestStars:{'1':99,'2':-5,'30':2,'31':3,'__proto__':{'polluted':true}},
    sound:'bad',
    vibration:false,
  };
  const normalized=SaveState.normalize(corrupt);
  out.push({
    name:'corrupt-save-clamp',
    pass:normalized.unlockedLevel===30&&normalized.bestStars['1']===3&&!normalized.bestStars['2']&&normalized.bestStars['30']===2&&!('31' in normalized.bestStars),
    detail:`unlock=${normalized.unlockedLevel}, stars1=${normalized.bestStars['1']||0}, stars30=${normalized.bestStars['30']||0}`,
  });

  const core=new Core(getShadowCatLevel(1));
  for(let i=0;i<1000;i++)core.move(36,36);
  out.push({
    name:'movement-bounds',
    pass:Math.abs(core.real.x)<=300&&Math.abs(core.real.y)<=220&&Math.abs(core.shadow.x)<=300&&Math.abs(core.shadow.y)<=220,
    detail:`real=(${core.real.x},${core.real.y}), shadow=(${core.shadow.x},${core.shadow.y})`,
  });

  const flow=new GameFlow();
  flow.save={...SaveState.fresh(),unlockedLevel:6};
  flow.startLevel(6);
  if(flow.core){
    flow.core.elapsed=flow.core.level.timeLimit+1;
    flow.update(0.016);
  }
  out.push({
    name:'timeout-no-unlock',
    pass:flow.page==='result'&&flow.save.unlockedLevel===6&&!flow.resultSuccess&&flow.resultStars===0,
    detail:`page=${flow.page}, unlock=${flow.save.unlockedLevel}, success=${flow.resultSuccess}, stars=${flow.resultStars}`,
  });

  const endFlow=new GameFlow();
  endFlow.save={...SaveState.fresh(),unlockedLevel:30};
  endFlow.startLevel(30);
  endFlow.nextLevel();
  out.push({
    name:'level-30-next-safe',
    pass:endFlow.page==='home'&&endFlow.core===null,
    detail:`page=${endFlow.page}, core=${endFlow.core?'present':'null'}`,
  });

  return out;
}

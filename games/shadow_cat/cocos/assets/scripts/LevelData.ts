import { ShadowCatLevel, ShadowMode } from './Core';

export const SHADOW_CAT_LEVELS: ShadowCatLevel[] = Array.from({length:30},(_,i)=>{
  const id=i+1;
  let shadowMode:ShadowMode='mirror';
  let shadowLagSteps=0;
  let lightShift=0;

  // 不是单纯增加数值：按章节逐步改变影子的运动规则。
  if(id>=16&&id<=20){ shadowMode='lag'; shadowLagSteps=id>=19?2:1; }
  if(id>=21){ shadowMode='light-shift'; lightShift=id>=26?12:8; }

  return {
    id,
    realSwitches: id<4?1:id<11?2:3,
    shadowSwitches: id<7?1:id<16?2:3,
    lightGates: id<6?0:id<13?1:id<22?2:3,
    dualExit: id>=8,
    movingShadow: id>=16,
    shadowMode,
    shadowLagSteps,
    lightShift,
    timeLimit: id<6?0:id<15?90:id<24?75:60,
  };
});

export function getShadowCatLevel(id:number){
  const clamped=Math.max(1,Math.min(30,Math.floor(id||1)));
  return SHADOW_CAT_LEVELS[clamped-1];
}

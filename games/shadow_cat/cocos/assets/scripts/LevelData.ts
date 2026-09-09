import { ShadowCatLevel, ShadowMode } from './Core';

export const SHADOW_CAT_LEVELS: ShadowCatLevel[] = Array.from({length:30},(_,i)=>{
  const id=i+1;
  let shadowMode:ShadowMode='mirror';
  let shadowLagSteps=0;
  let lightShift=0;

  if(id>=16&&id<=20){ shadowMode='lag'; shadowLagSteps=id>=19?2:1; }
  if(id>=21){ shadowMode='light-shift'; lightShift=id>=26?12:8; }

  // 真人节奏预留：新机制首次出现时不同时压缩时间，避免“逻辑可解但来不及理解”。
  let timeLimit=0;
  if(id>=6&&id<=10) timeLimit=100;
  else if(id>=11&&id<=15) timeLimit=95;
  else if(id>=16&&id<=18) timeLimit=105;
  else if(id>=19&&id<=20) timeLimit=115;
  else if(id>=21&&id<=25) timeLimit=100;
  else if(id>=26) timeLimit=90;

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
    timeLimit,
  };
});

export function getShadowCatLevel(id:number){
  const clamped=Math.max(1,Math.min(30,Math.floor(id||1)));
  return SHADOW_CAT_LEVELS[clamped-1];
}

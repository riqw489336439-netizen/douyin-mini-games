import { ShadowCatLevel } from './Core';

export const SHADOW_CAT_LEVELS: ShadowCatLevel[] = Array.from({length:30},(_,i)=>{
  const id=i+1;
  return {
    id,
    realSwitches: id<4?1:id<11?2:3,
    shadowSwitches: id<7?1:id<16?2:3,
    lightGates: id<5?0:id<13?1:id<22?2:3,
    dualExit: id>=8,
    movingShadow: id>=12,
    timeLimit: id<6?0:id<15?90:id<24?75:60,
  };
});

export function getShadowCatLevel(id:number){
  const clamped=Math.max(1,Math.min(30,Math.floor(id||1)));
  return SHADOW_CAT_LEVELS[clamped-1];
}

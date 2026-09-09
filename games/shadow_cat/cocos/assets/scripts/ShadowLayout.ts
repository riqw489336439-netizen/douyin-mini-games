import { Vec } from './Core';

/** 单一几何真相源：玩法判定和表现层都应引用这里，避免坐标漂移。 */
export const ShadowLayout={
  REAL_Y:155,
  SHADOW_Y:-155,
  EXIT_X:260,
  EXIT_RADIUS:64,
  SWITCH_RADIUS:58,
  WORLD_MIN_X:-300,
  WORLD_MAX_X:300,
  WORLD_MIN_Y:-250,
  WORLD_MAX_Y:250,
} as const;

export function switchX(index:number,count:number){
  if(count<=1)return -40;
  return -110+index*(220/(count-1));
}
export function realSwitchPos(index:number,count:number):Vec{return{x:switchX(index,count),y:ShadowLayout.REAL_Y};}
export function shadowSwitchPos(index:number,count:number):Vec{return{x:switchX(index,count),y:ShadowLayout.SHADOW_Y};}
export function realExitPos():Vec{return{x:ShadowLayout.EXIT_X,y:ShadowLayout.REAL_Y};}
export function shadowExitPos():Vec{return{x:ShadowLayout.EXIT_X,y:ShadowLayout.SHADOW_Y};}

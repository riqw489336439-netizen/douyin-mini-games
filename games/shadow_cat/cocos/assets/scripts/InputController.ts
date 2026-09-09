import { Core } from './Core';

export type MoveDir='left'|'right'|'up'|'down';

export interface InputResult {
  moved:boolean;
  reason?:'finished'|'invalid';
}

/**
 * 将触控/键盘输入与核心玩法解耦。
 * UI 层只调用这里，不直接改 Core 状态。
 */
export class InputController {
  constructor(private core:Core, private step=36){}

  move(dir:MoveDir):InputResult{
    if(this.core.finished) return {moved:false,reason:'finished'};
    const s=this.step;
    switch(dir){
      case 'left': this.core.move(-s,0); break;
      case 'right': this.core.move(s,0); break;
      case 'up': this.core.move(0,s); break;
      case 'down': this.core.move(0,-s); break;
      default: return {moved:false,reason:'invalid'};
    }
    return {moved:true};
  }

  toggleLight(){
    if(this.core.finished) return false;
    this.core.toggleLight();
    return true;
  }

  catchUpShadow(){
    if(this.core.finished)return false;
    return this.core.flushShadowLag();
  }
}

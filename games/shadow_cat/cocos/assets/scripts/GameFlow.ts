import { Core } from './Core';
import { getShadowCatLevel } from './LevelData';
import { SaveState, ShadowCatSave } from './SaveState';

export type GamePage='home'|'levels'|'tutorial'|'playing'|'paused'|'result';

export class GameFlow {
  page:GamePage='home';
  level=1;
  core:Core|null=null;
  save:ShadowCatSave=SaveState.load();
  resultStars=0;
  private backgroundAt=0;

  goHome(){ this.page='home'; this.core=null; }
  openLevels(){ this.page='levels'; }
  openTutorial(){ this.page='tutorial'; }

  startLevel(level:number){
    const safe=Math.max(1,Math.min(this.save.unlockedLevel,Math.floor(level||1)));
    this.level=safe;
    this.core=new Core(getShadowCatLevel(safe));
    this.resultStars=0;
    this.page='playing';
  }

  pause(){ if(this.page==='playing') this.page='paused'; }
  resume(){ if(this.page==='paused') this.page='playing'; }
  retry(){ this.startLevel(this.level); }
  backFromPause(){ this.goHome(); }

  update(dt:number){
    if(this.page!=='playing'||!this.core)return;
    this.core.tick(dt);
    if(this.core.isTimedOut()) this.retry();
  }

  tryComplete(realAtExit:boolean,shadowAtExit:boolean){
    if(this.page!=='playing'||!this.core)return false;
    if(!this.core.complete(realAtExit,shadowAtExit))return false;
    const ratio=this.core.level.timeLimit>0?this.core.elapsed/this.core.level.timeLimit:0;
    this.resultStars=ratio<=0.5?3:ratio<=0.8?2:1;
    SaveState.completeLevel(this.save,this.level,this.resultStars);
    this.page='result';
    return true;
  }

  nextLevel(){
    if(this.level>=30){ this.goHome(); return; }
    this.startLevel(this.level+1);
  }

  onHide(nowMs=Date.now()){ this.backgroundAt=nowMs; }
  onShow(nowMs=Date.now()){
    if(!this.backgroundAt||!this.core)return;
    // 后台停留不计入关卡计时，避免切回时直接判超时。
    this.backgroundAt=0;
  }
}

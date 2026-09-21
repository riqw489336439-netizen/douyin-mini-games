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
  resultSuccess=false;
  private backgroundAt=0;

  goHome(){ this.page='home'; this.core=null; }
  openLevels(){ this.page='levels'; }
  openTutorial(){ this.page='tutorial'; }

  startLevel(level:number){
    const safe=Math.max(1,Math.min(this.save.unlockedLevel,Math.floor(level||1)));
    this.level=safe;
    this.core=new Core(getShadowCatLevel(safe));
    this.resultStars=0;
    this.resultSuccess=false;
    this.page='playing';
  }

  pause(){ if(this.page==='playing') this.page='paused'; }
  resume(){ if(this.page==='paused') this.page='playing'; }
  retry(){ this.startLevel(this.level); }
  backFromPause(){ this.goHome(); }

  update(dt:number){
    if(this.page!=='playing'||!this.core)return;
    this.core.tick(dt);
    if(this.core.isTimedOut()){
      this.resultStars=0;
      this.resultSuccess=false;
      this.page='result';
    }
  }

  tryComplete(realAtExit:boolean,shadowAtExit:boolean){
    if(this.page!=='playing'||!this.core)return false;
    if(!this.core.complete(realAtExit,shadowAtExit))return false;
    const limit=this.core.level.timeLimit;
    const ratio=limit>0?this.core.elapsed/limit:0;
    // 三星标准给正常观察/试错留余量；星级是奖励，不影响继续闯关。
    this.resultStars=limit<=0?3:ratio<=0.65?3:ratio<=0.9?2:1;
    this.resultSuccess=true;
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
    // 后台停留时间不计入关卡倒计时；返回后由 Bootstrap 保持暂停等待玩家主动继续。
    this.backgroundAt=0;
  }
}

import {
  _decorator, Component, Node, Canvas, Camera, Layers, UITransform,
  Label, Color, Vec3, director, input, Input, EventKeyboard, KeyCode, Graphics
} from 'cc';
import { GameFlow } from './GameFlow';
import { InputController, MoveDir } from './InputController';
import { InteractionResolver } from './InteractionResolver';

const { ccclass } = _decorator;

@ccclass('ShadowCatBootstrap')
export class ShadowCatBootstrap extends Component {
  private flow=new GameFlow();
  private inputCtl:InputController|null=null;
  private resolver:InteractionResolver|null=null;
  private root:Node|null=null;
  private status:Label|null=null;
  private hint:Label|null=null;
  private realCat:Node|null=null;
  private shadowCat:Node|null=null;
  private levelsPage=0;
  private lastPage='';

  start(){
    this.ensureUiRoot();
    this.showHome();
    input.on(Input.EventType.KEY_DOWN,this.onKeyDown,this);
  }

  onDestroy(){ input.off(Input.EventType.KEY_DOWN,this.onKeyDown,this); }

  update(dt:number){
    const before=this.flow.page;
    this.flow.update(dt);
    if(before==='playing'&&this.flow.page==='result'){
      this.showResult();
      return;
    }
    if(this.flow.page==='playing'&&this.flow.core){
      this.syncActors();
      this.refreshStatus();
    }
  }

  private ensureUiRoot(){
    if(this.root)return;
    const canvasNode=new Node('ShadowCatCanvas');
    canvasNode.layer=Layers.Enum.UI_2D;
    canvasNode.addComponent(Canvas);
    canvasNode.addComponent(UITransform).setContentSize(720,1280);
    const cameraNode=new Node('UICamera');
    cameraNode.layer=Layers.Enum.UI_2D;
    const cam=cameraNode.addComponent(Camera);
    cam.projection=Camera.ProjectionType.ORTHO;
    cam.visibility=Layers.Enum.UI_2D;
    cameraNode.setPosition(0,0,1000);
    canvasNode.addChild(cameraNode);
    director.getScene()?.addChild(canvasNode);
    this.root=canvasNode;
  }

  private clear(){
    if(!this.root)return;
    [...this.root.children].forEach(n=>{if(n.name!=='UICamera')n.destroy();});
    this.status=null; this.hint=null; this.realCat=null; this.shadowCat=null;
  }

  private makeText(text:string,y:number,size=36){
    const n=new Node('Text'); n.layer=Layers.Enum.UI_2D;
    n.addComponent(UITransform).setContentSize(660,90);
    const l=n.addComponent(Label); l.string=text; l.fontSize=size; l.lineHeight=size+8; l.color=new Color(35,35,45,255);
    n.setPosition(0,y,0); this.root?.addChild(n); return l;
  }

  private makeButton(text:string,x:number,y:number,onTap:()=>void,w=210,h=76){
    const n=new Node(`Btn_${text}`); n.layer=Layers.Enum.UI_2D;
    n.addComponent(UITransform).setContentSize(w,h);
    const g=n.addComponent(Graphics); g.fillColor=new Color(235,240,252,255); g.roundRect(-w/2,-h/2,w,h,18); g.fill();
    const l=n.addComponent(Label); l.string=text; l.fontSize=26; l.lineHeight=32; l.color=new Color(35,35,45,255);
    n.setPosition(x,y,0); n.on(Node.EventType.TOUCH_END,onTap,this); this.root?.addChild(n); return n;
  }

  private makeCat(name:string,y:number,color:Color){
    const n=new Node(name); n.layer=Layers.Enum.UI_2D;
    n.addComponent(UITransform).setContentSize(76,76);
    const g=n.addComponent(Graphics); g.fillColor=color; g.circle(0,0,32); g.fill();
    n.setPosition(-220,y,0); this.root?.addChild(n); return n;
  }

  private showHome(){
    this.flow.goHome(); this.lastPage='home'; this.clear();
    this.makeText('影子小猫',420,56);
    this.makeText('现实与影子必须互相配合',340,28);
    this.makeButton('开始游戏',0,160,()=>this.startLevel(this.flow.save.unlockedLevel));
    this.makeButton('关卡选择',0,60,()=>this.showLevels(0));
    this.makeButton('玩法说明',0,-40,()=>this.showTutorial());
  }

  private showLevels(page=this.levelsPage){
    this.flow.openLevels(); this.lastPage='levels'; this.levelsPage=Math.max(0,Math.min(2,page)); this.clear();
    this.makeText('选择关卡',470,46);
    const start=this.levelsPage*10+1;
    const end=Math.min(30,start+9);
    for(let i=start;i<=end;i++){
      const col=(i-start)%2,row=Math.floor((i-start)/2);
      const unlocked=i<=this.flow.save.unlockedLevel;
      this.makeButton(unlocked?`第${i}关`:`第${i}关 🔒`,-130+col*260,320-row*105,()=>{if(unlocked)this.startLevel(i);},230,76);
    }
    if(this.levelsPage>0)this.makeButton('上一页',-130,-300,()=>this.showLevels(this.levelsPage-1));
    if(this.levelsPage<2)this.makeButton('下一页',130,-300,()=>this.showLevels(this.levelsPage+1));
    this.makeButton('返回首页',0,-410,()=>this.showHome());
  }

  private showTutorial(){
    this.flow.openTutorial(); this.lastPage='tutorial'; this.clear();
    this.makeText('玩法说明',440,46);
    this.makeText('移动现实猫，影子猫会镜像移动',300,26);
    this.makeText('靠近机关后点击“互动”激活',235,26);
    this.makeText('中后期部分机关需要正确光照状态',170,26);
    this.makeText('完成两侧机关后到右侧出口',105,26);
    this.makeButton('返回首页',0,-300,()=>this.showHome());
  }

  private startLevel(level:number){
    this.flow.startLevel(level);
    if(!this.flow.core)return;
    this.inputCtl=new InputController(this.flow.core);
    this.resolver=new InteractionResolver(this.flow.core);
    this.renderPlaying();
  }

  private renderPlaying(){
    if(!this.flow.core)return;
    this.lastPage='playing'; this.clear();
    this.makeText(`第 ${this.flow.level} 关`,540,38);
    this.status=this.makeText('',480,22);
    this.hint=this.makeText('移动到机关附近并点击互动',420,20);
    this.realCat=this.makeCat('RealCat',155,new Color(255,190,90,255));
    this.shadowCat=this.makeCat('ShadowCat',-155,new Color(115,105,180,255));
    this.makeButton('↑',0,-315,()=>this.move('up'),140,70);
    this.makeButton('←',-170,-400,()=>this.move('left'),140,70);
    this.makeButton('↓',0,-400,()=>this.move('down'),140,70);
    this.makeButton('→',170,-400,()=>this.move('right'),140,70);
    this.makeButton('互动',-210,-510,()=>this.interact(),160,72);
    this.makeButton('切换光照',0,-510,()=>this.toggleLight(),190,72);
    this.makeButton('暂停',210,-510,()=>this.pause(),160,72);
    this.syncActors(); this.refreshStatus();
  }

  private move(dir:MoveDir){
    if(this.flow.page!=='playing')return;
    this.inputCtl?.move(dir); this.syncActors();
  }

  private toggleLight(){
    if(this.flow.page!=='playing')return;
    this.inputCtl?.toggleLight(); this.refreshStatus();
  }

  private interact(){
    if(this.flow.page!=='playing'||!this.resolver)return;
    const r=this.resolver.interact();
    if(this.hint)this.hint.string=r.message;
    this.refreshStatus();
    if(r.completed&&this.flow.tryComplete(r.realAtExit,r.shadowAtExit))this.showResult();
  }

  private pause(){
    if(this.flow.page!=='playing')return;
    this.flow.pause(); this.clear(); this.lastPage='paused';
    this.makeText('已暂停',260,54);
    this.makeButton('继续游戏',0,80,()=>this.resumeFromPause());
    this.makeButton('重新开始',0,-20,()=>this.startLevel(this.flow.level));
    this.makeButton('返回首页',0,-120,()=>this.showHome());
  }

  private resumeFromPause(){
    if(this.flow.page!=='paused')return;
    this.flow.resume(); this.renderPlaying();
  }

  private showResult(){
    this.clear(); this.lastPage='result';
    if(this.flow.resultSuccess){
      this.makeText('通关成功',320,54);
      this.makeText(`星级：${'★'.repeat(this.flow.resultStars)}${'☆'.repeat(3-this.flow.resultStars)}`,230,34);
      if(this.flow.level<30)this.makeButton('下一关',0,70,()=>{this.flow.nextLevel();if(this.flow.core){this.inputCtl=new InputController(this.flow.core);this.resolver=new InteractionResolver(this.flow.core);this.renderPlaying();}});
    }else{
      this.makeText('时间到',320,54);
      this.makeText('本次进度不会覆盖最佳成绩',230,26);
    }
    this.makeButton('重试',0,-40,()=>this.startLevel(this.flow.level));
    this.makeButton('关卡选择',0,-140,()=>this.showLevels(Math.floor((this.flow.level-1)/10)));
    this.makeButton('返回首页',0,-240,()=>this.showHome());
  }

  private syncActors(){
    const c=this.flow.core;if(!c)return;
    this.realCat?.setPosition(new Vec3(c.real.x,c.real.y,0));
    this.shadowCat?.setPosition(new Vec3(c.shadow.x,c.shadow.y,0));
  }

  private refreshStatus(){
    if(!this.status||!this.flow.core)return;
    const c=this.flow.core;
    const time=c.level.timeLimit>0?` · ${Math.max(0,Math.ceil(c.level.timeLimit-c.elapsed))}s`:'';
    this.status.string=`现实 ${c.realActivated}/${c.level.realSwitches} · 影子 ${c.shadowActivated}/${c.level.shadowSwitches} · ${c.light?'亮':'暗'}${time}`;
  }

  private onKeyDown(e:EventKeyboard){
    if(e.keyCode===KeyCode.ESCAPE){
      if(this.flow.page==='playing')this.pause();
      else if(this.flow.page==='paused')this.resumeFromPause();
      else if(this.flow.page==='levels'||this.flow.page==='tutorial'||this.flow.page==='result')this.showHome();
      return;
    }
    if(this.flow.page!=='playing')return;
    if(e.keyCode===KeyCode.SPACE){this.interact();return;}
    const map:Partial<Record<KeyCode,MoveDir>>={
      [KeyCode.ARROW_LEFT]:'left',[KeyCode.KEY_A]:'left',
      [KeyCode.ARROW_RIGHT]:'right',[KeyCode.KEY_D]:'right',
      [KeyCode.ARROW_UP]:'up',[KeyCode.KEY_W]:'up',
      [KeyCode.ARROW_DOWN]:'down',[KeyCode.KEY_S]:'down',
    };
    const dir=map[e.keyCode]; if(dir)this.move(dir);
  }
}

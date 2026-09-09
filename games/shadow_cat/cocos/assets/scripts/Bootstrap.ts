import {
  _decorator, Component, Node, Canvas, Camera, Layers, UITransform,
  Label, Color, Sprite, SpriteFrame, Vec3, director, input, Input, EventKeyboard, KeyCode
} from 'cc';
import { GameFlow } from './GameFlow';
import { InputController, MoveDir } from './InputController';

const { ccclass } = _decorator;

/**
 * 影子小猫最小可运行启动组件。
 * 使用方式：在首场景创建空节点 App，并挂载本脚本。
 * 本组件负责运行时创建 Canvas/Camera/HUD，降低手写 scene 文件导致灰屏的风险。
 */
@ccclass('ShadowCatBootstrap')
export class ShadowCatBootstrap extends Component {
  private flow=new GameFlow();
  private inputCtl:InputController|null=null;
  private root:Node|null=null;
  private status:Label|null=null;
  private realCat:Node|null=null;
  private shadowCat:Node|null=null;

  start(){
    this.ensureUiRoot();
    this.showHome();
    input.on(Input.EventType.KEY_DOWN,this.onKeyDown,this);
  }

  onDestroy(){
    input.off(Input.EventType.KEY_DOWN,this.onKeyDown,this);
  }

  update(dt:number){
    this.flow.update(dt);
    if(this.flow.page==='playing'&&this.flow.core){
      this.syncActors();
      this.refreshStatus();
    }
  }

  private ensureUiRoot(){
    if(this.root) return;
    const canvasNode=new Node('ShadowCatCanvas');
    canvasNode.layer=Layers.Enum.UI_2D;
    canvasNode.addComponent(Canvas);
    const ui=canvasNode.addComponent(UITransform);
    ui.setContentSize(720,1280);

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
    [...this.root.children].forEach(n=>{ if(n.name!=='UICamera') n.destroy(); });
    this.status=null;
    this.realCat=null;
    this.shadowCat=null;
  }

  private makeText(text:string,y:number,size=36){
    const n=new Node(`Text_${text}`);
    n.layer=Layers.Enum.UI_2D;
    const t=n.addComponent(UITransform); t.setContentSize(620,80);
    const l=n.addComponent(Label); l.string=text; l.fontSize=size; l.lineHeight=size+8; l.color=new Color(40,40,50,255);
    n.setPosition(0,y,0);
    this.root?.addChild(n);
    return l;
  }

  private makeButton(text:string,x:number,y:number,onTap:()=>void){
    const n=new Node(`Btn_${text}`); n.layer=Layers.Enum.UI_2D;
    const t=n.addComponent(UITransform); t.setContentSize(220,76);
    const sp=n.addComponent(Sprite); sp.spriteFrame=new SpriteFrame(); sp.color=new Color(238,238,248,255);
    const l=n.addComponent(Label); l.string=text; l.fontSize=28; l.lineHeight=34; l.color=new Color(35,35,45,255);
    n.setPosition(x,y,0);
    n.on(Node.EventType.TOUCH_END,onTap,this);
    this.root?.addChild(n);
    return n;
  }

  private makeCat(name:string,y:number,color:Color){
    const n=new Node(name); n.layer=Layers.Enum.UI_2D;
    const t=n.addComponent(UITransform); t.setContentSize(72,72);
    const sp=n.addComponent(Sprite); sp.spriteFrame=new SpriteFrame(); sp.color=color;
    n.setPosition(-220,y,0);
    this.root?.addChild(n);
    return n;
  }

  private showHome(){
    this.flow.goHome(); this.clear();
    this.makeText('影子小猫',420,56);
    this.makeText('现实与影子必须互相配合',340,28);
    this.makeButton('开始游戏',0,160,()=>this.startLevel(this.flow.save.unlockedLevel));
    this.makeButton('关卡选择',0,60,()=>this.showLevels());
    this.makeButton('玩法说明',0,-40,()=>this.showTutorial());
  }

  private showLevels(){
    this.flow.openLevels(); this.clear();
    this.makeText('选择关卡',450,46);
    for(let i=1;i<=Math.min(12,this.flow.save.unlockedLevel);i++){
      const col=(i-1)%3, row=Math.floor((i-1)/3);
      this.makeButton(`第${i}关`,-240+col*240,300-row*100,()=>this.startLevel(i));
    }
    this.makeButton('返回',0,-360,()=>this.showHome());
  }

  private showTutorial(){
    this.flow.openTutorial(); this.clear();
    this.makeText('玩法说明',440,46);
    this.makeText('移动现实猫时，影子猫会镜像移动',300,26);
    this.makeText('完成两侧机关后一起到达出口',235,26);
    this.makeText('部分关卡需要切换光照状态',170,26);
    this.makeButton('返回首页',0,-300,()=>this.showHome());
  }

  private startLevel(level:number){
    this.flow.startLevel(level);
    if(!this.flow.core)return;
    this.inputCtl=new InputController(this.flow.core);
    this.clear();
    this.makeText(`第 ${this.flow.level} 关`,540,38);
    this.status=this.makeText('',470,22);
    this.realCat=this.makeCat('RealCat',155,new Color(255,190,90,255));
    this.shadowCat=this.makeCat('ShadowCat',-155,new Color(115,105,180,255));

    this.makeButton('↑',0,-350,()=>this.move('up'));
    this.makeButton('←',-230,-450,()=>this.move('left'));
    this.makeButton('↓',0,-450,()=>this.move('down'));
    this.makeButton('→',230,-450,()=>this.move('right'));
    this.makeButton('切换光照',-170,-555,()=>{this.inputCtl?.toggleLight();this.refreshStatus();});
    this.makeButton('暂停',170,-555,()=>this.pause());
    this.syncActors(); this.refreshStatus();
  }

  private move(dir:MoveDir){ this.inputCtl?.move(dir); this.syncActors(); }

  private pause(){
    this.flow.pause();
    if(this.flow.page!=='paused')return;
    this.makeButton('继续',-120,0,()=>{ this.flow.resume(); this.startLevel(this.flow.level); });
    this.makeButton('返回首页',120,0,()=>this.showHome());
  }

  private syncActors(){
    const c=this.flow.core;if(!c)return;
    this.realCat?.setPosition(new Vec3(c.real.x,c.real.y,0));
    this.shadowCat?.setPosition(new Vec3(c.shadow.x,c.shadow.y,0));
  }

  private refreshStatus(){
    if(!this.status||!this.flow.core)return;
    const c=this.flow.core;
    this.status.string=`现实机关 ${c.realActivated}/${c.level.realSwitches} · 影子机关 ${c.shadowActivated}/${c.level.shadowSwitches} · 光照 ${c.light?'亮':'暗'}`;
  }

  private onKeyDown(e:EventKeyboard){
    if(this.flow.page!=='playing')return;
    const map:Partial<Record<KeyCode,MoveDir>>={
      [KeyCode.ARROW_LEFT]:'left',[KeyCode.KEY_A]:'left',
      [KeyCode.ARROW_RIGHT]:'right',[KeyCode.KEY_D]:'right',
      [KeyCode.ARROW_UP]:'up',[KeyCode.KEY_W]:'up',
      [KeyCode.ARROW_DOWN]:'down',[KeyCode.KEY_S]:'down',
    };
    const dir=map[e.keyCode]; if(dir)this.move(dir);
  }
}

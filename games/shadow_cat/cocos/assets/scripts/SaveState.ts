import { DouyinBridge } from './DouyinBridge';

export interface ShadowCatSave {
  version:number;
  unlockedLevel:number;
  bestStars:Record<string,number>;
  sound:boolean;
  vibration:boolean;
}

const KEY='shadow_cat_save_v1';

export class SaveState {
  static fresh():ShadowCatSave{
    return {version:1,unlockedLevel:1,bestStars:{},sound:true,vibration:true};
  }

  static load():ShadowCatSave{
    const raw=DouyinBridge.load(KEY);
    if(!raw||typeof raw!=='object') return this.fresh();
    const save=this.fresh();
    save.unlockedLevel=Math.max(1,Math.min(30,Number(raw.unlockedLevel)||1));
    save.bestStars=raw.bestStars&&typeof raw.bestStars==='object'?raw.bestStars:{};
    save.sound=raw.sound!==false;
    save.vibration=raw.vibration!==false;
    return save;
  }

  static write(save:ShadowCatSave){
    return DouyinBridge.save(KEY,save);
  }

  static completeLevel(save:ShadowCatSave,level:number,stars:number){
    const lv=Math.max(1,Math.min(30,Math.floor(level)));
    const safeStars=Math.max(0,Math.min(3,Math.floor(stars)));
    const key=String(lv);
    save.bestStars[key]=Math.max(save.bestStars[key]||0,safeStars);
    if(lv<30) save.unlockedLevel=Math.max(save.unlockedLevel,lv+1);
    this.write(save);
  }
}

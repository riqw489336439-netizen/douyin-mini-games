import { DouyinBridge } from './DouyinBridge';

export interface ShadowCatSave {
  version:number;
  unlockedLevel:number;
  bestStars:Record<string,number>;
  sound:boolean;
  vibration:boolean;
}

const KEY='shadow_cat_save_v1';
const CURRENT_VERSION=1;

const clampInt=(value:any,min:number,max:number,fallback:number)=>{
  const n=Number(value);
  if(!Number.isFinite(n))return fallback;
  return Math.max(min,Math.min(max,Math.floor(n)));
};

export class SaveState {
  static fresh():ShadowCatSave{
    return {version:CURRENT_VERSION,unlockedLevel:1,bestStars:{},sound:true,vibration:true};
  }

  static load():ShadowCatSave{
    const raw=DouyinBridge.load(KEY);
    if(!raw||typeof raw!=='object'||Array.isArray(raw)) return this.fresh();

    const save=this.fresh();
    save.unlockedLevel=clampInt(raw.unlockedLevel,1,30,1);

    // 只接受 1~30 关且 0~3 星，避免损坏/旧版本存档把异常键值带入运行态。
    if(raw.bestStars&&typeof raw.bestStars==='object'&&!Array.isArray(raw.bestStars)){
      for(let level=1;level<=30;level++){
        const key=String(level);
        const stars=clampInt(raw.bestStars[key],0,3,0);
        if(stars>0)save.bestStars[key]=stars;
      }
    }

    save.sound=raw.sound!==false;
    save.vibration=raw.vibration!==false;
    return save;
  }

  static write(save:ShadowCatSave){
    const safe=this.normalize(save);
    // 同步回内存，保证写入前后状态一致。
    Object.assign(save,safe);
    return DouyinBridge.save(KEY,safe);
  }

  static normalize(input:ShadowCatSave):ShadowCatSave{
    const safe=this.fresh();
    safe.unlockedLevel=clampInt(input?.unlockedLevel,1,30,1);
    safe.sound=input?.sound!==false;
    safe.vibration=input?.vibration!==false;
    const stars=input?.bestStars||{};
    for(let level=1;level<=30;level++){
      const key=String(level);
      const v=clampInt(stars[key],0,3,0);
      if(v>0)safe.bestStars[key]=v;
    }
    return safe;
  }

  static completeLevel(save:ShadowCatSave,level:number,stars:number){
    const lv=clampInt(level,1,30,1);
    const safeStars=clampInt(stars,0,3,0);
    const key=String(lv);
    save.bestStars[key]=Math.max(save.bestStars[key]||0,safeStars);
    if(lv<30) save.unlockedLevel=Math.max(save.unlockedLevel,lv+1);
    this.write(save);
  }
}

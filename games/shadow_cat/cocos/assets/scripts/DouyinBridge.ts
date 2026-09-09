declare const tt:any;

export class DouyinBridge {
  static vibrate(){
    try{tt?.vibrateShort?.({type:'light'});}catch{}
  }

  static save(key:string,value:any){
    try{tt?.setStorageSync?.(key,value);return true;}catch{return false;}
  }

  static load(key:string){
    try{return tt?.getStorageSync?.(key);}catch{return null;}
  }

  // 分享永远由用户明确点击触发，不作为通关、领奖或继续游戏的前置条件。
  static shareFromUserAction(title:string){
    try{tt?.shareAppMessage?.({title});return true;}catch{return false;}
  }

  // 激励视频只能从明确标注“观看视频”的用户操作进入。
  // 关闭、失败或未完整观看都必须返回 false，正常关卡仍可继续游玩。
  static rewardedFromUserAction(adUnitId:string){
    return new Promise<boolean>(resolve=>{
      if(!adUnitId){resolve(false);return;}
      try{
        const ad=tt?.createRewardedVideoAd?.({adUnitId});
        if(!ad){resolve(false);return;}
        let settled=false;
        const finish=(value:boolean)=>{if(settled)return;settled=true;resolve(value);};
        ad.onClose?.((result:any)=>finish(!!result?.isEnded));
        ad.onError?.(()=>finish(false));
        Promise.resolve(ad.show?.()).catch(()=>finish(false));
      }catch{resolve(false);}
    });
  }
}

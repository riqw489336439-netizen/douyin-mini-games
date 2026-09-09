declare const tt:any;

export class DouyinBridge {
  private static platform(){
    try{return typeof tt!=='undefined'?tt:null;}catch{return null;}
  }

  static vibrate(){
    try{this.platform()?.vibrateShort?.({type:'light'});}catch{}
  }

  static save(key:string,value:any){
    try{
      const p=this.platform();
      if(p?.setStorageSync){p.setStorageSync(key,value);return true;}
      const g:any=globalThis as any;
      if(g?.localStorage){g.localStorage.setItem(key,JSON.stringify(value));return true;}
    }catch{}
    return false;
  }

  static load(key:string){
    try{
      const p=this.platform();
      if(p?.getStorageSync)return p.getStorageSync(key);
      const g:any=globalThis as any;
      const raw=g?.localStorage?.getItem?.(key);
      if(raw)return JSON.parse(raw);
    }catch{}
    return null;
  }

  static shareFromUserAction(title:string){
    try{
      const p=this.platform();
      if(!p?.shareAppMessage)return false;
      p.shareAppMessage({title});
      return true;
    }catch{return false;}
  }

  static rewardedFromUserAction(adUnitId:string,timeoutMs=15000){
    return new Promise<boolean>(resolve=>{
      if(!adUnitId){resolve(false);return;}
      const p=this.platform();
      if(!p?.createRewardedVideoAd){resolve(false);return;}

      let ad:any=null;
      let settled=false;
      let timer:any=null;
      const cleanup=()=>{
        try{if(timer)clearTimeout(timer);}catch{}
        try{ad?.offClose?.();}catch{}
        try{ad?.offError?.();}catch{}
      };
      const finish=(value:boolean)=>{
        if(settled)return;
        settled=true;
        cleanup();
        resolve(value);
      };

      try{
        ad=p.createRewardedVideoAd({adUnitId});
        if(!ad){finish(false);return;}
        ad.onClose?.((result:any)=>finish(!!result?.isEnded));
        ad.onError?.(()=>finish(false));
        timer=setTimeout(()=>finish(false),Math.max(3000,timeoutMs));

        const show=()=>Promise.resolve(ad.show?.()).catch(()=>finish(false));
        if(ad.load){
          Promise.resolve(ad.load()).then(show).catch(()=>show());
        }else{
          show();
        }
      }catch{finish(false);}
    });
  }
}

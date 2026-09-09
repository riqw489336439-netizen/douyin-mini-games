# 生命周期与残留引用回归 R1

## 本轮修复
- 游戏进入后台时明确进入 paused，并标记 pausedByBackground。
- 回到前台后重新绘制暂停页，显示“已从后台返回，点击继续后恢复本关”，避免恢复状态不明确。
- 后台停留时间仍不进入关卡计时；只有玩家主动点击继续才回到 playing。
- 离开玩法进入首页、选关、教程、结算时清空 InputController / InteractionResolver 引用，避免它们继续持有旧 Core。
- 暂停页统一由 showPause 渲染，减少手动暂停和后台暂停两条 UI 路径漂移。

## 独立复核
- 旧节点通过 clear()->destroy() 清理；全局 keyboard/game 生命周期监听只在 Bootstrap start 注册一次，并在 onDestroy 解除。
- 新按钮事件绑定在按钮节点本身，节点销毁后不再保留为全局监听。
- 结算页清除旧控制器后，“下一关/重试”都会创建绑定新 Core 的控制器。

## 尚未验证
Cocos Creator 3.8.x 的实际 EVENT_HIDE/EVENT_SHOW 顺序、真机后台恢复、10 分钟连续运行、内存/节点增长仍必须在真实运行环境验证。

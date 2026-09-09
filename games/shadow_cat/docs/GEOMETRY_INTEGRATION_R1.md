# 空间坐标统一：分段集成 R1

## 分段 A：判定层
InteractionResolver 已使用 ShadowLayout 的机关位置、出口位置和半径。

## 分段 B：核心层
Core 已使用 ShadowLayout 的世界边界和现实/影子初始 Y 坐标。

## 分段 C：表现层
Bootstrap 已移除自己的 switchX 计算，机关、出口、现实/影子世界及角色初始 Y 改为引用 ShadowLayout。

## 最终衔接
现在空间规则链路为：
`ShadowLayout -> Core / InteractionResolver / Bootstrap`

这样后续调整空间参数时，玩法状态、互动判定和画面表现共享同一数据源。

## 独立复核发现的下一问题
LightSeal 当前仍绘制为贯穿两个世界的竖直长条，但逻辑上并不存在实体阻挡/碰撞。玩家可能把它理解成墙。下一段应单独处理“光照机关视觉语义”，不在本段同时改变碰撞逻辑，以免破坏已经验证过的关卡可解性模型。

## 验证边界
本段完成源码级集成，不代表 Cocos Creator 编译、抖音开发者工具和真机验证已经完成。

# 母工程框架抽离 R2

## 本轮完成
- Core.ts 迁移到 ShadowLayout 统一世界边界和初始坐标。
- 消除 Core 内部重复的 -300/300/-250/250 常量。
- 现实世界和影子世界的坐标来源进一步统一。

## 当前架构状态
表现层、交互层、核心层逐步共享同一空间定义：

ShadowLayout
  ↓
Core（移动/状态）
  ↓
InteractionResolver（机关/出口判定）
  ↓
Bootstrap（表现）

## 下一步
- Bootstrap 绘制层迁移全部坐标。
- 抽离通用 PageManager。
- 建立第二款小游戏复用验证。

## 注意
仍需真实 Cocos Creator 编译运行验证。

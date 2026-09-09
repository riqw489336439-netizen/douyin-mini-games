# InputCommand 抽象阶段 R1

## 目标
将输入设备和游戏玩法解耦。

## 当前问题
旧模式容易形成：
输入事件 -> 直接调用角色移动。

这样第二款游戏如果需要改变输入含义，会影响基础代码。

## 新链路
InputDevice
-> InputCommand
-> GameplayHandler
-> Controller
-> WorldState

## Command 类型
- MOVE_LEFT
- MOVE_RIGHT
- MOVE_UP
- MOVE_DOWN
- ACTION
- SPECIAL

## 收口标准
- 键盘、触屏、虚拟摇杆均可生成相同 Command。
- 游戏玩法只接收 Command，不关心输入来源。
- 动画只监听状态变化，不监听输入事件。

## 后续
- 接入 PlayerController。
- 完成 ShadowController 独立化。
- 迁移 1-5 关进行回归。

# 平台桥接回归 R1

## 独立复核发现
激励视频流程虽然已有超时保护，但旧 show() 包装在 ad.show 不存在时会把 undefined 包成已完成 Promise，随后只能等待总超时，造成用户点击后长时间无反馈。

## 修复
- ad.show 不是函数时立即失败返回，不等待 15 秒超时。
- ad.show 同步抛错和 Promise reject 均统一收口为 false。
- ad.load 同步异常时仍尝试 show；load reject 时也尝试 show。
- close/error/timeout 仍统一走 finish，避免 Promise 多次结算。
- cleanup 保留 offClose/offError 和 timer 清理。

## 平台规范复核
- 广告能力只能由明确用户操作触发，当前桥接方法命名和调用语义保持 user action。
- 提审前仍需 Creator/抖音开发者工具/真机验证广告 close/error/load/show 行为。
- 官方准入仍要求前后台切换无黑白屏/闪退并连续运行 10 分钟以上；本文件不把源码检查等同于平台通过。

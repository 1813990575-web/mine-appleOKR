# 新增品牌提炼记录

这份文件记录本轮新加入品牌的提炼结果。

用途：

- 给后续继续扩展品牌时做参考
- 对照前端页面检查提取是否失真
- 作为方法论 V1 的实践样本

## Cursor

### 核心印象

- 暖米色纸面感
- 深棕文字而不是纯黑
- 编辑器与出版排版的混合气质

### 关键提炼

- 颜色：`#f2f1ed`、`#26251e`、`#e6e5e0`、`#f54e00`
- 字体：CursorGothic + jjannon + berkeleyMono
- 按钮：暖灰主按钮、full pill 标签、轻 ghost 动作
- 卡片：暖灰 surface + warm border + 大扩散阴影
- 阴影：更依赖边界和大范围 diffuse shadow，不是锐利投影

## ElevenLabs

### 核心印象

- 近白高级感
- 极轻展示标题
- 阴影极弱但层次非常精细

### 关键提炼

- 颜色：`#ffffff`、`#f5f5f5`、`#f5f2ef`
- 字体：Waldenburg 300 + Inter + WaldenburgFH + Geist Mono
- 按钮：黑色 pill、暖石色 pill、白色 outline shadow pill
- 卡片：白底 / 暖石底，16px–24px 圆角，outline shadow
- 阴影：inset edge + outline ring + warm shadow

### 提炼备注

- 这个品牌最容易提取错的地方是“看起来很轻，所以像没规范”
- 实际上它在标题字重、正文 tracking、shadow stack 上的约束很强

## Linear

### 核心印象

- dark-mode-native
- 工程精密感
- 亮度层级比阴影更重要

### 关键提炼

- 颜色：`#08090a`、`#0f1011`、`#191a1b`、`#5e6ad2`、`#7170ff`
- 字体：Inter Variable，必须带 `"cv01", "ss03"`
- 按钮：品牌紫主 CTA、半透明白 ghost、pill 状态标签
- 卡片：深色半透明 surface + 细白边框
- 阴影：弹层有 shadow stack，但普通卡片主要靠 luminance step

### 提炼备注

- 这个品牌不能用浅色产品的“投影思路”去理解
- 如果把它做成普通 dark card + 黑影，会直接失真

## Nike

### 核心印象

- UI 隐身，商品和摄影主导
- 电商效率优先
- 视觉非常平，不靠阴影取胜

### 关键提炼

- 颜色：`#111111`、`#ffffff`、`#f5f5f5`、`#707072`
- 字体：Nike Futura ND 风格展示标题 + Helvetica Now 风格正文
- 按钮：30px pill 黑白 CTA + 描边次按钮
- 卡片：商品图硬边、无阴影、信息直接排列
- 阴影：几乎没有，只有 divider 和 focus ring

### 提炼备注

- Nike 最容易做错的地方是把商品卡做成“设计卡片”
- 但它的真实重点根本不是卡片装饰，而是商品承载效率

import { generatedBrands } from './generatedBrands';

export const themeOrder = [
  'grid',
  'colors',
  'typography',
  'cards',
  'elevation',
  'buttons',
  'radius',
  'spacing',
  'forms',
  'guidance',
];

export const themes = {
  colors: { label: '颜色系统' },
  typography: { label: '字体系统' },
  buttons: { label: '按钮' },
  cards: { label: '卡片' },
  grid: { label: '网格与容器' },
  spacing: { label: '间距系统' },
  radius: { label: '圆角尺度' },
  elevation: { label: '层级与阴影' },
  forms: { label: '表单元素' },
  guidance: { label: '规范边界' },
};

const curatedBrands = [
  {
    id: 'airbnb',
    name: 'Airbnb',
    kicker: '温暖的旅行市场',
    mood: '温暖、可触感、摄影优先',
    summary:
      '像一本可以直接下单的旅行杂志，留白充足、字体温暖、品牌红克制而醒目，卡片阴影像自然光落下的效果。',
    anchors: ['暖调近黑文字', 'Rausch Red 单点强调', '大圆角', '摄影优先卡片'],
    colors: [
      {
        group: '品牌色',
        items: [
          { name: 'Rausch Red', value: '#ff385c', usage: '主按钮 / 激活状态', textColor: '#ffffff' },
          { name: 'Deep Rausch', value: '#e00b41', usage: '按下状态', textColor: '#ffffff' },
          { name: 'Luxe Purple', value: '#460479', usage: '高端层级', textColor: '#ffffff' },
          { name: 'Plus Magenta', value: '#92174d', usage: 'Plus 层级', textColor: '#ffffff' },
        ],
      },
      {
        group: '文字与中性色',
        items: [
          { name: 'Near Black', value: '#222222', usage: '主文字', textColor: '#ffffff' },
          { name: 'Secondary Gray', value: '#6a6a6a', usage: '描述文字', textColor: '#ffffff' },
          { name: 'Border', value: '#c1c1c1', usage: '边框 / 分割线', textColor: '#222222' },
          { name: 'Surface', value: '#f2f2f2', usage: '按钮 / 圆形控件', textColor: '#222222' },
          { name: 'Legal Blue', value: '#428bff', usage: '说明链接', textColor: '#ffffff' },
        ],
      },
    ],
    typography: [
      {
        label: '章节标题',
        sample: 'Section Heading',
        meta: '28px / 700 / 1.43 / Airbnb Cereal VF',
        style: { fontSize: 28, fontWeight: 700, lineHeight: 1.43, letterSpacing: 0, fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '卡片标题',
        sample: 'Card Heading',
        meta: '22px / 600 / 1.18 / -0.44px',
        style: { fontSize: 22, fontWeight: 600, lineHeight: 1.18, letterSpacing: '-0.44px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '卡片标题中等',
        sample: 'Card Heading Medium',
        meta: '22px / 500 / 1.18 / -0.44px',
        style: { fontSize: 22, fontWeight: 500, lineHeight: 1.18, letterSpacing: '-0.44px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '副标题',
        sample: 'Sub-heading',
        meta: '21px / 700 / 1.43',
        style: { fontSize: 21, fontWeight: 700, lineHeight: 1.43, letterSpacing: 0, fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '功能标题',
        sample: 'Feature Title',
        meta: '20px / 600 / 1.20 / -0.18px',
        style: { fontSize: 20, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.18px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'UI Medium',
        sample: 'UI Medium — Inspiration for future getaways',
        meta: '16px / 500 / 1.25',
        style: { fontSize: 16, fontWeight: 500, lineHeight: 1.25, letterSpacing: 0, fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '正文',
        sample: 'Body copy feels warm, readable, and easy to browse.',
        meta: '14px / 400 / 1.43',
        style: { fontSize: 14, fontWeight: 400, lineHeight: 1.43, letterSpacing: 0, fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'Tag Bold',
        sample: 'Tag Bold — $145 night',
        meta: '12px / 700 / 1.33',
        style: { fontSize: 12, fontWeight: 700, lineHeight: 1.33, letterSpacing: 0, fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'Micro Uppercase',
        sample: 'SUPERHOST',
        meta: '8px / 700 / 1.25 / +0.32px / uppercase',
        style: { fontSize: 8, fontWeight: 700, lineHeight: 1.25, letterSpacing: '0.32px', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' },
      },
    ],
    components: [
      {
        title: '按钮',
        note: '黑色主按钮、描边次按钮和圆形导航控件。',
        variant: 'airbnb-buttons',
      },
      {
        title: '卡片',
        note: '图片优先的 listing card，图在上，信息在下，20px 圆角和三层阴影是核心。',
        variant: 'airbnb-cards',
      },
    ],
    layout: {
      spacing: '8px 基础单位，覆盖 2–32px 的实用密集尺度',
      grid: '桌面端 3–5 列卡片网格，顶部搜索栏居中',
      rhythm: '像旅行杂志一样舒展，卡片紧凑但章节之间留白充足',
      radius: '8px 按钮 / 20px 卡片 / 32px 大容器 / 50% 圆形控件',
    },
    layoutSpec: {
      summary:
        'Airbnb 的页面骨架围绕“搜索 + 横向筛选 + 响应式 listing grid”展开。真正重要的是列数随断点细密变化，而不是某个固定容器宽度。',
      notes: ['Header 全宽置顶', '搜索栏居中', '筛选 pills 横向滚动', 'listing 5→4→3→2→1 列'],
      rows: [
        { label: '顶部结构', value: '全宽 sticky header + 居中搜索栏 + 横向筛选条' },
        { label: '主体容器', value: '图片优先 listing grid，桌面 3–5 列' },
        { label: '断点逻辑', value: '<375 单列，550–744 双列，1128+ 四列，1440+ 五列' },
      ],
      model: 'airbnb',
    },
    spacingScale: [2, 3, 4, 6, 8, 10, 11, 12, 15, 16, 22, 24, 32],
    radiusScale: [
      { value: '4px', label: '细小链接', shape: 'square' },
      { value: '8px', label: '按钮', shape: 'square' },
      { value: '14px', label: '徽标', shape: 'square' },
      { value: '20px', label: '卡片', shape: 'square' },
      { value: '32px', label: '大容器', shape: 'square' },
      { value: '50%', label: '圆形控件', shape: 'circle' },
    ],
    elevationScale: [
      {
        title: 'Flat',
        meta: 'No shadow',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.06)', color: '#222222' },
      },
      {
        title: 'Card Shadow',
        meta: 'rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px',
        tone: 'light',
        style: {
          background: '#ffffff',
          boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          border: 'none',
          color: '#222222',
        },
      },
      {
        title: 'Hover',
        meta: 'rgba(0,0,0,0.08) 0 4px 12px',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px', border: '1px solid rgba(0,0,0,0.03)', color: '#222222' },
      },
      {
        title: 'Active Focus',
        meta: 'white 4px ring + focus',
        tone: 'accent',
        style: {
          background: '#ffffff',
          boxShadow: 'rgb(255,255,255) 0px 0px 0px 4px, rgba(34,34,34,0.9) 0px 0px 0px 6px',
          border: '1px solid rgba(0,0,0,0.04)',
          color: '#222222',
        },
      },
    ],
    forms: {
      summary:
        'Airbnb 真正被重点规定的不是复杂表单，而是顶部搜索入口与搜索相关控件：白色胶囊容器、红色圆形搜索按钮、focus ring、以及与筛选 pills 的连续关系。',
      notes: ['搜索栏优先级最高', '32px 胶囊容器', '红色圆形搜索按钮', 'focus 使用 tint + ring'],
      fields: [
        {
          label: '默认搜索',
          type: 'search',
          containerStyle: {
            background: '#ffffff',
            borderRadius: '32px',
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            padding: '10px 12px 10px 18px',
          },
          inputStyle: { color: '#222222' },
          buttonStyle: { background: '#ff385c', color: '#ffffff', borderRadius: '50%' },
          placeholder: 'Search destinations',
          note: '顶部搜索栏是 primary action，不是普通输入框',
        },
        {
          label: '聚焦搜索',
          type: 'search',
          containerStyle: {
            background: '#ffe8ee',
            borderRadius: '32px',
            boxShadow:
              'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px, 0 0 0 2px #222222',
            padding: '10px 12px 10px 18px',
          },
          inputStyle: { color: '#3f3f3f' },
          buttonStyle: { background: '#ff385c', color: '#ffffff', borderRadius: '50%' },
          placeholder: 'Where to?',
          note: 'focus 通过背景 tint + ring 强调输入意图',
        },
        {
          label: '筛选 pills',
          type: 'chips',
          chips: ['Cabins', 'Beachfront', 'Design', 'Countryside'],
          note: '和搜索栏属于同一组浏览入口，支持横向滚动',
        },
      ],
    },
    cardSpec: {
      summary: '图片优先，白底，20px 卡片圆角，三层暖调阴影。',
      variants: [
        {
          name: 'Listing Card',
          notes: ['背景 #ffffff', '圆角 20px', '三层阴影', '图片优先，信息在下'],
        },
      ],
    },
    guidance: {
      do: ['主文字使用 #222222，不用纯黑', 'Rausch Red 只保留在高信号位置', '抬升表面使用三层阴影'],
      dont: ['不要使用过细的标题字重', '不要把卡片圆角压平', '不要把强调色铺到大面积背景'],
    },
  },
  {
    id: 'apple',
    name: 'Apple',
    kicker: '电影感产品极简',
    mood: '克制、雕塑感、黑白二元',
    summary:
      '会把界面退到最弱，让产品像舞台上的唯一主角。它的力量来自克制、场景节奏和极其精确的字体控制。',
    anchors: ['黑与浅灰的场景切换', '蓝色只用于交互', '棚拍感产品卡片', '玻璃态导航'],
    colors: [
      {
        group: '主色与场景',
        items: [
          { name: 'Pure Black', value: '#000000', usage: '沉浸式头图', textColor: '#ffffff' },
          { name: 'Light Gray', value: '#f5f5f7', usage: '浅色章节背景', textColor: '#1d1d1f' },
          { name: 'Near Black', value: '#1d1d1f', usage: '主文字 / 深色按钮', textColor: '#ffffff' },
          { name: 'Apple Blue', value: '#0071e3', usage: '按钮 / 焦点 / 主交互', textColor: '#ffffff' },
        ],
      },
      {
        group: '表面与辅助色',
        items: [
          { name: 'Link Blue', value: '#0066cc', usage: '正文链接', textColor: '#ffffff' },
          { name: 'Bright Blue', value: '#2997ff', usage: '深色背景链接', textColor: '#ffffff' },
          { name: 'Dark Surface', value: '#272729', usage: '深色卡片', textColor: '#ffffff' },
          { name: 'Filter Surface', value: '#fafafc', usage: '搜索 / 筛选控件', textColor: '#1d1d1f' },
          { name: 'Overlay', value: 'rgba(210,210,215,0.64)', usage: '媒体控件 / 遮罩', textColor: '#1d1d1f' },
        ],
      },
    ],
    typography: [
      {
        label: '主标题',
        sample: 'Display Hero',
        meta: '56px / 600 / 1.07 / SF Pro Display',
        style: { fontSize: 56, fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' },
      },
      {
        label: '章节标题',
        sample: 'Section Heading',
        meta: '40px / 600 / 1.10',
        style: { fontSize: 40, fontWeight: 600, lineHeight: 1.1, letterSpacing: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' },
      },
      {
        label: 'Tile Heading',
        sample: 'Tile Heading',
        meta: '28px / 400 / 1.14 / +0.196px',
        style: { fontSize: 28, fontWeight: 400, lineHeight: 1.14, letterSpacing: '0.196px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' },
      },
      {
        label: 'Card Title Bold',
        sample: 'Card Title Bold',
        meta: '21px / 700 / 1.19 / +0.231px',
        style: { fontSize: 21, fontWeight: 700, lineHeight: 1.19, letterSpacing: '0.231px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' },
      },
      {
        label: 'Card Title Regular',
        sample: 'Card Title Regular',
        meta: '21px / 400 / 1.19 / +0.231px',
        style: { fontSize: 21, fontWeight: 400, lineHeight: 1.19, letterSpacing: '0.231px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' },
      },
      {
        label: '正文',
        sample: 'Body — Powerful features let you do more than ever.',
        meta: '17px / 400 / 1.47 / -0.374px',
        style: { fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' },
      },
      {
        label: '正文强调',
        sample: 'Body Emphasis — Featured highlights',
        meta: '17px / 600 / 1.24 / -0.374px',
        style: { fontSize: 17, fontWeight: 600, lineHeight: 1.24, letterSpacing: '-0.374px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' },
      },
      {
        label: '链接',
        sample: 'Learn more >',
        meta: '14px / 400 / 1.43 / Link Blue',
        style: { fontSize: 14, fontWeight: 400, lineHeight: 1.43, letterSpacing: '-0.224px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' },
      },
      {
        label: 'Micro',
        sample: 'Micro — Legal text, footnotes, and fine print',
        meta: '12px / 400 / 1.33 / -0.12px',
        style: { fontSize: 12, fontWeight: 400, lineHeight: 1.33, letterSpacing: '-0.12px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' },
      },
    ],
    components: [
      {
        title: '按钮组合',
        note: '蓝色主按钮搭配描边胶囊链接。',
        variant: 'apple-buttons',
      },
      {
        title: '产品卡片',
        note: '浅底与深底两组产品内容卡，边框极少，8px 左右圆角，靠留白和链接层级建立秩序。',
        variant: 'apple-cards',
      },
    ],
    layout: {
      spacing: '8px 基础单位，小尺寸区间有更密集的微调刻度',
      grid: '980px 居中内容区放在全宽场景之内',
      rhythm: '通过黑与浅灰场景切换制造电影感节奏',
      radius: '8px 常规 / 11px 筛选控件 / 980px 胶囊 CTA / 50% 媒体控件',
    },
    layoutSpec: {
      summary:
        'Apple 的网格不是“看得见的网格线”，而是“全屏场景 + 980px 居中内容块”。结构感更多来自整屏色块切换和留白，而不是显性栅格。',
      notes: ['全屏 section', '980px 居中内容区', 'hero 单列', '产品区 2–3 列'],
      rows: [
        { label: '顶部结构', value: '48px 玻璃态导航浮在所有 section 之上' },
        { label: '主体容器', value: 'full-bleed section 内嵌 980px 居中内容块' },
        { label: '断点逻辑', value: 'hero 保持单列，产品区 3→2→1 列，背景色块始终全宽' },
      ],
      model: 'apple',
    },
    spacingScale: [2, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 17, 20, 24],
    radiusScale: [
      { value: '5px', label: 'Micro', shape: 'square' },
      { value: '8px', label: 'Buttons, Cards', shape: 'square' },
      { value: '11px', label: 'Search', shape: 'square' },
      { value: '12px', label: 'Features', shape: 'square' },
      { value: '980px', label: 'Pills', shape: 'pill' },
      { value: '50%', label: 'Media', shape: 'circle' },
    ],
    elevationScale: [
      {
        title: 'Level 0: Flat',
        meta: 'No shadow, solid bg',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.05)', color: '#1d1d1f' },
      },
      {
        title: 'Nav Glass',
        meta: 'Translucent + blur',
        tone: 'glass',
        style: {
          background: 'rgba(255,255,255,0.68)',
          boxShadow: 'none',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'saturate(180%) blur(20px)',
          color: '#1d1d1f',
        },
      },
      {
        title: 'Card Shadow',
        meta: 'rgba(0,0,0,0.22) 3px 5px 30px 0px',
        tone: 'light',
        style: {
          background: '#ffffff',
          boxShadow: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
          border: 'none',
          color: '#1d1d1f',
        },
      },
      {
        title: 'Focus',
        meta: '2px solid #0071e3',
        tone: 'accent',
        style: { background: '#ffffff', boxShadow: '0 0 0 2px #0071e3', border: '1px solid rgba(0,0,0,0.04)', color: '#1d1d1f' },
      },
    ],
    forms: {
      summary:
        'Apple 文档里更像“精密控件系统”而不是大而全的表单库。重点是 search / filter 的 11px 圆角、极轻边界、以及统一的蓝色 focus outline。',
      notes: ['11px 搜索 / 筛选', '#fafafc 浅灰底', '2px 蓝色 focus', '媒体控件属于同一交互家族'],
      fields: [
        {
          label: '默认输入',
          type: 'input',
          fieldStyle: {
            background: '#fafafc',
            border: '3px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '11px',
            color: 'rgba(0, 0, 0, 0.8)',
            padding: '16px 18px',
          },
          placeholder: 'name@example.com',
          note: '默认是近乎无装饰的浅灰输入容器',
        },
        {
          label: '聚焦输入',
          type: 'input',
          fieldStyle: {
            background: '#fafafc',
            border: '3px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '11px',
            color: '#1d1d1f',
            padding: '16px 18px',
            boxShadow: '0 0 0 2px #0071e3',
          },
          placeholder: 'Search products',
          note: '真正被强调的是统一 2px Apple Blue focus',
        },
        {
          label: '筛选按钮',
          type: 'filter-row',
          chips: ['Compare', 'Mac', 'iPad'],
          note: 'filter/search button 使用同一套 11px 轻边框逻辑',
        },
      ],
    },
    cardSpec: {
      summary: '存在 light / dark 两套卡片语境，边框几乎没有，靠背景对比和一层柔和阴影建立深度。',
      variants: [
        {
          name: 'Dark Product Card',
          notes: ['背景 #272729', '圆角 8px', '无明显边框', '白字 + 蓝色链接'],
        },
        {
          name: 'Light Product Card',
          notes: ['背景 #ffffff / #f5f5f7', '圆角 8px', '3px 5px 30px 阴影', '深色标题 + 蓝色链接'],
        },
      ],
    },
    guidance: {
      do: ['蓝色只保留给交互元素', '章节背景用黑与浅灰交替', '全局保持紧致排版'],
      dont: ['不要加入额外强调色', '不要给卡片加明显边框', '不要给界面加纹理或渐变背景'],
    },
  },
  {
    id: 'figma',
    name: 'Figma',
    kicker: '彩色内容的画廊白墙',
    mood: '单色界面、彩色内容、精密排版',
    summary:
      '把界面当成画廊白墙，黑白负责框架，彩色只出现在作品和展示内容里，层级主要依靠可变字体来完成。',
    anchors: ['界面严格黑白', '彩色只在内容里出现', 'figmaSans 可变字重', '虚线焦点态'],
    colors: [
      {
        group: '界面核心色',
        items: [
          { name: 'Pure Black', value: '#000000', usage: '文字 / 实心按钮 / 边框', textColor: '#ffffff' },
          { name: 'Pure White', value: '#ffffff', usage: '背景 / 深色上的文字', textColor: '#111111' },
          { name: 'Glass Black', value: 'rgba(0, 0, 0, 0.08)', usage: '次级圆形按钮', textColor: '#111111' },
          { name: 'Glass White', value: 'rgba(255, 255, 255, 0.16)', usage: '深色或彩色背景上的按钮', textColor: '#111111' },
        ],
      },
      {
        group: '视觉渐变',
        items: [
          { name: 'Electric Green', value: '#61ff7d', usage: '头图渐变色', textColor: '#111111' },
          { name: 'Bright Yellow', value: '#ffe45c', usage: '头图渐变色', textColor: '#111111' },
          { name: 'Deep Purple', value: '#5f2bff', usage: '头图渐变色', textColor: '#ffffff' },
          { name: 'Hot Pink', value: '#ff4fb8', usage: '头图渐变色', textColor: '#ffffff' },
        ],
      },
    ],
    typography: [
      {
        label: '主标题',
        sample: 'Display / Hero',
        meta: '86px / 400 / 1.00 / -1.72px / figmaSans',
        style: { fontSize: 86, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.72px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '章节标题',
        sample: 'Section Heading',
        meta: '64px / 400 / 1.10 / -0.96px',
        style: { fontSize: 64, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.96px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '副标题',
        sample: 'Sub-heading',
        meta: '26px / 540 / 1.35 / -0.26px',
        style: { fontSize: 26, fontWeight: 540, lineHeight: 1.35, letterSpacing: '-0.26px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '轻副标题',
        sample: 'Sub-heading Light',
        meta: '26px / 340 / 1.35 / -0.26px',
        style: { fontSize: 26, fontWeight: 340, lineHeight: 1.35, letterSpacing: '-0.26px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'Feature Title',
        sample: 'Feature Title',
        meta: '24px / 700 / 1.45',
        style: { fontSize: 24, fontWeight: 700, lineHeight: 1.45, letterSpacing: 0, fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: '大正文',
        sample: 'Body Large is airy, light-weight, and still tightly tracked.',
        meta: '20px / 330–450 / 1.30–1.40',
        style: { fontSize: 20, fontWeight: 350, lineHeight: 1.35, letterSpacing: '-0.14px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'Body / Button',
        sample: 'Body / Button',
        meta: '16px / 330–400 / 1.40–1.45 / -0.14px',
        style: { fontSize: 16, fontWeight: 360, lineHeight: 1.42, letterSpacing: '-0.14px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'Body Light',
        sample: 'Body Light',
        meta: '18px / 320 / 1.45 / -0.26px',
        style: { fontSize: 18, fontWeight: 320, lineHeight: 1.45, letterSpacing: '-0.26px', fontFamily: 'Manrope, system-ui, sans-serif' },
      },
      {
        label: 'Mono 标签',
        sample: 'MONO LABEL',
        meta: '18px / 400 / 1.30 / +0.54px / figmaMono',
        style: { fontSize: 18, fontWeight: 400, lineHeight: 1.3, letterSpacing: '0.54px', fontFamily: '"IBM Plex Mono", monospace' },
      },
      {
        label: 'Mono Small',
        sample: 'MONO SMALL',
        meta: '12px / 400 / 1.00 / +0.6px / uppercase',
        style: { fontSize: 12, fontWeight: 400, lineHeight: 1, letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' },
      },
    ],
    components: [
      {
        title: '圆角控件',
        note: '黑白胶囊按钮与玻璃感圆形控件，配合虚线焦点态。',
        variant: 'figma-buttons',
      },
      {
        title: '卡片与容器',
        note: '卡片更像内容容器：纯白、边框极轻、6px 到 8px 圆角，必要时用轻阴影或玻璃面。',
        variant: 'figma-cards',
      },
    ],
    layout: {
      spacing: '8px 基础单位，带 4.5px、46px、50px 这些特殊刻度',
      grid: '全宽头图搭配居中展示区，最大可到 1920px',
      rhythm: '黑白章节之间穿插彩色展示，像画廊分区一样推进',
      radius: '2px 链接 / 6px 小容器 / 8px 卡片 / 50px 胶囊 / 50% 圆形',
    },
    layoutSpec: {
      summary:
        'Figma 更像展陈页面：全宽 gradient hero 先定基调，后面用黑白界面层承载彩色内容，容器最大可以铺到 1920px，像画廊墙面一样陈列作品。',
      notes: ['全宽 gradient hero', '最大容器到 1920px', '展陈式 section', '移动端堆叠 / desktop 2 列'],
      rows: [
        { label: '顶部结构', value: 'full-width hero + centered content，彩色内容先出场' },
        { label: '主体容器', value: '黑白界面 chrome + 白色 surface 承载产品展示' },
        { label: '断点逻辑', value: '<560 紧凑堆叠，768–960 开始双列，960+ 标准 desktop' },
      ],
      model: 'figma',
    },
    spacingScale: [1, 2, 4, 4.5, 8, 10, 12, 16, 18, 24, 32, 40, 46, 48, 50],
    radiusScale: [
      { value: '2px', label: 'Links', shape: 'square' },
      { value: '6px', label: 'Containers', shape: 'square' },
      { value: '8px', label: 'Cards', shape: 'square' },
      { value: '50px', label: 'Pills', shape: 'pill' },
      { value: '50%', label: 'Circles', shape: 'circle' },
    ],
    elevationScale: [
      {
        title: 'Flat',
        meta: 'No shadow',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.05)', color: '#111111' },
      },
      {
        title: 'Surface',
        meta: 'White card on color',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: '0 10px 26px rgba(0,0,0,0.08)', border: 'none', color: '#111111' },
      },
      {
        title: 'Elevated',
        meta: 'Subtle shadow',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: '0 16px 30px rgba(0,0,0,0.12)', border: 'none', color: '#111111' },
      },
      {
        title: 'Dashed Focus',
        meta: '2px dashed outline',
        tone: 'accent',
        style: { background: '#ffffff', boxShadow: 'none', border: '2px dashed #111111', color: '#111111' },
      },
    ],
    forms: {
      summary:
        'Figma 的表单重点不在丰富状态色，而在统一的黑白输入容器、8px 小圆角，以及 dashed 2px focus。它更像编辑器里的属性面板，而不是营销站表单。',
      notes: ['黑白输入容器', '8px 圆角', 'dashed 2px focus', 'mono label 可作为结构标签'],
      fields: [
        {
          label: '默认输入',
          type: 'input',
          fieldStyle: {
            background: '#ffffff',
            border: '1px solid #000000',
            borderRadius: '8px',
            color: '#111111',
            padding: '16px 18px',
          },
          placeholder: 'Prototype kit',
          note: '默认态已经很像面板控件，而不是柔和表单',
        },
        {
          label: '聚焦输入',
          type: 'input',
          fieldStyle: {
            background: '#ffffff',
            border: '2px dashed #000000',
            borderRadius: '8px',
            color: '#111111',
            padding: '15px 17px',
          },
          placeholder: 'Design system',
          note: '虚线 focus 是签名式交互语言',
        },
        {
          label: '描述输入',
          type: 'textarea',
          fieldStyle: {
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '8px',
            color: '#111111',
            padding: '16px 18px',
          },
          placeholder: 'Describe the component in one sentence.',
          note: '多行输入依旧维持极简边框和工具感',
        },
      ],
    },
    cardSpec: {
      summary: '更像容器系统而不是单一卡片模板。核心是纯白表面、极轻边框或轻阴影，以及 6px / 8px 圆角。',
      variants: [
        {
          name: 'Standard Container',
          notes: ['背景 #ffffff', '极轻边框', '圆角 6px-8px', '内容容器'],
        },
        {
          name: 'Elevated Container',
          notes: ['背景 #ffffff', '轻到中等阴影', '圆角 8px', '用于 showcase / hover'],
        },
        {
          name: 'Gradient Showcase',
          notes: ['彩色展示内容', '黑白 chrome', '白字叠加', '内容截图是主角'],
        },
      ],
    },
    guidance: {
      do: ['使用 figmaSans 的精确字重档位', '保持界面层黑白', '焦点态使用虚线，按钮保持胶囊或圆形'],
      dont: ['不要给界面层添加强调色', '不要偷懒使用普通默认字重', '不要把虚线焦点态换成实线'],
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    kicker: '温暖极简的编辑器气质',
    mood: '温暖、编辑感、代码工具优雅',
    summary:
      '像一本高质量纸张做成的代码编辑器杂志，暖米色背景、深棕文字、极克制的边框和多字体排版一起构成一种比普通开发工具更有文学性的气质。',
    anchors: ['暖米色背景', 'CursorGothic 强压缩标题', 'jjannon 正文', 'oklab 暖边框'],
    colors: [
      {
        group: '核心底色',
        items: [
          { name: 'Cursor Cream', value: '#f2f1ed', usage: '页面主背景', textColor: '#26251e' },
          { name: 'Cursor Dark', value: '#26251e', usage: '主标题 / 主文字', textColor: '#ffffff' },
          { name: 'Cursor Light', value: '#e6e5e0', usage: '次级 surface / 按钮底色', textColor: '#26251e' },
          { name: 'Surface 300', value: '#ebeae5', usage: '主按钮背景', textColor: '#26251e' },
          { name: 'Surface 500', value: '#e1e0db', usage: '高一级 pill / 选中标签', textColor: '#26251e' },
        ],
      },
      {
        group: '强调与边界',
        items: [
          { name: 'Cursor Orange', value: '#f54e00', usage: '品牌强调 / 链接 / CTA 时刻', textColor: '#ffffff' },
          { name: 'Error Rose', value: '#cf2d56', usage: 'hover / error / 热点反馈', textColor: '#ffffff' },
          { name: 'Border 10', value: 'oklab(0.263084 -0.00230259 0.0124794 / 0.1)', usage: '标准暖边框', textColor: '#26251e' },
          { name: 'Border 20', value: 'oklab(0.263084 -0.00230259 0.0124794 / 0.2)', usage: '强调边框 / active', textColor: '#26251e' },
          { name: 'Border Strong', value: 'rgba(38, 37, 30, 0.55)', usage: '强对比规则线', textColor: '#ffffff' },
        ],
      },
    ],
    typography: [
      {
        label: '主标题',
        sample: 'Cursor can think with you.',
        meta: '72px / 400 / 1.10 / -2.16px / CursorGothic',
        style: { fontSize: 72, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-2.16px', fontFamily: '"Times New Roman", Georgia, serif' },
      },
      {
        label: '章节标题',
        sample: 'Section Heading',
        meta: '36px / 400 / 1.20 / -0.72px / CursorGothic',
        style: { fontSize: 36, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.72px', fontFamily: '"Times New Roman", Georgia, serif' },
      },
      {
        label: '副标题',
        sample: 'Card heading',
        meta: '26px / 400 / 1.25 / -0.325px / CursorGothic',
        style: { fontSize: 26, fontWeight: 400, lineHeight: 1.25, letterSpacing: '-0.325px', fontFamily: '"Times New Roman", Georgia, serif' },
      },
      {
        label: '正文 Serif',
        sample: 'Cursor balances editorial warmth with precise product structure.',
        meta: '19.2px / 500 / 1.50 / jjannon',
        style: { fontSize: 19.2, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'Georgia, "Times New Roman", serif' },
      },
      {
        label: '正文 Sans',
        sample: 'UI body text stays clear, compressed, and warm.',
        meta: '16px / 400 / 1.50 / CursorGothic',
        style: { fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.08px', fontFamily: 'system-ui, -apple-system, sans-serif' },
      },
      {
        label: '按钮文字',
        sample: 'Continue',
        meta: '14px / 400 / 1.00 / CursorGothic',
        style: { fontSize: 14, fontWeight: 400, lineHeight: 1, letterSpacing: 0, fontFamily: 'system-ui, -apple-system, sans-serif' },
      },
      {
        label: 'Mono 小号',
        sample: 'berkeleyMono / inline-code',
        meta: '11px / 400 / 1.33 / -0.275px',
        style: { fontSize: 11, fontWeight: 400, lineHeight: 1.33, letterSpacing: '-0.275px', fontFamily: '"IBM Plex Mono", monospace' },
      },
    ],
    components: [
      {
        title: '按钮',
        note: '暖灰主按钮、超大 pill 标签、透明 ghost 动作共存。',
        variant: 'cursor-buttons',
      },
      {
        title: '卡片',
        note: '暖灰背景 + oklab 边框 + 大而柔的扩散阴影，是最典型的 Cursor 容器语言。',
        variant: 'cursor-cards',
      },
    ],
    layout: {
      spacing: '8px 基础单位，同时允许 1.5px 到 6px 的微调刻度',
      grid: '约 1200px 居中容器，hero 单列，feature 区 2–3 列',
      rhythm: '文本压缩、布局呼吸，像编辑器与出版排版的混合',
      radius: '2px-4px 小容器 / 8px 主卡片 / 10px featured / full pill 标签',
    },
    layoutSpec: {
      summary:
        'Cursor 的页面骨架是典型的居中编辑式布局：暖色背景作为整体底纸，1200px 左右内容区承载主要阅读，hero 单列，功能区进入 2 到 3 列，像一份有目录层次的产品刊物。',
      notes: ['1200px 居中容器', 'hero 单列', 'feature 2–3 列', '暖底色切换而非强分割'],
      rows: [
        { label: '顶部结构', value: '简洁横向导航，暖米色背景下保持轻边界' },
        { label: '主体容器', value: '居中单列 hero + 2–3 列功能卡片 / 文档侧栏' },
        { label: '断点逻辑', value: '<600 单列，600+ 双列起步，900+ 形成完整 desktop 结构' },
      ],
      model: 'cursor',
    },
    spacingScale: [1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 24, 32],
    radiusScale: [
      { value: '1.5px', label: '细节', shape: 'square' },
      { value: '2px', label: '内联元素', shape: 'square' },
      { value: '4px', label: '标准卡片', shape: 'square' },
      { value: '8px', label: '主按钮与卡片', shape: 'square' },
      { value: '10px', label: '强调容器', shape: 'square' },
      { value: '9999px', label: '胶囊', shape: 'pill' },
    ],
    elevationScale: [
      {
        title: 'Flat',
        meta: 'No shadow',
        tone: 'light',
        style: { background: '#f2f1ed', boxShadow: 'none', border: '1px solid rgba(38,37,30,0.10)', color: '#26251e' },
      },
      {
        title: 'Border Ring',
        meta: 'oklab border 10%',
        tone: 'accent',
        style: { background: '#ebeae5', boxShadow: '0 0 0 1px rgba(38,37,30,0.10)', border: 'none', color: '#26251e' },
      },
      {
        title: 'Ambient',
        meta: 'rgba(0,0,0,0.02) 0 0 16px, rgba(0,0,0,0.008) 0 0 8px',
        tone: 'light',
        style: { background: '#ebeae5', boxShadow: 'rgba(0,0,0,0.02) 0px 0px 16px, rgba(0,0,0,0.008) 0px 0px 8px', border: '1px solid rgba(38,37,30,0.10)', color: '#26251e' },
      },
      {
        title: 'Elevated Card',
        meta: 'rgba(0,0,0,0.14) 0 28px 70px, rgba(0,0,0,0.1) 0 14px 32px',
        tone: 'light',
        style: { background: '#e6e5e0', boxShadow: 'rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px, rgba(38,37,30,0.10) 0px 0px 0px 1px', border: 'none', color: '#26251e' },
      },
    ],
    forms: {
      summary:
        'Cursor 的输入控件延续暖灰 surface 和 oklab 边框语言，不追求冷白表单，而是让输入框像页面纸面里自然切开的区域。',
      notes: ['暖灰 surface', 'oklab 边框', '焦点变强边界或橙色提示', '内边距细密'],
      fields: [
        {
          label: '默认输入',
          type: 'input',
          fieldStyle: {
            background: '#ebeae5',
            border: '1px solid rgba(38,37,30,0.10)',
            borderRadius: '8px',
            color: '#26251e',
            padding: '12px 14px',
          },
          placeholder: 'Ask Cursor to explain this file',
          note: '暖灰面而不是纯白输入框',
        },
        {
          label: '聚焦输入',
          type: 'input',
          fieldStyle: {
            background: '#f2f1ed',
            border: '1px solid rgba(38,37,30,0.20)',
            borderRadius: '8px',
            color: '#26251e',
            padding: '12px 14px',
            boxShadow: 'rgba(0,0,0,0.1) 0px 4px 12px',
          },
          placeholder: 'Refactor this component',
          note: 'focus 通过更强边界和轻阴影来提示',
        },
        {
          label: '标签筛选',
          type: 'chips',
          chips: ['Docs', 'Agent', 'Editor', 'Workflow'],
          note: 'full pill 标签是高频几何语言',
        },
      ],
    },
    cardSpec: {
      summary: '暖灰 surface、oklab 边框与大而柔的 diffused shadow 一起构成 Cursor 的卡片语言。',
      variants: [
        {
          name: 'Standard Warm Card',
          notes: ['背景 #e6e5e0', '1px warm oklab 边框', '圆角 8px', '正文与界面共存'],
        },
        {
          name: 'Elevated Editorial Card',
          notes: ['大 blur 阴影', '暖色表面', '更像页面为内容让出一层空间'],
        },
      ],
    },
    guidance: {
      do: ['保持暖米色背景和深棕文字关系', '使用 CursorGothic / serif / mono 三种声音分层', '边框优先用暖色 oklab，而不是机械灰'],
      dont: ['不要把页面冷白化', '不要使用冷蓝 focus ring', '不要把卡片做成厚重深阴影或大圆角产品卡'],
    },
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    kicker: '近白高级感音频产品',
    mood: '轻、暖、留白、精细阴影',
    summary:
      '它几乎把品牌感全部压进了排版和阴影里。页面接近纯白，标题极轻，按钮和卡片都像刚刚浮起半层空气。',
    anchors: ['Waldenburg 300', '暖石色 surface', '多层低透明阴影', '9999px pill'],
    colors: [
      {
        group: '核心底色',
        items: [
          { name: 'Pure White', value: '#ffffff', usage: '主背景 / 卡片底色', textColor: '#000000' },
          { name: 'Light Gray', value: '#f5f5f5', usage: '次级 section 背景', textColor: '#000000' },
          { name: 'Warm Stone', value: '#f5f2ef', usage: '暖调按钮 / 局部面板', textColor: '#000000' },
          { name: 'Near White', value: '#f6f6f6', usage: '替代浅色 surface', textColor: '#000000' },
        ],
      },
      {
        group: '文字与边界',
        items: [
          { name: 'Black', value: '#000000', usage: '主文字 / 深色按钮', textColor: '#ffffff' },
          { name: 'Body Gray', value: '#4e4e4e', usage: '正文文字', textColor: '#ffffff' },
          { name: 'Warm Text', value: '#777169', usage: '暖调辅助说明', textColor: '#ffffff' },
          { name: 'Border Light', value: '#e5e5e5', usage: '显式边框', textColor: '#000000' },
          { name: 'Ring Blue', value: 'rgb(147 197 253 / 0.5)', usage: 'focus ring', textColor: '#000000' },
        ],
      },
    ],
    typography: [
      {
        label: '展示标题',
        sample: 'The most realistic AI audio.',
        meta: '48px / 300 / 1.08 / -0.96px / Waldenburg',
        style: { fontSize: 48, fontWeight: 300, lineHeight: 1.08, letterSpacing: '-0.96px', fontFamily: 'Georgia, "Times New Roman", serif' },
      },
      {
        label: '卡片标题',
        sample: 'Build voice experiences',
        meta: '32px / 300 / 1.13 / Waldenburg',
        style: { fontSize: 32, fontWeight: 300, lineHeight: 1.13, letterSpacing: 0, fontFamily: 'Georgia, "Times New Roman", serif' },
      },
      {
        label: '正文',
        sample: 'Body text stays airy and calm with slight positive tracking.',
        meta: '16px / 400 / 1.60 / +0.16px / Inter',
        style: { fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.16px', fontFamily: 'system-ui, -apple-system, sans-serif' },
      },
      {
        label: '说明文字',
        sample: 'Thoughtful product copy with breathing room.',
        meta: '18px / 400 / 1.60 / +0.18px / Inter',
        style: { fontSize: 18, fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.18px', fontFamily: 'system-ui, -apple-system, sans-serif' },
      },
      {
        label: '按钮大写',
        sample: 'LISTEN NOW',
        meta: '14px / 700 / 1.10 / +0.7px / WaldenburgFH',
        style: { fontSize: 14, fontWeight: 700, lineHeight: 1.1, letterSpacing: '0.7px', textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif' },
      },
      {
        label: 'Mono 标注',
        sample: 'Geist Mono / waveform-preview',
        meta: '12px / 400 / 1.4 / Geist Mono',
        style: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, fontFamily: '"IBM Plex Mono", monospace' },
      },
    ],
    components: [
      {
        title: '按钮',
        note: '黑色 pill、暖石色 CTA 和白色描边式按钮是三种最清晰的动作层级。',
        variant: 'elevenlabs-buttons',
      },
      {
        title: '卡片',
        note: '白底、暖石底、极轻 outline shadow 与柔软大圆角共同构成它的高级感。',
        variant: 'elevenlabs-cards',
      },
    ],
    layout: {
      spacing: '以 8px 为主，但会插入 9 / 11 / 18 / 28 这样的微调节点',
      grid: '单列 hero，随后进入白卡 feature grid',
      rhythm: '像高端产品画册，纵向留白非常大',
      radius: '16px-24px 卡片，9999px 按钮 pill',
    },
    layoutSpec: {
      summary:
        'ElevenLabs 的骨架不是复杂多栏，而是“单列 hero + 展陈式 feature section”。内容在大量留白中被白卡或暖石色卡片托起，阅读节奏非常慢。',
      notes: ['hero 单列居中', '白卡栅格', '超大纵向留白', '暖石色做局部点缀'],
      rows: [
        { label: '顶部结构', value: '极简浅色导航，pill CTA 点缀右侧动作' },
        { label: '主体容器', value: '单列 hero + 2–3 列 feature / showcase 白卡' },
        { label: '断点逻辑', value: '<768 单列，768+ 双列，1024+ 完整桌面栅格' },
      ],
      model: 'elevenlabs',
    },
    spacingScale: [1, 3, 4, 8, 9, 10, 11, 12, 16, 18, 20, 24, 28, 32, 40],
    radiusScale: [
      { value: '8px', label: '小容器', shape: 'square' },
      { value: '12px', label: '中型面板', shape: 'square' },
      { value: '16px', label: '标准卡片', shape: 'square' },
      { value: '20px', label: '强调卡片', shape: 'square' },
      { value: '24px', label: '大区块', shape: 'square' },
      { value: '9999px', label: '胶囊', shape: 'pill' },
    ],
    elevationScale: [
      {
        title: 'Flat',
        meta: 'No shadow',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'none', border: '1px solid #e5e5e5', color: '#000000' },
      },
      {
        title: 'Inset Edge',
        meta: 'rgba(0,0,0,0.075) 0 0 0 0.5px inset',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset', border: 'none', color: '#000000' },
      },
      {
        title: 'Outline Ring',
        meta: 'rgba(0,0,0,0.06) 0 0 0 1px + soft elevation',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px', border: 'none', color: '#000000' },
      },
      {
        title: 'Warm CTA',
        meta: 'rgba(78,50,23,0.04) 0 6px 16px',
        tone: 'accent',
        style: { background: 'rgba(245,242,239,0.8)', boxShadow: 'rgba(78,50,23,0.04) 0px 6px 16px', border: '1px solid rgba(0,0,0,0.04)', color: '#000000' },
      },
    ],
    forms: {
      summary:
        'ElevenLabs 的表单和输入并不张扬。重点是白色或暖石色表面、极轻 outline 阴影，以及蓝色 ring 只在 focus 时出现。',
      notes: ['白底或暖石底', '极轻边界', 'blue ring 只在 focus 出现', '大圆角'],
      fields: [
        {
          label: '默认输入',
          type: 'input',
          fieldStyle: {
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '18px',
            color: '#000000',
            padding: '14px 18px',
          },
          placeholder: 'Generate a voice sample',
          note: '白底 + 轻边界，不做厚重描边',
        },
        {
          label: '聚焦输入',
          type: 'input',
          fieldStyle: {
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '18px',
            color: '#000000',
            padding: '14px 18px',
            boxShadow: '0 0 0 4px rgb(147 197 253 / 0.25)',
          },
          placeholder: 'Select a voice',
          note: 'focus 才出现温和蓝 ring',
        },
        {
          label: '暖石标签',
          type: 'chips',
          chips: ['Studio', 'Voices', 'API', 'Agents'],
          note: '很多轻操作更像暖石 pill，而不是传统硬标签',
        },
      ],
    },
    cardSpec: {
      summary: '白卡和暖石色卡片都依赖超低透明阴影，不靠强对比边框取胜。',
      variants: [
        { name: 'White Feature Card', notes: ['白底', '16px-20px 圆角', 'outline shadow', '大标题 + 说明'] },
        { name: 'Warm CTA Card', notes: ['暖石色底', 'warm shadow', 'pill 动作', '触感更强'] },
      ],
    },
    guidance: {
      do: ['让标题保持极轻字重', '所有阴影都维持极低透明度', '只在特定 CTA 上使用暖石色和 warm shadow'],
      dont: ['不要使用重阴影', '不要把 body tracking 收紧', '不要引入高饱和品牌色'],
    },
  },
  {
    id: 'linear',
    name: 'Linear',
    kicker: '深色原生的精密产品系统',
    mood: '冷静、克制、工程感、精确',
    summary:
      '它不是“暗黑模式版本的网站”，而是把黑暗本身当作原生介质。层级主要由白色透明度和表面亮度差形成，而不是靠传统投影。',
    anchors: ['#08090a 原生深底', 'Inter Variable 510', '半透明白边框', '唯一紫靛强调'],
    colors: [
      {
        group: '背景层级',
        items: [
          { name: 'Canvas', value: '#08090a', usage: '营销页主背景', textColor: '#ffffff' },
          { name: 'Panel', value: '#0f1011', usage: '导航 / 主容器', textColor: '#ffffff' },
          { name: 'Elevated Surface', value: '#191a1b', usage: '卡片 / 下拉 / 弹层', textColor: '#ffffff' },
          { name: 'Secondary Surface', value: '#28282c', usage: 'hover / 更高层 surface', textColor: '#ffffff' },
        ],
      },
      {
        group: '文字与强调',
        items: [
          { name: 'Primary Text', value: '#f7f8f8', usage: '主文字', textColor: '#08090a' },
          { name: 'Secondary Text', value: '#8a8f98', usage: '正文 / 次级说明', textColor: '#08090a' },
          { name: 'Brand Indigo', value: '#5e6ad2', usage: '主 CTA 背景', textColor: '#ffffff' },
          { name: 'Accent Violet', value: '#7170ff', usage: '激活 / 高亮', textColor: '#ffffff' },
          { name: 'Border Standard', value: 'rgba(255,255,255,0.08)', usage: '标准边框', textColor: '#ffffff' },
        ],
      },
    ],
    typography: [
      {
        label: '展示标题',
        sample: 'Software designed to keep teams on track.',
        meta: '48px / 510 / 1.00 / -1.056px / Inter Variable',
        style: { fontSize: 48, fontWeight: 510, lineHeight: 1, letterSpacing: '-1.056px', fontFamily: 'Inter, system-ui, sans-serif', fontFeatureSettings: '"cv01", "ss03"' },
      },
      {
        label: '大标题',
        sample: 'Built for modern product development.',
        meta: '32px / 510 / 1.05 / -0.704px / Inter Variable',
        style: { fontSize: 32, fontWeight: 510, lineHeight: 1.05, letterSpacing: '-0.704px', fontFamily: 'Inter, system-ui, sans-serif', fontFeatureSettings: '"cv01", "ss03"' },
      },
      {
        label: '卡片标题',
        sample: 'Issue tracking',
        meta: '20px / 590 / 1.33 / -0.24px',
        style: { fontSize: 20, fontWeight: 590, lineHeight: 1.33, letterSpacing: '-0.24px', fontFamily: 'Inter, system-ui, sans-serif', fontFeatureSettings: '"cv01", "ss03"' },
      },
      {
        label: '正文',
        sample: 'Body copy stays cool, restrained, and slightly compressed.',
        meta: '15px / 400 / 1.60 / -0.165px',
        style: { fontSize: 15, fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.165px', fontFamily: 'Inter, system-ui, sans-serif', fontFeatureSettings: '"cv01", "ss03"' },
      },
      {
        label: '标签文字',
        sample: 'Planned · In progress · Done',
        meta: '13px / 510 / 1.40 / Inter Variable',
        style: { fontSize: 13, fontWeight: 510, lineHeight: 1.4, letterSpacing: 0, fontFamily: 'Inter, system-ui, sans-serif', fontFeatureSettings: '"cv01", "ss03"' },
      },
      {
        label: 'Mono',
        sample: 'Berkeley Mono / command palette',
        meta: '12px / 400 / 1.45 / Berkeley Mono',
        style: { fontSize: 12, fontWeight: 400, lineHeight: 1.45, letterSpacing: 0, fontFamily: '"IBM Plex Mono", monospace' },
      },
    ],
    components: [
      {
        title: '按钮',
        note: '品牌紫主按钮、半透明白 ghost 按钮和 pill 状态标签构成主要按钮家族。',
        variant: 'linear-buttons',
      },
      {
        title: '卡片',
        note: '深色半透明 surface、半透明白边框、轻内阴影和 luminance 层级是关键。',
        variant: 'linear-cards',
      },
    ],
    layout: {
      spacing: '8px 主网格，但会插入 7 / 11 / 19 / 35 这类微调值',
      grid: '居中内容区，hero 单列，feature 2–3 列，changelog 单列时间线',
      rhythm: '高密度但不拥挤，依赖亮度层级分组',
      radius: '2px-12px 为主，功能性强于装饰性',
    },
    layoutSpec: {
      summary:
        'Linear 的页面骨架像精密控制面板：深底大画布上承载居中 hero，随后用 2–3 列 feature card 组织内容，所有层级通过 surface 亮度和细白边界划分。',
      notes: ['dark-first canvas', 'hero 单列', 'feature 2–3 列', '时间线式 changelog'],
      rows: [
        { label: '顶部结构', value: '深色 sticky nav，右侧 CTA 与 command palette 入口' },
        { label: '主体容器', value: '单列 hero + 2–3 列功能卡片 + 单列 changelog' },
        { label: '断点逻辑', value: '<640 单列，640+ 双列，1024+ 三列 feature' },
      ],
      model: 'linear',
    },
    spacingScale: [1, 4, 7, 8, 11, 12, 16, 19, 20, 22, 24, 28, 32, 35],
    radiusScale: [
      { value: '2px', label: '微型', shape: 'square' },
      { value: '4px', label: '小容器', shape: 'square' },
      { value: '6px', label: '按钮', shape: 'square' },
      { value: '8px', label: '卡片', shape: 'square' },
      { value: '12px', label: '大面板', shape: 'square' },
      { value: '9999px', label: '胶囊', shape: 'pill' },
    ],
    elevationScale: [
      {
        title: 'Flat',
        meta: '#010102 / no shadow',
        tone: 'dark',
        style: { background: '#010102', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.03)', color: '#f7f8f8' },
      },
      {
        title: 'Surface',
        meta: 'rgba(255,255,255,0.05) bg + 1px white border',
        tone: 'dark',
        style: { background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#f7f8f8' },
      },
      {
        title: 'Inset',
        meta: 'rgba(0,0,0,0.2) 0 0 12px inset',
        tone: 'dark',
        style: { background: '#191a1b', boxShadow: 'rgba(0,0,0,0.2) 0px 0px 12px 0px inset', border: '1px solid rgba(255,255,255,0.05)', color: '#f7f8f8' },
      },
      {
        title: 'Dialog',
        meta: 'multi-layer popover stack',
        tone: 'accent',
        style: { background: '#191a1b', boxShadow: 'rgba(0,0,0,0) 0px 8px 2px, rgba(0,0,0,0.01) 0px 5px 2px, rgba(0,0,0,0.04) 0px 3px 2px, rgba(0,0,0,0.07) 0px 1px 1px, rgba(0,0,0,0.08) 0px 0px 1px', border: '1px solid rgba(255,255,255,0.08)', color: '#f7f8f8' },
      },
    ],
    forms: {
      summary:
        'Linear 的表单核心不是“白色输入框”，而是深色 surface、半透明白边框、以及 command palette 式的高密度信息组织。',
      notes: ['dark surface', '半透明白边框', '紫色或多层 focus', '像工具面板'],
      fields: [
        {
          label: '默认输入',
          type: 'input',
          fieldStyle: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#f7f8f8',
            padding: '12px 14px',
          },
          placeholder: 'Search issues',
          note: '标准 dark surface 输入框',
        },
        {
          label: 'Command Palette',
          type: 'textarea',
          fieldStyle: {
            background: '#191a1b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            color: '#f7f8f8',
            padding: '16px 18px',
            boxShadow: 'rgba(0,0,0,0) 0px 8px 2px, rgba(0,0,0,0.01) 0px 5px 2px, rgba(0,0,0,0.04) 0px 3px 2px, rgba(0,0,0,0.07) 0px 1px 1px, rgba(0,0,0,0.08) 0px 0px 1px',
          },
          placeholder: 'Jump to issue, team, or project',
          note: '命令面板本身就是重要的表单语言',
        },
        {
          label: '状态标签',
          type: 'chips',
          chips: ['Backlog', 'Planned', 'In review', 'Done'],
          note: '大量状态和过滤都以 pill 标签呈现',
        },
      ],
    },
    cardSpec: {
      summary: '深色 surface + 半透明白边框比阴影更重要。卡片像被月光勾出的薄盒子。',
      variants: [
        { name: 'Feature Card', notes: ['rgba white bg', '8px 圆角', '1px 半透明白边框', '冷静标题层级'] },
        { name: 'Dialog Surface', notes: ['12px 圆角', '多层弹层阴影', '更高 luminance', '适合命令面板'] },
      ],
    },
    guidance: {
      do: ['所有 Inter 文本都启用 cv01 / ss03', '用半透明白边界而不是实色边框', '让品牌紫只留给关键激活和 CTA'],
      dont: ['不要在 dark surface 上使用厚重黑影', '不要引入暖色 UI chrome', '不要把按钮做成高饱和大片彩色块'],
    },
  },
  {
    id: 'nike',
    name: 'Nike',
    kicker: '单色 UI 让位给产品与摄影',
    mood: '直接、运动、零修饰、商品导向',
    summary:
      'Nike 的界面几乎故意隐身。真正的主角是商品、摄影和巨大标题，UI 只负责承接购买路径，所以它非常平、非常黑白、非常直接。',
    anchors: ['Nike Black #111111', '无阴影', '30px pill 按钮', '无圆角商品图'],
    colors: [
      {
        group: '黑白与表面',
        items: [
          { name: 'Nike Black', value: '#111111', usage: '主文字 / 深色按钮', textColor: '#ffffff' },
          { name: 'Nike White', value: '#ffffff', usage: '页面背景 / 白色按钮', textColor: '#111111' },
          { name: 'Light Gray', value: '#f5f5f5', usage: '输入框 / 浅底面板', textColor: '#111111' },
          { name: 'Hover Gray', value: '#e5e5e5', usage: 'hover / disabled', textColor: '#111111' },
          { name: 'Deep Charcoal', value: '#1f1f21', usage: '深色反转 section', textColor: '#ffffff' },
        ],
      },
      {
        group: '功能色',
        items: [
          { name: 'Secondary Text', value: '#707072', usage: '说明 / 价格 / 次级文字', textColor: '#ffffff' },
          { name: 'Error Red', value: '#d30005', usage: '错误 / 售卖紧急标识', textColor: '#ffffff' },
          { name: 'Success Green', value: '#007d48', usage: '可用 / 成功', textColor: '#ffffff' },
          { name: 'Link Blue', value: '#1151ff', usage: '链接', textColor: '#ffffff' },
          { name: 'Border Secondary', value: '#cacacb', usage: '输入边框 / 分隔线', textColor: '#111111' },
        ],
      },
    ],
    typography: [
      {
        label: '巨型标题',
        sample: 'JUST DO IT',
        meta: '96px / 500 / 0.90 / uppercase / Nike Futura ND',
        style: { fontSize: 96, fontWeight: 500, lineHeight: 0.9, letterSpacing: 0, textTransform: 'uppercase', fontFamily: '"Arial Narrow", Impact, sans-serif' },
      },
      {
        label: '展示标题',
        sample: 'RUN THE GAME',
        meta: '64px / 500 / 0.95 / uppercase',
        style: { fontSize: 64, fontWeight: 500, lineHeight: 0.95, letterSpacing: 0, textTransform: 'uppercase', fontFamily: '"Arial Narrow", Impact, sans-serif' },
      },
      {
        label: '卡片标题',
        sample: 'Air Max DN8',
        meta: '16px / 500 / 1.50 / Helvetica Now',
        style: { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'Helvetica, Arial, sans-serif' },
      },
      {
        label: '正文',
        sample: 'Confident product copy with direct, functional hierarchy.',
        meta: '16px / 500 / 1.75 / Helvetica Now',
        style: { fontSize: 16, fontWeight: 500, lineHeight: 1.75, letterSpacing: 0, fontFamily: 'Helvetica, Arial, sans-serif' },
      },
      {
        label: '按钮文字',
        sample: 'Shop now',
        meta: '16px / 500 / 1.50 / Helvetica Now',
        style: { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'Helvetica, Arial, sans-serif' },
      },
      {
        label: '说明文字',
        sample: 'Men’s road running shoes',
        meta: '14px / 500 / 1.50 / Helvetica Now',
        style: { fontSize: 14, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'Helvetica, Arial, sans-serif' },
      },
    ],
    components: [
      {
        title: '按钮',
        note: '黑白 pill CTA、描边次按钮、圆形图标动作共同组成购买路径。',
        variant: 'nike-buttons',
      },
      {
        title: '卡片',
        note: '产品卡真正关键的是无阴影、无圆角商品图、密集商品信息和极轻 UI chrome。',
        variant: 'nike-cards',
      },
    ],
    layout: {
      spacing: '基础 4px / 8px 系统，商品网格间距有意压紧',
      grid: '商品 3 列桌面、2 列平板、1 列移动，分类卡也使用图像网格',
      rhythm: '大标题与紧密商品矩阵并存，视觉重心几乎总在图片和商品上',
      radius: '0px 商品图 / 20px 容器 / 24px 搜索 / 30px 按钮 pill',
    },
    layoutSpec: {
      summary:
        'Nike 的骨架是零修饰电商结构：上方白色导航承接搜索与分类，下方大 hero 和高密度商品网格直接接管视线，内容密度明显高于其他品牌。',
      notes: ['白色电商导航', 'hero 全幅', '产品 3→2→1 列', '商品图 edge-to-edge'],
      rows: [
        { label: '顶部结构', value: '白色 sticky nav，分类在中部，搜索与收藏在右侧' },
        { label: '主体容器', value: '全幅 hero + 3 列商品网格 + 分类图片卡片' },
        { label: '断点逻辑', value: '<640 单列，960 前双列，960+ 三列 product grid' },
      ],
      model: 'nike',
    },
    spacingScale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
    radiusScale: [
      { value: '0px', label: '商品图', shape: 'square' },
      { value: '8px', label: '表单输入', shape: 'square' },
      { value: '20px', label: '容器', shape: 'square' },
      { value: '24px', label: '搜索', shape: 'square' },
      { value: '30px', label: '按钮', shape: 'pill' },
      { value: '50%', label: '圆形控件', shape: 'circle' },
    ],
    elevationScale: [
      {
        title: 'Flat',
        meta: 'No shadow / no border',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'none', border: '1px solid rgba(17,17,17,0.04)', color: '#111111' },
      },
      {
        title: 'State Gray',
        meta: '#f5f5f5 surface only',
        tone: 'light',
        style: { background: '#f5f5f5', boxShadow: 'none', border: '1px solid rgba(17,17,17,0.04)', color: '#111111' },
      },
      {
        title: 'Divider',
        meta: '1px inset or border line',
        tone: 'light',
        style: { background: '#ffffff', boxShadow: 'inset 0 -1px 0 #cacacb', border: 'none', color: '#111111' },
      },
      {
        title: 'Focus Ring',
        meta: 'rgba(39,93,197,1) ring',
        tone: 'accent',
        style: { background: '#ffffff', boxShadow: '0 0 0 2px rgba(39,93,197,1)', border: '1px solid #111111', color: '#111111' },
      },
    ],
    forms: {
      summary:
        'Nike 的表单和输入完全服务于电商效率。它们不是展示对象，而是承接搜索、筛选和购买的轻量控件，所以背景和边界都非常直白。',
      notes: ['灰底 search', '边框极简', 'focus ring 清晰', '购买路径优先'],
      fields: [
        {
          label: '搜索框',
          type: 'input',
          fieldStyle: {
            background: '#f5f5f5',
            border: '1px solid transparent',
            borderRadius: '24px',
            color: '#111111',
            padding: '14px 18px',
          },
          placeholder: 'Search',
          note: '搜索默认几乎无边框，靠浅灰底区分',
        },
        {
          label: '表单输入',
          type: 'input',
          fieldStyle: {
            background: '#ffffff',
            border: '1px solid #cacacb',
            borderRadius: '8px',
            color: '#111111',
            padding: '14px 16px',
          },
          placeholder: 'Email address',
          note: '普通输入框仍保持极简边界',
        },
        {
          label: '筛选项',
          type: 'chips',
          chips: ['Men', 'Women', 'Jordan', 'Running'],
          note: '筛选和分类会直接贴合电商购买路径',
        },
      ],
    },
    cardSpec: {
      summary: 'Nike 的卡片不是“漂亮 UI 卡”，而是最短路径地承载商品图、名称、价格与分类信息。',
      variants: [
        { name: 'Product Card', notes: ['无阴影', '图片无圆角', '标题 + 说明 + 价格', '紧密网格'] },
        { name: 'Category Image Card', notes: ['全幅摄影', '文字覆盖在图上', '容器圆角可存在但图片仍保持硬边'] },
      ],
    },
    guidance: {
      do: ['让摄影和商品承担主要颜色', '保持按钮 pill 但不装饰', '商品图维持硬边和高密度排列'],
      dont: ['不要给卡片加阴影', '不要给商品图加圆角', '不要让 UI 自己变得比商品更有存在感'],
    },
  },
];

export const brands = [...curatedBrands, ...generatedBrands];

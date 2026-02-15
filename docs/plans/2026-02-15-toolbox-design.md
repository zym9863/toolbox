# Toolbox 工具箱网站设计文档

## 概述

一个包含 100 个在线小工具的工具箱网站，面向开发者和普通用户，支持中英双语，以前端工具为主、少量后端支持。

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- lucide-react (图标)
- pnpm (包管理)

## 架构方案：混合路由 + 动态加载 (方案 C)

使用 `[category]/[tool]` 两级动态路由，工具组件通过 registry 模式 + dynamic import 加载。

### 路由结构

```
src/app/
├── layout.tsx                    # 根布局：导航栏 + 侧边栏 + 主内容区
├── page.tsx                      # 首页：搜索 + 分类工具网格
├── [category]/
│   └── [tool]/
│       └── page.tsx              # 工具页：动态加载对应工具组件
```

### 工具注册 Registry

每个工具通过统一的 registry 配置文件注册：

```ts
// src/tools/registry.ts
{
  slug: "json-formatter",
  category: "text",
  name: { zh: "JSON 格式化", en: "JSON Formatter" },
  description: { zh: "格式化和验证 JSON 数据", en: "Format and validate JSON" },
  icon: "Braces",
  component: () => import("./text/JsonFormatter"),
}
```

新增工具 = 写组件 + 加一条注册。

### 工具组件结构

```
src/tools/
├── registry.ts                   # 工具注册表
├── types.ts                      # 类型定义
├── text/
│   ├── JsonFormatter.tsx
│   ├── MarkdownPreview.tsx
│   └── ...
├── encoding/
│   ├── Base64Codec.tsx
│   └── ...
└── ...（按分类组织）
```

## 工具分类（10 类 × ~10 个 = 100 个）

### 1. 文本处理 (text)
1. JSON 格式化/验证
2. Markdown 预览
3. 文本差异对比
4. 字数/字符统计
5. 大小写转换
6. 文本去重
7. 文本排序
8. 文本替换
9. 行号添加/删除
10. 空白字符清理

### 2. 编码转换 (encoding)
11. Base64 编解码
12. URL 编解码
13. HTML 实体编解码
14. JWT 解码
15. Unicode 转换
16. UTF-8 编解码
17. Hex 编解码
18. ASCII 转换
19. Punycode 转换
20. MIME 编解码

### 3. 生成器 (generators)
21. UUID 生成器
22. 密码生成器
23. Lorem Ipsum 生成器
24. 二维码生成器
25. 条形码生成器
26. 随机数生成器
27. 假数据生成器 (Mock Data)
28. 头像/占位图生成器
29. 渐变色生成器
30. 配色方案生成器

### 4. 图片工具 (image)
31. 图片压缩
32. 图片格式转换
33. 图片裁剪/缩放
34. 取色器 (Color Picker)
35. 图片转 Base64
36. SVG 预览/优化
37. ICO 转换器
38. 图片水印
39. 图片拼接
40. 图片元数据查看

### 5. CSS/前端 (css)
41. 颜色选择器/转换器
42. CSS 渐变生成器
43. Box Shadow 生成器
44. Border Radius 生成器
45. Flexbox 演练场
46. Grid 演练场
47. CSS 动画生成器
48. 字体预览
49. CSS 单位转换 (px/rem/em)
50. Tailwind CSS 查找器

### 6. 计算工具 (calculators)
51. 科学计算器
52. 单位换算
53. 日期计算器
54. 进制转换 (2/8/10/16)
55. 百分比计算器
56. BMI 计算器
57. 贷款计算器
58. 时区转换
59. 色彩空间转换 (RGB/HSL/HEX)
60. 数学表达式求值

### 7. 网络工具 (network)
61. HTTP 状态码参考
62. URL 解析器
63. IP 地址查询
64. DNS 查询
65. User-Agent 解析
66. 请求头查看器
67. WebSocket 测试
68. API 测试工具
69. CORS 检查器
70. Ping/延迟测试

### 8. 加密安全 (crypto)
71. MD5 哈希
72. SHA 哈希 (1/256/512)
73. HMAC 生成器
74. AES 加解密
75. RSA 密钥对生成
76. bcrypt 哈希
77. 数字签名验证
78. 证书解析 (X.509)
79. CSP 生成器
80. 密码强度检测

### 9. 数据处理 (data)
81. JSON ↔ CSV 转换
82. JSON ↔ YAML 转换
83. JSON ↔ XML 转换
84. JSON ↔ TOML 转换
85. SQL 格式化
86. 正则表达式测试
87. JSON Path 查询
88. 数据表格查看器
89. JSON Schema 验证
90. GraphQL 格式化

### 10. 开发辅助 (devtools)
91. Cron 表达式生成器
92. 时间戳转换
93. Git 命令速查
94. 键盘快捷键查看 (KeyCode)
95. Chmod 计算器
96. .gitignore 生成器
97. HTML 预览
98. 代码截图 (Code to Image)
99. 代码差异对比
100. Markdown 表格生成器

## 布局设计

```
┌─────────────────────────────────────────────┐
│  Logo  Toolbox     [搜索框]     [中/EN] [☀/🌙] │
├──────────┬──────────────────────────────────┤
│ 分类导航  │  工具内容区                        │
│ ▸ 文本处理│  ┌──────────────────────────────┐ │
│ ▸ 编码转换│  │  工具名称 + 描述               │ │
│ ▸ 生成器  │  │  ┌─────────┐  ┌─────────┐    │ │
│ ▸ 图片工具│  │  │  输入区   │  │  输出区   │    │ │
│ ▸ CSS前端 │  │  └─────────┘  └─────────┘    │ │
│ ▸ 计算工具│  └──────────────────────────────┘ │
│ ▸ 网络工具│                                   │
│ ▸ 加密安全│                                   │
│ ▸ 数据处理│                                   │
│ ▸ 开发辅助│                                   │
└──────────┴──────────────────────────────────┘
```

- 左侧：可折叠的分类侧边栏
- 顶部：搜索框 + 语言切换 + 暗色模式切换
- 移动端：侧边栏收起为汉堡菜单
- 首页：分类卡片网格，每个分类展示工具列表

## 国际化方案

轻量自建 i18n：
- `src/i18n/zh.ts` / `src/i18n/en.ts` 字典文件（通用 UI 文案）
- React Context (`LocaleProvider`) 提供语言切换
- 工具名称和描述在 registry 中直接定义 `{ zh, en }` 双语
- localStorage 持久化语言偏好

## 技术要点

- **组件懒加载**：`next/dynamic` 按需加载工具组件
- **搜索**：前端 fuzzy search，支持中英文工具名和描述搜索
- **暗色模式**：Tailwind CSS dark mode + CSS 变量 + localStorage 持久化
- **无额外 UI 库**：纯 Tailwind 手写组件
- **图标**：lucide-react
- **后端**：仅图片处理（压缩/转换等）使用 Next.js API Routes / Server Actions
- **共享组件**：抽取通用的输入/输出面板、复制按钮、文件上传等

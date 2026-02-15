[English](README.md) · [简体中文](README-zh.md)

# Toolbox - 开发者工具

一个使用 Next.js 构建的综合在线开发者工具集合。包含 100+ 个工具，覆盖 10 个类别，全部在浏览器中运行以保证隐私和速度。

## 功能

- **100+ 开发者工具** - 满足日常开发各种需求
- **隐私优先** - 所有工具在客户端运行，不向服务器发送数据
- **双语支持** - 提供中文与英文界面
- **深色/浅色主题** - 适配不同阅读环境
- **响应式设计** - 兼容桌面与移动设备
- **现代与高性能** - 基于 Next.js 16 与 React 19

## 工具分类

### 文本处理
JSON 格式化、Markdown 预览、文本差异、单词计数、大小写转换、文本去重、文本排序、批量替换、行号、空白清理

### 编码
Base64 编解码、URL 编码、HTML 实体、JWT 解码、Unicode 转换、UTF-8 编码/解码、Hex 编解码、ASCII 表、Punycode 转换、MIME 编解码

### 生成器
UUID 生成器、密码生成器、Lorem Ipsum、二维码生成、条形码生成、随机数、Mock 数据生成、占位图、渐变生成、配色方案

### 图像工具
图片压缩、格式转换、图片缩放、取色器、图片转 Base64、SVG 预览、ICO 转换、图片水印、图片拼接、图片元数据

### CSS / 前端
颜色转换、CSS 渐变、阴影（Box Shadow）、圆角（Border Radius）、Flexbox 练习场、Grid 练习场、CSS 动画、字体预览、CSS 单位转换、Tailwind 查找器

### 计算器
科学计算器、单位换算、日期计算器、进制转换、百分比计算、BMI 计算、贷款计算、时区转换、色彩空间转换、数学表达式求值

### 网络
HTTP 状态码、URL 解析、IP 查询、DNS 查询、User-Agent 解析、请求头查看、WebSocket 测试、API 测试、CORS 检查、Ping 测试

### 加密 / 安全
MD5、SHA、HMAC 生成器、AES 加解密、RSA 密钥生成、Bcrypt、数字签名、X.509 解析、CSP 生成器、密码强度检测

### 数据处理
JSON/CSV 转换、JSON/YAML 转换、JSON/XML 转换、JSON/TOML 转换、SQL 格式化、正则测试、JSONPath 查询、表格查看、JSON Schema 验证、GraphQL 格式化

### 开发工具
Cron 生成器、时间戳转换、Git 备忘、按键码查看、Chmod 计算器、.gitignore 生成、HTML 预览、代码转图片、代码差异、Markdown 表格

## 技术栈

- 框架：Next.js 16（App Router）
- UI：React 19，Tailwind CSS 4
- 语言：TypeScript
- 图标：Lucide React
- 代码风格/静态检查：Biome
- 包管理：pnpm

## 快速开始

### 先决条件

- Node.js 18+
- pnpm（推荐）

### 安装

```bash
# 克隆仓库
git clone https://github.com/zym9863/toolbox.git
cd toolbox

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 http://localhost:3000 查看应用。

### 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 Biome linter |
| `pnpm format` | 使用 Biome 格式化代码 |

## 项目结构

```
src/
  app/                    # Next.js App Router 页面
    [category]/           # 动态分类路由
    [category]/[tool]/    # 动态工具路由
    api/                  # API 路由
  components/            # 可复用 UI 组件
  i18n/                   # 国际化
    locales/              # 语言文件（en, zh）
  tools/                  # 工具实现
    calculators/          # 计算器工具
    crypto/               # 加密工具
    css/                  # CSS/前端工具
    data/                 # 数据处理工具
    devtools/             # 开发者工具
    encoding/             # 编码工具
    generators/           # 生成器工具
    image/                # 图像工具
    network/              # 网络工具
    text/                 # 文本处理工具
    categories.ts         # 分类定义
    registry.ts           # 工具注册表
    types.ts              # TypeScript 类型
```

## 添加新工具

1. 在对应分类目录（`src/tools/`）下创建新的工具组件。
2. 在 `src/tools/registry.ts` 注册新工具：

```typescript
{
  slug: "tool-slug",
  category: "category-name",
  name: { zh: "Chinese Name", en: "English Name" },
  description: { zh: "Chinese description", en: "English description" },
  icon: "IconName",
  component: () => import("./category/ToolComponent"),
}
```

## 贡献

欢迎贡献！欢迎通过 Pull Request 提交改进。

## 许可证

MIT 许可证 — 详情请参阅 [LICENSE](LICENSE)。

import type { ToolDefinition } from "./types";

export const tools: ToolDefinition[] = [
  // ===== 文本处理 (text) =====
  {
    slug: "json-formatter", category: "text",
    name: { zh: "JSON 格式化", en: "JSON Formatter" },
    description: { zh: "格式化、压缩和验证 JSON 数据", en: "Format, minify and validate JSON" },
    icon: "Braces", component: () => import("./text/JsonFormatter"),
  },
  {
    slug: "markdown-preview", category: "text",
    name: { zh: "Markdown 预览", en: "Markdown Preview" },
    description: { zh: "实时预览 Markdown 渲染效果", en: "Live preview Markdown rendering" },
    icon: "FileText", component: () => import("./text/MarkdownPreview"),
  },
  {
    slug: "text-diff", category: "text",
    name: { zh: "文本差异对比", en: "Text Diff" },
    description: { zh: "比较两段文本的差异", en: "Compare differences between two texts" },
    icon: "GitCompare", component: () => import("./text/TextDiff"),
  },
  {
    slug: "word-counter", category: "text",
    name: { zh: "字数统计", en: "Word Counter" },
    description: { zh: "统计字符、单词、行数和段落数", en: "Count characters, words, lines and paragraphs" },
    icon: "Hash", component: () => import("./text/WordCounter"),
  },
  {
    slug: "case-converter", category: "text",
    name: { zh: "大小写转换", en: "Case Converter" },
    description: { zh: "转换文本大小写格式", en: "Convert text case format" },
    icon: "CaseSensitive", component: () => import("./text/CaseConverter"),
  },
  {
    slug: "text-dedup", category: "text",
    name: { zh: "文本去重", en: "Text Dedup" },
    description: { zh: "删除重复的文本行", en: "Remove duplicate text lines" },
    icon: "ListFilter", component: () => import("./text/TextDedup"),
  },
  {
    slug: "text-sort", category: "text",
    name: { zh: "文本排序", en: "Text Sort" },
    description: { zh: "按行排序文本", en: "Sort text by lines" },
    icon: "ArrowDownAZ", component: () => import("./text/TextSort"),
  },
  {
    slug: "text-replace", category: "text",
    name: { zh: "文本替换", en: "Text Replace" },
    description: { zh: "查找和替换文本内容", en: "Find and replace text content" },
    icon: "Replace", component: () => import("./text/TextReplace"),
  },
  {
    slug: "line-numbers", category: "text",
    name: { zh: "行号工具", en: "Line Numbers" },
    description: { zh: "添加或删除文本行号", en: "Add or remove line numbers" },
    icon: "List", component: () => import("./text/LineNumbers"),
  },
  {
    slug: "whitespace-cleaner", category: "text",
    name: { zh: "空白清理", en: "Whitespace Cleaner" },
    description: { zh: "清理多余的空白字符", en: "Clean up extra whitespace" },
    icon: "Eraser", component: () => import("./text/WhitespaceCleaner"),
  },

  // ===== 编码转换 (encoding) =====
  {
    slug: "base64", category: "encoding",
    name: { zh: "Base64 编解码", en: "Base64 Codec" },
    description: { zh: "Base64 编码和解码", en: "Base64 encode and decode" },
    icon: "FileCode", component: () => import("./encoding/Base64Codec"),
  },
  {
    slug: "url-codec", category: "encoding",
    name: { zh: "URL 编解码", en: "URL Codec" },
    description: { zh: "URL 编码和解码", en: "URL encode and decode" },
    icon: "Link", component: () => import("./encoding/UrlCodec"),
  },
  {
    slug: "html-entity", category: "encoding",
    name: { zh: "HTML 实体", en: "HTML Entity" },
    description: { zh: "HTML 实体编码和解码", en: "HTML entity encode and decode" },
    icon: "Code", component: () => import("./encoding/HtmlEntityCodec"),
  },
  {
    slug: "jwt-decoder", category: "encoding",
    name: { zh: "JWT 解码", en: "JWT Decoder" },
    description: { zh: "解码和检查 JWT Token", en: "Decode and inspect JWT tokens" },
    icon: "KeyRound", component: () => import("./encoding/JwtDecoder"),
  },
  {
    slug: "unicode", category: "encoding",
    name: { zh: "Unicode 转换", en: "Unicode Converter" },
    description: { zh: "Unicode 转义序列转换", en: "Unicode escape sequence conversion" },
    icon: "Languages", component: () => import("./encoding/UnicodeConverter"),
  },
  {
    slug: "utf8", category: "encoding",
    name: { zh: "UTF-8 编解码", en: "UTF-8 Codec" },
    description: { zh: "查看文本的 UTF-8 字节序列", en: "View UTF-8 byte sequence of text" },
    icon: "Binary", component: () => import("./encoding/Utf8Codec"),
  },
  {
    slug: "hex", category: "encoding",
    name: { zh: "Hex 编解码", en: "Hex Codec" },
    description: { zh: "十六进制编码和解码", en: "Hexadecimal encode and decode" },
    icon: "Hexagon", component: () => import("./encoding/HexCodec"),
  },
  {
    slug: "ascii-table", category: "encoding",
    name: { zh: "ASCII 表", en: "ASCII Table" },
    description: { zh: "ASCII 字符参考表和转换", en: "ASCII character reference and conversion" },
    icon: "Table", component: () => import("./encoding/AsciiTable"),
  },
  {
    slug: "punycode", category: "encoding",
    name: { zh: "Punycode 转换", en: "Punycode Converter" },
    description: { zh: "国际化域名 Punycode 转换", en: "IDN Punycode conversion" },
    icon: "Globe", component: () => import("./encoding/PunycodeConverter"),
  },
  {
    slug: "mime", category: "encoding",
    name: { zh: "MIME 编解码", en: "MIME Codec" },
    description: { zh: "MIME 编码和解码", en: "MIME encode and decode" },
    icon: "Mail", component: () => import("./encoding/MimeCodec"),
  },

  // ===== 生成器 (generators) =====
  {
    slug: "uuid", category: "generators",
    name: { zh: "UUID 生成器", en: "UUID Generator" },
    description: { zh: "生成随机 UUID", en: "Generate random UUIDs" },
    icon: "Fingerprint", component: () => import("./generators/UuidGenerator"),
  },
  {
    slug: "password", category: "generators",
    name: { zh: "密码生成器", en: "Password Generator" },
    description: { zh: "生成安全的随机密码", en: "Generate secure random passwords" },
    icon: "Lock", component: () => import("./generators/PasswordGenerator"),
  },
  {
    slug: "lorem-ipsum", category: "generators",
    name: { zh: "Lorem Ipsum", en: "Lorem Ipsum" },
    description: { zh: "生成占位文本", en: "Generate placeholder text" },
    icon: "AlignLeft", component: () => import("./generators/LoremIpsum"),
  },
  {
    slug: "qrcode", category: "generators",
    name: { zh: "二维码生成器", en: "QR Code Generator" },
    description: { zh: "生成二维码图片", en: "Generate QR code images" },
    icon: "QrCode", component: () => import("./generators/QrCodeGenerator"),
  },
  {
    slug: "barcode", category: "generators",
    name: { zh: "条形码生成器", en: "Barcode Generator" },
    description: { zh: "生成条形码图片", en: "Generate barcode images" },
    icon: "Barcode", component: () => import("./generators/BarcodeGenerator"),
  },
  {
    slug: "random-number", category: "generators",
    name: { zh: "随机数生成器", en: "Random Number" },
    description: { zh: "生成随机数", en: "Generate random numbers" },
    icon: "Dices", component: () => import("./generators/RandomNumber"),
  },
  {
    slug: "mock-data", category: "generators",
    name: { zh: "假数据生成器", en: "Mock Data Generator" },
    description: { zh: "生成模拟数据", en: "Generate mock/fake data" },
    icon: "Database", component: () => import("./generators/MockDataGenerator"),
  },
  {
    slug: "placeholder-image", category: "generators",
    name: { zh: "占位图生成器", en: "Placeholder Image" },
    description: { zh: "生成占位图片", en: "Generate placeholder images" },
    icon: "ImagePlus", component: () => import("./generators/PlaceholderImage"),
  },
  {
    slug: "gradient", category: "generators",
    name: { zh: "渐变色生成器", en: "Gradient Generator" },
    description: { zh: "生成 CSS 渐变色", en: "Generate CSS gradients" },
    icon: "Blend", component: () => import("./generators/GradientGenerator"),
  },
  {
    slug: "color-scheme", category: "generators",
    name: { zh: "配色方案", en: "Color Scheme" },
    description: { zh: "生成和谐的配色方案", en: "Generate harmonious color schemes" },
    icon: "Palette", component: () => import("./generators/ColorScheme"),
  },

  // ===== 图片工具 (image) =====
  {
    slug: "image-compressor", category: "image",
    name: { zh: "图片压缩", en: "Image Compressor" },
    description: { zh: "压缩图片文件大小", en: "Compress image file size" },
    icon: "FileDown", component: () => import("./image/ImageCompressor"),
  },
  {
    slug: "image-format", category: "image",
    name: { zh: "图片格式转换", en: "Image Format Converter" },
    description: { zh: "转换图片格式", en: "Convert image format" },
    icon: "RefreshCw", component: () => import("./image/ImageFormatConverter"),
  },
  {
    slug: "image-resizer", category: "image",
    name: { zh: "图片缩放", en: "Image Resizer" },
    description: { zh: "调整图片尺寸", en: "Resize image dimensions" },
    icon: "Maximize", component: () => import("./image/ImageResizer"),
  },
  {
    slug: "color-picker", category: "image",
    name: { zh: "取色器", en: "Color Picker" },
    description: { zh: "从图片中提取颜色", en: "Pick colors from images" },
    icon: "Pipette", component: () => import("./image/ColorPicker"),
  },
  {
    slug: "image-to-base64", category: "image",
    name: { zh: "图片转 Base64", en: "Image to Base64" },
    description: { zh: "将图片转换为 Base64 编码", en: "Convert image to Base64 encoding" },
    icon: "FileImage", component: () => import("./image/ImageToBase64"),
  },
  {
    slug: "svg-preview", category: "image",
    name: { zh: "SVG 预览", en: "SVG Preview" },
    description: { zh: "预览和编辑 SVG 代码", en: "Preview and edit SVG code" },
    icon: "PenTool", component: () => import("./image/SvgPreview"),
  },
  {
    slug: "ico-converter", category: "image",
    name: { zh: "ICO 转换器", en: "ICO Converter" },
    description: { zh: "生成多尺寸图标", en: "Generate multi-size icons" },
    icon: "AppWindow", component: () => import("./image/IcoConverter"),
  },
  {
    slug: "image-watermark", category: "image",
    name: { zh: "图片水印", en: "Image Watermark" },
    description: { zh: "给图片添加文字水印", en: "Add text watermark to images" },
    icon: "Stamp", component: () => import("./image/ImageWatermark"),
  },
  {
    slug: "image-collage", category: "image",
    name: { zh: "图片拼接", en: "Image Collage" },
    description: { zh: "拼接多张图片", en: "Combine multiple images" },
    icon: "LayoutGrid", component: () => import("./image/ImageCollage"),
  },
  {
    slug: "image-metadata", category: "image",
    name: { zh: "图片元数据", en: "Image Metadata" },
    description: { zh: "查看图片详细信息", en: "View image details" },
    icon: "Info", component: () => import("./image/ImageMetadata"),
  },

  // ===== CSS/前端 (css) =====
  {
    slug: "color-converter", category: "css",
    name: { zh: "颜色转换器", en: "Color Converter" },
    description: { zh: "HEX/RGB/HSL 颜色格式转换", en: "Convert between HEX/RGB/HSL color formats" },
    icon: "Paintbrush", component: () => import("./css/ColorConverter"),
  },
  {
    slug: "css-gradient", category: "css",
    name: { zh: "CSS 渐变生成器", en: "CSS Gradient" },
    description: { zh: "可视化生成 CSS 渐变", en: "Visually generate CSS gradients" },
    icon: "Blend", component: () => import("./css/CssGradient"),
  },
  {
    slug: "box-shadow", category: "css",
    name: { zh: "Box Shadow 生成器", en: "Box Shadow" },
    description: { zh: "可视化生成 CSS 阴影", en: "Visually generate CSS box shadows" },
    icon: "Square", component: () => import("./css/BoxShadow"),
  },
  {
    slug: "border-radius", category: "css",
    name: { zh: "Border Radius 生成器", en: "Border Radius" },
    description: { zh: "可视化生成 CSS 圆角", en: "Visually generate CSS border radius" },
    icon: "RectangleHorizontal", component: () => import("./css/BorderRadius"),
  },
  {
    slug: "flexbox", category: "css",
    name: { zh: "Flexbox 演练场", en: "Flexbox Playground" },
    description: { zh: "交互式 Flexbox 布局演练", en: "Interactive Flexbox layout playground" },
    icon: "Columns3", component: () => import("./css/FlexboxPlayground"),
  },
  {
    slug: "grid", category: "css",
    name: { zh: "Grid 演练场", en: "Grid Playground" },
    description: { zh: "交互式 CSS Grid 布局演练", en: "Interactive CSS Grid layout playground" },
    icon: "Grid3X3", component: () => import("./css/GridPlayground"),
  },
  {
    slug: "css-animation", category: "css",
    name: { zh: "CSS 动画生成器", en: "CSS Animation" },
    description: { zh: "生成 CSS 动画效果", en: "Generate CSS animations" },
    icon: "Play", component: () => import("./css/CssAnimation"),
  },
  {
    slug: "font-preview", category: "css",
    name: { zh: "字体预览", en: "Font Preview" },
    description: { zh: "预览不同字体效果", en: "Preview different font effects" },
    icon: "Type", component: () => import("./css/FontPreview"),
  },
  {
    slug: "css-unit-converter", category: "css",
    name: { zh: "CSS 单位转换", en: "CSS Unit Converter" },
    description: { zh: "px/rem/em 等单位互转", en: "Convert between px/rem/em units" },
    icon: "Ruler", component: () => import("./css/CssUnitConverter"),
  },
  {
    slug: "tailwind-finder", category: "css",
    name: { zh: "Tailwind 查找器", en: "Tailwind Finder" },
    description: { zh: "CSS 属性对应的 Tailwind 类名", en: "Find Tailwind classes for CSS properties" },
    icon: "Search", component: () => import("./css/TailwindFinder"),
  },

  // ===== 计算工具 (calculators) =====
  {
    slug: "calculator", category: "calculators",
    name: { zh: "科学计算器", en: "Scientific Calculator" },
    description: { zh: "支持科学函数的计算器", en: "Calculator with scientific functions" },
    icon: "Calculator", component: () => import("./calculators/Calculator"),
  },
  {
    slug: "unit-converter", category: "calculators",
    name: { zh: "单位换算", en: "Unit Converter" },
    description: { zh: "长度、重量、温度等单位换算", en: "Convert length, weight, temperature units" },
    icon: "ArrowLeftRight", component: () => import("./calculators/UnitConverter"),
  },
  {
    slug: "date-calculator", category: "calculators",
    name: { zh: "日期计算器", en: "Date Calculator" },
    description: { zh: "计算日期差和日期加减", en: "Calculate date difference and add/subtract" },
    icon: "Calendar", component: () => import("./calculators/DateCalculator"),
  },
  {
    slug: "base-converter", category: "calculators",
    name: { zh: "进制转换", en: "Base Converter" },
    description: { zh: "二进制、八进制、十进制、十六进制互转", en: "Convert between binary, octal, decimal, hex" },
    icon: "Hash", component: () => import("./calculators/BaseConverter"),
  },
  {
    slug: "percent-calculator", category: "calculators",
    name: { zh: "百分比计算器", en: "Percent Calculator" },
    description: { zh: "百分比相关计算", en: "Percentage calculations" },
    icon: "Percent", component: () => import("./calculators/PercentCalculator"),
  },
  {
    slug: "bmi-calculator", category: "calculators",
    name: { zh: "BMI 计算器", en: "BMI Calculator" },
    description: { zh: "计算身体质量指数", en: "Calculate Body Mass Index" },
    icon: "Heart", component: () => import("./calculators/BmiCalculator"),
  },
  {
    slug: "loan-calculator", category: "calculators",
    name: { zh: "贷款计算器", en: "Loan Calculator" },
    description: { zh: "等额本息/等额本金计算", en: "Calculate loan payments" },
    icon: "Banknote", component: () => import("./calculators/LoanCalculator"),
  },
  {
    slug: "timezone", category: "calculators",
    name: { zh: "时区转换", en: "Timezone Converter" },
    description: { zh: "世界时区时间转换", en: "Convert between world timezones" },
    icon: "Clock", component: () => import("./calculators/TimezoneConverter"),
  },
  {
    slug: "color-space", category: "calculators",
    name: { zh: "色彩空间转换", en: "Color Space Converter" },
    description: { zh: "RGB/HSL/HSV/HEX 色彩转换", en: "Convert between RGB/HSL/HSV/HEX" },
    icon: "Palette", component: () => import("./calculators/ColorSpaceConverter"),
  },
  {
    slug: "math-evaluator", category: "calculators",
    name: { zh: "数学表达式求值", en: "Math Evaluator" },
    description: { zh: "安全地计算数学表达式", en: "Safely evaluate math expressions" },
    icon: "Sigma", component: () => import("./calculators/MathEvaluator"),
  },

  // ===== 网络工具 (network) =====
  {
    slug: "http-status", category: "network",
    name: { zh: "HTTP 状态码", en: "HTTP Status Codes" },
    description: { zh: "HTTP 状态码速查表", en: "HTTP status code reference" },
    icon: "FileJson", component: () => import("./network/HttpStatusCodes"),
  },
  {
    slug: "url-parser", category: "network",
    name: { zh: "URL 解析器", en: "URL Parser" },
    description: { zh: "解析 URL 的各个部分", en: "Parse URL components" },
    icon: "Link2", component: () => import("./network/UrlParser"),
  },
  {
    slug: "ip-lookup", category: "network",
    name: { zh: "IP 地址查询", en: "IP Lookup" },
    description: { zh: "查询 IP 地址信息", en: "Look up IP address info" },
    icon: "MapPin", component: () => import("./network/IpLookup"),
  },
  {
    slug: "dns-lookup", category: "network",
    name: { zh: "DNS 查询", en: "DNS Lookup" },
    description: { zh: "查询域名 DNS 记录", en: "Query domain DNS records" },
    icon: "Server", component: () => import("./network/DnsLookup"),
  },
  {
    slug: "user-agent", category: "network",
    name: { zh: "User-Agent 解析", en: "User-Agent Parser" },
    description: { zh: "解析浏览器 User-Agent", en: "Parse browser User-Agent" },
    icon: "Monitor", component: () => import("./network/UserAgentParser"),
  },
  {
    slug: "request-headers", category: "network",
    name: { zh: "请求头查看", en: "Request Headers" },
    description: { zh: "查看浏览器请求头", en: "View browser request headers" },
    icon: "FileText", component: () => import("./network/RequestHeaders"),
  },
  {
    slug: "websocket-tester", category: "network",
    name: { zh: "WebSocket 测试", en: "WebSocket Tester" },
    description: { zh: "测试 WebSocket 连接", en: "Test WebSocket connections" },
    icon: "Plug", component: () => import("./network/WebSocketTester"),
  },
  {
    slug: "api-tester", category: "network",
    name: { zh: "API 测试", en: "API Tester" },
    description: { zh: "发送 HTTP 请求测试 API", en: "Send HTTP requests to test APIs" },
    icon: "Send", component: () => import("./network/ApiTester"),
  },
  {
    slug: "cors-checker", category: "network",
    name: { zh: "CORS 检查", en: "CORS Checker" },
    description: { zh: "检查跨域资源共享配置", en: "Check CORS configuration" },
    icon: "ShieldCheck", component: () => import("./network/CorsChecker"),
  },
  {
    slug: "ping-tester", category: "network",
    name: { zh: "Ping 测试", en: "Ping Tester" },
    description: { zh: "测试网络延迟", en: "Test network latency" },
    icon: "Activity", component: () => import("./network/PingTester"),
  },

  // ===== 加密安全 (crypto) =====
  {
    slug: "md5", category: "crypto",
    name: { zh: "MD5 哈希", en: "MD5 Hash" },
    description: { zh: "计算 MD5 哈希值", en: "Calculate MD5 hash" },
    icon: "Hash", component: () => import("./crypto/Md5Hash"),
  },
  {
    slug: "sha", category: "crypto",
    name: { zh: "SHA 哈希", en: "SHA Hash" },
    description: { zh: "计算 SHA-1/256/384/512 哈希", en: "Calculate SHA-1/256/384/512 hash" },
    icon: "ShieldCheck", component: () => import("./crypto/ShaHash"),
  },
  {
    slug: "hmac", category: "crypto",
    name: { zh: "HMAC 生成器", en: "HMAC Generator" },
    description: { zh: "生成 HMAC 消息认证码", en: "Generate HMAC message authentication code" },
    icon: "KeyRound", component: () => import("./crypto/HmacGenerator"),
  },
  {
    slug: "aes", category: "crypto",
    name: { zh: "AES 加解密", en: "AES Encrypt/Decrypt" },
    description: { zh: "AES-GCM 加密和解密", en: "AES-GCM encryption and decryption" },
    icon: "Lock", component: () => import("./crypto/AesEncryptor"),
  },
  {
    slug: "rsa-keygen", category: "crypto",
    name: { zh: "RSA 密钥生成", en: "RSA Key Generator" },
    description: { zh: "生成 RSA 公钥/私钥对", en: "Generate RSA public/private key pair" },
    icon: "Key", component: () => import("./crypto/RsaKeyGenerator"),
  },
  {
    slug: "bcrypt", category: "crypto",
    name: { zh: "Bcrypt 哈希", en: "Bcrypt Hash" },
    description: { zh: "Bcrypt 密码哈希和验证", en: "Bcrypt password hashing and verification" },
    icon: "Shield", component: () => import("./crypto/BcryptHash"),
  },
  {
    slug: "digital-signature", category: "crypto",
    name: { zh: "数字签名", en: "Digital Signature" },
    description: { zh: "ECDSA 签名和验证", en: "ECDSA sign and verify" },
    icon: "PenTool", component: () => import("./crypto/DigitalSignature"),
  },
  {
    slug: "x509-parser", category: "crypto",
    name: { zh: "证书解析", en: "X.509 Parser" },
    description: { zh: "解析 X.509 数字证书", en: "Parse X.509 digital certificates" },
    icon: "Award", component: () => import("./crypto/X509Parser"),
  },
  {
    slug: "csp-generator", category: "crypto",
    name: { zh: "CSP 生成器", en: "CSP Generator" },
    description: { zh: "生成 Content-Security-Policy", en: "Generate Content-Security-Policy" },
    icon: "ShieldAlert", component: () => import("./crypto/CspGenerator"),
  },
  {
    slug: "password-strength", category: "crypto",
    name: { zh: "密码强度检测", en: "Password Strength" },
    description: { zh: "检测密码安全强度", en: "Check password security strength" },
    icon: "ShieldCheck", component: () => import("./crypto/PasswordStrength"),
  },

  // ===== 数据处理 (data) =====
  {
    slug: "json-csv", category: "data",
    name: { zh: "JSON ↔ CSV", en: "JSON ↔ CSV" },
    description: { zh: "JSON 和 CSV 格式互转", en: "Convert between JSON and CSV" },
    icon: "Table", component: () => import("./data/JsonCsvConverter"),
  },
  {
    slug: "json-yaml", category: "data",
    name: { zh: "JSON ↔ YAML", en: "JSON ↔ YAML" },
    description: { zh: "JSON 和 YAML 格式互转", en: "Convert between JSON and YAML" },
    icon: "FileCode", component: () => import("./data/JsonYamlConverter"),
  },
  {
    slug: "json-xml", category: "data",
    name: { zh: "JSON ↔ XML", en: "JSON ↔ XML" },
    description: { zh: "JSON 和 XML 格式互转", en: "Convert between JSON and XML" },
    icon: "FileCode2", component: () => import("./data/JsonXmlConverter"),
  },
  {
    slug: "json-toml", category: "data",
    name: { zh: "JSON ↔ TOML", en: "JSON ↔ TOML" },
    description: { zh: "JSON 和 TOML 格式互转", en: "Convert between JSON and TOML" },
    icon: "FileText", component: () => import("./data/JsonTomlConverter"),
  },
  {
    slug: "sql-formatter", category: "data",
    name: { zh: "SQL 格式化", en: "SQL Formatter" },
    description: { zh: "格式化 SQL 查询语句", en: "Format SQL queries" },
    icon: "Database", component: () => import("./data/SqlFormatter"),
  },
  {
    slug: "regex-tester", category: "data",
    name: { zh: "正则表达式测试", en: "Regex Tester" },
    description: { zh: "测试和调试正则表达式", en: "Test and debug regular expressions" },
    icon: "Regex", component: () => import("./data/RegexTester"),
  },
  {
    slug: "jsonpath", category: "data",
    name: { zh: "JSONPath 查询", en: "JSONPath Query" },
    description: { zh: "使用 JSONPath 查询 JSON 数据", en: "Query JSON data with JSONPath" },
    icon: "Search", component: () => import("./data/JsonPathQuery"),
  },
  {
    slug: "data-table", category: "data",
    name: { zh: "数据表格查看器", en: "Data Table Viewer" },
    description: { zh: "以表格形式查看 JSON/CSV 数据", en: "View JSON/CSV data as a table" },
    icon: "Sheet", component: () => import("./data/DataTableViewer"),
  },
  {
    slug: "json-schema", category: "data",
    name: { zh: "JSON Schema 验证", en: "JSON Schema Validator" },
    description: { zh: "验证 JSON 数据是否符合 Schema", en: "Validate JSON data against a schema" },
    icon: "CheckCircle", component: () => import("./data/JsonSchemaValidator"),
  },
  {
    slug: "graphql-formatter", category: "data",
    name: { zh: "GraphQL 格式化", en: "GraphQL Formatter" },
    description: { zh: "格式化 GraphQL 查询", en: "Format GraphQL queries" },
    icon: "Braces", component: () => import("./data/GraphqlFormatter"),
  },

  // ===== 开发辅助 (devtools) =====
  {
    slug: "cron", category: "devtools",
    name: { zh: "Cron 表达式", en: "Cron Generator" },
    description: { zh: "可视化生成 Cron 表达式", en: "Visually generate cron expressions" },
    icon: "Timer", component: () => import("./devtools/CronGenerator"),
  },
  {
    slug: "timestamp", category: "devtools",
    name: { zh: "时间戳转换", en: "Timestamp Converter" },
    description: { zh: "Unix 时间戳和日期互转", en: "Convert between Unix timestamp and date" },
    icon: "Clock", component: () => import("./devtools/TimestampConverter"),
  },
  {
    slug: "git-cheatsheet", category: "devtools",
    name: { zh: "Git 命令速查", en: "Git Cheat Sheet" },
    description: { zh: "常用 Git 命令参考", en: "Common Git command reference" },
    icon: "GitBranch", component: () => import("./devtools/GitCheatSheet"),
  },
  {
    slug: "keycode", category: "devtools",
    name: { zh: "KeyCode 查看器", en: "KeyCode Viewer" },
    description: { zh: "查看键盘按键代码", en: "View keyboard key codes" },
    icon: "Keyboard", component: () => import("./devtools/KeyCodeViewer"),
  },
  {
    slug: "chmod", category: "devtools",
    name: { zh: "Chmod 计算器", en: "Chmod Calculator" },
    description: { zh: "Linux 文件权限计算", en: "Linux file permission calculator" },
    icon: "FileKey", component: () => import("./devtools/ChmodCalculator"),
  },
  {
    slug: "gitignore", category: "devtools",
    name: { zh: ".gitignore 生成器", en: ".gitignore Generator" },
    description: { zh: "生成 .gitignore 文件", en: "Generate .gitignore files" },
    icon: "FileX", component: () => import("./devtools/GitignoreGenerator"),
  },
  {
    slug: "html-preview", category: "devtools",
    name: { zh: "HTML 预览", en: "HTML Preview" },
    description: { zh: "实时预览 HTML 代码", en: "Live preview HTML code" },
    icon: "Globe", component: () => import("./devtools/HtmlPreview"),
  },
  {
    slug: "code-to-image", category: "devtools",
    name: { zh: "代码截图", en: "Code to Image" },
    description: { zh: "将代码转为精美图片", en: "Convert code to beautiful images" },
    icon: "Camera", component: () => import("./devtools/CodeToImage"),
  },
  {
    slug: "code-diff", category: "devtools",
    name: { zh: "代码差异对比", en: "Code Diff" },
    description: { zh: "详细的代码差异对比", en: "Detailed code diff comparison" },
    icon: "GitCompare", component: () => import("./devtools/CodeDiff"),
  },
  {
    slug: "markdown-table", category: "devtools",
    name: { zh: "Markdown 表格", en: "Markdown Table" },
    description: { zh: "可视化生成 Markdown 表格", en: "Visually generate Markdown tables" },
    icon: "Table", component: () => import("./devtools/MarkdownTable"),
  },
];

export function getToolsByCategory(category: string): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function getTool(category: string, slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.category === category && t.slug === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  return tools.filter(
    (t) =>
      t.name.zh.toLowerCase().includes(q) ||
      t.name.en.toLowerCase().includes(q) ||
      t.description.zh.toLowerCase().includes(q) ||
      t.description.en.toLowerCase().includes(q),
  );
}

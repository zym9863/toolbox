import type { CategoryDefinition } from "./types";

export const categories: CategoryDefinition[] = [
  { slug: "text", name: { zh: "文本处理", en: "Text" }, icon: "Type" },
  { slug: "encoding", name: { zh: "编码转换", en: "Encoding" }, icon: "Binary" },
  { slug: "generators", name: { zh: "生成器", en: "Generators" }, icon: "Sparkles" },
  { slug: "image", name: { zh: "图片工具", en: "Image" }, icon: "Image" },
  { slug: "css", name: { zh: "CSS/前端", en: "CSS/Frontend" }, icon: "Palette" },
  { slug: "calculators", name: { zh: "计算工具", en: "Calculators" }, icon: "Calculator" },
  { slug: "network", name: { zh: "网络工具", en: "Network" }, icon: "Globe" },
  { slug: "crypto", name: { zh: "加密安全", en: "Crypto" }, icon: "Shield" },
  { slug: "data", name: { zh: "数据处理", en: "Data" }, icon: "Database" },
  { slug: "devtools", name: { zh: "开发辅助", en: "DevTools" }, icon: "Wrench" },
];

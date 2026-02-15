[简体中文](README-zh.md) · [English](README.md)

# Toolbox - Developer Tools

A comprehensive collection of online developer tools built with Next.js. Features 100+ utilities across 10 categories, all running directly in your browser for maximum privacy and speed.

## Features

- **100+ Developer Tools** - Comprehensive toolkit for daily development tasks
- **Privacy First** - All tools run client-side, no data sent to servers
- **Bilingual Support** - Available in Chinese and English
- **Dark/Light Theme** - Comfortable viewing in any environment
- **Responsive Design** - Works on desktop and mobile devices
- **Fast & Modern** - Built with Next.js 16 and React 19

## Tool Categories

### Text Processing
JSON Formatter, Markdown Preview, Text Diff, Word Counter, Case Converter, Text Dedup, Text Sort, Text Replace, Line Numbers, Whitespace Cleaner

### Encoding
Base64 Codec, URL Codec, HTML Entity, JWT Decoder, Unicode Converter, UTF-8 Codec, Hex Codec, ASCII Table, Punycode Converter, MIME Codec

### Generators
UUID Generator, Password Generator, Lorem Ipsum, QR Code Generator, Barcode Generator, Random Number, Mock Data Generator, Placeholder Image, Gradient Generator, Color Scheme

### Image Tools
Image Compressor, Image Format Converter, Image Resizer, Color Picker, Image to Base64, SVG Preview, ICO Converter, Image Watermark, Image Collage, Image Metadata

### CSS/Frontend
Color Converter, CSS Gradient, Box Shadow, Border Radius, Flexbox Playground, Grid Playground, CSS Animation, Font Preview, CSS Unit Converter, Tailwind Finder

### Calculators
Scientific Calculator, Unit Converter, Date Calculator, Base Converter, Percent Calculator, BMI Calculator, Loan Calculator, Timezone Converter, Color Space Converter, Math Evaluator

### Network
HTTP Status Codes, URL Parser, IP Lookup, DNS Lookup, User-Agent Parser, Request Headers, WebSocket Tester, API Tester, CORS Checker, Ping Tester

### Crypto/Security
MD5 Hash, SHA Hash, HMAC Generator, AES Encrypt/Decrypt, RSA Key Generator, Bcrypt Hash, Digital Signature, X.509 Parser, CSP Generator, Password Strength

### Data Processing
JSON/CSV Converter, JSON/YAML Converter, JSON/XML Converter, JSON/TOML Converter, SQL Formatter, Regex Tester, JSONPath Query, Data Table Viewer, JSON Schema Validator, GraphQL Formatter

### DevTools
Cron Generator, Timestamp Converter, Git Cheat Sheet, KeyCode Viewer, Chmod Calculator, .gitignore Generator, HTML Preview, Code to Image, Code Diff, Markdown Table

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript
- **Icons**: Lucide React
- **Linting**: Biome
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/zym9863/toolbox.git
cd toolbox

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    [category]/           # Dynamic category routes
    [category]/[tool]/    # Dynamic tool routes
    api/                  # API routes
  components/            # Reusable UI components
  i18n/                   # Internationalization
    locales/              # Language files (en, zh)
  tools/                  # Tool implementations
    calculators/          # Calculator tools
    crypto/               # Cryptography tools
    css/                  # CSS/Frontend tools
    data/                 # Data processing tools
    devtools/             # Developer utilities
    encoding/             # Encoding tools
    generators/           # Generator tools
    image/                # Image tools
    network/              # Network tools
    text/                 # Text processing tools
    categories.ts         # Category definitions
    registry.ts           # Tool registry
    types.ts              # TypeScript types
```

## Adding New Tools

1. Create a new tool component in the appropriate category folder under `src/tools/`
2. Register the tool in `src/tools/registry.ts`:

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.
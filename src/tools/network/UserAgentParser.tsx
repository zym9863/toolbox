"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { ToolGrid, ToolPanel } from "@/components/ToolLayout";

interface UaParsed {
  browser: { name: string; version: string };
  os: { name: string; version: string };
  device: string;
  engine: { name: string; version: string };
}

function parseUserAgent(ua: string): UaParsed {
  const result: UaParsed = {
    browser: { name: "Unknown", version: "" },
    os: { name: "Unknown", version: "" },
    device: "Desktop",
    engine: { name: "Unknown", version: "" },
  };

  if (!ua) return result;

  // Browser detection
  if (/Edg\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Microsoft Edge", version: RegExp.$1 };
  } else if (/OPR\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Opera", version: RegExp.$1 };
  } else if (/Vivaldi\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Vivaldi", version: RegExp.$1 };
  } else if (/YaBrowser\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Yandex Browser", version: RegExp.$1 };
  } else if (/SamsungBrowser\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Samsung Internet", version: RegExp.$1 };
  } else if (/UCBrowser\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "UC Browser", version: RegExp.$1 };
  } else if (/Firefox\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Firefox", version: RegExp.$1 };
  } else if (/Chrome\/(\d[\d.]*)/i.test(ua) && !/Chromium/i.test(ua)) {
    result.browser = { name: "Chrome", version: RegExp.$1 };
  } else if (/Chromium\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Chromium", version: RegExp.$1 };
  } else if (/Safari\/(\d[\d.]*)/i.test(ua) && /Version\/(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Safari", version: RegExp.$1 };
  } else if (/MSIE\s(\d[\d.]*)/i.test(ua) || /Trident.*rv:(\d[\d.]*)/i.test(ua)) {
    result.browser = { name: "Internet Explorer", version: RegExp.$1 };
  }

  // OS detection
  if (/Windows NT (\d[\d.]*)/i.test(ua)) {
    const ver = RegExp.$1;
    const winVersions: Record<string, string> = {
      "10.0": "10/11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
      "6.0": "Vista",
      "5.1": "XP",
    };
    result.os = { name: "Windows", version: winVersions[ver] || ver };
  } else if (/Mac OS X (\d[_\d.]*)/i.test(ua)) {
    result.os = { name: "macOS", version: RegExp.$1.replace(/_/g, ".") };
  } else if (/Android (\d[\d.]*)/i.test(ua)) {
    result.os = { name: "Android", version: RegExp.$1 };
  } else if (/iPhone OS (\d[_\d.]*)/i.test(ua)) {
    result.os = { name: "iOS", version: RegExp.$1.replace(/_/g, ".") };
  } else if (/iPad.*OS (\d[_\d.]*)/i.test(ua)) {
    result.os = { name: "iPadOS", version: RegExp.$1.replace(/_/g, ".") };
  } else if (/Linux/i.test(ua)) {
    result.os = { name: "Linux", version: "" };
  } else if (/CrOS/i.test(ua)) {
    result.os = { name: "Chrome OS", version: "" };
  }

  // Device type detection
  if (/Mobile|Android.*Mobile|iPhone/i.test(ua)) {
    result.device = "Mobile";
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    result.device = "Tablet";
  } else {
    result.device = "Desktop";
  }

  // Engine detection
  if (/AppleWebKit\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: "WebKit", version: RegExp.$1 };
    if (/Chrome/i.test(ua)) {
      result.engine.name = "Blink";
    }
  } else if (/Gecko\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: "Gecko", version: RegExp.$1 };
  } else if (/Trident\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: "Trident", version: RegExp.$1 };
  } else if (/Presto\/(\d[\d.]*)/i.test(ua)) {
    result.engine = { name: "Presto", version: RegExp.$1 };
  }

  return result;
}

export default function UserAgentParser() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const currentUa = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaString = useCustom ? input : currentUa;
  const parsed = useMemo(() => parseUserAgent(uaString), [uaString]);

  const deviceIcon = parsed.device === "Mobile" ? "📱" : parsed.device === "Tablet" ? "📟" : "🖥️";

  const cards = [
    {
      title: locale === "zh" ? "浏览器" : "Browser",
      value: parsed.browser.name,
      sub: parsed.browser.version ? `v${parsed.browser.version}` : "",
    },
    {
      title: locale === "zh" ? "操作系统" : "Operating System",
      value: parsed.os.name,
      sub: parsed.os.version,
    },
    {
      title: locale === "zh" ? "设备类型" : "Device Type",
      value: parsed.device,
      sub: deviceIcon,
    },
    {
      title: locale === "zh" ? "渲染引擎" : "Engine",
      value: parsed.engine.name,
      sub: parsed.engine.version ? `v${parsed.engine.version}` : "",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={locale === "zh" ? "User-Agent 字符串" : "User-Agent String"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={!useCustom ? btnClass : `${inputClass} hover:bg-border transition-colors`}
              onClick={() => setUseCustom(false)}
            >
              {locale === "zh" ? "当前浏览器" : "Current Browser"}
            </button>
            <button
              type="button"
              className={useCustom ? btnClass : `${inputClass} hover:bg-border transition-colors`}
              onClick={() => setUseCustom(true)}
            >
              {locale === "zh" ? "自定义输入" : "Custom Input"}
            </button>
          </div>

          {useCustom ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={locale === "zh" ? "粘贴 User-Agent 字符串..." : "Paste User-Agent string..."}
              rows={3}
              className="w-full rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
          ) : (
            <div className="flex items-start gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted p-3 font-mono text-xs text-foreground break-all">
                {currentUa}
              </div>
              <CopyButton text={currentUa} />
            </div>
          )}
        </div>
      </ToolPanel>

      {uaString && (
        <ToolPanel title={locale === "zh" ? "解析结果" : "Parsed Result"}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-border bg-muted/50 p-4 flex flex-col gap-1"
              >
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </span>
                <span className="text-lg font-semibold text-foreground">{card.value}</span>
                {card.sub && <span className="text-sm text-muted-foreground">{card.sub}</span>}
              </div>
            ))}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}

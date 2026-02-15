"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

// Minimal ASN.1 DER parser for X.509 certificates
function parseDerLength(bytes: Uint8Array, offset: number): { length: number; nextOffset: number } {
  const first = bytes[offset];
  if (first < 0x80) {
    return { length: first, nextOffset: offset + 1 };
  }
  const numBytes = first & 0x7f;
  let length = 0;
  for (let i = 0; i < numBytes; i++) {
    length = (length << 8) | bytes[offset + 1 + i];
  }
  return { length, nextOffset: offset + 1 + numBytes };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");
}

// OID mappings for common X.509 fields
const OID_MAP: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "1.2.840.113549.1.1.1": "RSA",
  "1.2.840.113549.1.1.11": "SHA256withRSA",
  "1.2.840.113549.1.1.12": "SHA384withRSA",
  "1.2.840.113549.1.1.13": "SHA512withRSA",
  "1.2.840.113549.1.1.5": "SHA1withRSA",
  "1.2.840.10045.2.1": "EC",
  "1.2.840.10045.4.3.2": "ECDSAwithSHA256",
};

function parseOid(bytes: Uint8Array, offset: number, length: number): string {
  const oidBytes = bytes.slice(offset, offset + length);
  const components: number[] = [];
  components.push(Math.floor(oidBytes[0] / 40));
  components.push(oidBytes[0] % 40);

  let value = 0;
  for (let i = 1; i < oidBytes.length; i++) {
    value = (value << 7) | (oidBytes[i] & 0x7f);
    if ((oidBytes[i] & 0x80) === 0) {
      components.push(value);
      value = 0;
    }
  }
  return components.join(".");
}

interface CertInfo {
  serialNumber: string;
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  version: string;
}

function extractReadableStrings(bytes: Uint8Array): string[] {
  const strings: string[] = [];
  let i = 0;
  while (i < bytes.length) {
    // Look for UTF8String (0x0C), PrintableString (0x13), IA5String (0x16)
    if (bytes[i] === 0x0c || bytes[i] === 0x13 || bytes[i] === 0x16) {
      const { length, nextOffset } = parseDerLength(bytes, i + 1);
      if (length > 0 && nextOffset + length <= bytes.length) {
        const str = new TextDecoder("utf-8", { fatal: false }).decode(
          bytes.slice(nextOffset, nextOffset + length),
        );
        if (str.length > 0 && /^[\x20-\x7e\u4e00-\u9fff]+$/.test(str)) {
          strings.push(str);
        }
      }
    }
    i++;
  }
  return strings;
}

function parseDistinguishedName(bytes: Uint8Array, offset: number, endOffset: number): string {
  const parts: string[] = [];
  let i = offset;

  while (i < endOffset) {
    if (bytes[i] !== 0x31) { i++; continue; } // SET
    const setLen = parseDerLength(bytes, i + 1);
    const setEnd = setLen.nextOffset + setLen.length;
    let j = setLen.nextOffset;

    if (j < setEnd && bytes[j] === 0x30) { // SEQUENCE
      const seqLen = parseDerLength(bytes, j + 1);
      let k = seqLen.nextOffset;

      if (k < setEnd && bytes[k] === 0x06) { // OID
        const oidLen = parseDerLength(bytes, k + 1);
        const oid = parseOid(bytes, oidLen.nextOffset, oidLen.length);
        const label = OID_MAP[oid] || oid;
        k = oidLen.nextOffset + oidLen.length;

        if (k < setEnd && (bytes[k] === 0x0c || bytes[k] === 0x13 || bytes[k] === 0x16)) {
          const valLen = parseDerLength(bytes, k + 1);
          const val = new TextDecoder("utf-8", { fatal: false }).decode(
            bytes.slice(valLen.nextOffset, valLen.nextOffset + valLen.length),
          );
          parts.push(`${label}=${val}`);
        }
      }
    }
    i = setEnd;
  }
  return parts.join(", ");
}

function parseUtcTime(bytes: Uint8Array, offset: number, length: number): string {
  const str = new TextDecoder().decode(bytes.slice(offset, offset + length));
  // Format: YYMMDDHHMMSSZ
  if (str.length >= 13) {
    let year = parseInt(str.substring(0, 2), 10);
    year = year >= 50 ? 1900 + year : 2000 + year;
    return `${year}-${str.substring(2, 4)}-${str.substring(4, 6)} ${str.substring(6, 8)}:${str.substring(8, 10)}:${str.substring(10, 12)} UTC`;
  }
  return str;
}

function parseGeneralizedTime(bytes: Uint8Array, offset: number, length: number): string {
  const str = new TextDecoder().decode(bytes.slice(offset, offset + length));
  // Format: YYYYMMDDHHMMSSZ
  if (str.length >= 15) {
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)} ${str.substring(8, 10)}:${str.substring(10, 12)}:${str.substring(12, 14)} UTC`;
  }
  return str;
}

function parseCertificate(pemText: string): CertInfo {
  // Strip PEM headers and decode base64
  const base64 = pemText
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  const info: CertInfo = {
    serialNumber: "",
    issuer: "",
    subject: "",
    notBefore: "",
    notAfter: "",
    signatureAlgorithm: "",
    publicKeyAlgorithm: "",
    version: "v1",
  };

  try {
    // Root: SEQUENCE
    if (bytes[0] !== 0x30) throw new Error("Not a valid DER sequence");
    const rootLen = parseDerLength(bytes, 1);
    let pos = rootLen.nextOffset;

    // TBSCertificate: SEQUENCE
    if (bytes[pos] !== 0x30) throw new Error("Expected TBSCertificate SEQUENCE");
    const tbsLen = parseDerLength(bytes, pos + 1);
    const tbsStart = tbsLen.nextOffset;
    const tbsEnd = tbsStart + tbsLen.length;
    pos = tbsStart;

    // Version: [0] EXPLICIT (optional)
    if (bytes[pos] === 0xa0) {
      const vLen = parseDerLength(bytes, pos + 1);
      const vStart = vLen.nextOffset;
      if (bytes[vStart] === 0x02) {
        const intLen = parseDerLength(bytes, vStart + 1);
        const versionNum = bytes[intLen.nextOffset];
        info.version = `v${versionNum + 1}`;
      }
      pos = vLen.nextOffset + vLen.length;
    }

    // Serial Number: INTEGER
    if (bytes[pos] === 0x02) {
      const snLen = parseDerLength(bytes, pos + 1);
      info.serialNumber = bytesToHex(bytes.slice(snLen.nextOffset, snLen.nextOffset + snLen.length));
      pos = snLen.nextOffset + snLen.length;
    }

    // Signature Algorithm: SEQUENCE
    if (bytes[pos] === 0x30) {
      const sigAlgLen = parseDerLength(bytes, pos + 1);
      const sigAlgStart = sigAlgLen.nextOffset;
      if (bytes[sigAlgStart] === 0x06) {
        const oidLen = parseDerLength(bytes, sigAlgStart + 1);
        const oid = parseOid(bytes, oidLen.nextOffset, oidLen.length);
        info.signatureAlgorithm = OID_MAP[oid] || oid;
      }
      pos = sigAlgLen.nextOffset + sigAlgLen.length;
    }

    // Issuer: SEQUENCE
    if (bytes[pos] === 0x30) {
      const issuerLen = parseDerLength(bytes, pos + 1);
      info.issuer = parseDistinguishedName(bytes, issuerLen.nextOffset, issuerLen.nextOffset + issuerLen.length);
      pos = issuerLen.nextOffset + issuerLen.length;
    }

    // Validity: SEQUENCE
    if (bytes[pos] === 0x30) {
      const valLen = parseDerLength(bytes, pos + 1);
      let vPos = valLen.nextOffset;

      // notBefore
      if (bytes[vPos] === 0x17) { // UTCTime
        const tLen = parseDerLength(bytes, vPos + 1);
        info.notBefore = parseUtcTime(bytes, tLen.nextOffset, tLen.length);
        vPos = tLen.nextOffset + tLen.length;
      } else if (bytes[vPos] === 0x18) { // GeneralizedTime
        const tLen = parseDerLength(bytes, vPos + 1);
        info.notBefore = parseGeneralizedTime(bytes, tLen.nextOffset, tLen.length);
        vPos = tLen.nextOffset + tLen.length;
      }

      // notAfter
      if (bytes[vPos] === 0x17) {
        const tLen = parseDerLength(bytes, vPos + 1);
        info.notAfter = parseUtcTime(bytes, tLen.nextOffset, tLen.length);
      } else if (bytes[vPos] === 0x18) {
        const tLen = parseDerLength(bytes, vPos + 1);
        info.notAfter = parseGeneralizedTime(bytes, tLen.nextOffset, tLen.length);
      }

      pos = valLen.nextOffset + valLen.length;
    }

    // Subject: SEQUENCE
    if (bytes[pos] === 0x30) {
      const subLen = parseDerLength(bytes, pos + 1);
      info.subject = parseDistinguishedName(bytes, subLen.nextOffset, subLen.nextOffset + subLen.length);
      pos = subLen.nextOffset + subLen.length;
    }

    // SubjectPublicKeyInfo: SEQUENCE
    if (bytes[pos] === 0x30) {
      const spkiLen = parseDerLength(bytes, pos + 1);
      const spkiStart = spkiLen.nextOffset;
      if (bytes[spkiStart] === 0x30) {
        const algLen = parseDerLength(bytes, spkiStart + 1);
        const algStart = algLen.nextOffset;
        if (bytes[algStart] === 0x06) {
          const oidLen = parseDerLength(bytes, algStart + 1);
          const oid = parseOid(bytes, oidLen.nextOffset, oidLen.length);
          info.publicKeyAlgorithm = OID_MAP[oid] || oid;
        }
      }
    }

    // Fallback: use extractReadableStrings if fields are empty
    if (!info.subject && !info.issuer) {
      const strings = extractReadableStrings(bytes);
      if (strings.length > 0) {
        info.subject = strings.slice(0, Math.ceil(strings.length / 2)).join(", ");
        info.issuer = strings.slice(Math.ceil(strings.length / 2)).join(", ");
      }
    }
  } catch {
    // If structured parsing fails, try extracting readable strings
    const strings = extractReadableStrings(bytes);
    if (strings.length > 0) {
      info.subject = strings.join(", ");
    }
  }

  return info;
}

export default function X509Parser() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState("");

  const parse = () => {
    if (!input.trim()) return;
    setError("");
    try {
      const info = parseCertificate(input);
      setCertInfo(info);
    } catch (e) {
      setError(
        locale === "zh"
          ? "证书解析失败: " + (e instanceof Error ? e.message : String(e))
          : "Certificate parse failed: " + (e instanceof Error ? e.message : String(e)),
      );
      setCertInfo(null);
    }
  };

  const clear = () => {
    setInput("");
    setCertInfo(null);
    setError("");
  };

  const infoString = certInfo
    ? Object.entries(certInfo)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  return (
    <ToolLayout
      title={locale === "zh" ? "X.509 证书解析" : "X.509 Certificate Parser"}
      description={
        locale === "zh"
          ? "解析 PEM 格式的 X.509 证书，提取基本信息"
          : "Parse PEM-encoded X.509 certificates and extract basic information"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "证书 (PEM)" : "Certificate (PEM)"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={parse}>
                {locale === "zh" ? "解析" : "Parse"}
              </button>
              <button
                type="button"
                className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                onClick={clear}
              >
                {locale === "zh" ? "清空" : "Clear"}
              </button>
            </div>
          }
        >
          <TextArea
            value={input}
            onChange={setInput}
            placeholder={
              locale === "zh"
                ? "粘贴 PEM 格式的证书...\n-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
                : "Paste PEM certificate...\n-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
            }
            rows={10}
          />
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "证书信息" : "Certificate Info"}
          actions={infoString ? <CopyButton text={infoString} /> : undefined}
        >
          {certInfo ? (
            <div className="flex flex-col gap-2">
              {[
                { label: locale === "zh" ? "版本" : "Version", value: certInfo.version },
                { label: locale === "zh" ? "序列号" : "Serial Number", value: certInfo.serialNumber },
                { label: locale === "zh" ? "签名算法" : "Signature Algorithm", value: certInfo.signatureAlgorithm },
                { label: locale === "zh" ? "颁发者" : "Issuer", value: certInfo.issuer },
                { label: locale === "zh" ? "主体" : "Subject", value: certInfo.subject },
                { label: locale === "zh" ? "有效期起" : "Not Before", value: certInfo.notBefore },
                { label: locale === "zh" ? "有效期至" : "Not After", value: certInfo.notAfter },
                { label: locale === "zh" ? "公钥算法" : "Public Key Algorithm", value: certInfo.publicKeyAlgorithm },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs break-all">
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {locale === "zh"
                ? "解析结果将显示在这里..."
                : "Parsed info will appear here..."}
            </p>
          )}
        </ToolPanel>
      </ToolGrid>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
    </ToolLayout>
  );
}

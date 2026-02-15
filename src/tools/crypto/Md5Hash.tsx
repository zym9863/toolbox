"use client";

import { useState, useCallback } from "react";
import { md5 } from "js-md5";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { FileUpload } from "@/components/FileUpload";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

const btnClass =
  "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

export default function Md5Hash() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [fileName, setFileName] = useState("");

  const computeHash = useCallback(
    (text: string) => {
      const result = md5(text);
      setHash(uppercase ? result.toUpperCase() : result);
    },
    [uppercase],
  );

  const handleText = () => {
    if (!input.trim()) return;
    computeHash(input);
    setFileName("");
  };

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const result = md5(buffer);
        setHash(uppercase ? result.toUpperCase() : result);
      };
      reader.readAsArrayBuffer(file);
    },
    [uppercase],
  );

  const toggleCase = () => {
    setUppercase((prev) => {
      const next = !prev;
      if (hash) {
        setHash(next ? hash.toUpperCase() : hash.toLowerCase());
      }
      return next;
    });
  };

  const clear = () => {
    setInput("");
    setHash("");
    setFileName("");
  };

  return (
    <ToolLayout
      title={locale === "zh" ? "MD5 哈希" : "MD5 Hash"}
      description={
        locale === "zh"
          ? "计算文本或文件的 MD5 哈希值"
          : "Calculate MD5 hash of text or files"
      }
    >
      <ToolGrid>
        <ToolPanel
          title={locale === "zh" ? "输入" : "Input"}
          actions={
            <div className="flex items-center gap-2">
              <button type="button" className={btnClass} onClick={handleText}>
                {locale === "zh" ? "计算哈希" : "Hash"}
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
                ? "输入要计算 MD5 的文本..."
                : "Enter text to hash..."
            }
            rows={8}
          />
          <div className="mt-3">
            <FileUpload
              onFile={handleFile}
              label={locale === "zh" ? "或上传文件" : "Or upload a file"}
            />
            {fileName && (
              <span className="ml-2 text-sm text-muted-foreground">
                {fileName}
              </span>
            )}
          </div>
        </ToolPanel>

        <ToolPanel
          title={locale === "zh" ? "MD5 哈希值" : "MD5 Hash"}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border transition-colors"
                onClick={toggleCase}
              >
                {uppercase ? "lowercase" : "UPPERCASE"}
              </button>
              {hash && <CopyButton text={hash} />}
            </div>
          }
        >
          <TextArea
            value={hash}
            readOnly
            placeholder={
              locale === "zh" ? "哈希值将显示在这里..." : "Hash will appear here..."
            }
            rows={3}
          />
        </ToolPanel>
      </ToolGrid>
    </ToolLayout>
  );
}

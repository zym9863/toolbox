"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/i18n";
import { FileUpload } from "@/components/FileUpload";
import { CopyButton } from "@/components/CopyButton";
import { TextArea } from "@/components/TextArea";
import { ToolLayout, ToolGrid, ToolPanel } from "@/components/ToolLayout";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageToBase64() {
  const { locale } = useI18n();
  const [base64, setBase64] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      // Remove the data URL prefix to get raw base64
      const rawBase64 = result.split(",")[1] || "";
      setBase64(rawBase64);
    };
    reader.readAsDataURL(file);
  }, []);

  const zh = locale === "zh";

  const base64Length = base64.length;
  // Approximate original byte size from base64 length
  const estimatedBytes = Math.ceil((base64Length * 3) / 4);

  return (
    <ToolLayout
      title={zh ? "图片转 Base64" : "Image to Base64"}
      description={
        zh
          ? "将图片转换为 Base64 字符串，支持复制 Data URL"
          : "Convert images to Base64 strings, copy as Data URL"
      }
    >
      <ToolPanel title={zh ? "上传图片" : "Upload Image"}>
        <FileUpload accept="image/*" onFile={handleFile} />
        {fileName && (
          <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>
        )}
      </ToolPanel>

      {base64 && (
        <>
          <ToolPanel title={zh ? "信息" : "Info"}>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border border-border p-3">
                <div className="text-muted-foreground">
                  {zh ? "字符串长度" : "String Length"}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {base64Length.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-muted-foreground">
                  {zh ? "估算大小" : "Estimated Size"}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {formatSize(estimatedBytes)}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-muted-foreground">
                  {zh ? "Data URL 长度" : "Data URL Length"}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {dataUrl.length.toLocaleString()}
                </div>
              </div>
            </div>
          </ToolPanel>

          <ToolGrid>
            <ToolPanel
              title={zh ? "Base64 字符串" : "Base64 String"}
              actions={<CopyButton text={base64} />}
            >
              <TextArea value={base64} readOnly rows={8} />
            </ToolPanel>

            <ToolPanel
              title="Data URL"
              actions={<CopyButton text={dataUrl} />}
            >
              <TextArea value={dataUrl} readOnly rows={8} />
            </ToolPanel>
          </ToolGrid>

          <ToolPanel title={zh ? "预览" : "Preview"}>
            <img
              src={dataUrl}
              alt="Preview"
              className="max-h-64 max-w-full rounded-lg object-contain"
            />
          </ToolPanel>
        </>
      )}
    </ToolLayout>
  );
}

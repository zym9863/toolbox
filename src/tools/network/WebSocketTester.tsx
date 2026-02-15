"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { ToolPanel } from "@/components/ToolLayout";

interface WsMessage {
  id: number;
  type: "sent" | "received" | "system";
  content: string;
  timestamp: Date;
}

export default function WebSocketTester() {
  const { locale } = useI18n();
  const [url, setUrl] = useState("wss://echo.websocket.org");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const addMessage = useCallback((type: WsMessage["type"], content: string) => {
    idRef.current += 1;
    setMessages((prev) => [
      ...prev,
      { id: idRef.current, type, content, timestamp: new Date() },
    ]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const handleConnect = useCallback(() => {
    if (!url.trim()) return;
    setConnecting(true);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        addMessage("system", locale === "zh" ? `已连接到 ${url}` : `Connected to ${url}`);
      };

      ws.onmessage = (event) => {
        const data = typeof event.data === "string" ? event.data : "[Binary Data]";
        addMessage("received", data);
      };

      ws.onclose = (event) => {
        setConnected(false);
        setConnecting(false);
        addMessage(
          "system",
          locale === "zh"
            ? `连接已关闭 (code: ${event.code}, reason: ${event.reason || "N/A"})`
            : `Connection closed (code: ${event.code}, reason: ${event.reason || "N/A"})`
        );
        wsRef.current = null;
      };

      ws.onerror = () => {
        setConnecting(false);
        addMessage("system", locale === "zh" ? "连接错误" : "Connection error");
      };
    } catch (e) {
      setConnecting(false);
      addMessage("system", `Error: ${(e as Error).message}`);
    }
  }, [url, addMessage, locale]);

  const handleDisconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !message.trim()) return;
    wsRef.current.send(message);
    addMessage("sent", message);
    setMessage("");
  }, [message, addMessage]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={locale === "zh" ? "WebSocket 连接" : "WebSocket Connection"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  connected
                    ? "bg-green-500"
                    : connecting
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {connected
                  ? locale === "zh"
                    ? "已连接"
                    : "Connected"
                  : connecting
                    ? locale === "zh"
                      ? "连接中..."
                      : "Connecting..."
                    : locale === "zh"
                      ? "未连接"
                      : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="wss://echo.websocket.org"
              className={`${inputClass} flex-1`}
              disabled={connected}
            />
            {connected ? (
              <button
                type="button"
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:opacity-90 transition-opacity"
                onClick={handleDisconnect}
              >
                {locale === "zh" ? "断开" : "Disconnect"}
              </button>
            ) : (
              <button
                type="button"
                className={btnClass}
                onClick={handleConnect}
                disabled={connecting || !url.trim()}
              >
                {connecting
                  ? locale === "zh"
                    ? "连接中..."
                    : "Connecting..."
                  : locale === "zh"
                    ? "连接"
                    : "Connect"}
              </button>
            )}
          </div>
        </div>
      </ToolPanel>

      <ToolPanel title={locale === "zh" ? "发送消息" : "Send Message"}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={locale === "zh" ? "输入消息内容..." : "Enter message..."}
            className={`${inputClass} flex-1`}
            disabled={!connected}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            type="button"
            className={btnClass}
            onClick={handleSend}
            disabled={!connected || !message.trim()}
          >
            {locale === "zh" ? "发送" : "Send"}
          </button>
        </div>
      </ToolPanel>

      <ToolPanel
        title={locale === "zh" ? "消息日志" : "Message Log"}
        actions={
          messages.length > 0 ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMessages([])}
            >
              {locale === "zh" ? "清空" : "Clear"}
            </button>
          ) : undefined
        }
      >
        <div className="h-80 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {locale === "zh" ? "暂无消息" : "No messages yet"}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 rounded px-2 py-1 text-xs ${
                    msg.type === "sent"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      : msg.type === "received"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="shrink-0 text-muted-foreground">[{formatTime(msg.timestamp)}]</span>
                  <span className="shrink-0 font-semibold w-8">
                    {msg.type === "sent" ? ">>>" : msg.type === "received" ? "<<<" : "---"}
                  </span>
                  <span className="break-all">{msg.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ToolPanel>
    </div>
  );
}

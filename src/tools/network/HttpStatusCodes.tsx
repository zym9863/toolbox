"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { ToolPanel } from "@/components/ToolLayout";

interface StatusCode {
  code: number;
  name: string;
  description: string;
}

const STATUS_CODES: StatusCode[] = [
  // 1xx Informational
  { code: 100, name: "Continue", description: "The server has received the request headers, the client should proceed to send the request body." },
  { code: 101, name: "Switching Protocols", description: "The server is switching protocols as requested by the client." },
  { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet." },
  { code: 103, name: "Early Hints", description: "Used to return some response headers before the final HTTP message." },
  // 2xx Success
  { code: 200, name: "OK", description: "The request has succeeded." },
  { code: 201, name: "Created", description: "The request has been fulfilled and a new resource has been created." },
  { code: 202, name: "Accepted", description: "The request has been accepted for processing, but the processing has not been completed." },
  { code: 203, name: "Non-Authoritative Information", description: "The returned meta-information is not the definitive set from the origin server." },
  { code: 204, name: "No Content", description: "The server has fulfilled the request but does not need to return an entity-body." },
  { code: 205, name: "Reset Content", description: "The server has fulfilled the request and the user agent should reset the document view." },
  { code: 206, name: "Partial Content", description: "The server has fulfilled the partial GET request for the resource." },
  { code: 207, name: "Multi-Status", description: "Provides status for multiple independent operations (WebDAV)." },
  { code: 208, name: "Already Reported", description: "Used inside a DAV: propstat response to avoid enumerating members repeatedly." },
  { code: 226, name: "IM Used", description: "The server has fulfilled a GET request and the response is a representation of one or more instance-manipulations." },
  // 3xx Redirection
  { code: 300, name: "Multiple Choices", description: "The request has more than one possible response." },
  { code: 301, name: "Moved Permanently", description: "The resource has been permanently moved to a new URI." },
  { code: 302, name: "Found", description: "The resource resides temporarily under a different URI." },
  { code: 303, name: "See Other", description: "The response can be found under a different URI using GET." },
  { code: 304, name: "Not Modified", description: "The resource has not been modified since the last request." },
  { code: 305, name: "Use Proxy", description: "The requested resource must be accessed through the specified proxy." },
  { code: 307, name: "Temporary Redirect", description: "The resource resides temporarily under a different URI, method should not change." },
  { code: 308, name: "Permanent Redirect", description: "The resource has been permanently moved, method should not change." },
  // 4xx Client Error
  { code: 400, name: "Bad Request", description: "The server cannot process the request due to a client error." },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or has not yet been provided." },
  { code: 402, name: "Payment Required", description: "Reserved for future use. Sometimes used for digital payment systems." },
  { code: 403, name: "Forbidden", description: "The server understood the request but refuses to authorize it." },
  { code: 404, name: "Not Found", description: "The requested resource could not be found on the server." },
  { code: 405, name: "Method Not Allowed", description: "The request method is not supported for the requested resource." },
  { code: 406, name: "Not Acceptable", description: "The requested resource cannot generate content acceptable according to the Accept headers." },
  { code: 407, name: "Proxy Authentication Required", description: "The client must first authenticate itself with the proxy." },
  { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request." },
  { code: 409, name: "Conflict", description: "The request could not be completed due to a conflict with the current state of the resource." },
  { code: 410, name: "Gone", description: "The resource is no longer available and no forwarding address is known." },
  { code: 411, name: "Length Required", description: "The request did not specify the length of its content, which is required." },
  { code: 412, name: "Precondition Failed", description: "A precondition in the request headers evaluated to false." },
  { code: 413, name: "Content Too Large", description: "The request entity is larger than the server is willing or able to process." },
  { code: 414, name: "URI Too Long", description: "The URI provided was too long for the server to process." },
  { code: 415, name: "Unsupported Media Type", description: "The request entity has a media type which the server does not support." },
  { code: 416, name: "Range Not Satisfiable", description: "The range specified in the Range header cannot be fulfilled." },
  { code: 417, name: "Expectation Failed", description: "The expectation given in the Expect header could not be met." },
  { code: 418, name: "I'm a Teapot", description: "The server refuses to brew coffee because it is, permanently, a teapot (RFC 2324)." },
  { code: 421, name: "Misdirected Request", description: "The request was directed at a server that is not able to produce a response." },
  { code: 422, name: "Unprocessable Content", description: "The request was well-formed but the server was unable to process the contained instructions." },
  { code: 423, name: "Locked", description: "The resource that is being accessed is locked (WebDAV)." },
  { code: 424, name: "Failed Dependency", description: "The request failed because it depended on another request that failed (WebDAV)." },
  { code: 425, name: "Too Early", description: "The server is unwilling to risk processing a request that might be replayed." },
  { code: 426, name: "Upgrade Required", description: "The client should switch to a different protocol." },
  { code: 428, name: "Precondition Required", description: "The origin server requires the request to be conditional." },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time." },
  { code: 431, name: "Request Header Fields Too Large", description: "The server is unwilling to process the request because its header fields are too large." },
  { code: 451, name: "Unavailable For Legal Reasons", description: "The resource is unavailable due to legal demands." },
  // 5xx Server Error
  { code: 500, name: "Internal Server Error", description: "The server encountered an unexpected condition that prevented it from fulfilling the request." },
  { code: 501, name: "Not Implemented", description: "The server does not support the functionality required to fulfill the request." },
  { code: 502, name: "Bad Gateway", description: "The server received an invalid response from an upstream server." },
  { code: 503, name: "Service Unavailable", description: "The server is currently unable to handle the request due to overloading or maintenance." },
  { code: 504, name: "Gateway Timeout", description: "The server did not receive a timely response from the upstream server." },
  { code: 505, name: "HTTP Version Not Supported", description: "The server does not support the HTTP protocol version used in the request." },
  { code: 506, name: "Variant Also Negotiates", description: "Transparent content negotiation results in a circular reference." },
  { code: 507, name: "Insufficient Storage", description: "The server is unable to store the representation needed to complete the request (WebDAV)." },
  { code: 508, name: "Loop Detected", description: "The server detected an infinite loop while processing the request (WebDAV)." },
  { code: 510, name: "Not Extended", description: "Further extensions to the request are required for the server to fulfill it." },
  { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access." },
];

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  "1": { label: "1xx Informational", color: "text-blue-600 dark:text-blue-400" },
  "2": { label: "2xx Success", color: "text-green-600 dark:text-green-400" },
  "3": { label: "3xx Redirection", color: "text-yellow-600 dark:text-yellow-400" },
  "4": { label: "4xx Client Error", color: "text-orange-600 dark:text-orange-400" },
  "5": { label: "5xx Server Error", color: "text-red-600 dark:text-red-400" },
};

export default function HttpStatusCodes() {
  const { locale } = useI18n();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";
  const btnClass = "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const filtered = useMemo(() => {
    return STATUS_CODES.filter((sc) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        sc.code.toString().includes(q) ||
        sc.name.toLowerCase().includes(q) ||
        sc.description.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "all" || sc.code.toString()[0] === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, StatusCode[]> = {};
    for (const sc of filtered) {
      const cat = sc.code.toString()[0];
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sc);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title={locale === "zh" ? "搜索与筛选" : "Search & Filter"}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "zh" ? "搜索状态码、名称或描述..." : "Search code, name, or description..."}
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`${categoryFilter === "all" ? btnClass : `${inputClass} hover:bg-border transition-colors`}`}
              onClick={() => setCategoryFilter("all")}
            >
              {locale === "zh" ? "全部" : "All"}
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                className={`${categoryFilter === key ? btnClass : `${inputClass} hover:bg-border transition-colors`}`}
                onClick={() => setCategoryFilter(key)}
              >
                {label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </ToolPanel>

      <ToolPanel title={locale === "zh" ? `共 ${filtered.length} 个状态码` : `${filtered.length} status codes`}>
        <div className="flex flex-col gap-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([cat, codes]) => {
              const catInfo = CATEGORY_MAP[cat];
              return (
                <div key={cat}>
                  <h3 className={`mb-2 text-sm font-semibold ${catInfo?.color ?? ""}`}>
                    {catInfo?.label ?? `${cat}xx`}
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-2 pr-4 font-medium text-muted-foreground w-20">
                          {locale === "zh" ? "状态码" : "Code"}
                        </th>
                        <th className="pb-2 pr-4 font-medium text-muted-foreground w-56">
                          {locale === "zh" ? "名称" : "Name"}
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground">
                          {locale === "zh" ? "描述" : "Description"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((sc) => (
                        <tr key={sc.code} className="border-b border-border">
                          <td className="py-2 pr-4 font-mono font-semibold">{sc.code}</td>
                          <td className="py-2 pr-4 font-medium">{sc.name}</td>
                          <td className="py-2 text-muted-foreground">{sc.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {locale === "zh" ? "没有匹配的状态码" : "No matching status codes"}
            </p>
          )}
        </div>
      </ToolPanel>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { type AxiosResponseHeaders, type RawAxiosResponseHeaders } from 'axios';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Send, Loader2, X, Plus, Trash2, History, Clock } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useApiHistoryStore, type HttpMethod, type BodyMode } from '@/stores/apiHistoryStore';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const BODY_MODES: { value: BodyMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'form', label: 'Form' },
];

interface ApiResponse {
  status: number;
  statusText: string;
  duration: number;
  headers: Record<string, string>;
  body: string;
  isJson: boolean;
}

function formatHeaders(
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders
): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof headers.toJSON === 'function') {
    return headers.toJSON() as Record<string, string>;
  }
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result[key] = String(value);
    }
  }
  return result;
}

function tryFormatJson(text: string): { formatted: string; isJson: boolean } {
  try {
    const parsed = JSON.parse(text);
    return { formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { formatted: text, isJson: false };
  }
}

export default function ApiTester() {
  const { resolvedTheme } = useThemeStore();
  const {
    history,
    currentRequest,
    setMethod,
    setUrl,
    addHeader,
    removeHeader,
    updateHeader,
    setBodyMode,
    setBody,
    addToHistory,
    loadFromHistory,
  } = useApiHistoryStore();

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const sendRequest = useCallback(async () => {
    const { method, url, headers, bodyMode, body } = currentRequest;

    if (!url.trim()) {
      setError('请输入请求 URL');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');
    setResponse(null);

    const startTime = performance.now();

    try {
      const requestHeaders: Record<string, string> = {};
      for (const h of headers) {
        if (h.enabled && h.key.trim()) {
          requestHeaders[h.key.trim()] = h.value;
        }
      }

      let data: unknown;
      if (bodyMode === 'json' && method !== 'GET') {
        data = body.trim() ? JSON.parse(body) : undefined;
      } else if (bodyMode === 'form' && method !== 'GET') {
        const params = new URLSearchParams();
        for (const line of body.split('\n')) {
          const [key, ...rest] = line.split('=');
          if (key?.trim()) params.append(key.trim(), rest.join('=').trim());
        }
        data = params;
        if (!requestHeaders['Content-Type']) {
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      const res = await axios({
        method: method.toLowerCase(),
        url: url.trim(),
        headers: requestHeaders,
        data: bodyMode === 'none' || method === 'GET' ? undefined : data,
        signal: controller.signal,
        timeout: 30000,
        validateStatus: () => true,
      });

      const duration = Math.round(performance.now() - startTime);
      const bodyText =
        typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      const { formatted, isJson } = tryFormatJson(bodyText);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        duration,
        headers: formatHeaders(res.headers),
        body: formatted,
        isJson,
      });

      addToHistory(method, url.trim());
    } catch (e) {
      if (axios.isCancel(e) || (e instanceof Error && e.name === 'CanceledError')) return;
      if (e instanceof SyntaxError) {
        setError('JSON Body 格式无效');
        return;
      }
      const msg = axios.isAxiosError(e)
        ? e.message
        : e instanceof Error
          ? e.message
          : '请求失败';
      setError(msg);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [currentRequest, addToHistory]);

  const statusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 400) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API 请求测试器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          类似 Postman 的 HTTP 请求调试工具
        </p>
      </div>

      {/* Request bar */}
      <div className="card mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={currentRequest.method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="input-field w-auto font-mono font-semibold"
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={currentRequest.url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="input-field min-w-0 flex-1 font-mono text-xs"
          />
          {loading ? (
            <button type="button" className="btn-secondary" onClick={cancelRequest}>
              <X className="h-4 w-4" />
              取消
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={() => void sendRequest()}>
              <Send className="h-4 w-4" />
              发送
            </button>
          )}
        </div>

        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <History className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">历史:</span>
            {history.map((item) => (
              <button
                key={`${item.method}-${item.url}-${item.timestamp}`}
                type="button"
                onClick={() => loadFromHistory(item)}
                className="rounded border border-gray-200 px-2 py-0.5 font-mono text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {item.method} {item.url.length > 40 ? item.url.slice(0, 40) + '…' : item.url}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Headers & Body */}
        <div className="space-y-4">
          <ToolSection
            title="Headers"
            actions={
              <button type="button" className="btn-secondary text-xs" onClick={addHeader}>
                <Plus className="h-3.5 w-3.5" />
                添加
              </button>
            }
          >
            <div className="space-y-2">
              {currentRequest.headers.map((h) => (
                <div key={h.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => updateHeader(h.id, 'enabled', e.target.checked)}
                    className="shrink-0"
                  />
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => updateHeader(h.id, 'key', e.target.value)}
                    placeholder="Key"
                    className="input-field flex-1 font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => updateHeader(h.id, 'value', e.target.value)}
                    placeholder="Value"
                    className="input-field flex-1 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(h.id)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection title="Body">
            <div className="mb-3 flex gap-2">
              {BODY_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setBodyMode(mode.value)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    currentRequest.bodyMode === mode.value
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {currentRequest.bodyMode === 'none' ? (
              <p className="text-sm text-gray-400">此请求不包含 Body</p>
            ) : currentRequest.bodyMode === 'json' ? (
              <CodeEditor
                value={currentRequest.body}
                language="json"
                placeholder="输入 JSON..."
                onChange={(e) => setBody(e.target.value)}
                padding={12}
                style={{
                  fontSize: 13,
                  backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb',
                  minHeight: 200,
                }}
              />
            ) : (
              <textarea
                value={currentRequest.body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="key1=value1&#10;key2=value2"
                className="input-field min-h-[200px] resize-y font-mono text-xs"
              />
            )}
          </ToolSection>
        </div>

        {/* Response */}
        <ToolSection
          title="响应"
          actions={
            response ? <CopyButton text={response.body} label="复制响应" /> : undefined
          }
        >
          {loading && (
            <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              请求中...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {response && !loading && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className={`font-semibold ${statusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  {response.duration} ms
                </span>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-gray-500">响应头</h4>
                <div className="max-h-32 overflow-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="font-mono text-xs">
                      <span className="text-primary-600 dark:text-primary-400">{key}:</span>{' '}
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-gray-500">
                  响应体 {response.isJson && '(JSON)'}
                </h4>
                <pre className="max-h-96 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs whitespace-pre-wrap dark:bg-gray-800">
                  {response.body}
                </pre>
              </div>
            </div>
          )}

          {!loading && !error && !response && (
            <p className="py-8 text-center text-sm text-gray-400">发送请求后在此查看响应</p>
          )}
        </ToolSection>
      </div>
    </div>
  );
}

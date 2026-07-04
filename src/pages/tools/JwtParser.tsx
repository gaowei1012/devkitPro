import { useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return decodeURIComponent(
    binary
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

function parseJwt(token: string): JwtParts {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('JWT 格式无效：应包含 Header.Payload.Signature 三部分');
  }
  const header = JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>;
  const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
  return { header, payload, signature: parts[2] };
}

function formatJson(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

export default function JwtParser() {
  const [input, setInput] = useState('');

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: '' };
    try {
      return { parsed: parseJwt(input), error: '' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'JWT 解析失败';
      return { parsed: null, error: msg };
    }
  }, [input]);

  const expInfo = useMemo(() => {
    if (!parsed?.payload.exp) return null;
    const exp = parsed.payload.exp;
    if (typeof exp !== 'number') return null;
    const expDate = dayjs.unix(exp);
    const isExpired = expDate.isBefore(dayjs());
    return {
      formatted: expDate.format('YYYY-MM-DD HH:mm:ss'),
      isExpired,
    };
  }, [parsed]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JWT 解析器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          解码 JWT Token 的 Header、Payload 和 Signature（无需密钥）
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolSection title="JWT 输入">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="粘贴 JWT 字符串，如 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="input-field min-h-[320px] resize-y font-mono text-xs"
          />
        </ToolSection>

        <div className="flex flex-col gap-4">
          <ToolSection
            title="Header"
            actions={
              parsed ? <CopyButton text={formatJson(parsed.header)} label="复制 Header" /> : undefined
            }
          >
            {parsed ? (
              <pre className="max-h-40 overflow-auto font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {formatJson(parsed.header)}
              </pre>
            ) : (
              <p className="text-sm text-gray-400">等待输入有效的 JWT...</p>
            )}
          </ToolSection>

          <ToolSection
            title="Payload"
            actions={
              parsed ? <CopyButton text={formatJson(parsed.payload)} label="复制 Payload" /> : undefined
            }
          >
            {parsed ? (
              <>
                <pre className="max-h-48 overflow-auto font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {formatJson(parsed.payload)}
                </pre>
                {expInfo && (
                  <div
                    className={`mt-3 rounded-lg px-3 py-2 text-xs ${
                      expInfo.isExpired
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                    }`}
                  >
                    过期时间 (exp): {expInfo.formatted}
                    {expInfo.isExpired ? ' — 已过期' : ' — 有效'}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">等待输入有效的 JWT...</p>
            )}
          </ToolSection>

          <ToolSection title="Signature">
            {parsed ? (
              <code className="block break-all font-mono text-xs text-gray-700 dark:text-gray-300">
                {parsed.signature}
              </code>
            ) : (
              <p className="text-sm text-gray-400">等待输入有效的 JWT...</p>
            )}
          </ToolSection>
        </div>
      </div>
    </div>
  );
}

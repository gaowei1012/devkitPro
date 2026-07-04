import { useState, useCallback } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowRightLeft, Trash2, Download } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type TargetLang = 'python' | 'javascript' | 'java' | 'go' | 'ruby' | 'php';

const LANG_TABS: { value: TargetLang; label: string; ext: string; hlLang: string }[] = [
  { value: 'python', label: 'Python', ext: 'py', hlLang: 'python' },
  { value: 'javascript', label: 'JavaScript', ext: 'js', hlLang: 'javascript' },
  { value: 'java', label: 'Java', ext: 'java', hlLang: 'java' },
  { value: 'go', label: 'Go', ext: 'go', hlLang: 'go' },
  { value: 'ruby', label: 'Ruby', ext: 'rb', hlLang: 'ruby' },
  { value: 'php', label: 'PHP', ext: 'php', hlLang: 'php' },
];

const DEFAULT_CURL = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name":"John","email":"john@example.com"}'`;

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: string;
  auth?: string;
}

function tokenize(command: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false;
      } else if (ch === '\\' && i + 1 < command.length) {
        current += command[++i];
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
    } else if (ch === ' ' || ch === '\t' || ch === '\n') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else if (ch === '\\' && (command[i + 1] === '\n' || command[i + 1] === '\r')) {
      i++;
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseCurlFallback(command: string): ParsedCurl {
  const trimmed = command.trim();
  if (!/^curl(\s|$)/i.test(trimmed)) {
    throw new Error('命令必须以 curl 开头');
  }

  const tokens = tokenize(trimmed.replace(/^curl\s+/i, ''));
  const result: ParsedCurl = { method: 'GET', url: '', headers: {} };

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      result.method = (tokens[++i] ?? 'GET').toUpperCase();
      i++;
    } else if (token === '-H' || token === '--header') {
      const header = tokens[++i] ?? '';
      const colonIdx = header.indexOf(':');
      if (colonIdx > 0) {
        const key = header.slice(0, colonIdx).trim();
        const val = header.slice(colonIdx + 1).trim();
        result.headers[key] = val;
      }
      i++;
    } else if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary'
    ) {
      result.data = tokens[++i] ?? '';
      if (result.method === 'GET') result.method = 'POST';
      i++;
    } else if (token === '-u' || token === '--user') {
      result.auth = tokens[++i] ?? '';
      i++;
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      result.url = token;
      i++;
    } else if (!token.startsWith('-')) {
      if (!result.url && (token.includes('.') || token.includes('localhost'))) {
        result.url = token;
      }
      i++;
    } else {
      i++;
    }
  }

  if (!result.url) {
    throw new Error('无法解析 URL，请检查 cURL 命令格式');
  }
  return result;
}

function escapePy(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeJs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function toPythonFallback(p: ParsedCurl): string {
  const lines = ['import requests', ''];
  if (p.auth) {
    lines.push(`auth = ('${escapePy(p.auth.split(':')[0] ?? '')}', '${escapePy(p.auth.split(':')[1] ?? '')}')`);
  }
  lines.push(`response = requests.${p.method.toLowerCase()}(`);
  lines.push(`    '${escapePy(p.url)}',`);
  if (Object.keys(p.headers).length) {
    lines.push('    headers={');
    for (const [k, v] of Object.entries(p.headers)) {
      lines.push(`        '${escapePy(k)}': '${escapePy(v)}',`);
    }
    lines.push('    },');
  }
  if (p.data) {
    lines.push(`    data='${escapePy(p.data)}',`);
  }
  if (p.auth) lines.push('    auth=auth,');
  lines.push(')');
  lines.push('print(response.text)');
  return lines.join('\n');
}

function toJavaScriptFallback(p: ParsedCurl): string {
  const lines = ['const options = {', `  method: '${p.method}',`, '  headers: {'];
  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`    '${escapeJs(k)}': '${escapeJs(v)}',`);
  }
  if (p.auth) {
    const encoded = btoa(p.auth);
    lines.push(`    'Authorization': 'Basic ${encoded}',`);
  }
  lines.push('  },');
  if (p.data) {
    lines.push(`  body: '${escapeJs(p.data)}',`);
  }
  lines.push('};', '');
  lines.push(`fetch('${escapeJs(p.url)}', options)`);
  lines.push('  .then(response => response.text())');
  lines.push('  .then(data => console.log(data))');
  lines.push('  .catch(error => console.error(error));');
  return lines.join('\n');
}

function toJavaFallback(p: ParsedCurl): string {
  const lines = [
    'import java.net.URI;',
    'import java.net.http.HttpClient;',
    'import java.net.http.HttpRequest;',
    'import java.net.http.HttpResponse;',
    '',
    'HttpClient client = HttpClient.newHttpClient();',
    'HttpRequest.Builder builder = HttpRequest.newBuilder()',
    `    .uri(URI.create("${p.url}"))`,
    `    .method("${p.method}", HttpRequest.BodyPublishers.ofString("${p.data ?? ''}"));`,
  ];
  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`builder.header("${k}", "${v}");`);
  }
  lines.push('HttpRequest request = builder.build();');
  lines.push('HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());');
  lines.push('System.out.println(response.body());');
  return lines.join('\n');
}

function toGoFallback(p: ParsedCurl): string {
  const lines = [
    'package main',
    '',
    'import (',
    '    "fmt"',
    '    "io"',
    '    "net/http"',
    '    "strings"',
    ')',
    '',
    'func main() {',
    `    payload := strings.NewReader(\`${p.data ?? ''}\`)`,
    `    req, _ := http.NewRequest("${p.method}", "${p.url}", payload)`,
  ];
  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`    req.Header.Add("${k}", "${v}")`);
  }
  lines.push('    client := &http.Client{}');
  lines.push('    resp, _ := client.Do(req)');
  lines.push('    defer resp.Body.Close()');
  lines.push('    body, _ := io.ReadAll(resp.Body)');
  lines.push('    fmt.Println(string(body))');
  lines.push('}');
  return lines.join('\n');
}

function toRubyFallback(p: ParsedCurl): string {
  const lines = ["require 'net/http'", "require 'uri'", ''];
  lines.push(`uri = URI('${p.url}')`);
  lines.push(`http = Net::HTTP.new(uri.host, uri.port)`);
  lines.push('http.use_ssl = true if uri.scheme == "https"');
  lines.push(`request = Net::HTTP::${p.method.charAt(0) + p.method.slice(1).toLowerCase()}.new(uri)`);
  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`request['${k}'] = '${v}'`);
  }
  if (p.data) lines.push(`request.body = '${escapeJs(p.data)}'`);
  lines.push('response = http.request(request)');
  lines.push('puts response.body');
  return lines.join('\n');
}

function toPhpFallback(p: ParsedCurl): string {
  const lines = ['<?php', '$ch = curl_init();', `curl_setopt($ch, CURLOPT_URL, '${escapeJs(p.url)}');`];
  lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${p.method}');`);
  if (p.data) lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${escapeJs(p.data)}');`);
  const headerArr = Object.entries(p.headers).map(([k, v]) => `'${escapeJs(k)}: ${escapeJs(v)}'`);
  if (headerArr.length) {
    lines.push('$headers = [');
    headerArr.forEach((h) => lines.push(`    ${h},`));
    lines.push('];');
    lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);');
  }
  lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);');
  lines.push('$response = curl_exec($ch);');
  lines.push('curl_close($ch);');
  lines.push('echo $response;');
  return lines.join('\n');
}

const FALLBACK_CONVERTERS: Record<TargetLang, (p: ParsedCurl) => string> = {
  python: toPythonFallback,
  javascript: toJavaScriptFallback,
  java: toJavaFallback,
  go: toGoFallback,
  ruby: toRubyFallback,
  php: toPhpFallback,
};

function convertCurl(command: string, lang: TargetLang): string {
  const parsed = parseCurlFallback(command);
  return FALLBACK_CONVERTERS[lang](parsed);
}

export default function CurlConverter() {
  const { resolvedTheme } = useThemeStore();
  const [lang, setLang] = useState<TargetLang>('python');
  const [input, setInput] = useState(DEFAULT_CURL);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const syntaxTheme = isDark ? oneDark : oneLight;
  const langConfig = LANG_TABS.find((t) => t.value === lang)!;

  const editorStyle = {
    fontSize: 13,
    backgroundColor: isDark ? '#1f2937' : '#f9fafb',
    color: isDark ? '#f3f4f6' : '#111827',
    minHeight: 360,
  };

  const handleConvert = useCallback(async () => {
    if (!input.trim()) {
      setError('请先输入 cURL 命令');
      setOutput('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 0));
      const result = convertCurl(input, lang);
      setOutput(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '无法解析该 cURL 命令，请检查格式';
      setError(msg);
      setOutput('');
    } finally {
      setLoading(false);
    }
  }, [input, lang]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `request.${langConfig.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, langConfig.ext]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">cURL 命令转换器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          将 cURL 命令转换为 Python、JavaScript、Java 等多种语言代码
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50">
        {LANG_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setLang(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === tab.value
                ? 'bg-white text-primary-700 shadow-sm dark:bg-gray-700 dark:text-primary-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="cURL 命令">
            <CodeEditor
              value={input}
              language="shell"
              placeholder="粘贴 cURL 命令..."
              onChange={(e) => setInput(e.target.value)}
              padding={12}
              style={editorStyle}
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title={`${langConfig.label} 代码`}
            actions={
              <div className="flex gap-2">
                <CopyButton text={output} label="复制代码" />
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={handleDownload}
                  disabled={!output}
                >
                  <Download className="h-3.5 w-3.5" />
                  下载 .{langConfig.ext}
                </button>
              </div>
            }
          >
            {loading ? (
              <LoadingSpinner />
            ) : output ? (
              <SyntaxHighlighter
                language={langConfig.hlLang}
                style={syntaxTheme}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  minHeight: 360,
                }}
                showLineNumbers
              >
                {output}
              </SyntaxHighlighter>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400 dark:bg-gray-800">
                转换后的代码将显示在这里...
              </div>
            )}
          </ToolSection>
        }
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => void handleConvert()} disabled={loading}>
          <ArrowRightLeft className="h-4 w-4" />
          解析并转换
        </button>
        <button type="button" className="btn-secondary" onClick={handleClear} disabled={loading}>
          <Trash2 className="h-4 w-4" />
          清空
        </button>
      </div>
    </div>
  );
}

import { useState, useCallback, useMemo } from 'react';
import { Container, Download } from 'lucide-react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

const DEFAULT_COMMAND = `docker run -d --name nginx \\
  -p 80:80 -p 443:443 \\
  -v /data:/data \\
  -e NGINX_HOST=example.com \\
  --restart unless-stopped \\
  nginx:latest`;

interface ComposeService {
  image: string;
  container_name?: string;
  ports: string[];
  volumes: string[];
  environment: Record<string, string>;
  restart?: string;
  network?: string;
  detach?: boolean;
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

function parseDockerRun(command: string): ComposeService {
  const cleaned = command.trim().replace(/^docker\s+run\s+/i, '');
  const tokens = tokenize(cleaned);

  const service: ComposeService = {
    image: '',
    ports: [],
    volumes: [],
    environment: {},
  };

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '-d' || token === '--detach') {
      service.detach = true;
      i++;
    } else if (token === '--name' && tokens[i + 1]) {
      service.container_name = tokens[++i];
      i++;
    } else if ((token === '-p' || token === '--publish') && tokens[i + 1]) {
      service.ports.push(tokens[++i]);
      i++;
    } else if ((token === '-v' || token === '--volume') && tokens[i + 1]) {
      service.volumes.push(tokens[++i]);
      i++;
    } else if ((token === '-e' || token === '--env') && tokens[i + 1]) {
      const envStr = tokens[++i];
      const eqIdx = envStr.indexOf('=');
      if (eqIdx > 0) {
        service.environment[envStr.slice(0, eqIdx)] = envStr.slice(eqIdx + 1);
      } else {
        service.environment[envStr] = '';
      }
      i++;
    } else if (token === '--restart' && tokens[i + 1]) {
      service.restart = tokens[++i];
      i++;
    } else if (token === '--network' && tokens[i + 1]) {
      service.network = tokens[++i];
      i++;
    } else if (token.startsWith('-')) {
      i += 2;
    } else {
      service.image = token;
      i++;
    }
  }

  if (!service.image) {
    throw new Error('未找到镜像名称，请检查 docker run 命令格式');
  }

  return service;
}

function toComposeYaml(service: ComposeService): string {
  const lines: string[] = ['services:'];
  const name = service.container_name ?? 'app';
  lines.push(`  ${name}:`);
  lines.push(`    image: ${service.image}`);

  if (service.container_name) {
    lines.push(`    container_name: ${service.container_name}`);
  }
  if (service.restart) {
    lines.push(`    restart: ${service.restart}`);
  }
  if (service.ports.length) {
    lines.push('    ports:');
    for (const p of service.ports) {
      lines.push(`      - "${p}"`);
    }
  }
  if (service.volumes.length) {
    lines.push('    volumes:');
    for (const v of service.volumes) {
      lines.push(`      - ${v}`);
    }
  }
  if (Object.keys(service.environment).length) {
    lines.push('    environment:');
    for (const [key, val] of Object.entries(service.environment)) {
      lines.push(`      ${key}: ${val.includes(' ') ? `"${val}"` : val}`);
    }
  }
  if (service.network) {
    lines.push(`    network_mode: ${service.network}`);
  }
  if (service.detach) {
    lines.push('    detach: true');
  }

  return lines.join('\n');
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DockerConverter() {
  const [input, setInput] = useState(DEFAULT_COMMAND);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      const service = parseDockerRun(input);
      return { output: toComposeYaml(service), error: '' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : '解析失败';
      return { output: '', error: msg };
    }
  }, [input]);

  const handleDownload = useCallback(() => {
    if (output) downloadFile(output, 'docker-compose.yml');
  }, [output]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Docker run → Compose 转换器
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          将 docker run 命令转换为 docker-compose.yml
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="Docker run 命令">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴 docker run 命令..."
              className="input-field min-h-[400px] resize-y font-mono text-xs"
            />
          </ToolSection>
        }
        output={
          <ToolSection
            title="docker-compose.yml"
            actions={
              output ? (
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <button type="button" className="btn-secondary text-xs" onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5" />
                    下载
                  </button>
                </div>
              ) : undefined
            }
          >
            {output ? (
              <pre className="max-h-[400px] overflow-auto font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {output}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Container className="mb-2 h-8 w-8" />
                <p className="text-sm">输入 docker run 命令后自动生成</p>
              </div>
            )}
          </ToolSection>
        }
      />
    </div>
  );
}

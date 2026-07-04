import { useState, useCallback, useMemo } from 'react';
import { calculateSubnetMask, calculateCIDRPrefix } from 'ip-subnet-calculator';
import { Calculator, Network } from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  subnetMask: string;
  cidr: number;
  wildcardMask: string;
  usableHosts: number;
  ipClass: string;
  isPrivate: boolean;
}

function validateIp(ip: string): string | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) {
    return 'IP 格式错误：必须为 4 段点分十进制地址';
  }
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '' || !/^\d+$/.test(part)) {
      return `IP 格式错误：第 ${i + 1} 段无效`;
    }
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) {
      return `IP 格式错误：第 ${i + 1} 段超出 0-255 范围（当前值 ${num}）`;
    }
  }
  return null;
}

function parseMask(maskInput: string): { prefix: number } | { subnetMask: string } | { error: string } {
  const trimmed = maskInput.trim();
  if (!trimmed) {
    return { error: '请输入子网掩码' };
  }

  if (trimmed.startsWith('/')) {
    const prefix = parseInt(trimmed.slice(1), 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return { error: 'CIDR 格式错误：前缀长度必须在 /0 到 /32 之间' };
    }
    return { prefix };
  }

  if (/^\d{1,2}$/.test(trimmed)) {
    const prefix = parseInt(trimmed, 10);
    if (prefix < 0 || prefix > 32) {
      return { error: 'CIDR 格式错误：前缀长度必须在 0 到 32 之间' };
    }
    return { prefix };
  }

  const ipError = validateIp(trimmed);
  if (ipError) {
    return { error: `子网掩码格式错误：${ipError.replace('IP 格式错误：', '')}` };
  }

  const parts = trimmed.split('.').map((p) => parseInt(p, 10));
  const maskNum =
    ((parts[0]! << 24) >>> 0) +
    ((parts[1]! << 16) >>> 0) +
    ((parts[2]! << 8) >>> 0) +
    (parts[3]! >>> 0);

  const inverted = (~maskNum >>> 0) + 1;
  if ((maskNum & inverted) !== 0) {
    return { error: '子网掩码无效：必须是连续的 1 后跟连续的 0' };
  }

  return { subnetMask: trimmed };
}

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  return (
    ((parts[0]! << 24) >>> 0) +
    ((parts[1]! << 16) >>> 0) +
    ((parts[2]! << 8) >>> 0) +
    (parts[3]! >>> 0)
  );
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

function getIpClass(ip: string): string {
  const first = parseInt(ip.split('.')[0] ?? '0', 10);
  if (first >= 1 && first <= 126) return 'A 类';
  if (first >= 128 && first <= 191) return 'B 类';
  if (first >= 192 && first <= 223) return 'C 类';
  if (first >= 224 && first <= 239) return 'D 类（组播）';
  if (first >= 240 && first <= 255) return 'E 类（保留）';
  return '未知';
}

function isPrivateIp(ip: string): boolean {
  const num = ipToNumber(ip);
  const ranges = [
    { start: ipToNumber('10.0.0.0'), end: ipToNumber('10.255.255.255') },
    { start: ipToNumber('172.16.0.0'), end: ipToNumber('172.31.255.255') },
    { start: ipToNumber('192.168.0.0'), end: ipToNumber('192.168.255.255') },
  ];
  return ranges.some((r) => num >= r.start && num <= r.end);
}

function computeUsableHosts(prefixSize: number, networkNum: number, broadcastNum: number): {
  firstUsable: string;
  lastUsable: string;
  count: number;
} {
  if (prefixSize === 32) {
    const ip = numberToIp(networkNum);
    return { firstUsable: ip, lastUsable: ip, count: 1 };
  }
  if (prefixSize === 31) {
    return {
      firstUsable: numberToIp(networkNum),
      lastUsable: numberToIp(broadcastNum),
      count: 2,
    };
  }
  return {
    firstUsable: numberToIp(networkNum + 1),
    lastUsable: numberToIp(broadcastNum - 1),
    count: broadcastNum - networkNum - 1,
  };
}

function buildResultText(result: SubnetResult, ip: string): string {
  return [
    '=== IP 子网计算结果 ===',
    '',
    `输入 IP 地址:        ${ip}`,
    `网络地址:            ${result.networkAddress}`,
    `广播地址:            ${result.broadcastAddress}`,
    `可用 IP 范围:        ${result.firstUsable} ~ ${result.lastUsable}`,
    `子网掩码:            ${result.subnetMask} (/${result.cidr})`,
    `通配符掩码:          ${result.wildcardMask}`,
    `可用主机数量:        ${result.usableHosts}`,
    `IP 地址类别:         ${result.ipClass}`,
    `是否为私有 IP:       ${result.isPrivate ? '是' : '否'}`,
  ].join('\n');
}

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function ResultCard({ label, value, highlight }: ResultCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30'
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
      }`}
    >
      <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="break-all font-mono text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.0');
  const [mask, setMask] = useState('/24');
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const copyText = useMemo(() => (result ? buildResultText(result, ip) : ''), [result, ip]);

  const handleCalculate = useCallback(async () => {
    setError('');
    setResult(null);

    const ipError = validateIp(ip);
    if (ipError) {
      setError(ipError);
      return;
    }

    const maskParsed = parseMask(mask);
    if ('error' in maskParsed) {
      setError(maskParsed.error);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 0));

      let analysis;
      if ('prefix' in maskParsed) {
        analysis = calculateSubnetMask(ip.trim(), maskParsed.prefix);
      } else {
        analysis = calculateCIDRPrefix(ip.trim(), maskParsed.subnetMask);
      }

      if (!analysis) {
        setError('计算失败，请检查 IP 地址和子网掩码');
        return;
      }

      const networkNum = analysis.ipLow;
      const broadcastNum = analysis.ipHigh;
      const usable = computeUsableHosts(analysis.prefixSize, networkNum, broadcastNum);

      setResult({
        networkAddress: analysis.ipLowStr,
        broadcastAddress: analysis.ipHighStr,
        firstUsable: usable.firstUsable,
        lastUsable: usable.lastUsable,
        subnetMask: analysis.prefixMaskStr,
        cidr: analysis.prefixSize,
        wildcardMask: analysis.invertedMaskStr,
        usableHosts: usable.count,
        ipClass: getIpClass(ip.trim()),
        isPrivate: isPrivateIp(ip.trim()),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '计算过程中发生错误');
    } finally {
      setLoading(false);
    }
  }, [ip, mask]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IP 子网计算器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          根据 IP 地址和子网掩码计算网络地址、广播地址、可用 IP 范围等信息
        </p>
      </div>

      <ToolSection title="输入参数">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              IP 地址
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.0"
              className="input-field font-mono"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              子网掩码
            </label>
            <input
              type="text"
              value={mask}
              onChange={(e) => setMask(e.target.value)}
              placeholder="255.255.255.0 或 /24"
              className="input-field font-mono"
            />
            <p className="mt-1 text-xs text-gray-400">支持点分十进制（255.255.255.0）或 CIDR（/24）</p>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => void handleCalculate()}
          disabled={loading}
        >
          <Calculator className="h-4 w-4" />
          计算
        </button>
      </ToolSection>

      {loading && (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      )}

      {result && !loading && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Network className="h-5 w-5 text-primary-600" />
              计算结果
            </h2>
            <CopyButton text={copyText} label="复制全部结果" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResultCard label="网络地址 (Network Address)" value={result.networkAddress} highlight />
            <ResultCard label="广播地址 (Broadcast Address)" value={result.broadcastAddress} highlight />
            <ResultCard
              label="可用 IP 范围"
              value={`${result.firstUsable} ~ ${result.lastUsable}`}
            />
            <ResultCard
              label="子网掩码"
              value={`${result.subnetMask} / ${result.cidr}`}
            />
            <ResultCard label="通配符掩码 (Wildcard Mask)" value={result.wildcardMask} />
            <ResultCard label="可用主机数量" value={result.usableHosts.toLocaleString()} />
            <ResultCard label="IP 地址类别" value={result.ipClass} />
            <ResultCard
              label="是否为私有 IP"
              value={result.isPrivate ? '是' : '否'}
            />
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-300">
                    属性
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-300">
                    值
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ['输入 IP', ip],
                  ['网络地址', result.networkAddress],
                  ['广播地址', result.broadcastAddress],
                  ['可用起始 IP', result.firstUsable],
                  ['可用结束 IP', result.lastUsable],
                  ['子网掩码', result.subnetMask],
                  ['CIDR 前缀', `/${result.cidr}`],
                  ['通配符掩码', result.wildcardMask],
                  ['可用主机数', String(result.usableHosts)],
                  ['IP 类别', result.ipClass],
                  ['私有 IP', result.isPrivate ? '是' : '否'],
                ].map(([label, value]) => (
                  <tr key={label} className="bg-white dark:bg-gray-900">
                    <td className="px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">{label}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-white">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

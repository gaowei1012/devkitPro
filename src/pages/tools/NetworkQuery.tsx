import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { Globe, Server, Loader2, RefreshCw } from 'lucide-react';
import { ToolSection } from '@/components/ToolLayout';

type Tab = 'ip' | 'dns';
type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX';

const DNS_TYPE_MAP: Record<DnsRecordType, number> = {
  A: 1,
  AAAA: 28,
  CNAME: 5,
  MX: 15,
};

interface IpInfo {
  ip: string;
  country: string;
  city: string;
  isp: string;
}

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export default function NetworkQuery() {
  const [tab, setTab] = useState<Tab>('ip');
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState('');

  const [domain, setDomain] = useState('google.com');
  const [recordType, setRecordType] = useState<DnsRecordType>('A');
  const [dnsResults, setDnsResults] = useState<DnsAnswer[]>([]);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const fetchIp = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIpLoading(true);
    setIpError('');
    setIpInfo(null);

    try {
      const ipRes = await axios.get<{ ip: string }>('https://api.ipify.org?format=json', {
        signal: controller.signal,
        timeout: 10000,
      });

      const geoRes = await axios.get<{
        status: string;
        country: string;
        city: string;
        isp: string;
        query: string;
      }>(`http://ip-api.com/json/${ipRes.data.ip}?fields=status,country,city,isp,query`, {
        signal: controller.signal,
        timeout: 10000,
      });

      if (geoRes.data.status === 'success') {
        setIpInfo({
          ip: geoRes.data.query,
          country: geoRes.data.country,
          city: geoRes.data.city,
          isp: geoRes.data.isp,
        });
      } else {
        setIpInfo({
          ip: ipRes.data.ip,
          country: '-',
          city: '-',
          isp: '-',
        });
      }
    } catch (e) {
      if (axios.isCancel(e) || (e instanceof Error && e.name === 'CanceledError')) return;
      const msg = e instanceof Error ? e.message : 'IP 查询失败';
      setIpError(msg);
    } finally {
      if (!controller.signal.aborted) {
        setIpLoading(false);
      }
    }
  }, []);

  const fetchDns = useCallback(async () => {
    if (!domain.trim()) {
      setDnsError('请输入域名');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setDnsLoading(true);
    setDnsError('');
    setDnsResults([]);

    try {
      const type = DNS_TYPE_MAP[recordType];
      const res = await axios.get<{
        Status: number;
        Answer?: DnsAnswer[];
        Comment?: string;
      }>(`https://dns.google/resolve`, {
        params: { name: domain.trim(), type },
        signal: controller.signal,
        timeout: 10000,
      });

      if (res.data.Status !== 0) {
        setDnsError(res.data.Comment ?? `DNS 查询失败 (Status: ${res.data.Status})`);
        return;
      }

      if (!res.data.Answer?.length) {
        setDnsError('未找到 DNS 记录');
        return;
      }

      setDnsResults(res.data.Answer);
    } catch (e) {
      if (axios.isCancel(e) || (e instanceof Error && e.name === 'CanceledError')) return;
      const msg = e instanceof Error ? e.message : 'DNS 查询失败';
      setDnsError(msg);
    } finally {
      if (!controller.signal.aborted) {
        setDnsLoading(false);
      }
    }
  }, [domain, recordType]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">网络查询工具箱</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">IP 地址查询与 DNS 记录解析</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setTab('ip')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'ip'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Globe className="h-4 w-4" />
          IP 查询
        </button>
        <button
          type="button"
          onClick={() => setTab('dns')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'dns'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Server className="h-4 w-4" />
          DNS 查询
        </button>
      </div>

      {tab === 'ip' && (
        <ToolSection title="本机 IP 信息">
          <div className="space-y-4">
            <button type="button" className="btn-primary" onClick={() => void fetchIp()} disabled={ipLoading}>
              {ipLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  查询中...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  获取本机 IP
                </>
              )}
            </button>

            {ipError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                <p>{ipError}</p>
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-xs underline"
                  onClick={() => void fetchIp()}
                >
                  <RefreshCw className="h-3 w-3" />
                  重试
                </button>
              </div>
            )}

            {ipInfo && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: 'IP 地址', value: ipInfo.ip },
                  { label: '国家', value: ipInfo.country },
                  { label: '城市', value: ipInfo.city },
                  { label: '运营商 (ISP)', value: ipInfo.isp },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="text-xs font-semibold text-gray-500">{item.label}</div>
                    <div className="mt-1 font-mono text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ToolSection>
      )}

      {tab === 'dns' && (
        <ToolSection title="DNS 记录查询">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="输入域名，如 google.com"
                className="input-field flex-1 min-w-[200px]"
              />
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as DnsRecordType)}
                className="input-field w-auto"
              >
                {(Object.keys(DNS_TYPE_MAP) as DnsRecordType[]).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-primary" onClick={() => void fetchDns()} disabled={dnsLoading}>
                {dnsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    查询中...
                  </>
                ) : (
                  '查询 DNS'
                )}
              </button>
            </div>

            {dnsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                <p>{dnsError}</p>
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-xs underline"
                  onClick={() => void fetchDns()}
                >
                  <RefreshCw className="h-3 w-3" />
                  重试
                </button>
              </div>
            )}

            {dnsResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-700">
                      <th className="pb-2 pr-4">名称</th>
                      <th className="pb-2 pr-4">类型</th>
                      <th className="pb-2 pr-4">TTL</th>
                      <th className="pb-2">数据</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsResults.map((record, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-4 font-mono text-xs">{record.name}</td>
                        <td className="py-2 pr-4">{record.type}</td>
                        <td className="py-2 pr-4">{record.TTL}s</td>
                        <td className="py-2 font-mono text-xs break-all">{record.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ToolSection>
      )}
    </div>
  );
}

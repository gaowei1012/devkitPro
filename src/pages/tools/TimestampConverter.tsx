import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState(String(Date.now()));
  const [datetime, setDatetime] = useState('');
  const [unit, setUnit] = useState<'ms' | 's'>('ms');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const ts = parseInt(timestamp, 10);
    if (!isNaN(ts)) {
      const d = unit === 's' ? dayjs.unix(ts) : dayjs(ts);
      if (d.isValid()) {
        setDatetime(d.format('YYYY-MM-DDTHH:mm:ss'));
      }
    }
  }, []);

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    const ts = parseInt(value, 10);
    if (isNaN(ts)) return;
    const d = unit === 's' ? dayjs.unix(ts) : dayjs(ts);
    if (d.isValid()) {
      setDatetime(d.format('YYYY-MM-DDTHH:mm:ss'));
    }
  };

  const handleDatetimeChange = (value: string) => {
    setDatetime(value);
    const d = dayjs(value);
    if (d.isValid()) {
      setTimestamp(String(unit === 's' ? d.unix() : d.valueOf()));
    }
  };

  const handleUnitChange = (newUnit: 'ms' | 's') => {
    setUnit(newUnit);
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) return;
    if (newUnit === 's' && unit === 'ms') {
      setTimestamp(String(Math.floor(ts / 1000)));
    } else if (newUnit === 'ms' && unit === 's') {
      setTimestamp(String(ts * 1000));
    }
  };

  const formatted = (() => {
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) return '';
    const d = unit === 's' ? dayjs.unix(ts) : dayjs(ts);
    return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : '';
  })();

  const isoString = (() => {
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts)) return '';
    const d = unit === 's' ? dayjs.unix(ts) : dayjs(ts);
    return d.isValid() ? d.toISOString() : '';
  })();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">时间戳转换</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Unix 时间戳与日期时间互转 · 当前时区：{timezone}
        </p>
      </div>

      <ToolLayout
        input={
          <ToolSection title="输入">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    时间戳
                  </label>
                  <div className="flex gap-1 rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => handleUnitChange('ms')}
                      className={`rounded px-2 py-0.5 text-xs ${
                        unit === 'ms'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      毫秒
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitChange('s')}
                      className={`rounded px-2 py-0.5 text-xs ${
                        unit === 's'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      秒
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  value={timestamp}
                  onChange={(e) => handleTimestampChange(e.target.value)}
                  className="input-field"
                  placeholder="输入时间戳"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  日期时间
                </label>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => handleDatetimeChange(e.target.value)}
                  className="input-field"
                  step="1"
                />
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const now = Date.now();
                  setUnit('ms');
                  setTimestamp(String(now));
                  setDatetime(dayjs(now).format('YYYY-MM-DDTHH:mm:ss'));
                }}
              >
                设为当前时间
              </button>
            </div>
          </ToolSection>
        }
        output={
          <ToolSection title="转换结果" actions={<CopyButton text={formatted} />}>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">本地时间</div>
                <div className="mt-1 font-mono text-lg">{formatted || '—'}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">ISO 8601</div>
                  <CopyButton text={isoString} />
                </div>
                <div className="mt-1 break-all font-mono text-sm">{isoString || '—'}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    时间戳（{unit === 'ms' ? '毫秒' : '秒'}）
                  </div>
                  <CopyButton text={timestamp} />
                </div>
                <div className="mt-1 font-mono text-lg">{timestamp || '—'}</div>
              </div>
            </div>
          </ToolSection>
        }
      />
    </div>
  );
}

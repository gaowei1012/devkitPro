import { useState, useMemo } from 'react';
import { ToolSection } from '@/components/ToolLayout';

type Category = 'radix' | 'storage' | 'css' | 'aspect';

const COMMON_RATIOS = [
  { ratio: '16:9', resolutions: ['1920×1080', '1280×720', '3840×2160'] },
  { ratio: '4:3', resolutions: ['1024×768', '1600×1200'] },
  { ratio: '21:9', resolutions: ['2560×1080', '3440×1440'] },
  { ratio: '1:1', resolutions: ['1080×1080', '512×512'] },
  { ratio: '9:16', resolutions: ['1080×1920', '720×1280'] },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(w: number, h: number): string {
  if (w <= 0 || h <= 0) return '-';
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('radix');

  const [decimal, setDecimal] = useState('255');
  const [storageValue, setStorageValue] = useState('1024');
  const [storageUnit, setStorageUnit] = useState<'B' | 'KB' | 'MB' | 'GB' | 'TB'>('KB');
  const [pxValue, setPxValue] = useState('16');
  const [rootFont, setRootFont] = useState('16');
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');

  const radixResults = useMemo(() => {
    const num = parseInt(decimal, 10);
    if (isNaN(num)) return null;
    return {
      binary: num.toString(2),
      octal: num.toString(8),
      hex: num.toString(16).toUpperCase(),
      decimal: num.toString(10),
    };
  }, [decimal]);

  const storageResults = useMemo(() => {
    const val = parseFloat(storageValue);
    if (isNaN(val)) return null;
    const units = { B: 0, KB: 1, MB: 2, GB: 3, TB: 4 };
    const bytes = val * Math.pow(1024, units[storageUnit]);
    return {
      B: bytes,
      KB: bytes / 1024,
      MB: bytes / (1024 * 1024),
      GB: bytes / (1024 * 1024 * 1024),
      TB: bytes / (1024 * 1024 * 1024 * 1024),
    };
  }, [storageValue, storageUnit]);

  const cssResults = useMemo(() => {
    const px = parseFloat(pxValue);
    const root = parseFloat(rootFont);
    if (isNaN(px) || isNaN(root) || root === 0) return null;
    return {
      px,
      rem: (px / root).toFixed(4),
      em: (px / root).toFixed(4),
    };
  }, [pxValue, rootFont]);

  const aspectResult = useMemo(() => {
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h)) return null;
    const ratio = simplifyRatio(w, h);
    const decimal = (w / h).toFixed(4);
    const matches = COMMON_RATIOS.filter((r) => r.ratio === ratio);
    return { ratio, decimal, matches };
  }, [width, height]);

  const categories: { id: Category; label: string }[] = [
    { id: 'radix', label: '进制换算' },
    { id: 'storage', label: '存储单位' },
    { id: 'css', label: 'CSS 单位' },
    { id: 'aspect', label: '宽高比' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">单位换算器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          进制、存储、CSS 单位和宽高比换算
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              category === cat.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {category === 'radix' && (
        <ToolSection title="进制换算">
          <div className="mb-4">
            <label className="mb-1 block text-xs text-gray-500">十进制</label>
            <input
              type="number"
              value={decimal}
              onChange={(e) => setDecimal(e.target.value)}
              className="input-field max-w-xs font-mono"
            />
          </div>
          {radixResults && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: '二进制', value: radixResults.binary },
                { label: '八进制', value: radixResults.octal },
                { label: '十六进制', value: radixResults.hex },
                { label: '十进制', value: radixResults.decimal },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="text-xs font-semibold text-gray-500">{item.label}</div>
                  <div className="mt-1 break-all font-mono text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </ToolSection>
      )}

      {category === 'storage' && (
        <ToolSection title="存储单位换算">
          <div className="mb-4 flex gap-2">
            <input
              type="number"
              value={storageValue}
              onChange={(e) => setStorageValue(e.target.value)}
              className="input-field max-w-xs font-mono"
            />
            <select
              value={storageUnit}
              onChange={(e) => setStorageUnit(e.target.value as typeof storageUnit)}
              className="input-field w-auto"
            >
              {(['B', 'KB', 'MB', 'GB', 'TB'] as const).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          {storageResults && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(['B', 'KB', 'MB', 'GB', 'TB'] as const).map((u) => (
                <div key={u} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="text-xs font-semibold text-gray-500">{u}</div>
                  <div className="mt-1 font-mono text-sm">
                    {storageResults[u].toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ToolSection>
      )}

      {category === 'css' && (
        <ToolSection title="CSS 单位换算">
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">px 值</label>
              <input
                type="number"
                value={pxValue}
                onChange={(e) => setPxValue(e.target.value)}
                className="input-field max-w-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">根字体 (px)</label>
              <input
                type="number"
                value={rootFont}
                onChange={(e) => setRootFont(e.target.value)}
                className="input-field max-w-xs font-mono"
              />
            </div>
          </div>
          {cssResults && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'px', value: cssResults.px },
                { label: 'rem', value: cssResults.rem },
                { label: 'em', value: cssResults.em },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="text-xs font-semibold text-gray-500">{item.label}</div>
                  <div className="mt-1 font-mono text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </ToolSection>
      )}

      {category === 'aspect' && (
        <ToolSection title="宽高比计算">
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">宽度</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="input-field max-w-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">高度</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="input-field max-w-xs font-mono"
              />
            </div>
          </div>
          {aspectResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="text-xs font-semibold text-gray-500">比例</div>
                  <div className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {aspectResult.ratio}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="text-xs font-semibold text-gray-500">小数比</div>
                  <div className="mt-1 font-mono text-sm">{aspectResult.decimal}</div>
                </div>
              </div>
              {aspectResult.matches.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-gray-500">常见分辨率匹配</h4>
                  <div className="flex flex-wrap gap-2">
                    {aspectResult.matches[0].resolutions.map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-primary-50 px-3 py-1 font-mono text-xs text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ToolSection>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { hexToRgb, rgbToHsl } from '@/utils/crypto';

function normalizeHex(hex: string): string {
  let h = hex.trim();
  if (!h.startsWith('#')) h = '#' + h;
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return h.toUpperCase();
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#3B82F6');

  const colorData = useMemo(() => {
    const normalized = normalizeHex(hex);
    const rgb = hexToRgb(normalized);
    if (!rgb) return null;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cssHex = normalized;
    const cssRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const cssHsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    return { rgb, hsl, cssHex, cssRgb, cssHsl, normalized };
  }, [hex]);

  const handleColorPicker = (value: string) => {
    setHex(value);
  };

  const handleHexInput = (value: string) => {
    setHex(value);
  };

  const cssCode = colorData
    ? `color: ${colorData.cssHex};\nbackground-color: ${colorData.cssRgb};\n/* HSL: ${colorData.cssHsl} */`
    : '';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">颜色转换器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          HEX、RGB、HSL 颜色格式互转，含色块预览和 CSS 代码
        </p>
      </div>

      <ToolLayout
        input={
          <ToolSection title="输入颜色">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colorData?.normalized ?? '#3B82F6'}
                  onChange={(e) => handleColorPicker(e.target.value)}
                  className="h-16 w-16 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="input-field flex-1 font-mono uppercase"
                  placeholder="#RRGGBB"
                />
              </div>

              {colorData && (
                <div
                  className="h-24 rounded-xl border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: colorData.normalized }}
                />
              )}
            </div>
          </ToolSection>
        }
        output={
          <ToolSection title="转换结果" actions={<CopyButton text={cssCode} label="复制 CSS" />}>
            {colorData ? (
              <div className="space-y-4">
                {[
                  { label: 'HEX', value: colorData.cssHex },
                  { label: 'RGB', value: colorData.cssRgb },
                  {
                    label: 'HSL',
                    value: colorData.cssHsl,
                  },
                  {
                    label: 'RGB 分量',
                    value: `R: ${colorData.rgb.r}  G: ${colorData.rgb.g}  B: ${colorData.rgb.b}`,
                  },
                  {
                    label: 'HSL 分量',
                    value: `H: ${colorData.hsl.h}°  S: ${colorData.hsl.s}%  L: ${colorData.hsl.l}%`,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                      <CopyButton text={item.value} />
                    </div>
                    <code className="font-mono text-sm">{item.value}</code>
                  </div>
                ))}

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="mb-2 text-xs font-semibold text-gray-500">CSS 代码</div>
                  <pre className="font-mono text-sm whitespace-pre-wrap">{cssCode}</pre>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-red-500">
                无效的 HEX 颜色值，请输入如 #FF5733 的格式
              </div>
            )}
          </ToolSection>
        }
      />
    </div>
  );
}

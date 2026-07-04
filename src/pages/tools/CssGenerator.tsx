import { useState, useMemo, useCallback } from 'react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

type SubTab = 'shadow' | 'radius';

export default function CssGenerator() {
  const [subTab, setSubTab] = useState<SubTab>('shadow');

  const [offsetX, setOffsetX] = useState(4);
  const [offsetY, setOffsetY] = useState(4);
  const [blur, setBlur] = useState(8);
  const [spread, setSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState('#3B82F680');
  const [inset, setInset] = useState(false);

  const [radiusTL, setRadiusTL] = useState(16);
  const [radiusTR, setRadiusTR] = useState(16);
  const [radiusBR, setRadiusBR] = useState(16);
  const [radiusBL, setRadiusBL] = useState(16);

  const boxShadowCss = useMemo(() => {
    const insetStr = inset ? 'inset ' : '';
    return `box-shadow: ${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor};`;
  }, [offsetX, offsetY, blur, spread, shadowColor, inset]);

  const borderRadiusCss = useMemo(() => {
    if (radiusTL === radiusTR && radiusTR === radiusBR && radiusBR === radiusBL) {
      return `border-radius: ${radiusTL}px;`;
    }
    return `border-radius: ${radiusTL}px ${radiusTR}px ${radiusBR}px ${radiusBL}px;`;
  }, [radiusTL, radiusTR, radiusBR, radiusBL]);

  const boxShadowStyle = useMemo(
    () => ({
      boxShadow: `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}`,
    }),
    [offsetX, offsetY, blur, spread, shadowColor, inset]
  );

  const borderRadiusStyle = useMemo(
    () => ({
      borderRadius: `${radiusTL}px ${radiusTR}px ${radiusBR}px ${radiusBL}px`,
    }),
    [radiusTL, radiusTR, radiusBR, radiusBL]
  );

  const handleLinkedRadius = useCallback(
    (value: number, setter: (v: number) => void) => {
      setter(value);
    },
    []
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CSS 可视化生成器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          可视化调整 Box Shadow 和 Border Radius 并生成 CSS 代码
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setSubTab('shadow')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            subTab === 'shadow'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Box Shadow
        </button>
        <button
          type="button"
          onClick={() => setSubTab('radius')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            subTab === 'radius'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Border Radius
        </button>
      </div>

      {subTab === 'shadow' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="参数调整">
            <div className="space-y-4">
              {[
                { label: '水平偏移 (X)', value: offsetX, setter: setOffsetX, min: -50, max: 50 },
                { label: '垂直偏移 (Y)', value: offsetY, setter: setOffsetY, min: -50, max: 50 },
                { label: '模糊半径 (Blur)', value: blur, setter: setBlur, min: 0, max: 100 },
                { label: '扩散半径 (Spread)', value: spread, setter: setSpread, min: -50, max: 50 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>{item.label}</span>
                    <span>{item.value}px</span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    value={item.value}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs text-gray-500">阴影颜色</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={shadowColor.slice(0, 7)}
                    onChange={(e) => setShadowColor(e.target.value + shadowColor.slice(7))}
                    className="h-10 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="input-field flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inset}
                  onChange={(e) => setInset(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Inset 内阴影
              </label>
            </div>
          </ToolSection>

          <div className="flex flex-col gap-4">
            <ToolSection title="预览">
              <div className="flex items-center justify-center rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
                <div
                  className="h-[150px] w-[150px] bg-primary-500"
                  style={boxShadowStyle}
                />
              </div>
            </ToolSection>

            <ToolSection title="CSS 代码" actions={<CopyButton text={boxShadowCss} />}>
              <pre className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-800">
                {boxShadowCss}
              </pre>
            </ToolSection>
          </div>
        </div>
      )}

      {subTab === 'radius' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolSection title="圆角参数">
            <div className="space-y-4">
              {[
                { label: '左上 (TL)', value: radiusTL, setter: setRadiusTL },
                { label: '右上 (TR)', value: radiusTR, setter: setRadiusTR },
                { label: '右下 (BR)', value: radiusBR, setter: setRadiusBR },
                { label: '左下 (BL)', value: radiusBL, setter: setRadiusBL },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>{item.label}</span>
                    <span>{item.value}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={item.value}
                    onChange={(e) => handleLinkedRadius(Number(e.target.value), item.setter)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </ToolSection>

          <div className="flex flex-col gap-4">
            <ToolSection title="预览">
              <div className="flex items-center justify-center rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
                <div
                  className="h-[150px] w-[150px] bg-primary-500"
                  style={borderRadiusStyle}
                />
              </div>
            </ToolSection>

            <ToolSection title="CSS 代码" actions={<CopyButton text={borderRadiusCss} />}>
              <pre className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-800">
                {borderRadiusCss}
              </pre>
            </ToolSection>
          </div>
        </div>
      )}
    </div>
  );
}

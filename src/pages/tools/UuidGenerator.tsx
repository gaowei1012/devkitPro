import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RefreshCw } from 'lucide-react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

export default function UuidGenerator() {
  const [single, setSingle] = useState(() => uuidv4());
  const [count, setCount] = useState(5);
  const [batch, setBatch] = useState<string[]>([]);

  const generateSingle = () => setSingle(uuidv4());

  const generateBatch = () => {
    const n = Math.min(100, Math.max(1, count));
    const list = Array.from({ length: n }, () => uuidv4());
    setBatch(list);
  };

  const allUuids = batch.join('\n');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UUID 生成器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          生成 UUID v4 唯一标识符，支持批量生成（1-100 个）
        </p>
      </div>

      <ToolLayout
        input={
          <ToolSection title="单个生成">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-gray-50 px-4 py-3 font-mono text-sm dark:bg-gray-800">
                  {single}
                </code>
                <CopyButton text={single} />
              </div>
              <button type="button" className="btn-primary" onClick={generateSingle}>
                <RefreshCw className="h-4 w-4" />
                生成
              </button>
            </div>
          </ToolSection>
        }
        output={
          <ToolSection
            title="批量生成"
            actions={batch.length > 0 ? <CopyButton text={allUuids} label="复制全部" /> : undefined}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-400">数量</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                  className="input-field w-24"
                />
                <button type="button" className="btn-primary" onClick={generateBatch}>
                  批量生成
                </button>
              </div>

              {batch.length > 0 && (
                <ul className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  {batch.map((id, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <code className="truncate font-mono text-sm">{id}</code>
                      <CopyButton text={id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ToolSection>
        }
      />
    </div>
  );
}

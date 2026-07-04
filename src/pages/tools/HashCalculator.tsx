import { useState, useMemo } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { md5, sha1, sha256, hashFileContent } from '@/utils/crypto';
import { formatBytes } from '@/utils/format';

const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;

export default function HashCalculator() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fileHashes, setFileHashes] = useState<{ md5: string; sha1: string; sha256: string } | null>(
    null
  );
  const [warning, setWarning] = useState('');

  const textHashes = useMemo(() => {
    if (!text) return null;
    return { md5: md5(text), sha1: sha1(text), sha256: sha256(text) };
  }, [text]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setFileHashes(null);

    if (file.size > LARGE_FILE_THRESHOLD) {
      setWarning(`文件较大 (${formatBytes(file.size)})，哈希计算可能较慢，请耐心等待。`);
    } else {
      setWarning('');
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashes = hashFileContent(buffer);
      setFileHashes(hashes);
    } catch (err) {
      setWarning(err instanceof Error ? err.message : '文件读取失败');
    } finally {
      setLoading(false);
    }
  };

  const activeHashes = fileHashes ?? textHashes;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">哈希计算器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          实时计算文本或文件的 MD5、SHA-1、SHA-256 哈希值
        </p>
      </div>

      {warning && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
          {warning}
        </div>
      )}

      <ToolLayout
        input={
          <ToolSection title="输入">
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setFileHashes(null);
                  setFileName('');
                }}
                className="input-field min-h-[160px] resize-y font-mono"
                placeholder="输入文本，实时计算哈希..."
              />

              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-600 dark:hover:border-primary-500"
                >
                  <Upload className="h-5 w-5" />
                  {fileName ? `${fileName} (${formatBytes(fileSize)})` : '点击或拖拽上传文件'}
                </label>
              </div>
            </div>
          </ToolSection>
        }
        output={
          <ToolSection title="哈希结果">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                计算中...
              </div>
            ) : activeHashes ? (
              <div className="space-y-4">
                {(['md5', 'sha1', 'sha256'] as const).map((algo) => (
                  <div key={algo} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-gray-500">
                        {algo}
                      </span>
                      <CopyButton text={activeHashes[algo]} />
                    </div>
                    <code className="break-all font-mono text-sm">{activeHashes[algo]}</code>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-gray-400">
                输入文本或上传文件以计算哈希
              </div>
            )}
          </ToolSection>
        }
      />
    </div>
  );
}

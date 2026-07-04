import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ToolLayout, ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';
import { evaluatePasswordStrength, type PasswordStrength } from '@/utils/crypto';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

const strengthLabels: Record<PasswordStrength, { label: string; color: string }> = {
  weak: { label: '弱', color: 'text-red-500 bg-red-100 dark:bg-red-950' },
  medium: { label: '中', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950' },
  strong: { label: '强', color: 'text-green-600 bg-green-100 dark:bg-green-950' },
};

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [hasUpper, setHasUpper] = useState(true);
  const [hasLower, setHasLower] = useState(true);
  const [hasNumber, setHasNumber] = useState(true);
  const [hasSymbol, setHasSymbol] = useState(true);
  const [password, setPassword] = useState('');

  const generate = useCallback(() => {
    let pool = '';
    const required: string[] = [];

    if (hasUpper) {
      pool += UPPER;
      required.push(UPPER[Math.floor(Math.random() * UPPER.length)]);
    }
    if (hasLower) {
      pool += LOWER;
      required.push(LOWER[Math.floor(Math.random() * LOWER.length)]);
    }
    if (hasNumber) {
      pool += NUMBERS;
      required.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
    }
    if (hasSymbol) {
      pool += SYMBOLS;
      required.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }

    if (!pool) {
      setPassword('');
      return;
    }

    const chars: string[] = [...required];
    for (let i = chars.length; i < length; i++) {
      chars.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    setPassword(chars.join(''));
  }, [length, hasUpper, hasLower, hasNumber, hasSymbol]);

  const strength = password
    ? evaluatePasswordStrength(password, { hasUpper, hasLower, hasNumber, hasSymbol })
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">密码生成器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          自定义规则生成安全密码，并显示密码强度
        </p>
      </div>

      <ToolLayout
        input={
          <ToolSection title="配置">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">长度: {length}</label>
                </div>
                <input
                  type="range"
                  min={8}
                  max={32}
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value, 10))}
                  className="w-full accent-primary-600"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>8</span>
                  <span>32</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: '大写字母 (A-Z)', checked: hasUpper, set: setHasUpper },
                  { label: '小写字母 (a-z)', checked: hasLower, set: setHasLower },
                  { label: '数字 (0-9)', checked: hasNumber, set: setHasNumber },
                  { label: '符号 (!@#$...)', checked: hasSymbol, set: setHasSymbol },
                ].map(({ label, checked, set: setChecked }) => (
                  <label key={label} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <button type="button" className="btn-primary w-full" onClick={generate}>
                <RefreshCw className="h-4 w-4" />
                生成密码
              </button>
            </div>
          </ToolSection>
        }
        output={
          <ToolSection title="生成的密码" actions={<CopyButton text={password} />}>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 px-4 py-6 text-center dark:bg-gray-800">
                <code className="break-all font-mono text-lg">
                  {password || '点击"生成密码"'}
                </code>
              </div>

              {strength && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">密码强度</span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${strengthLabels[strength].color}`}
                  >
                    {strengthLabels[strength].label}
                  </span>
                </div>
              )}
            </div>
          </ToolSection>
        }
      />
    </div>
  );
}

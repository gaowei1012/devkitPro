import { useState, useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { Eye, EyeOff, ShieldAlert, Lightbulb } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { ToolSection } from '@/components/ToolLayout';

const SCORE_LEVELS = [
  { score: 0, label: '极弱', labelEn: 'Very Weak', light: '#ef4444', dark: '#f87171', width: '20%' },
  { score: 1, label: '弱', labelEn: 'Weak', light: '#f97316', dark: '#fb923c', width: '40%' },
  { score: 2, label: '一般', labelEn: 'Fair', light: '#eab308', dark: '#facc15', width: '60%' },
  { score: 3, label: '强', labelEn: 'Strong', light: '#22c55e', dark: '#4ade80', width: '80%' },
  { score: 4, label: '极强', labelEn: 'Very Strong', light: '#16a34a', dark: '#22c55e', width: '100%' },
] as const;

export default function PasswordStrength() {
  const { resolvedTheme } = useThemeStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const isEmpty = password.length === 0;

  const analysis = useMemo(() => {
    if (isEmpty) return null;
    return zxcvbn(password);
  }, [password, isEmpty]);

  const level = analysis ? SCORE_LEVELS[analysis.score] : null;
  const barColor = level ? (isDark ? level.dark : level.light) : isDark ? '#374151' : '#e5e7eb';
  const barWidth = level ? level.width : '0%';

  const crackTime = analysis?.crack_times_display?.offline_slow_hashing_1e4_per_second ?? '';
  const warning = analysis?.feedback?.warning ?? '';
  const suggestions = analysis?.feedback?.suggestions ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">密码强度检测器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          实时评估密码强度，提供破解时间估算与安全建议
        </p>
      </div>

      <ToolSection title="密码输入">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入要检测的密码..."
            className="input-field pr-12 font-mono"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            title={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </ToolSection>

      <div className="mt-6 space-y-6">
        {isEmpty ? (
          <div className="card flex min-h-[120px] items-center justify-center text-sm text-gray-400">
            请输入密码
          </div>
        ) : (
          <>
            <div className="card">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">密码强度</span>
                {level && (
                  <span
                    className="rounded-full px-3 py-0.5 text-sm font-semibold"
                    style={{
                      color: barColor,
                      backgroundColor: `${barColor}20`,
                    }}
                  >
                    {level.label} ({level.labelEn})
                  </span>
                )}
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: barWidth, backgroundColor: barColor }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>评分: {analysis?.score ?? 0} / 4</span>
                {crackTime && (
                  <span>
                    破解时间估算: <strong className="text-gray-700 dark:text-gray-300">{crackTime}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  警告信息
                </h3>
                {warning ? (
                  <p className="text-sm text-amber-700 dark:text-amber-400">{warning}</p>
                ) : (
                  <p className="text-sm text-gray-400">暂无警告</p>
                )}
              </div>

              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Lightbulb className="h-4 w-4 text-primary-500" />
                  优化建议
                </h3>
                {suggestions.length > 0 ? (
                  <ul className="space-y-1.5">
                    {suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">暂无建议</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">强度等级说明</h3>
              <div className="flex flex-wrap gap-2">
                {SCORE_LEVELS.map((lv) => (
                  <div
                    key={lv.score}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                      analysis?.score === lv.score
                        ? 'border-gray-300 bg-gray-100 font-semibold dark:border-gray-600 dark:bg-gray-800'
                        : 'border-transparent text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: isDark ? lv.dark : lv.light }}
                    />
                    {lv.label} — {lv.labelEn}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

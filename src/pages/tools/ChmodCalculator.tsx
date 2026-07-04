import { useState, useMemo, useCallback } from 'react';
import { ToolSection } from '@/components/ToolLayout';
import { CopyButton } from '@/components/CopyButton';

interface PermissionGroup {
  read: boolean;
  write: boolean;
  execute: boolean;
}

function groupToBits(group: PermissionGroup): number {
  return (group.read ? 4 : 0) + (group.write ? 2 : 0) + (group.execute ? 1 : 0);
}

function bitsToSymbol(bits: number): string {
  const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
  return map[bits] ?? '---';
}

function parseOctalDigit(digit: string): number {
  const n = parseInt(digit, 10);
  if (isNaN(n) || n < 0 || n > 7) return 0;
  return n;
}

function digitToGroup(digit: number): PermissionGroup {
  return {
    read: (digit & 4) !== 0,
    write: (digit & 2) !== 0,
    execute: (digit & 1) !== 0,
  };
}

function PermissionCheckboxes({
  label,
  group,
  onChange,
}: {
  label: string;
  group: PermissionGroup;
  onChange: (group: PermissionGroup) => void;
}) {
  const toggle = (key: keyof PermissionGroup) => {
    onChange({ ...group, [key]: !group[key] });
  };

  return (
    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <div className="mb-2 text-xs font-semibold text-gray-500">{label}</div>
      <div className="flex gap-4">
        {(['read', 'write', 'execute'] as const).map((perm) => (
          <label key={perm} className="flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={group[perm]}
              onChange={() => toggle(perm)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {perm === 'read' ? '读 (r)' : perm === 'write' ? '写 (w)' : '执行 (x)'}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ChmodCalculator() {
  const [user, setUser] = useState<PermissionGroup>({ read: true, write: true, execute: true });
  const [group, setGroup] = useState<PermissionGroup>({ read: true, write: false, execute: true });
  const [other, setOther] = useState<PermissionGroup>({ read: false, write: false, execute: false });

  const [octalInput, setOctalInput] = useState('755');

  const symbolResult = useMemo(() => {
    const u = groupToBits(user);
    const g = groupToBits(group);
    const o = groupToBits(other);
    const octal = `${u}${g}${o}`;
    const symbol = `${bitsToSymbol(u)}${bitsToSymbol(g)}${bitsToSymbol(o)}`;
    const command = `chmod ${octal} filename`;
    return { octal, symbol, command };
  }, [user, group, other]);

  const octalResult = useMemo(() => {
    const digits = octalInput.padEnd(3, '0').slice(0, 3);
    const u = parseOctalDigit(digits[0] ?? '0');
    const g = parseOctalDigit(digits[1] ?? '0');
    const o = parseOctalDigit(digits[2] ?? '0');
    const symbol = `${bitsToSymbol(u)}${bitsToSymbol(g)}${bitsToSymbol(o)}`;
    const command = `chmod ${u}${g}${o} filename`;
    return { symbol, command, u, g, o };
  }, [octalInput]);

  const handleOctalChange = useCallback((value: string) => {
    const filtered = value.replace(/[^0-7]/g, '').slice(0, 3);
    setOctalInput(filtered);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">chmod 权限计算器</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          符号权限与数字权限双向转换
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToolSection title="符号 → 数字">
          <div className="space-y-3">
            <PermissionCheckboxes label="User (所有者)" group={user} onChange={setUser} />
            <PermissionCheckboxes label="Group (用户组)" group={group} onChange={setGroup} />
            <PermissionCheckboxes label="Other (其他)" group={other} onChange={setOther} />

            <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <span className="text-xs text-gray-500">符号表示</span>
                <p className="font-mono text-lg tracking-widest">{symbolResult.symbol}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">数字权限</span>
                <p className="font-mono text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {symbolResult.octal}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">chmod 命令</span>
                <div className="mt-1 flex items-center justify-between">
                  <code className="font-mono text-sm">{symbolResult.command}</code>
                  <CopyButton text={symbolResult.command} />
                </div>
              </div>
            </div>
          </div>
        </ToolSection>

        <ToolSection title="数字 → 符号">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                数字权限 (三位 0-7)
              </label>
              <input
                type="text"
                value={octalInput}
                onChange={(e) => handleOctalChange(e.target.value)}
                placeholder="755"
                className="input-field font-mono text-2xl tracking-widest"
                maxLength={3}
              />
            </div>

            <div className="space-y-3">
              {[
                { label: 'User', perm: digitToGroup(octalResult.u) },
                { label: 'Group', perm: digitToGroup(octalResult.g) },
                { label: 'Other', perm: digitToGroup(octalResult.o) },
              ].map(({ label, perm }) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="mb-1 text-xs font-semibold text-gray-500">{label}</div>
                  <div className="font-mono text-sm tracking-wider">
                    {perm.read ? 'r' : '-'}
                    {perm.write ? 'w' : '-'}
                    {perm.execute ? 'x' : '-'}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <span className="text-xs text-gray-500">符号表示</span>
                <p className="font-mono text-lg tracking-widest">{octalResult.symbol}</p>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">chmod 命令</span>
                <div className="mt-1 flex items-center justify-between">
                  <code className="font-mono text-sm">{octalResult.command}</code>
                  <CopyButton text={octalResult.command} />
                </div>
              </div>
            </div>
          </div>
        </ToolSection>
      </div>
    </div>
  );
}

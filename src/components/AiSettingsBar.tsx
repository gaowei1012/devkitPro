import { useAiStore, type AiModel } from '@/stores/aiStore';

const models: { value: AiModel; label: string }[] = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4', label: 'GPT-4' },
];

export function AiSettingsBar() {
  const { apiKey, baseUrl, model, setApiKey, setBaseUrl, setModel } = useAiStore();

  return (
    <div className="card mb-6 space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 设置</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="input-field font-mono text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">API Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="input-field font-mono text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">模型</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as AiModel)}
            className="input-field"
          >
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        API Key 仅存储在浏览器 localStorage 中，不会发送到 DevKit Pro 服务器。
      </p>
    </div>
  );
}

export function requireApiKey(apiKey: string): boolean {
  if (!apiKey.trim()) {
    alert('请先在上方输入您的 OpenAI API Key');
    return false;
  }
  return true;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-07-04',
    features: ['上线 28 个开发者工具', '支持 AI 代码解释'],
  },
];

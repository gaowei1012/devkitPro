import { useState, useCallback, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Copy } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { ToolSection } from '@/components/ToolLayout';

type Tab = 'pomodoro' | 'lorem';

const WORK_OPTIONS = [15, 25, 30, 45];
const BREAK_OPTIONS = [5, 10];

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function generateLorem(paragraphs: number, wordCount?: number): string {
  if (wordCount) {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(LOREM_WORDS[i % LOREM_WORDS.length]);
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  }

  const result: string[] = [];
  for (let p = 0; p < paragraphs; p++) {
    const sentenceCount = 3 + Math.floor(Math.random() * 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const len = 8 + Math.floor(Math.random() * 12);
      const words: string[] = [];
      for (let w = 0; w < len; w++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      sentences.push(words.join(' ') + '.');
    }
    result.push(sentences.join(' '));
  }
  return result.join('\n\n');
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PomodoroLorem() {
  const [tab, setTab] = useState<Tab>('pomodoro');

  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isBreakRef = useRef(isBreak);
  const workMinutesRef = useRef(workMinutes);
  const breakMinutesRef = useRef(breakMinutes);

  useEffect(() => {
    isBreakRef.current = isBreak;
  }, [isBreak]);
  useEffect(() => {
    workMinutesRef.current = workMinutes;
  }, [workMinutes]);
  useEffect(() => {
    breakMinutesRef.current = breakMinutes;
  }, [breakMinutes]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  const [paragraphs, setParagraphs] = useState(3);
  const [wordCount, setWordCount] = useState(0);
  const [loremText, setLoremText] = useState('');
  const { copied, copy } = useClipboard();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);

            try {
              audioRef.current = new Audio(
                'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE='
              );
              void audioRef.current.play();
            } catch {
              // audio not supported
            }

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(isBreakRef.current ? '休息结束！' : '番茄钟完成！', {
                body: isBreakRef.current ? '该开始工作了' : '该休息一下了',
              });
            }

            if (isBreakRef.current) {
              setIsBreak(false);
              return workMinutesRef.current * 60;
            }
            setIsBreak(true);
            return breakMinutesRef.current * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const startPause = useCallback(() => setRunning((r) => !r), []);

  const reset = useCallback(() => {
    setRunning(false);
    setIsBreak(false);
    setSecondsLeft(workMinutes * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [workMinutes]);

  const handleWorkChange = useCallback((mins: number) => {
    setWorkMinutes(mins);
    if (!running && !isBreak) setSecondsLeft(mins * 60);
  }, [running, isBreak]);

  const generateLoremText = useCallback(() => {
    if (wordCount > 0) {
      setLoremText(generateLorem(0, Math.min(500, Math.max(10, wordCount))));
    } else {
      setLoremText(generateLorem(Math.min(20, Math.max(1, paragraphs))));
    }
  }, [paragraphs, wordCount]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">番茄钟 & Lorem Ipsum</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          专注计时器与占位文本生成
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(
          [
            { id: 'pomodoro' as Tab, label: '番茄钟', icon: Timer },
            { id: 'lorem' as Tab, label: 'Lorem Ipsum', icon: Copy },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pomodoro' && (
        <ToolSection title="番茄钟">
          <div className="flex flex-col items-center py-8">
            <div
              className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
                isBreak ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'
              }`}
            >
              {isBreak ? '休息时间' : '工作时间'}
            </div>
            <div className="mb-8 font-mono text-7xl font-bold tabular-nums text-gray-900 dark:text-white">
              {formatTime(secondsLeft)}
            </div>

            <div className="mb-6 flex gap-3">
              <button type="button" className="btn-primary" onClick={startPause}>
                {running ? (
                  <>
                    <Pause className="h-4 w-4" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    开始
                  </>
                )}
              </button>
              <button type="button" className="btn-secondary" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                重置
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <div>
                <label className="mb-2 block text-center text-xs text-gray-500">工作时长</label>
                <div className="flex gap-2">
                  {WORK_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleWorkChange(m)}
                      className={`rounded-lg px-3 py-1 text-sm ${
                        workMinutes === m
                          ? 'bg-primary-100 font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {m} 分
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-center text-xs text-gray-500">休息时长</label>
                <div className="flex gap-2">
                  {BREAK_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBreakMinutes(m)}
                      className={`rounded-lg px-3 py-1 text-sm ${
                        breakMinutes === m
                          ? 'bg-green-100 font-medium text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {m} 分
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ToolSection>
      )}

      {tab === 'lorem' && (
        <ToolSection
          title="Lorem Ipsum 生成"
          actions={
            loremText ? (
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => void copy(loremText)}
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? '已复制' : '复制'}
              </button>
            ) : undefined
          }
        >
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">段落数 (1-20)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={paragraphs}
                onChange={(e) => {
                  setParagraphs(Number(e.target.value));
                  setWordCount(0);
                }}
                className="input-field w-24"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">或单词数 (10-500)</label>
              <input
                type="number"
                min={0}
                max={500}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                placeholder="0 = 按段落"
                className="input-field w-32"
              />
            </div>
            <div className="flex items-end">
              <button type="button" className="btn-primary" onClick={generateLoremText}>
                生成
              </button>
            </div>
          </div>
          {loremText ? (
            <div className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {loremText.split('\n\n').map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-4' : ''}>
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">设置参数后点击「生成」</p>
          )}
        </ToolSection>
      )}
    </div>
  );
}

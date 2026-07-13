import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from '@/stores/toastStore';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({ text, className = '', label = '复制' }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  const handleClick = async () => {
    if (!text) return;

    const ok = await copy(text);
    if (ok) {
      toast.success('复制成功');
    } else {
      toast.error('复制失败');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!text}
      className={`btn-secondary text-xs ${className}`}
      title={copied ? '已复制' : label}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          已复制
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

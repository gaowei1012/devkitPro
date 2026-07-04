import CryptoJS from 'crypto-js';
import { hashFromWordArray } from '@/utils/crypto';

const CHUNK_SIZE = 2 * 1024 * 1024;

type ComputeMessage = {
  type: 'compute';
  file: File;
};

type WorkerOutMessage =
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'result'; hashes: { md5: string; sha1: string; sha256: string } }
  | { type: 'error'; message: string };

function arrayBufferToWordArray(buffer: ArrayBuffer): CryptoJS.lib.WordArray {
  const u8 = new Uint8Array(buffer);
  const words: number[] = [];
  for (let i = 0; i < u8.length; i++) {
    words[i >>> 2] |= u8[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(blob);
  });
}

async function hashFileInChunks(file: File): Promise<{ md5: string; sha1: string; sha256: string }> {
  let offset = 0;
  let wordArray = CryptoJS.lib.WordArray.create();

  while (offset < file.size) {
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    const buffer = await readAsArrayBuffer(slice);
    wordArray = wordArray.concat(arrayBufferToWordArray(buffer));
    offset += CHUNK_SIZE;

    const loaded = Math.min(offset, file.size);
    self.postMessage({
      type: 'progress',
      loaded,
      total: file.size,
    } satisfies WorkerOutMessage);
  }

  return hashFromWordArray(wordArray);
}

self.addEventListener('message', async (event: MessageEvent<ComputeMessage>) => {
  const { type, file } = event.data;
  if (type !== 'compute' || !file) return;

  try {
    const hashes = await hashFileInChunks(file);
    self.postMessage({
      type: 'result',
      hashes,
    } satisfies WorkerOutMessage);
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : '哈希计算失败',
    } satisfies WorkerOutMessage);
  }
});

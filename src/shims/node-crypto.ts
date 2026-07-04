import CryptoJS from 'crypto-js';

interface HashInstance {
  update(data: string): HashInstance;
  digest(encoding: 'hex'): string;
}

export function createHash(algorithm: string): HashInstance {
  let data = '';

  return {
    update(input: string) {
      data = input;
      return this;
    },
    digest(encoding: 'hex') {
      if (algorithm === 'md5' && encoding === 'hex') {
        return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);
      }
      throw new Error(`Unsupported hash: ${algorithm}/${encoding}`);
    },
  };
}

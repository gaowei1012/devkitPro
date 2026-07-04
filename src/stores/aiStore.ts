import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o-mini';

interface AiStore {
  apiKey: string;
  baseUrl: string;
  model: AiModel;
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: AiModel) => void;
}

export const useAiStore = create<AiStore>()(
  persist(
    (set) => ({
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (model) => set({ model }),
    }),
    {
      name: 'openai_api_key',
      partialize: (state) => ({
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        model: state.model,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type BodyMode = 'none' | 'json' | 'form';

export interface HeaderPair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestHistoryItem {
  method: HttpMethod;
  url: string;
  timestamp: number;
}

export interface ApiRequestState {
  method: HttpMethod;
  url: string;
  headers: HeaderPair[];
  bodyMode: BodyMode;
  body: string;
}

interface ApiHistoryStore {
  history: RequestHistoryItem[];
  currentRequest: ApiRequestState;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: HeaderPair[]) => void;
  addHeader: () => void;
  removeHeader: (id: string) => void;
  updateHeader: (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
  setBodyMode: (mode: BodyMode) => void;
  setBody: (body: string) => void;
  addToHistory: (method: HttpMethod, url: string) => void;
  loadFromHistory: (item: RequestHistoryItem) => void;
  resetRequest: () => void;
}

const defaultHeaders: HeaderPair[] = [
  { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
];

const defaultRequest: ApiRequestState = {
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  headers: defaultHeaders,
  bodyMode: 'none',
  body: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}',
};

let headerIdCounter = 2;

export const useApiHistoryStore = create<ApiHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      currentRequest: defaultRequest,

      setMethod: (method) =>
        set((s) => ({ currentRequest: { ...s.currentRequest, method } })),

      setUrl: (url) =>
        set((s) => ({ currentRequest: { ...s.currentRequest, url } })),

      setHeaders: (headers) =>
        set((s) => ({ currentRequest: { ...s.currentRequest, headers } })),

      addHeader: () =>
        set((s) => ({
          currentRequest: {
            ...s.currentRequest,
            headers: [
              ...s.currentRequest.headers,
              { id: String(++headerIdCounter), key: '', value: '', enabled: true },
            ],
          },
        })),

      removeHeader: (id) =>
        set((s) => ({
          currentRequest: {
            ...s.currentRequest,
            headers: s.currentRequest.headers.filter((h) => h.id !== id),
          },
        })),

      updateHeader: (id, field, value) =>
        set((s) => ({
          currentRequest: {
            ...s.currentRequest,
            headers: s.currentRequest.headers.map((h) =>
              h.id === id ? { ...h, [field]: value } : h
            ),
          },
        })),

      setBodyMode: (bodyMode) =>
        set((s) => ({ currentRequest: { ...s.currentRequest, bodyMode } })),

      setBody: (body) =>
        set((s) => ({ currentRequest: { ...s.currentRequest, body } })),

      addToHistory: (method, url) => {
        const item: RequestHistoryItem = { method, url, timestamp: Date.now() };
        set((s) => {
          const filtered = s.history.filter(
            (h) => !(h.method === method && h.url === url)
          );
          return { history: [item, ...filtered].slice(0, 5) };
        });
      },

      loadFromHistory: (item) => {
        set((s) => ({
          currentRequest: {
            ...s.currentRequest,
            method: item.method,
            url: item.url,
          },
        }));
      },

      resetRequest: () => set({ currentRequest: defaultRequest }),
    }),
    {
      name: 'devkit-api-history',
      partialize: (state) => ({ history: state.history }),
    }
  )
);

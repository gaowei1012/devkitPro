import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore } from './searchStore';

describe('searchStore', () => {
  beforeEach(() => {
    useSearchStore.setState({ isOpen: false, query: '' });
  });

  it('starts closed with empty query', () => {
    const state = useSearchStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe('');
  });

  it('opens search palette', () => {
    useSearchStore.getState().open();
    expect(useSearchStore.getState().isOpen).toBe(true);
  });

  it('closes and clears query', () => {
    useSearchStore.getState().open();
    useSearchStore.getState().setQuery('json');
    useSearchStore.getState().close();

    const state = useSearchStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe('');
  });

  it('updates query', () => {
    useSearchStore.getState().setQuery('base64');
    expect(useSearchStore.getState().query).toBe('base64');
  });
});

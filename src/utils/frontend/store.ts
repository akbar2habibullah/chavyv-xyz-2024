"use client"

import { create } from "zustand";

interface ErrorState {
  error: string | null;
  setError: (error: string | null) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));

export const logError = (error: string | Error) => {
  const message = error instanceof Error ? error.message : error;
  useErrorStore.getState().setError(message);
};
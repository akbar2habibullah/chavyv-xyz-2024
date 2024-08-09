"use client"

export const localStorageUtils = {
  // Store data in localStorage
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error storing data in localStorage:', error)
    }
  },

  // Retrieve data from localStorage
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error)
      return null
    }
  },

  // Remove data from localStorage
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing data from localStorage:', error)
    }
  },

  // Clear all data from localStorage
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}
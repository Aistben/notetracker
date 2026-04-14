import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function setLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getRawLocalStorage(key: string) {
  return localStorage.getItem(key)
}

export function setRawLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
}

export function removeLocalStorage(key: string) {
  localStorage.removeItem(key)
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => getLocalStorage(key, initialValue))

  useEffect(() => {
    setLocalStorage(key, storedValue)
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

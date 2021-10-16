import {useState} from 'react';

export const useLocalStorage = <T = any>(key: string, initialValue: T): [T, (arg: T) => void] => {

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      setValue(initialValue);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore =
              value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

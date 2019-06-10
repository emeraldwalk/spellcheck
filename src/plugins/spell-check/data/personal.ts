import { useState } from "react";

/**
 * Naive implementation of personal dictionary in local storage. In practice
 * this should be a secure / persistent storage since users might add sensitive
 * words such as patient names to their lists.
 */

const key = 'DICTIONARY_INCLUDES';

// HACK: There's an issue with strategy function trying to get most recent
// dictionary from the instance created by useSate(). This impacts clearing
// the cache not updating the decorator until page refresh. Until I can figure
// this out, just keeping most recent instance here.
let hack: Record<string, number>;
export function getDictionaryHack(): Record<string, number> {
  return hack;
}

export function usePersonalDictionary() {
  const raw = localStorage.getItem(key) || '{}';
  let [dictionary, setDictionary] = useState<Record<string, number>>(
    JSON.parse(raw) as Record<string, number>
  );

  hack = dictionary;

  function clearDictionary(): void {
    localStorage.removeItem(key);
    setDictionary({});
  }

  function putInDictionary(
    word: string
  ): void {
    dictionary[word] = 1;
    setDictionary({
      ...dictionary
    });
    localStorage.setItem(key, JSON.stringify(dictionary));
  }

  return {
    clearDictionary,
    dictionary,
    putInDictionary
  };
}
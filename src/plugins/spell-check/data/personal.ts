const key = 'DICTIONARY_INCLUDES';

export function getPersonalDictionary(): Record<string, number> {
  const raw = localStorage.getItem(key) || '{}';
  return JSON.parse(raw);
}

export function setInPersonalDictionary(
  word: string
) {
  const words = getPersonalDictionary();
  words[word] = 1;
  localStorage.setItem(key, JSON.stringify(words));
}
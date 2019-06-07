import { SpellCheckResult } from "./context";
import { wordsEndpoint } from "../../config";

export async function fetchWords(
  words: string[]
): Promise<SpellCheckResult> {
  if(words.length === 0) {
    return {};
  }

  const response = await fetch(wordsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ words })
  });

  const data: Record<string, 1 | 0> = await response.json();

  console.log(data);

  return Object.keys(data).reduce((memo, word) => {
    memo[word] = data[word]
      ? {
        isValid: true
      }
      : {
        isValid: false,
        suggestions: [
          'aaa', 'bbb', 'ccc'
        ]
      };
    return memo;
  }, {} as SpellCheckResult);

  // const result: string[] = ['This']; //words.slice();
  // return words.reduce((memo, word) => {
  //   return {
  //     ...memo,
  //     [word]: result.indexOf(word) > -1
  //   };
  // }, {} as Record<string, boolean>);
}
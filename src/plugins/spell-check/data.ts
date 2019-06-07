import { SpellCheckResult } from "./context";
import { cognitoPoolId, spellingWordsTable } from "../../config";

import AWS from 'aws-sdk';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoPoolId,
});

const db = new AWS.DynamoDB();

export async function fetchWords(
  words: string[]
): Promise<SpellCheckResult> {
  const results: number[] = await Promise.all(
    words.map(async word => {
      const pk = hashKey(word);
      const result = await db.query({
        KeyConditionExpression: 'pk = :pk and sk = :sk',
        ExpressionAttributeValues: {
          ':pk': { S: pk },
          ':sk': { S: word }
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: spellingWordsTable
      }).promise();
      return result.Count || 0;
    })
  );

  const map = results.reduce((memo, cur, i) => {
    memo[words[i]] = cur > 0
      ? {
        isValid: true
      }
      : {
        isValid: false,
        suggestions: ['aaa', 'bbb', 'ccc']
      };

    return memo;
  }, {} as SpellCheckResult);

  return map;
}

function hashKey(
  word: string
) {
  const max = 8;

  for(let i = max; i >= 4; i-=2) {
    if(i <= word.length) {
      return word.substr(0, i - 2);
    }
  }

  return word.substr(0, max);
}

// export async function fetchWords(
//   words: string[]
// ): Promise<SpellCheckResult> {
//   if(words.length === 0) {
//     return {};
//   }

//   const response = await fetch(wordsEndpoint, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ words })
//   });

//   const data: Record<string, 1 | 0> = await response.json();

//   console.log(data);

//   return Object.keys(data).reduce((memo, word) => {
//     memo[word] = data[word]
//       ? {
//         isValid: true
//       }
//       : {
//         isValid: false,
//         suggestions: [
//           'aaa', 'bbb', 'ccc'
//         ]
//       };
//     return memo;
//   }, {} as SpellCheckResult);

//   // const result: string[] = ['This']; //words.slice();
//   // return words.reduce((memo, word) => {
//   //   return {
//   //     ...memo,
//   //     [word]: result.indexOf(word) > -1
//   //   };
//   // }, {} as Record<string, boolean>);
// }
import { cognitoPoolId, spellingWordsTable } from "../../config";

import AWS from 'aws-sdk';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoPoolId,
});

const client = new AWS.DynamoDB.DocumentClient();

export async function bulkGetExactMatches(
  words: string[]
): Promise<Record<string, boolean>> {
  const wordsUnique = words.reduce((memo, word) => {
    memo[word] = false;
    return memo;
  }, {} as Record<string, boolean>);

  const keys: AWS.DynamoDB.DocumentClient.KeyList = Object
    .keys(wordsUnique)
    .map(word => ({
      pk: word.toLowerCase(),
      sk: word
    }));

  const query: AWS.DynamoDB.DocumentClient.BatchGetItemInput = {
    RequestItems: {
      [spellingWordsTable]: {
        Keys: keys,
        ProjectionExpression: 'pk,sk',
      },
    },
    ReturnConsumedCapacity: 'TOTAL',
  };

  const result = await client.batchGet(
    query
  ).promise();

  result.Responses![spellingWordsTable].forEach(item => {
    wordsUnique[item.sk] = true;
  });

  return wordsUnique;
}

export async function fetchSuggestions(
  word: string
) {
  const search = [word];

  if(word.length > 1) {
    search.push(...deleteDistance(1, word));
  }
  // TODO: If I can get better word frequency data to better sort results
  // pulling edit distance 2 might be worthwhile
  // if(word.length > 2) {
  //   search.push(...deleteDistance(2, word));
  // }

  console.log('search:', search);

  const queries: AWS.DynamoDB.DocumentClient.QueryInput[] = search
    .map(word => ({
      ExpressionAttributeValues: {
        ':pk': word
      },
      KeyConditionExpression: 'pk = :pk',
      ReturnConsumedCapacity: 'TOTAL',
      TableName: spellingWordsTable
    }));

  const results = await Promise.all(
    queries.map(q => client.query(q).promise())
  );

  const suggestions: Record<string, number> = {};

  results
    .map(r => r.Items)
    .flat()
    .forEach((item: { tk: string }) => {
      if('tk' in item) {
        console.log(item.tk);
        suggestions[item.tk] = 1;
      }
    });

  console.log(suggestions);

  return Object.keys(suggestions);
}

// export async function bulkQuery(
//   words: string[]
// ) {
//   const caseMap = words.reduce((memo, word) => {
//     memo[word.toLowerCase()] = word;
//     return memo;
//   }, {} as Record<string, string>);

//   const queries: AWS.DynamoDB.DocumentClient.QueryInput[] = Object.keys(caseMap)
//     .map(word => ({
//       ExpressionAttributeValues: {
//         ':pk': word
//       },
//       KeyConditionExpression: 'pk = :pk',
//       ReturnConsumedCapacity: 'TOTAL',
//       TableName: spellingWordsTable
//     }));

//   const results = await Promise.all(
//     queries.map(q => client.query(q).promise())
//   );

//   console.log('results:', results);

//   type Item = {
//     WORD?: string
//     CASE: string[],
//     MISS: string[]
//   };

//   const items = results
//     .map(r => r.Items as { pk: string, sk: string, tk: 'WORD' | 'CASE' | 'MISS' }[])
//     .flat()
//     .reduce((memo, item) => {
//       const word = caseMap[item.pk] || item.pk;

//       memo[word] = memo[word] || {
//         CASE: [],
//         MISS: []
//       };

//       if(item.tk === 'WORD') {
//         if(word === item.pk) {
//           memo[word][item.tk] = item.pk;
//         }
//         else {
//           memo[word]['CASE'].push(item.pk);
//         }
//       }
//       else {
//         memo[word][item.tk].push(item.sk);
//       }

//       return memo;
//     }, {} as Record<string, Item>);

//   // const phase2 = words.filter(
//   //   word => {
//   //     if(word in items) {
//   //       if('WORD' in items[word]) {
//   //         return false;
//   //       }
//   //     }

//   //     return true;
//   //   }
//   // );

//   // console.log(phase2);

//   // console.log(
//   //   deleteDistance(
//   //     1,
//   //     ...phase2
//   //   )
//   // );

//   return items;
// }

// export async function checkSpelling(
//   words: string[]
// ): Promise<SpellCheckResult> {
//   const results = await fetchWords(words, true);

//   // any words with capital letters could potentially match
//   // suggestions tied to lowercase pk
//   const lowerCaseCandidates = Object.keys(results)
//     .filter(word => !results[word].isValid);

//   for(const word of lowerCaseCandidates) {
//     const lc = word.toLowerCase();

//     const suggestionCandidates = [lc];
//     if(lc.length > 1) {
//       suggestionCandidates.push(
//         ...deleteDistance(
//           1,
//           lc
//         )
//       );
//     }

//     console.log('suggestionCandidates1:', suggestionCandidates);

//     const suggestions = await fetchWords(suggestionCandidates, false);

//     for(const s in suggestions) {
//       const result = suggestions[s];

//       if(result.isValid) {
//         if(s === lc) {
//           (results[word] as { suggestions: string[]} ).suggestions.unshift(s);
//         }
//         else {
//           (results[word] as { suggestions: string[]} ).suggestions.push(s);
//         }
//       }
//       else {
//         (results[word] as { suggestions: string[]} ).suggestions.push(
//           ...result.suggestions
//         );
//       }
//     }

//     console.log('result:', word, (results[word] as { suggestions: string[]} ).suggestions);
//   }

//   return results;
// }

// export async function fetchWords(
//   words: string[],
//   exactMatch: boolean
// ): Promise<SpellCheckResult> {
//   const results: AWS.DynamoDB.QueryOutput[] = await Promise.all(
//     words.map(async word => {
//       const pk = word; //.toLowerCase(); // TODO: may need to be smarter than this, but it should catch all cases since words with capital letters also have spelling suggestions mapped to lower case misspelling
//       const result = await db.query({
//         KeyConditionExpression: exactMatch
//           ? 'pk = :pk and sk = :sk'
//           : 'pk = :pk',
//         ExpressionAttributeValues: exactMatch
//           ? {
//             ':pk': { S: pk },
//             ':sk': { S: word }
//           }
//           : {
//             ':pk': { S: pk }
//           },
//         ReturnConsumedCapacity: 'TOTAL',
//         TableName: spellingWordsTable
//       }).promise();
//       return result;
//     })
//   );

//   const map = results.reduce((memo, cur, i) => {
//     const items = cur.Items!.map(i => ({
//       pk: i.pk.S!,
//       sk: i.sk.S!
//     }));

//     if(items.find(item => item.sk === words[i])) {
//       memo[words[i]] = {
//         isValid: true
//       };
//     }
//     else {
//       const miss = memo[words[i]] = {
//         isValid: false,
//         suggestions: [] as string[]
//       };

//       items.forEach(item => {
//         miss.suggestions.push(item.sk);
//       });
//     }

//     return memo;
//   }, {} as SpellCheckResult);

//   console.log(map);

//   return map;
// }

/**
 * Given a list of words, returns a list of words that are the given delete / edit
 * distance from each word.
 *
 * e.g.
 * For an edit distance of 1, given the word 'the', results would be
 * 'he', 'te', 'he'
 *
 * An edit distance of 2 for 'the' would return the edit distance 1 results
 * for each of 'he', 'te', 'he' which would be 'e', 'h', 't'
 */
export function deleteDistance(
  distance: number,
  ...words: Array<string>
): string[] {
  const unique: Record<string, number> = {};

  words.forEach(word => {
    word = word.toLowerCase();

    for(let i = 0; i < word.length; ++i) {
      const result = word.slice(0, i) + word.slice(i + 1, word.length);
      unique[result] = 1;
    }
  });

  if(distance <= 1) {
    return Object.keys(unique);
  }

  return deleteDistance(distance - 1, ...Object.keys(unique));
}
import { cognitoPoolId, spellingWordsTable } from "../../config";

import AWS from 'aws-sdk';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoPoolId,
});

const client = new AWS.DynamoDB.DocumentClient();

/**
 * Look for exact spellings of given words.
 */
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

/**
 * Get suggestions for a given list of misspelled words.
 */
export async function fetchSuggestions(
  word: string
): Promise<string[]> {
  const search = [word];

  if(word.length > 1) {
    const deleteDistance1 = createDeleteDistance1(word);
    search.push(...deleteDistance1);

    // TODO: If I can get better word frequency data to better sort results
    // pulling edit distance 2 might be worthwhile
    // if(word.length > 2) {
    //   const deleteDistance2 = createDeleteDistance1(...deleteDistance1);
    //   search.push(...deleteDistance2);
    // }
  }

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
        suggestions[item.tk] = 1;
      }
    });

  return Object.keys(suggestions);
}

/**
 * Given a list of words, returns a list of words that are the given delete / edit
 * distance from each word.
 *
 * e.g.
 * Given the word 'the', results would be
 * 'he', 'te', 'he'
 *
 * An edit distance of 2 can be calculated by passing the results into another
 * call.
 *
 * e.g.
 * 'he', 'te', 'he' would produce 'e', 'h', 't'
 */
export function createDeleteDistance1(
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

  return Object.keys(unique);
}
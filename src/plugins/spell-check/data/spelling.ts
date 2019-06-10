import AWS from 'aws-sdk';
import { cognitoPoolId, spellingWordsTable } from "../../../config";
import { createDeleteDistance1 } from "./util";

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoPoolId,
});

const client = new AWS.DynamoDB.DocumentClient();

/**
 * Look for exact spellings of given words.
 * TODO: DynamoDB batch get has a limit of 100 results, so will
 * need to account for this via paging results for longer text
 * content.
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
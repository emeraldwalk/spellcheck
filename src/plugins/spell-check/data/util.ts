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
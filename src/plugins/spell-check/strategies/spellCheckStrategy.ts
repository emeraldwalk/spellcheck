import {
  ContentBlock,
} from 'draft-js';
import { Context } from '../context';
import { bulkGetExactMatches } from '../data/spelling';

/**
 * Factory for spellcheck strategy.
 */
export function createSpellCheckStrategy(
  getContext: () => Context,
  getPersonalDictionary: () => Record<string, number>
) {
  let timeout: Record<string, ReturnType<typeof setTimeout>> = {
  };

  return function spellCheckStrategy (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void
  ) {
    const blockKey = contentBlock.getKey();
    clearTimeout(timeout[blockKey]);

    const context = getContext();

    const regEx = /([\w]+)([\s.]|$)/g;
    const text = contentBlock.getText();

    let match;
    const toFetch: string[] = [];

    while((match = regEx.exec(text))) {
      const start = match.index;
      const word = match[1];
      const end = start + word.length;

      if(word in getPersonalDictionary()) {
        continue;
      }
      // if word has already been checked
      else if(word in context.words) {
        // missspellings
        if(!context.words[word]) {
          callback(start, end);
        }
      }
      // word hasn't been checked
      else {
        toFetch.push(word);
      }
    }

    // Fetch any words that haven't already been checked
    if(toFetch.length > 0) {
      timeout[blockKey] = setTimeout(async () => {

        const results = await bulkGetExactMatches(toFetch);

        context.words = {
          ...context.words,
          ...results
        };

        getContext().reapplyDecorators();
      }, 1000);
    }
  }
}
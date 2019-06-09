import {
  ContentBlock,
} from 'draft-js';
import { Context } from './context';
import { bulkGetExactMatches } from './data';

export function createSpellCheckStrategy(
  getContext: () => Context
) {
  let timeout: ReturnType<typeof setTimeout>;

  return function spellCheckStrategy (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void
  ) {
    clearTimeout(timeout);

    const context = getContext();

    const regEx = /([\w]+)([\s.]|$)/g;
    const text = contentBlock.getText();

    let match;
    const toFetch: string[] = [];
    while((match = regEx.exec(text))) {
      const start = match.index;
      const word = match[1];
      //  = start === 0
      //   ? match[1].toLowerCase() // ignore casing on first word TODO: need to account for sentence starts
      //   : match[1];

      const end = start + word.length;

      if(word in context.words) {
        if(!context.words[word]) {
          callback(start, end);
        }
      }
      else {
        toFetch.push(word);
      }
    }

    if(toFetch.length > 0) {
      timeout = setTimeout(async () => {

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
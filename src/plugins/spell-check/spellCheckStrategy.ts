import {
  ContentBlock,
} from 'draft-js';
import { Context } from './context';
import { fetchWords } from './data';

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
      const word = match[1];
      const start = match.index;
      const end = start + word.length;

      if(word in context.words) {
        const wordDetails = context.words[word];
        if(!wordDetails.isValid) {
          callback(start, end);
        }
      }
      else {
        toFetch.push(word);
      }
    }

    if(toFetch.length > 0) {
      timeout = setTimeout(async () => {

        const result = await fetchWords(toFetch);

        context.words = {
          ...context.words,
          ...result
        };

        console.log(context.words);

        getContext().reapplyDecorators();
      }, 1000);
    }
  }
}
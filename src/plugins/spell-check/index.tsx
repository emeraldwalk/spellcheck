import { RichUtils } from 'draft-js';
import {
  Plugin, PluginContext,
} from 'draft-js-plugins-editor';

import {
  createSpellCheckDecoratorComponent,
  createSuggestionsComponent
} from './components';
import { createSpellCheckStrategy } from './strategies/spellCheckStrategy';
import { Context, createContext } from './context';
import { bulkGetExactMatches } from './data/spelling';

export type SpellCheckPlugin = ReturnType<typeof createSpellCheckPlugin>;

function createSpellCheckPlugin(
  getPersonalDictionary: () => Record<string, number>
): Plugin & { SuggestionsComponent: ReturnType<typeof createSuggestionsComponent> } {

  let context: Context;

  const spellCheckStrategy = createSpellCheckStrategy(
    () => context,
    getPersonalDictionary
  );

  const decorators = [
    {
      component: createSpellCheckDecoratorComponent(
        () => context
      ),
      strategy: spellCheckStrategy,
    }
  ];

  return {
    SuggestionsComponent: createSuggestionsComponent(
      () => context
    ),
    // customStyleMap: {
    //   'HIGHLIGHT': {
    //     background: 'blue',
    //     color: 'white'
    //   }
    // },
    decorators,
    initialize: (ctx: PluginContext) => {
      // seeding with a few common words (mostly to make an initial request to Cognito to make subsequent calls faster)
      context = createContext(ctx, bulkGetExactMatches(['a', 'an', 'the']));
    },
    // keyBindingFn: e => {
    //   if(e.metaKey && e.key === 'h') {
    //     return 'highlight'
    //   }
    // },
    // handleKeyCommand: (cmd, editorState, { setEditorState }) => {
    //   if(cmd === 'highlight') {
    //     setEditorState(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT'));
    //     return true;
    //   }
    // },
    handleKeyCommand: (cmd, editorState, { setEditorState }) => {
      const newEditorState = RichUtils.handleKeyCommand(editorState, cmd);
      if(newEditorState) {
        setEditorState(newEditorState);
        return true;
      }
    },
    // onChange: function (editorState) {
    //   return editorState;
    // }
  };
}

export {
  createSpellCheckPlugin
};
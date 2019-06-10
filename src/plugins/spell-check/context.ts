import { PluginContext } from 'draft-js-plugins-editor';
import { SelectionState } from 'draft-js';
import { reapplyDecorators } from '../utils';

export type Context = ReturnType<typeof createContext>;
export interface ShowSuggestionArgs {
  x: number;
  y: number;
  selection: SelectionState;
  suggestions: string[];
  text: string;
}
export type SpellCheckResult = Record<string, boolean>;
export interface ShowSuggestions {
  (args: ShowSuggestionArgs): void;
}

/**
 * Creates a context instance that can be shared betwen components and
 * services in the plugin.
 */
export function createContext(
  initContext: PluginContext,
  initialDictionary: Promise<SpellCheckResult>
) {
  const context = {
    ...initContext,
    reapplyDecorators() {
      reapplyDecorators(context);
    },
    showSuggestions: undefined as ShowSuggestions | undefined,
    suggestions: {} as Record<string, string[]>,
    words: {} as SpellCheckResult,
  };

  initialDictionary.then(seed => {
    context.words = {
      ...context.words,
      ...seed
    }
  })

  return context;
}
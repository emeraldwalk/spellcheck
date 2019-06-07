import { PluginContext } from 'draft-js-plugins-editor';
import { reapplyDecorators } from '../utils';

export type Context = ReturnType<typeof createContext>;
export type SpellCheckResult = Record<
  string,
  { isValid: true } | { isValid: false, suggestions: string[] }
>;

export function createContext(
  initContext: PluginContext
) {
  const context = {
    ...initContext,
    reapplyDecorators() {
      reapplyDecorators(context);
    },
    showSuggestions: undefined as ((suggestions: string[]) => void) | undefined,
    words: {} as SpellCheckResult
  };

  return context;
}
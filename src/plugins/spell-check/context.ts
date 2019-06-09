import { PluginContext } from 'draft-js-plugins-editor';
import { reapplyDecorators } from '../utils';

export type Context = ReturnType<typeof createContext>;
export type SpellCheckResult = Record<string, boolean>;

/**
 * Creates a context instance that can be shared betwen components and
 * services in the plugin.
 */
export function createContext(
  initContext: PluginContext
) {
  const context = {
    ...initContext,
    reapplyDecorators() {
      reapplyDecorators(context);
    },
    showSuggestions: undefined as ((suggestions: string[]) => void) | undefined,
    suggestions: {} as Record<string, string[]>,
    words: {} as SpellCheckResult,
  };

  return context;
}
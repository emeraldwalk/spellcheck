import React from 'react';
import { Dictionary, Editor } from '..';
import { createSpellCheckPlugin, SpellCheckPlugin } from '../../plugins/spell-check';
import { getDictionaryHack, usePersonalDictionary } from '../../plugins/spell-check/data/personal';

// define outside of component so we can have a single instance
let spellCheckPlugin: SpellCheckPlugin;

const App: React.FC = () => {
  const { clearDictionary, dictionary, putInDictionary } = usePersonalDictionary();

  // NOTE: we only ever want 1 instance of the plugin
  if(!spellCheckPlugin) {
    spellCheckPlugin = createSpellCheckPlugin(
      getDictionaryHack
    );
  }

  return (
    <div className="c_app">
      <h1>Draft.js Spellcheck Demo</h1>
      <Editor
        putInDictionary={putInDictionary}
        spellCheckPlugin={spellCheckPlugin!}
        />
      <Dictionary
        clearDictionary={clearDictionary}
        dictionary={dictionary}
      />
    </div>
  );
};

export default App;

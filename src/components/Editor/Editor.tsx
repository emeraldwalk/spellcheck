import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import DraftEditor from 'draft-js-plugins-editor';
import { SpellCheckPlugin } from '../../plugins/spell-check';

export interface EditorProps {
  putInDictionary: (word: string) => void,
  spellCheckPlugin: SpellCheckPlugin
}

const Editor: React.SFC<EditorProps> = ({
  putInDictionary,
  spellCheckPlugin
}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  return (
    <div className="c_editor">
      <DraftEditor
        editorState={editorState}
        onChange={editorState => setEditorState(editorState)}
        placeholder="Enter content. Right-click on misspelled words to show context menu."
        plugins={[spellCheckPlugin]}
      />
      <spellCheckPlugin.SuggestionsComponent
        putInDictionary={putInDictionary}
      />
    </div>
  );
};

export default Editor;
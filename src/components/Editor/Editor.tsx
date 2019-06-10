import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import DraftEditor from 'draft-js-plugins-editor';
import { createSpellCheckPlugin } from '../../plugins/spell-check';

const spellCheckPlugin = createSpellCheckPlugin();

export interface EditorProps {
}

const Editor: React.SFC<EditorProps> = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  return (
    <div className="c_editor">
      <DraftEditor
        editorState={editorState}
        onChange={editorState => setEditorState(editorState)}
        placeholder="Enter content..."
        plugins={[spellCheckPlugin]}
      />
      <spellCheckPlugin.SuggestionsComponent/>
    </div>
  );
};

export default Editor;
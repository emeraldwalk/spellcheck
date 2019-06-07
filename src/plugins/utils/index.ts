import { CompositeDecorator, EditorState } from "draft-js";
import { PluginContext } from "draft-js-plugins-editor";

export function reapplyDecorators(
  context: PluginContext
): void {
  const decorators = context.getPlugins()
    .map(p => p.decorators)
    .flat();

  const editorState = setDecorator(
    context.getEditorState(),
    new CompositeDecorator(decorators)
  );

  context.setEditorState(
    editorState
  );
}

/**
 * Helper to update the decorator on an editor instance.
 * Clears the current decorator first.
 * @param editorState
 * @param decorator
 */
export function setDecorator(
  editorState: EditorState,
  decorator: CompositeDecorator
): EditorState {
  // clear current decorators
  editorState = EditorState.set(
    editorState,
    { decorator: null }
  );

  editorState = EditorState.set(
    editorState,
    { decorator }
  );

  return editorState;
}
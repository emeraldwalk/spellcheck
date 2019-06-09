import {
  CompositeDecorator,
  EditorState,
  Modifier,
  SelectionState,
} from "draft-js";
import { PluginContext, DecoratorComponentChild } from "draft-js-plugins-editor";

/**
 * Calculate an HTML element's position relative to the document.
 */
export function calculatePosition(
  el: HTMLElement
): { x: number, y: number } {
  const { top, left } = el.getBoundingClientRect();
  const winX = window.pageXOffset || document.documentElement.scrollLeft;
  const winY = window.pageYOffset || document.documentElement.scrollTop;

  return {
    x: left + winX,
    y: top + winY
  };
}

/**
 * Create selection state for a block with given start and end position.
 */
export function createSelectionState(
  blockKey: string,
  start: number,
  end: number
) {
  return SelectionState
    .createEmpty(blockKey)
    .merge({
      anchorOffset: start,
      focusOffset: end
    }) as SelectionState
}

/**
 * Decorator components receive a children prop that contains
 * a start index on the props of the first item.
 */
export function getDecoratorRange({ child, decoratedText }: {
  child: DecoratorComponentChild,
  decoratedText: string
}): { start: number, end: number } {
  const start = child.props.start || 0;
  const end = start + decoratedText.length;

  return {
    start,
    end
  };
}

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

export function replaceText(
  editorState: EditorState,
  selection: SelectionState,
  text: string
): EditorState {
  let contentState = editorState.getCurrentContent();
  contentState = Modifier.replaceText(
    contentState,
    selection,
    text
  );

  return EditorState.push(
    editorState,
    contentState,
    'change-block-data'
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
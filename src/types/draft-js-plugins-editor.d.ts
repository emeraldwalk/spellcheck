module 'draft-js-plugins-editor' {
  import React from 'react';
  import {
    CompositeDecorator,
    ContentBlock,
    DraftEditorCommand,
    Editor,
    EditorProps,
    EditorState,
  } from 'draft-js';

  interface PluginEditorProps extends EditorProps {
    plugins: Plugin[]
  }

  class PluginEditor extends React.Component<PluginEditorProps, {}> {
    blur(): void;
    focus(): void;
  }

  export { PluginEditor as default };

  export interface PluginContext {
    getEditorRef: () => PluginEditor,
    getEditorState: () => EditorState,
    getPlugins: () => Plugin[],
    getProps: () => unknown,
    getReadOnly: () => boolean,
    setEditorState: (editorState: EditorState) => void,
    setReadOnly: (readOnly: boolean) => void,
  }

  type FirstArgument<T> = T extends new (a: Array<infer U>) => any ? U : any;

  type Decorator = FirstArgument<typeof CompositeDecorator>;

  export type DecoratorComponentChild = React.ReactElement<{
    block: ContentBlock,
    start: number
  }>;

  export interface DecoratorComponentProps {
    children: [ DecoratorComponentChild ],
    contentState: ContentState,
    decoratedText: string,
    getEditorState: () => EditorState,
    setEditorState: (editorState: EditorState) => void,
  }

  export interface Plugin extends Partial<EditorProps> {
    customStyleMap?: Record<string, Record<string, string>>,
    decorators?: Decorator[],
    initialize?: (context: PluginContext) => void,
    keyBindingFn?: (e: React.KeyboardEvent<{}>) => string | undefined,
    handleKeyCommand?: (
      command: string,
      editorState: EditorState,
      context: PluginContext
    ) => boolean | undefined,
    onChange?: (
      editorState: EditorState,
      context: PluginContext
    ) => EditorState,
  }
}
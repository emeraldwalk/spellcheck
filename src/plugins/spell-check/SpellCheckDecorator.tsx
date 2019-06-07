import React, { useRef } from 'react';
import {
  DecoratorComponentProps,
} from 'draft-js-plugins-editor';
import { Context } from './context';

export interface SpellCheckDecoratorProps extends DecoratorComponentProps {
}

export function createSpellCheckDecoratorComponent(
  getContext: () => Context
){
  const SpellCheckDecorator: React.SFC<SpellCheckDecoratorProps> = ({
    children,
  }) => {
    const targetRef = useRef<HTMLElement>(null);
    const context = getContext();

    return (
      <span
        className="c_spell-check-decorator"
        onClick={e => {
          const word = context.words[e.currentTarget.innerText];
          if(word && !word.isValid) {
            context.showSuggestions!(word.suggestions)
          }
        }}
        ref={targetRef}>{children}
      </span>
    );
  };

  return SpellCheckDecorator;
}
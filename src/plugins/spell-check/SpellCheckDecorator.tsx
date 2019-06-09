import React, { useRef } from 'react';
import {
  DecoratorComponentProps,
} from 'draft-js-plugins-editor';
import { Context } from './context';
import { fetchSuggestions } from './data';

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
        onContextMenu={async e => {
          e.preventDefault();

          const miss = e.currentTarget.innerText;
          const isValid = context.words[miss];
          if(!isValid) {
            context.suggestions[miss] = context.suggestions[miss] || await fetchSuggestions(miss);
            context.showSuggestions!(context.suggestions[miss].slice(0, 10));
          }
        }}
        ref={targetRef}>{children}
      </span>
    );
  };

  return SpellCheckDecorator;
}
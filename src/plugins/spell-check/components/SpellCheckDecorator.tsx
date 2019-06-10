import React, { useRef } from 'react';
import {
  DecoratorComponentProps,
} from 'draft-js-plugins-editor';
import { Context } from '../context';
import { fetchSuggestions } from '../data/spelling';
import { calculatePosition, getDecoratorRange, createSelectionState } from '../../utils';

export interface SpellCheckDecoratorProps extends DecoratorComponentProps {
}

export function createSpellCheckDecoratorComponent(
  getContext: () => Context
){
  const SpellCheckDecorator: React.SFC<SpellCheckDecoratorProps> = (props) => {
    const {
      children,
      decoratedText
    } = props;
    const child = children[0];
    const targetRef = useRef<HTMLElement>(null);
    const context = getContext();

    const { start, end } = getDecoratorRange({
      child,
      decoratedText
    });

    return (
      <span
        className="c_spell-check-decorator"
        onContextMenu={async e => {
          e.preventDefault();

          const miss = e.currentTarget.innerText;
          const isValid = context.words[miss];
          if(!isValid) {
            context.suggestions[miss] = context.suggestions[miss] || await fetchSuggestions(miss);

            const selection = createSelectionState(
              child.props.block.getKey(),
              start,
              end
            );

            context.showSuggestions!(
              {
                ...calculatePosition(targetRef.current!),
                selection,
                suggestions: context.suggestions[miss].slice(0, 10),
                text: decoratedText
              },
            );
          }
        }}
        ref={targetRef}>{children}
      </span>
    );
  };

  return SpellCheckDecorator;
}
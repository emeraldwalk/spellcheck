import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Context } from './context';

export interface SuggestionsProps {
}

export function createSuggestionsComponent(
  getContext: () => Context
) {
  const Suggestions: React.FC<SuggestionsProps> = () => {
    const [suggestions, setSuggestions] = useState<string[]>();
    const focusRef = useRef<HTMLUListElement>(null);
    const context = getContext();

    // set this on context so SpellCheckDecorator can toggle visibility
    context.showSuggestions = setSuggestions;

    useEffect(() => {
      if(focusRef.current) {
        focusRef.current!.focus();
      }
    }, [suggestions]);

    return suggestions
      ? ReactDOM.createPortal(
        <ul
          className="c_suggestions"
          onBlur={() => setSuggestions(undefined)}
          ref={focusRef}
          tabIndex={0}
          >
          { suggestions.map(suggestion => (
            <li className="c_suggestions__item" key={suggestion}>{suggestion}</li>
          ))}
        </ul>, document.body
      )
      : null;
  }

  return Suggestions;
}
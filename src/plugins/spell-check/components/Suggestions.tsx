import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Context, ShowSuggestionArgs } from '../context';
import { replaceText } from '../../utils';
import { setInPersonalDictionary } from '../data/data';

export interface SuggestionsProps {
}

export function createSuggestionsComponent(
  getContext: () => Context
) {
  const Suggestions: React.FC<SuggestionsProps> = () => {
    const [suggestionArgs, setSuggestionArgs] = useState<ShowSuggestionArgs>();

    const focusRef = useRef<HTMLDivElement>(null);
    const context = getContext();

    // set this on context so SpellCheckDecorator can toggle visibility
    context.showSuggestions = function(args) {
      setSuggestionArgs(args);
    }

    useEffect(() => {
      if(focusRef.current) {
        focusRef.current!.focus();
      }
    }, [suggestionArgs]);

    if(!suggestionArgs) {
      return null;
    }

    const { x, y, selection, suggestions, text } = suggestionArgs;

    return ReactDOM.createPortal(
      <div
        className="c_suggestions"
        onBlur={() => setSuggestionArgs(undefined)}
        ref={focusRef}
        style={{left: x, top: y + 20}}
        tabIndex={0}
        >
        <ul
          className="c_suggestions__list">
          { suggestions.length === 0 ? <li className="c_suggestions__none">No Suggestions</li> : null }
          { suggestions.map(suggestion => (
            <li className="c_suggestions__item" key={suggestion} onClick={() => {
              context.setEditorState(
                replaceText(
                  context.getEditorState(),
                  selection!,
                  suggestion
                )
              );
              setSuggestionArgs(undefined);
            }}>{suggestion}</li>
          ))}
        </ul>
        <div
          className="c_suggestions__static"
          onClick={() => {
            setInPersonalDictionary(text);
            setSuggestionArgs(undefined);
            context.reapplyDecorators();
          }}
          >Add to Dictionary</div>
      </div>, document.body
    );
  };

  return Suggestions;
}
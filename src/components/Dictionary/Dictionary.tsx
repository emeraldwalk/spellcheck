import React from 'react';

export interface DictionaryProps {
  dictionary: Record<string, number>,
  clearDictionary: () => void
}

const Dictionary: React.FC<DictionaryProps> = ({
  dictionary,
  clearDictionary
}) => {

  const words = Object.keys(dictionary);

  return (words.length > 0 ?
    <div className="c_dictionary">
      <h2>Personal Dictionary</h2>
      {words.map(word => (
        <div key={word}>
          {word}
        </div>
      ))}
      {
        words.length > 0
          ?
          <button onClick={() => {
            clearDictionary();
          }}>Clear</button>
          : 'Empty'
      }
    </div>
  : null);
};

export default Dictionary;
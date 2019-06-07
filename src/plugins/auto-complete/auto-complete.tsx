import React from 'react';

export interface AutoCompleteDecoratorProps {
}

const AutoCompleteDecorator: React.SFC<AutoCompleteDecoratorProps> = ({
  children
}) => (
  <span className="c_auto-complete">children</span>
);
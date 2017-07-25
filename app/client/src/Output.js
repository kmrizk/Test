import React from 'react';
import Prompt from './Prompt';

export default ({val, type, format, isCommand}) => (
  <p
    className={format || 'line'}>
    {isCommand ? <Prompt /> : null}
    {val}
  </p>
)
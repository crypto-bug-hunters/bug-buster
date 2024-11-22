import React from 'react';

import { Tooltip as ReactTooltip } from 'react-tooltip';
import IconHelp from './IconHelp';

type Props = {
  children?: React.ReactNode;
  id: string;
  content?: string;
  style?: string;
};

const Tooltip = ({ children, id, content, style }: Props) => {
  return (
    <>
      <a
        data-tooltip-id={id}
        data-tooltip-content={content}
        className={style}
        data-tooltip-class-name='max-w-xs text-xs'
      >
        {children ? children : <IconHelp style='w-4 h-4 opacity-50' />}
      </a>
      <ReactTooltip id={id} />
    </>
  );
};

export default Tooltip;

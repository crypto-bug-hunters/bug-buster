import React from 'react';

type Props = {
  className?: string;
  classNameSvg?: string;
};

const Loading = ({ className, classNameSvg }: Props) => {
  return (
    <span className={className}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        className={classNameSvg}
        stroke='currentColor'
      >
        <g className='loading stroke-current'>
          <circle cx='12' cy='12' r='9.5' fill='none' strokeWidth={2} />
        </g>
      </svg>
    </span>
  );
};

export default Loading;

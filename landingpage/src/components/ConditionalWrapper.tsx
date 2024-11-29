import { FC } from 'react';

export interface ConditionalWrapperProps {
  condition: any;
  wrapper1: any;
  wrapper2: any;
  children: any;
}

const ConditionalWrapper: FC<ConditionalWrapperProps> = props => {
  const { condition, wrapper1, wrapper2, children } = props;
  return condition ? wrapper1(children) : wrapper2(children);
};

export default ConditionalWrapper;

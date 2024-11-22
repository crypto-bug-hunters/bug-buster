import { useState, useEffect } from 'react';
import { useDebounceValue, useMediaQuery } from 'usehooks-ts';

const useMouse = (ref: React.RefObject<HTMLDivElement>) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isInside, setIsInside] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)', {
    initializeWithValue: false,
  });

  const [debouncedX] = useDebounceValue(x, 10);
  const [debouncedY] = useDebounceValue(y, 10);

  useEffect(() => {
    if (!isDesktop) return;
    const documentMouseMove = (event: MouseEvent) => {
      const isOverRef =
        event.target === ref.current ||
        ref.current?.contains(event.target as Node);
      if (!isOverRef) {
        setIsInside(false);
        return;
      }

      setIsInside(isOverRef ? true : false);

      setX(event.clientX);
      setY(event.clientY);

      const isOverLink =
        event.target instanceof HTMLAnchorElement ||
        event.target instanceof HTMLButtonElement;

      if (isOverLink) {
        setIsInside(false);
      }
    };

    document.addEventListener('mousemove', documentMouseMove);

    return () => {
      document.removeEventListener('mousemove', documentMouseMove);
    };
  }, [ref, isDesktop]);

  return { x: debouncedX, y: debouncedY, isInside, isDesktop };
};

export default useMouse;

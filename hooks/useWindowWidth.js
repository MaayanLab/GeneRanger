import { useState, useEffect } from 'react';

export default function useWindowWidth() {

  const hasWindow = typeof window !== 'undefined';

  function getWindowWidth() {
    return hasWindow ? window.innerWidth : null;
  }

  const [windowWidth, setWindowWidth] = useState(getWindowWidth());

  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowWidth(getWindowWidth());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [hasWindow]);

  return windowWidth;
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';

const VintageCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    requestAnimationFrame(() => {
      setPosition({ x: e.clientX, y: e.clientY });
    });
  }, []);

  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  const handleMouseOver = useCallback((e) => {
    const target = e.target;
    const isInteractive = target.tagName === 'A' || 
                          target.tagName === 'BUTTON' || 
                          target.closest('button') ||
                          target.closest('a');
    setIsHovering(isInteractive);
  }, []);

  useEffect(() => {
    const options = { passive: true };
    
    document.addEventListener('mousemove', handleMouseMove, options);
    document.addEventListener('mousedown', handleMouseDown, options);
    document.addEventListener('mouseup', handleMouseUp, options);
    document.addEventListener('mouseover', handleMouseOver, options);
    
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
      canvas { cursor: none !important; }
      .avatar-container { cursor: none !important; }
      .avatar-container * { cursor: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, options);
      document.removeEventListener('mousedown', handleMouseDown, options);
      document.removeEventListener('mouseup', handleMouseUp, options);
      document.removeEventListener('mouseover', handleMouseOver, options);
      style.remove();
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseOver]);

  const createPixelatedCursor = React.useMemo(() => {
    const scale = 2; 
    const pixels = [
      [1,0,0,0,0,0,0,0,0,0,0],
      [1,1,0,0,0,0,0,0,0,0,0],
      [1,2,1,0,0,0,0,0,0,0,0],
      [1,2,2,1,0,0,0,0,0,0,0],
      [1,2,2,2,1,0,0,0,0,0,0],
      [1,2,2,2,2,1,0,0,0,0,0],
      [1,2,2,2,2,2,1,0,0,0,0],
      [1,2,2,2,2,2,2,1,0,0,0],
      [1,2,2,2,2,2,2,2,1,0,0],
      [1,2,2,2,2,2,1,1,1,1,0],
      [1,2,2,1,2,2,1,0,0,0,0],
      [1,2,1,0,1,2,2,1,0,0,0],
      [1,1,0,0,1,2,2,1,0,0,0],
      [1,0,0,0,0,1,2,2,1,0,0],
      [0,0,0,0,0,1,2,2,1,0,0],
      [0,0,0,0,0,0,1,1,0,0,0],
    ];

    const getPixelColor = (value) => {
      if (value === 0) return 'transparent';
      if (value === 1) return '#000000'; 
      if (value === 2) {
        if (isClicking) return '#ff6b6b'; 
        if (isHovering) return '#ffff00'; 
        return '#ffffff'; 
      }
      return 'transparent';
    };

    return (
      <div 
        className="relative"
        style={{
          width: pixels[0].length * scale,
          height: pixels.length * scale,
          willChange: 'transform', 
        }}
      >
        {pixels.map((row, rowIndex) =>
          row.map((pixel, colIndex) => 
            pixel !== 0 ? (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="absolute"
                style={{
                  left: colIndex * scale,
                  top: rowIndex * scale,
                  width: scale,
                  height: scale,
                  backgroundColor: getPixelColor(pixel),
                  imageRendering: 'pixelated',
                }}
              />
            ) : null
          )
        )}
      </div>
    );
  }, [isClicking, isHovering]);

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${isClicking ? 0.9 : isHovering ? 1.1 : 1})`,
        willChange: 'transform',
        transition: 'transform 100ms ease-out',
      }}
    >
      {createPixelatedCursor}
    </div>
  );
};

export default VintageCursor;

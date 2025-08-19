'use client';

import React, { useState, useEffect, useCallback } from 'react';

const VintageCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  const handleMouseOver = useCallback((e) => {
    const target = e.target;
    if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('button')) {
      setIsHovering(true);
    } else {
      setIsHovering(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    
    const style = document.createElement('style');
    style.innerHTML = '* { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      style.remove();
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleMouseOver]);

  const createPixelatedCursor = () => {
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
        }}
      >
        {pixels.map((row, rowIndex) =>
          row.map((pixel, colIndex) => (
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
          ))
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${isClicking ? 0.9 : isHovering ? 1.1 : 1})`,
      }}
    >
      {createPixelatedCursor()}
    </div>
  );
};

export default VintageCursor;

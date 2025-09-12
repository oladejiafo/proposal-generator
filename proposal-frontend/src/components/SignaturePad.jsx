import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const SignaturePad = forwardRef(({ onSave, initialImage }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Add fromDataURL method
  const loadFromDataURL = (dataURL) => {
    if (!canvasRef.current) return;
    
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      if (onSave) {
        onSave(dataURL); // Notify parent that signature is loaded
      }
    };
    img.src = dataURL;
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current.toDataURL('image/png'),
    clear: () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (onSave) {
        onSave(''); // Clear the saved signature
      }
    },
    fromDataURL: loadFromDataURL // Add this method
  }));

  // Load initial image when component mounts or initialImage changes
  useEffect(() => {
    if (initialImage) {
      loadFromDataURL(initialImage);
    }
  }, [initialImage]);

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (onSave) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        style={{ 
          border: '0.5px solid #05445E', 
          borderRadius: '5px', 
          padding: '15px',
          backgroundColor: 'white',
          cursor: 'crosshair'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          startDrawing({
            nativeEvent: {
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top
            }
          });
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          draw({
            nativeEvent: {
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top
            }
          });
        }}
        onTouchEnd={stopDrawing}
      />

    </div>
  );
});

export default SignaturePad;
import { useCallback, useState } from 'react';

export function useDragAndDrop(onFile: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const handlers = {
    onDragOver: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []),
    onDragLeave: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      if (e.currentTarget === e.target) setIsDragging(false);
    }, []),
    onDrop: useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      },
      [onFile]
    ),
  };

  return { isDragging, handlers };
}

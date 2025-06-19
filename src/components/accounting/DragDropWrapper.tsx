'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

interface DragDropWrapperProps {
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
}

export const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // SSRでのhydration問題を解決するために、マウント後に有効化
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

const DragDropWrapper: React.FC<DragDropWrapperProps> = ({ onDragEnd, children }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
};

export { Draggable };
export type { DraggableProvided, DroppableProvided };
export default DragDropWrapper; 
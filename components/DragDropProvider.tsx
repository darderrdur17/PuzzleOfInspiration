"use client";

import React from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverEvent
} from '@dnd-kit/core';
import { Quote, PhaseTitle, Phase } from '@/types/game';

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  draggedQuote: Quote | null;
  draggedTitle: PhaseTitle | null;
  quoteComponent?: React.ComponentType<{ quote: Quote; isDragging?: boolean }>;
  titleComponent?: React.ComponentType<{ title: PhaseTitle; isDragging?: boolean }>;
}

export function DraggableQuote({
  quote,
  children,
  id
}: {
  quote: Quote;
  children: React.ReactNode;
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: 'quote', quote },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? 'opacity-50' : ''} cursor-move touch-manipulation`}
    >
      {children}
    </div>
  );
}

export function DraggableTitle({
  title,
  children,
  id
}: {
  title: PhaseTitle;
  children: React.ReactNode;
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: 'title', title },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? 'opacity-50' : ''} cursor-move touch-manipulation`}
    >
      {children}
    </div>
  );
}

export function DroppableZone({
  id,
  children,
  onDrop,
  className = '',
  isHighlighted = false,
  style
}: {
  id: string;
  children: React.ReactNode;
  onDrop?: (phase: Phase) => void;
  className?: string;
  isHighlighted?: boolean;
  style?: React.CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'drop-zone', phase: id as Phase },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver || isHighlighted ? 'ring-4 ring-primary ring-offset-2 scale-105 transition-transform duration-200' : ''}`}
      style={style}
      onDragOver={(e) => {
        e.preventDefault();
        if (onDrop) onDrop(id as Phase);
      }}
    >
      {children}
    </div>
  );
}

export function DragDropProvider({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  draggedQuote,
  draggedTitle,
  quoteComponent: QuoteComponent,
  titleComponent: TitleComponent,
}: DragDropProviderProps) {
  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      {children}

      <DragOverlay>
        {draggedQuote && QuoteComponent && (
          <QuoteComponent quote={draggedQuote} isDragging />
        )}
        {draggedTitle && TitleComponent && (
          <TitleComponent title={draggedTitle} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  );
}
import React, { ReactNode } from "react";
import { Draggable, DraggableProps, Droppable, DroppableProps, DroppableProvided, DroppableProvidedProps } from "react-beautiful-dnd";

import styles from "./index.module.scss";

type DropProps = Omit<DroppableProps, "children"> & { children: ReactNode };

export const Drop = ({ children, ...props }: DropProps) => {
  return (
    <Droppable {...props}>
      {provided => {
        if (React.isValidElement(children)) {
          return React.cloneElement(children, {
            ...provided.droppableProps,
            ref: provided.innerRef,
            provided
          });
        }
        return <div />;
      }}
    </Droppable>
  );
};

type DropChildProps = Partial<{ provided: DroppableProvided } & DroppableProvidedProps> & React.HTMLAttributes<HTMLDivElement>;
export const DropChild = React.forwardRef<HTMLDivElement, DropChildProps>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
    {props.provided?.placeholder}
  </div>
));

type DragProps = Omit<DraggableProps, "children"> & { children: ReactNode };
export const Drag = ({ children, ...props }: DragProps) => {
  return (
    <Draggable {...props}>
      {provided => {
        if (React.isValidElement(children)) {
          return React.cloneElement(children, {
            ...provided.draggableProps,
            ...provided.dragHandleProps,
            ref: provided.innerRef
          });
        }
        return <div />;
      }}
    </Draggable>
  );
};

export const MyTagShow = ({ children, tag }) => {
  return (
    <div className={`${tag?.active ? styles.activeContainer : styles.container}`}>
      <span className={`${tag?.active ? styles.activeRound : styles.round}`} />
      <span className={styles.name}>{tag.name}</span>
      <span className={styles.textshow}>
        <b className={styles.contextb} />
      </span>
      <span className={styles.bottomline} />
      {children}
    </div>
  );
};

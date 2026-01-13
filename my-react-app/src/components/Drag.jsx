<DragDropContext onDragEnd={handleDragEnd}>
    <Droppable droppableId="droppable-1">
        {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
                <Draggable draggableId="1" index={0}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                        >
                            {/* Your draggable content */}
                        </div>
                    )}
                </Draggable>

                {provided.placeholder}
            </div>
        )}
    </Droppable>
</DragDropContext>

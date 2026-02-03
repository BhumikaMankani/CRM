import React from 'react';
import './table.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Table = ({ columns, data, onAddClick, onAddColumnClick, onDragEnd }) => {
    const add = () => {
        return (
            <svg viewBox="0 0 16 16" fill="none" xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 1H6V6L1 6V10H6V15H10V10H15V6L10 6V1Z" fill="#000000"></path> </g></svg>
        )
    }

    return (
        <div className='row'>
            <div className="col-md-12 table-responsive_ct">
                <div className="table-wrap smooth-scroll-container">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <table className="custom-table mb-0 table table-striped table-bordered dataTable table table-hover align-middle mb-0">
                            <thead className='table-light'>
                                {columns.length > 1 ? (
                                    <Droppable droppableId="columns" direction="horizontal">
                                        {(provided) => (
                                            <tr
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {columns.map((column, index) => {
                                                    const isSticky = column.sticky || index === 0;
                                                    const isInfo = column.accessor === 'row_info_column';
                                                    // Calculate left offset for sticky columns
                                                    let leftOffset = 0;
                                                    if (isSticky) {
                                                        for (let i = 0; i < index; i++) {
                                                            if (columns[i].sticky || i === 0) {
                                                                const w = i === 0 ? 45 : (columns[i].accessor === 'row_info_column' ? 60 : 150);
                                                                leftOffset += w;
                                                            }
                                                        }
                                                    }

                                                    return (
                                                        <Draggable
                                                            key={column.accessor || `col-${index}`}
                                                            draggableId={column.accessor || `col-${index}`}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => {
                                                                const style = {
                                                                    ...provided.draggableProps.style,
                                                                    left: isSticky ? `${leftOffset}px` : provided.draggableProps.style?.left
                                                                };

                                                                if (isInfo) {
                                                                    style.width = '60px';
                                                                    style.minWidth = '60px';
                                                                    style.maxWidth = '60px';

                                                                }

                                                                return (
                                                                    <th
                                                                        className={`${snapshot.isDragging ? 'dragging' : ''} ${isSticky ? 'sticky-col' : ''}`}
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={style}
                                                                    >
                                                                        {column.header}
                                                                    </th>
                                                                );
                                                            }}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </tr>
                                        )}
                                    </Droppable>
                                ) : null}
                            </thead>
                            <tbody>
                                {data.map((row, rowIndex) => (
                                    columns.length > 1 ? (
                                        <tr key={row._id || rowIndex}>
                                            {columns.map((column, colIndex) => {
                                                const cellProps = column.getCellProps ? column.getCellProps(row) : {};
                                                const isSticky = column.sticky || colIndex === 0;
                                                const isInfo = column.accessor === 'row_info_column';

                                                let leftOffset = 0;
                                                if (isSticky) {
                                                    for (let i = 0; i < colIndex; i++) {
                                                        if (columns[i].sticky || i === 0) {
                                                            const w = i === 0 ? 45 : (columns[i].accessor === 'row_info_column' ? 60 : 150);
                                                            leftOffset += w;
                                                        }
                                                    }
                                                }

                                                const style = {
                                                    ...cellProps.style,
                                                    left: isSticky ? `${leftOffset}px` : cellProps.style?.left
                                                };

                                                if (isInfo) {
                                                    style.width = '60px';
                                                    style.minWidth = '60px';
                                                    style.maxWidth = '60px';
                                                    style.padding = '5px';
                                                }

                                                return (
                                                    <td
                                                        key={column.accessor || `cell-${colIndex}`}
                                                        {...cellProps}
                                                        className={`${cellProps.className || ''} ${isSticky ? 'sticky-col' : ''}`}
                                                        style={style}
                                                    >
                                                        {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ) : null
                                ))}
                            </tbody>
                        </table>
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
};

export default Table;

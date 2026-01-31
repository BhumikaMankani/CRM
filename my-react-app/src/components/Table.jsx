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
                                                {columns.map((column, index) => (
                                                    <Draggable
                                                        key={column.accessor || `col-${index}`}
                                                        draggableId={column.accessor || `col-${index}`}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <th
                                                                className={snapshot.isDragging ? 'dragging' : ''}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {column.header}
                                                            </th>
                                                        )}
                                                    </Draggable>
                                                ))}
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
                                                return (
                                                    <td
                                                        key={column.accessor || `cell-${colIndex}`}
                                                        {...cellProps}
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

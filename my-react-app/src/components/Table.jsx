// import React from 'react';
// import './table.css';
// // import Updator from './updator';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// const Table = ({ columns, data, onAddClick, onAddColumnClick, onDragEnd }) => {
//     const add = () => {
//         return (
//             <svg viewBox="0 0 16 16" fill="none" xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 1H6V6L1 6V10H6V15H10V10H15V6L10 6V1Z" fill="#000000"></path> </g></svg>
//         )
//     }

//     return (
//         <div className='row'>
//             <div className="col-md-12 table-responsive_ct">
//                 {/* <Updator /> */}
//                 <div className="table-wrap smooth-scroll-container">
//                     <DragDropContext onDragEnd={onDragEnd}>
//                         <table className="custom-table mb-0 table table-striped table-bordered dataTable table table-hover align-middle mb-0">
//                             <thead className='table-light'>
//                                 {columns.length > 1 ? (
//                                     <Droppable droppableId="columns" direction="horizontal">
//                                         {(provided) => (
//                                             <tr
//                                                 ref={provided.innerRef}
//                                                 {...provided.droppableProps}
//                                             >
//                                                 {columns.map((column, index) => {
//                                                     const isSticky = column.sticky || index === 0;
//                                                     const isInfo = column.accessor === 'row_info_column';
//                                                     // Calculate left offset for sticky columns
//                                                     let leftOffset = 0;
//                                                     if (isSticky) {
//                                                         for (let i = 0; i < index; i++) {
//                                                             if (columns[i].sticky || i === 0) {
//                                                                 const w = i === 0 ? 45 : (columns[i].accessor === 'row_info_column' ? 60 : 150);
//                                                                 leftOffset += w;
//                                                             }
//                                                         }
//                                                     }

//                                                     return (
//                                                         <Draggable
//                                                             key={column.accessor || `col-${index}`}
//                                                             draggableId={column.accessor || `col-${index}`}
//                                                             index={index}
//                                                         >
//                                                             {(provided, snapshot) => {
//                                                                 const style = {
//                                                                     ...provided.draggableProps.style,
//                                                                     left: isSticky ? `${leftOffset}px` : provided.draggableProps.style?.left
//                                                                 };

//                                                                 if (isInfo) {
//                                                                     style.width = '60px';
//                                                                     style.minWidth = '60px';
//                                                                     style.maxWidth = '60px';

//                                                                 }

//                                                                 return (
//                                                                     <th
//                                                                         className={`${snapshot.isDragging ? 'dragging' : ''} ${isSticky ? 'sticky-col' : ''}`}
//                                                                         ref={provided.innerRef}
//                                                                         {...provided.draggableProps}
//                                                                         {...provided.dragHandleProps}
//                                                                         style={style}
//                                                                     >
//                                                                         {column.header}
//                                                                     </th>
//                                                                 );
//                                                             }}
//                                                         </Draggable>
//                                                     );
//                                                 })}
//                                                 {provided.placeholder}
//                                             </tr>
//                                         )}
//                                     </Droppable>
//                                 ) : null}
//                             </thead>
//                             <tbody>
//                                 {data.map((row, rowIndex) => (
//                                     columns.length > 1 ? (
//                                         <tr key={row._id || rowIndex}>
//                                             {columns.map((column, colIndex) => {
//                                                 const cellProps = column.getCellProps ? column.getCellProps(row) : {};
//                                                 const isSticky = column.sticky || colIndex === 0;
//                                                 const isInfo = column.accessor === 'row_info_column';

//                                                 let leftOffset = 0;
//                                                 if (isSticky) {
//                                                     for (let i = 0; i < colIndex; i++) {
//                                                         if (columns[i].sticky || i === 0) {
//                                                             const w = i === 0 ? 45 : (columns[i].accessor === 'row_info_column' ? 60 : 150);
//                                                             leftOffset += w;
//                                                         }
//                                                     }
//                                                 }

//                                                 const style = {
//                                                     ...cellProps.style,
//                                                     left: isSticky ? `${leftOffset}px` : cellProps.style?.left
//                                                 };

//                                                 if (isInfo) {
//                                                     style.width = '60px';
//                                                     style.minWidth = '60px';
//                                                     style.maxWidth = '60px';
//                                                     style.padding = '5px';
//                                                 }

//                                                 return (
//                                                     <td
//                                                         key={column.accessor || `cell-${colIndex}`}
//                                                         {...cellProps}
//                                                         className={`${cellProps.className || ''} ${isSticky ? 'sticky-col' : ''}`}
//                                                         style={style}
//                                                     >
//                                                         {column.render ? column.render(row, rowIndex) : row[column.accessor]}
//                                                     </td>
//                                                 );
//                                             })}
//                                         </tr>
//                                     ) : null
//                                 ))}
//                             </tbody>
//                         </table>
//                     </DragDropContext>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Table;

import React, { useState, useEffect } from 'react';
import './table.css';
// import Updator from './updator';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const PAGE_SIZE = 50;

const Table = ({ columns, data, onDragEnd }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
    const paginatedData = data.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE
    );

    const startRow = data.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
    const endRow = Math.min(safeCurrentPage * PAGE_SIZE, data.length);

    useEffect(() => {
        const resetPage = async () => {
            setCurrentPage(1);
        };
        resetPage();
    }, [data]);

    return (
        <div className='row'>
            <div className="col-md-12 table-responsive_ct">
                {/* <Updator /> */}
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
                                {paginatedData.map((row, rowIndex) => {
                                    const absoluteRowIndex = (safeCurrentPage - 1) * PAGE_SIZE + rowIndex;
                                    return columns.length > 1 ? (
                                        <tr key={row._id || absoluteRowIndex}>
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
                                                        {column.render ? column.render(row, absoluteRowIndex) : row[column.accessor]}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ) : null;
                                })}
                            </tbody>
                        </table>
                    </DragDropContext>
                </div>

                {/* ── Pagination controls ── */}
                {totalPages > 1 && (
                    <div className='pagination_table' style={{ "justifyContent": "center", display: 'flex', alignItems: 'center', gap: 8, padding: '12px 4px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                        >
                            «
                        </button>
                        {/* <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ‹ Prev
                        </button> */}

                        {/* Page number pills */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page =>
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 2
                            )
                            .reduce((acc, page, idx, arr) => {
                                if (idx > 0 && page - arr[idx - 1] > 1) {
                                    acc.push('...');
                                }
                                acc.push(page);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#888' }}>…</span>
                                ) : (
                                    <button
                                        key={item}
                                        className={`btn btn-sm ${item === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setCurrentPage(item)}
                                    >
                                        {item}
                                    </button>
                                )
                            )
                        }

                        {/* <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next ›
                        </button> */}
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                        >
                            »
                        </button>

                        <span style={{ fontSize: 13, color: '#000', marginLeft: 8 }}>
                            {startRow}–{endRow} of {data.length} rows
                        </span>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Table;

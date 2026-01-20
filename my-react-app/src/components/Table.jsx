import React from 'react';
import './table.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Table = ({ columns, data, onAddClick, onAddColumnClick }) => {
    const add = () => {
        return (
            <svg viewBox="0 0 16 16" fill="none" xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 1H6V6L1 6V10H6V15H10V10H15V6L10 6V1Z" fill="#000000"></path> </g></svg>
        )
    }

    return (
        <div className='row'>
            <div className="col-md-12">
                <div
                    className="table-wrap smooth-scroll-container"
                >
                    <table className="custom-table mb-0 table table-striped table-bordered dataTable">
                        <thead className='thead-light'>
                            {columns.length > 1 ? (
                                <tr>
                                    {columns.map((column, index) => (
                                        <th className='' key={column.accessor || `col-${index}`}>{column.header}</th>
                                    ))}
                                </tr>
                            ) : null}
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                columns.length > 1 ? (
                                    <tr key={row._id || rowIndex}>
                                        {columns.map((column, colIndex) => (
                                            <td key={column.accessor || `cell-${colIndex}`}>
                                                {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ) : null
                            ))}
                        </tbody>
                    </table>
                    {/* <>
                        <button
                            className="add-more-columns"
                            onClick={onAddColumnClick}
                            title="Add New Column"
                        >
                            {add()}
                        </button>
                    </> */}
                </div>
            </div>
        </div>
    );
};

export default Table;

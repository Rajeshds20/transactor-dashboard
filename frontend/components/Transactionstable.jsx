import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatisticsTable from './StatisticsTable';
import BarChart from './BarChart';

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [month, setMonth] = useState('March');
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const months = [
        'All', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Fetch transactions from the API
    const fetchTransactions = async (page, month, search = '') => {
        try {
            const response = await axios.get('https://transactions-dashboard-57fs.onrender.com/api/transactions', {
                params: {
                    page,
                    perPage: 10,
                    month: months.indexOf(month),
                    search
                }
            });
            setTransactions(response.data.transactions);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    // Effect to fetch transactions initially or on dependency change
    useEffect(() => {
        fetchTransactions(page, month, searchText);
    }, [page, month, searchText]);

    // Handle month selection change
    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        setPage(1); // Reset to first page on month change
        setSearchText(''); // Clear search text
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setPage(1); // Reset to first page on search
    };

    // Handle clearing search
    const handleClearSearch = () => {
        setSearchText('');
    };

    // Handle pagination
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const containerStyle = {
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    };

    const headerStyle = {
        textAlign: 'center',
    };

    const formStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    };

    const thStyle = {
        border: '1px solid #ddd',
        padding: '10px',
        // backgroundColor: '#f4f4f4',
        textTransform: 'uppercase',
    };

    const tdStyle = {
        border: '1px solid #ddd',
        padding: '10px',
    };

    const buttonStyle = {
        padding: '10px 20px',
        margin: '0 5px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        // backgroundColor: '#ccc',
        cursor: 'not-allowed',
    };

    return (
        <div style={containerStyle}>
            <h1 style={headerStyle}>Transactions</h1>

            {/* Month Dropdown and Search Box */}
            <div style={formStyle}>
                <div>
                    <label htmlFor="month-select" style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Month: </label>
                    <select
                        id="month-select"
                        value={month}
                        onChange={handleMonthChange}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {months.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="search-input" style={{ fontWeight: 'bold', marginRight: '10px' }}>Search Transactions: </label>
                    <input
                        id="search-input"
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        placeholder="Search by title, description, or price"
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    {searchText && (
                        <button
                            onClick={handleClearSearch}
                            style={{ ...buttonStyle, backgroundColor: '#DC3545', marginLeft: '10px' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {
                transactions.length > 0 ?
                    <>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Image</th>
                                    <th style={thStyle}>Title</th>
                                    <th style={thStyle}>Description</th>
                                    <th style={thStyle}>Price</th>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td style={tdStyle}>{transaction.id}</td>
                                        <td style={tdStyle}><img style={{
                                            width: '100%',
                                            height: '100%',
                                        }} src={transaction.image} /></td>
                                        <td style={tdStyle}>{transaction.title}</td>
                                        <td style={tdStyle}>{transaction.description}</td>
                                        <td style={tdStyle}>₹{(Math.round(transaction.price * 100) / 100).toFixed(2)}</td>
                                        <td style={tdStyle}>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                                        <td style={tdStyle}>{transaction.sold ? 'Sold' : 'Available'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 1}
                                style={page === 1 ? disabledButtonStyle : buttonStyle}
                            >
                                Previous
                            </button>
                            <span style={{ margin: '0 15px' }}>Page {page} of {totalPages}</span>
                            <button
                                onClick={handleNextPage}
                                disabled={page === totalPages}
                                style={page === totalPages ? disabledButtonStyle : buttonStyle}
                            >
                                Next
                            </button>
                        </div>
                    </>
                    : <p>
                        No Results Found
                    </p>
            }

            <StatisticsTable month={months.indexOf(month)} />
            <BarChart selectedMonth={months.indexOf(month)} />
        </div>
    );
};

export default TransactionsTable;

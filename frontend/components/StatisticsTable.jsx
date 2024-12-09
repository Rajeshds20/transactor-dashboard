import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatisticsTable = ({ month }) => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch statistics data from API
    const fetchStatistics = async (month) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`https://transactions-dashboard-57fs.onrender.com/api/statistics?month=${month}`);
            setStatistics(response.data);
        } catch (err) {
            setError('Failed to fetch statistics. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch data on initial render and whenever the month changes
    useEffect(() => {
        fetchStatistics(month);
    }, [month]);

    return (
        <div>

            <center><h1>Monthly Statistics</h1></center>

            {
                month != 0 ?
                    <>
                        {loading && <p>Loading...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        {statistics && !loading && !error && (
                            <table border="1" style={{ marginTop: '20px', width: '50%' }}>
                                <thead>
                                    <tr>
                                        <th>Total Sale Amount</th>
                                        <th>Sold Items Count</th>
                                        <th>Unsold Items Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>₹{statistics.totalSaleAmount}</td>
                                        <td>{statistics.soldItemsCount}</td>
                                        <td>{statistics.unsoldItemsCount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </>
                    : <center style={{
                        color: 'red',
                    }}>
                        Select a Specific Month
                    </center>
            }
        </div>
    );
};

export default StatisticsTable;

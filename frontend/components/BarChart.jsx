import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TransactionsBarChart = ({ selectedMonth }) => {
    const [barChartData, setBarChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch bar chart data
    const fetchBarChartData = async (month) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`https://transactions-dashboard-57fs.onrender.com/api/bar-chart?month=${month}`);
            setBarChartData(response.data);
        } catch (err) {
            setError('Failed to fetch bar chart data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch data when the selected month changes
    useEffect(() => {
        fetchBarChartData(selectedMonth);
    }, [selectedMonth]);

    // Prepare data for the bar chart
    const chartData = {
        labels: Object.keys(barChartData),
        datasets: [
            {
                label: 'Number of Items',
                data: Object.values(barChartData),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    return (
        <div>
            <center><h1>Monthly Bar Chart</h1></center>
            {
                selectedMonth != 0 ?
                    <>
                        <h2>Transactions Bar Chart</h2>

                        {loading && <p>Loading...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        {!loading && !error && (
                            <div style={{ width: '80%', margin: '0 auto' }}>
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { callbacks: { label: (context) => `Items: ${context.raw}` } }
                                        },
                                        scales: {
                                            x: { title: { display: true, text: 'Price Range' } },
                                            y: { title: { display: true, text: 'Number of Items' }, beginAtZero: true }
                                        }
                                    }}
                                />
                            </div>
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

export default TransactionsBarChart;

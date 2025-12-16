import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import api from '../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const [taskData, setTaskData] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);

    useEffect(() => {
        const processData = async () => {
            try {
                const res = await api.get('/tasks');
                const tasks = res.data;

                // 1. Category Distribution (Doughnut)
                const categories = {};
                tasks.forEach(t => {
                    categories[t.category] = (categories[t.category] || 0) + 1;
                });

                setCategoryData({
                    labels: Object.keys(categories),
                    datasets: [{
                        label: '# of Tasks',
                        data: Object.values(categories),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                        ],
                        borderWidth: 1,
                    }]
                });

                // 2. Weekly Activity (Mocked for now based on completion date if available, or just random variation for demo)
                // In a real app, we'd group tasks by 'completedAt' date. 
                // Let's ensure we have a structure even if empty.
                setWeeklyData({
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Tasks Completed',
                        data: [1, 3, 2, 4, 3, 5, 2], // Mock data for visual appeal as we don't have historical data yet
                        backgroundColor: 'rgba(108, 92, 231, 0.6)',
                        borderRadius: 8,
                    }]
                });

                // 3. Productivity Trend (Mock Line Chart)
                setTaskData({
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Productivity Score',
                        data: [65, 72, 78, 85],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        tension: 0.4
                    }]
                });

            } catch (err) {
                console.error("Error fetching analytics data", err);
            }
        };

        processData();
    }, []);

    if (!categoryData || !weeklyData) return <div className="p-5 text-center">Loading Analytics...</div>;

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="fw-bold mb-4">Analytics & Insights</h1>

            <div className="row g-4">
                {/* Weekly Activity Bar Chart */}
                <div className="col-md-8">
                    <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                        <h5 className="fw-bold mb-4 text-muted">Weekly Performance</h5>
                        <Bar options={{ responsive: true, plugins: { legend: { position: 'top' } } }} data={weeklyData} />
                    </div>
                </div>

                {/* Category Distribution Doughnut */}
                <div className="col-md-4">
                    <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                        <h5 className="fw-bold mb-4 text-muted">Task Distribution</h5>
                        <div className="d-flex justify-content-center">
                            <div style={{ width: '250px' }}>
                                <Doughnut data={categoryData} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productivity Trend Line Chart */}
                <div className="col-12">
                    <div className="bg-white p-4 rounded-4 shadow-sm">
                        <h5 className="fw-bold mb-4 text-muted">Productivity Growth</h5>
                        <Line options={{ responsive: true }} data={taskData} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;

import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FaBell, FaSearch, FaEllipsisH, FaPlay, FaPause, FaMagic } from 'react-icons/fa';
import api from '../services/api'; // Import the new centralized API service
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const navigate = useNavigate();
    const [productivityScore, setProductivityScore] = useState(0);
    const [taskStats, setTaskStats] = useState({ completed: 0, pending: 0, total: 0 });
    const [tasksList, setTasksList] = useState([]); // Store full list for recommendation
    const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [userProfile, setUserProfile] = useState({ name: 'User', level: 1, xp: 0 });
    const [showWellnessModal, setShowWellnessModal] = useState(false);
    const [wellnessData, setWellnessData] = useState({ sleep: 7, mood: 5 });

    // Check if check-in was done today
    useEffect(() => {
        const lastCheckIn = localStorage.getItem('wellness_checkin_date');
        const today = new Date().toISOString().split('T')[0];
        if (lastCheckIn !== today) {
            setShowWellnessModal(true);
        }
    }, []);

    // Timer State
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
            alert("Focus session complete!");
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setTimerActive(!timerActive);
    const resetTimer = () => {
        setTimerActive(false);
        setTimeLeft(25 * 60);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 0. Fetch User Profile
                const userRes = await api.get('/auth/user');
                setUserProfile(userRes.data);

                // 1. Fetch Tasks for stats
                const tasksRes = await api.get('/tasks');
                const tasks = tasksRes.data;
                const completed = tasks.filter(t => t.status === 'Completed').length;
                const total = tasks.length;
                const pending = total - completed;
                setTaskStats({ completed, pending, total });
                setTasksList(tasks); // Save for recommendation widget

                // 3. Weekly Activity (Real Data)
                const activity = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
                const today = new Date();
                const oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(today.getDate() - 7);

                tasks.forEach(task => {
                    if (task.status === 'Completed' && task.completedAt) {
                        const date = new Date(task.completedAt);
                        if (date > oneWeekAgo) {
                            // Map Sunday(0) to 6, Mon(1) to 0, etc.
                            const dayIndex = (date.getDay() + 6) % 7;
                            activity[dayIndex]++;
                        }
                    }
                });
                setWeeklyActivity(activity);

                // 2. Fetch Productivity Prediction (ML) - ONLY if Modal Closed
                if (!showWellnessModal) {
                    // Calculate Real "Tasks Completed Yesterday"
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    yesterday.setHours(0, 0, 0, 0);

                    const tasksYesterday = tasks.filter(t => {
                        if (t.status !== 'Completed' || !t.completedAt) return false;
                        const d = new Date(t.completedAt);
                        d.setHours(0, 0, 0, 0);
                        return d.getTime() === yesterday.getTime();
                    }).length;

                    const mlRes = await api.post('/ml/predict-productivity', {
                        sleep_hours: wellnessData.sleep,
                        work_hours_yesterday: 8, // Could be another input
                        tasks_completed_yesterday: tasksYesterday,
                        exercise_minutes: 30, // Could be another input
                        mood_score: wellnessData.mood
                    });
                    setProductivityScore(Math.round(mlRes.data.predicted_productivity_score || 75));
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            }


        };

        fetchData();
    }, []);

    const barData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Activity',
            data: weeklyActivity,
            backgroundColor: '#e0e0e0',
            hoverBackgroundColor: '#2d3436',
            borderRadius: 5,
            barThickness: 20
        }]
    };

    const doughnutData = {
        labels: ['Done', 'Pending'],
        datasets: [{
            data: [taskStats.completed, taskStats.pending || 1], // Avoid 0/0
            backgroundColor: ['#4a66f9', '#f1f2f6'],
            borderWidth: 0,
            cutout: '75%'
        }]
    };

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Daily Wellness Check-in Modal */}
            {showWellnessModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-4 rounded-4 shadow-lg text-center"
                        style={{ maxWidth: '400px' }}
                    >
                        <h4 className="fw-bold mb-3">☀️ Daily Check-in</h4>
                        <p className="text-muted mb-4">Good morning! Help us personalize your day.</p>

                        <div className="mb-3 text-start">
                            <label className="form-label fw-bold small text-uppercase text-muted">Hours Slept</label>
                            <input
                                type="number"
                                className="form-control bg-light border-0"
                                value={wellnessData.sleep}
                                onChange={(e) => setWellnessData({ ...wellnessData, sleep: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="mb-4 text-start">
                            <label className="form-label fw-bold small text-uppercase text-muted">Mood (1-10)</label>
                            <input
                                type="range"
                                className="form-range"
                                min="1" max="10"
                                value={wellnessData.mood}
                                onChange={(e) => setWellnessData({ ...wellnessData, mood: parseInt(e.target.value) })}
                            />
                            <div className="d-flex justify-content-between small text-muted">
                                <span>😫</span>
                                <span>😐</span>
                                <span>🤩</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                localStorage.setItem('wellness_checkin_date', today);
                                setShowWellnessModal(false);
                                // Trigger fetching prediction with new data
                                // We'll handle this by dependency in useEffect or direct call, 
                                // but simpler to just reload or let the effect run if dependent on state.
                                // Ideally, we separate the ML call.
                            }}
                        >
                            Start My Day 🚀
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Top Header */}
            <div className="top-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-muted mb-0">{getGreeting()}, {userProfile.name}! 👋 (Level {userProfile.level || 1})</p>
                    {/* XP Progress Bar */}
                    <div className="progress mt-2" style={{ height: '6px', width: '200px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(userProfile.xp || 0) % 100}%` }}></div>
                    </div>
                </div>
                <div className="user-profile">
                    <div className="icon-btn"><FaSearch /></div>
                    <div className="position-relative">
                        <div
                            className="icon-btn has-notification"
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ cursor: 'pointer' }}
                        >
                            <FaBell />
                        </div>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="position-absolute bg-white shadow-lg p-3 rounded-4"
                                style={{ top: '120%', right: 0, width: '250px', zIndex: 10 }}
                            >
                                <h6 className="fw-bold mb-3 border-bottom pb-2">Notifications</h6>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
                                    <small className="text-muted">Welcome to SmartLife!</small>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-warning rounded-circle" style={{ width: 8, height: 8 }}></div>
                                    <small className="text-muted">Complete your first task to gain XP.</small>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <div className="avatar"></div>
                </div>
            </div>

            <Row className="g-4">
                {/* Left Column: Tasks & Charts */}
                <Col lg={8}>
                    {/* Task Overview Cards */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold">Overview</h5>
                            <button onClick={() => navigate('/tasks')} className="btn btn-dark btn-sm rounded-pill px-3 text-white">+ Add Task</button>
                        </div>
                        <Row className="g-3">
                            <Col md={6}>
                                <motion.div whileHover={{ scale: 1.02 }} className="task-category-card red">
                                    <div className="d-flex justify-content-between">
                                        <h6>Productivity Prediction</h6>
                                        <FaEllipsisH />
                                    </div>
                                    <h3>{productivityScore}% Score</h3>
                                    <div className="mt-3 text-white-50">
                                        Predicted for today based on your recent activity.
                                    </div>
                                </motion.div>
                            </Col>
                            <Col md={6}>
                                <div className="widget-card d-flex align-items-center justify-content-between">
                                    <div>
                                        <h6 className="text-muted text-uppercase mb-2">Task Completion</h6>
                                        <h2 className="mb-0 fw-bold">{taskStats.completed}/{taskStats.total}</h2>
                                    </div>
                                    <div style={{ width: '100px', height: '100px' }}>
                                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row className="g-3 mt-1">
                            <Col md={4}>
                                <motion.div whileHover={{ scale: 1.02 }} className="task-category-card yellow text-dark">
                                    <h6>Pending Tasks</h6>
                                    <h3>{taskStats.pending} Remaining</h3>
                                </motion.div>
                            </Col>
                            <Col md={8}>
                                <div className="widget-card">
                                    <h5>
                                        Weekly Activity
                                    </h5>
                                    <div className="chart-container">
                                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { display: false } }, plugins: { legend: { display: false } } }} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>

                {/* Right Column: Schedule & Timer */}
                <Col lg={4}>
                    <div className="widget-card mb-4" style={{ height: 'auto' }}>
                        <h5>Today's Schedule</h5>
                        <div className="calendar-strip mb-4">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const today = new Date();
                                const date = new Date(today);
                                date.setDate(today.getDate() - today.getDay() + i + 1); // Start from Monday
                                const isToday = date.getDate() === today.getDate();
                                const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

                                return (
                                    <div key={i} className={`day-item ${isToday ? 'active' : ''}`}>
                                        {days[date.getDay()]} <span className="date">{date.getDate()}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="time">Now</div>
                                <div className="content work">
                                    <h6>Focus Mode</h6>
                                    <p>Working on High Priority Tasks</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Suggested Task Widget (AI Recommended) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="widget-card mb-4 text-white"
                        style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', height: 'auto' }}
                    >
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 className="opacity-75 mb-1"><FaMagic className="me-2" />AI Recommendation</h6>
                                <h4 className="fw-bold mb-0">Focus on this!</h4>
                            </div>
                            <div className="bg-white text-primary rounded-circle p-2 px-3 fw-bold">
                                #1
                            </div>
                        </div>

                        <div className="mt-4 bg-white bg-opacity-25 p-3 rounded-4">
                            {taskStats.pending > 0 ? (
                                <>
                                    <h5 className="mb-1 text-white fw-bold">
                                        {(() => {
                                            const pendingTasks = tasksList.filter(t => t.status !== 'Completed');
                                            // Sort: High > Medium > Low
                                            const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                                            pendingTasks.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);

                                            return pendingTasks.length > 0 ? pendingTasks[0].title : "Check your tasks";
                                        })()}
                                    </h5>
                                    <small className="opacity-75">
                                        {(() => {
                                            const pendingTasks = tasksList.filter(t => t.status !== 'Completed');
                                            const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                                            pendingTasks.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
                                            return pendingTasks.length > 0 && pendingTasks[0].priority === 'High'
                                                ? "🚨 High Priority - Do this now!"
                                                : "Aligned with your productivity peak.";
                                        })()}
                                    </small>
                                </>
                            ) : (
                                <h5 className="mb-0 text-white">All caught up! 🎉</h5>
                            )}
                        </div>
                    </motion.div>

                    <div className="task-category-card green text-center py-4">
                        <h6 className="mb-3">Focus Timer</h6>
                        <h2 className="display-4 fw-bold mb-3">{formatTime(timeLeft)}</h2>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn btn-dark rounded-circle p-3" onClick={toggleTimer}>
                                {timerActive ? <FaPause /> : <FaPlay style={{ marginLeft: '2px' }} />}
                            </button>
                            <button className="btn btn-white text-dark bg-white rounded-circle p-3" onClick={resetTimer}>
                                <div style={{ width: '14px', height: '14px', background: 'currentColor', borderRadius: '2px' }}></div>
                            </button>
                        </div>
                    </div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default Dashboard;

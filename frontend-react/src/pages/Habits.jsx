import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaFire, FaCheckCircle, FaPlus, FaTimes } from 'react-icons/fa';

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await api.get('/habits');
            setHabits(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const createHabit = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        try {
            const res = await api.post('/habits', { title: newHabit });
            setHabits([res.data, ...habits]);
            setNewHabit('');
            setShowInput(false);
        } catch (err) {
            console.error(err);
        }
    };

    const checkIn = async (id) => {
        try {
            const res = await api.post(`/habits/${id}/checkin`);
            // Update local state
            setHabits(habits.map(h => h._id === id ? res.data : h));
        } catch (err) {
            alert(err.response?.data?.msg || "Check-in failed");
        }
    };

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold mb-1">Habit Tracker 💧</h1>
                    <p className="text-muted">Build consistency, one day at a time.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowInput(!showInput)}>
                    {showInput ? <FaTimes /> : <><FaPlus className="me-2" /> New Habit</>}
                </button>
            </div>

            {showInput && (
                <motion.form
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onSubmit={createHabit}
                    className="mb-4 bg-white p-3 rounded-4 shadow-sm d-flex gap-2"
                >
                    <input
                        type="text"
                        className="form-control border-0 bg-light rounded-pill px-4"
                        placeholder="e.g., Drink 2L Water"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary rounded-circle" style={{ width: '40px', height: '40px' }}>
                        <FaPlus />
                    </button>
                </motion.form>
            )}

            <div className="row g-4">
                {habits.map(habit => {
                    const today = new Date().toISOString().split('T')[0];
                    const isDoneToday = habit.completedDates.includes(today);

                    return (
                        <div key={habit._id} className="col-md-4">
                            <motion.div
                                className={`widget-card d-flex flex-column justify-content-between ${isDoneToday ? 'border-primary' : ''}`}
                                style={{ minHeight: '180px', border: isDoneToday ? '2px solid #4a66f9' : 'none' }}
                                whileHover={{ y: -5 }}
                            >
                                <div>
                                    <h5 className="fw-bold mb-1">{habit.title}</h5>
                                    <div className="d-flex align-items-center gap-2 text-warning fw-bold">
                                        <FaFire /> {habit.streak} Day Streak
                                    </div>
                                </div>

                                <button
                                    className={`btn w-100 rounded-pill py-2 fw-bold mt-3 ${isDoneToday ? 'btn-success' : 'btn-outline-primary'}`}
                                    onClick={() => checkIn(habit._id)}
                                    disabled={isDoneToday}
                                >
                                    {isDoneToday ? <><FaCheckCircle className="me-2" /> Done for Today</> : 'Check In'}
                                </button>
                            </motion.div>
                        </div>
                    );
                })}

                {habits.length === 0 && !showInput && (
                    <div className="col-12 text-center py-5 text-muted">
                        <h4>No habits yet. Start small!</h4>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Habits;

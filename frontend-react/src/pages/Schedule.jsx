import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaMagic } from 'react-icons/fa';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const Schedule = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            // Convert tasks to calendar events
            // Assuming tasks have a 'deadline' or we just place them on 'today' for demo

            const calendarEvents = res.data.map(task => {
                const startDate = task.deadline ? new Date(task.deadline) : new Date();
                const endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

                return {
                    title: task.title,
                    start: startDate,
                    end: endDate,
                    allDay: false,
                    resource: task
                };
            });
            setEvents(calendarEvents);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAutoSchedule = async () => {
        try {
            alert("🤖 AI is optimizing your schedule based on Priority & Deadlines...");

            // Send current tasks for optimization
            // We pass tasks derived from 'events' or refetch
            const tasksPayload = events.map(e => e.resource);

            const res = await api.post('/ml/optimize-schedule', { tasks: tasksPayload });
            const optimizedTasks = res.data.optimized_schedule;

            // Map back to Calendar format
            const newEvents = optimizedTasks.map(task => {
                const today = new Date(); // Or keep original date
                const [startH, startM] = task.suggested_start.split(':');
                const [endH, endM] = task.suggested_end.split(':');

                const startDate = new Date(today);
                startDate.setHours(parseInt(startH), parseInt(startM), 0);

                const endDate = new Date(today);
                endDate.setHours(parseInt(endH), parseInt(endM), 0);

                return {
                    title: task.title,
                    start: startDate,
                    end: endDate,
                    allDay: false,
                    resource: task
                };
            });

            setEvents(newEvents);

        } catch (err) {
            console.error("Scheduling failed", err);
            alert("AI Optimization failed. Is the ML service running?");
        }
    };

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold mb-1">Smart Schedule</h1>
                    <p className="text-muted">AI-optimized calendar for your tasks.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4" onClick={handleAutoSchedule}>
                    <FaMagic className="me-2" /> Auto-Optimize
                </button>
            </div>

            <div className="bg-white p-4 rounded-4 shadow-sm" style={{ height: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    eventPropGetter={(event) => {
                        const priorityColor = event.resource.priority === 'High' ? '#ff7675' : '#74b9ff';
                        return { style: { backgroundColor: priorityColor } };
                    }}
                />
            </div>
        </motion.div>
    );
};

export default Schedule;

import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaCheck, FaTrash, FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import api from '../services/api';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [category, setCategory] = useState('Work');
    const [priority, setPriority] = useState('Medium');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            const res = await api.post('/tasks', {
                title: newTask,
                category,
                priority
            });
            setTasks([res.data, ...tasks]);
            setNewTask('');
        } catch (err) {
            console.error(err);
        }
    };

    const completeTask = async (id) => {
        try {
            const updatedTasks = tasks.map(t => t._id === id ? { ...t, status: 'Completed' } : t);
            setTasks(updatedTasks);
            await api.put(`/tasks/${id}`, { status: 'Completed' });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (id) => {
        try {
            setTasks(tasks.filter(t => t._id !== id));
            await api.delete(`/tasks/${id}`);
        } catch (err) {
            console.error(err);
        }
    }

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort: Pending first, then by Priority (High > Medium > Low)
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    filteredTasks.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'Completed' ? 1 : -1;
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold mb-1">My Tasks</h1>
                    <p className="text-muted">Manage your daily goals effectively.</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
                <Row className="g-3">
                    <Col md={5}>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-0"><FaSearch className="text-muted" /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search tasks..."
                                className="bg-light border-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-0"><FaFilter className="text-muted" /></InputGroup.Text>
                            <Form.Select
                                className="bg-light border-0"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Work">Work</option>
                                <option value="Personal">Personal</option>
                                <option value="Study">Study</option>
                                <option value="Health">Health</option>
                            </Form.Select>
                        </InputGroup>
                    </Col>
                    <Col md={3} className="d-flex align-items-center justify-content-end text-muted">
                        <small><FaSortAmountDown className="me-1" /> Sorted by Priority</small>
                    </Col>
                </Row>
            </Card>

            {/* Add Task Form */}
            <Card className="glass-panel p-4 mb-5 border-0">
                <Form onSubmit={addTask} className="d-flex gap-3 flex-wrap">
                    <Form.Control
                        type="text"
                        placeholder="Add a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        required
                        className="border-0 bg-light p-3 flex-grow-1"
                        style={{ borderRadius: '12px', minWidth: '200px' }}
                    />
                    <Form.Select
                        style={{ width: '130px', borderRadius: '12px' }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border-0 bg-light"
                    >
                        <option>Work</option>
                        <option>Personal</option>
                        <option>Study</option>
                        <option>Health</option>
                    </Form.Select>
                    <Form.Select
                        style={{ width: '130px', borderRadius: '12px' }}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="border-0 bg-light"
                    >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </Form.Select>
                    <Button variant="primary" type="submit" className="px-4 rounded-3 fw-bold"><FaPlus /> Add</Button>
                </Form>
            </Card>

            {/* Task List */}
            <ListGroup variant="flush" className="gap-3">
                <AnimatePresence>
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <motion.div
                            layout
                            key={task._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex justify-content-between align-items-center"
                        >
                            <div className="d-flex align-items-center gap-3">
                                <Button variant={task.status === 'Completed' ? 'success' : 'light'}
                                    size="sm"
                                    className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px', transition: 'all 0.2s' }}
                                    onClick={() => completeTask(task._id)}
                                    disabled={task.status === 'Completed'}
                                >
                                    <FaCheck size={12} className={task.status === 'Completed' ? 'text-white' : 'text-muted'} />
                                </Button>
                                <div>
                                    <h5 className={`mb-1 fw-bold ${task.status === 'Completed' ? 'text-decoration-line-through text-muted' : ''}`} style={{ fontSize: '1rem' }}>
                                        {task.title}
                                    </h5>
                                    <div className="d-flex gap-2">
                                        <Badge bg="light" text="dark" className="fw-normal border">{task.category}</Badge>
                                        <Badge bg={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'} text={task.priority === 'Medium' ? 'dark' : 'white'} className="fw-normal">
                                            {task.priority || 'Medium'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button variant="light" className="text-danger rounded-circle p-2" onClick={() => deleteTask(task._id)}><FaTrash /></Button>
                        </motion.div>
                    )) : (
                        <div className="text-center py-5 text-muted">
                            <p>No tasks found. Time to relax? 🌴</p>
                        </div>
                    )}
                </AnimatePresence>
            </ListGroup>
        </motion.div>
    );
};

export default Tasks;

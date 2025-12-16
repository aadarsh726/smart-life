import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaBook, FaMagic, FaSmile, FaSadTear, FaMeh } from 'react-icons/fa';

const Journal = () => {
    const [entries, setEntries] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await api.get('/journal');
            setEntries(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const saveEntry = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/journal', { content });
            setEntries([res.data, ...entries]);
            setContent('');
        } catch (err) {
            console.error(err);
            alert("Failed to analyze sentiment.");
        }
        setLoading(false);
    };

    const getMoodIcon = (label) => {
        if (label.includes('Positive')) return <FaSmile className="text-success" />;
        if (label.includes('Negative')) return <FaSadTear className="text-danger" />;
        return <FaMeh className="text-warning" />;
    };

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="row g-4 h-100">
                {/* Editor Section */}
                <div className="col-md-5">
                    <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
                        <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <FaBook className="text-primary" /> Daily Journal
                        </h4>
                        <p className="text-muted small">Write about your day. AI will analyze your mood.</p>

                        <textarea
                            className="form-control bg-light border-0 rounded-4 p-3 flex-grow-1 mb-3"
                            style={{ resize: 'none' }}
                            placeholder="Dear Diary..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        <button
                            className="btn btn-primary w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                            onClick={saveEntry}
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : <><FaMagic /> Analyze & Save</>}
                        </button>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="col-md-7">
                    <div className="h-100 overflow-auto pe-2">
                        <h5 className="fw-bold mb-3 text-muted">Recent Entries</h5>

                        {entries.map(entry => (
                            <motion.div
                                key={entry._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-4 rounded-4 shadow-sm mb-3 position-relative"
                            >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge bg-light text-dark rounded-pill px-3 py-2 border">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill">
                                        {getMoodIcon(entry.sentiment_label)}
                                        <span className="fw-bold small">{entry.sentiment_label}</span>
                                    </div>
                                </div>

                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {entry.content}
                                </p>
                            </motion.div>
                        ))}

                        {entries.length === 0 && (
                            <div className="text-center text-muted mt-5">
                                <p>No entries yet. Start writing!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Journal;

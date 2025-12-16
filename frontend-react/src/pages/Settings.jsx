import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { FaUserEdit, FaDownload, FaSignOutAlt, FaSave, FaMoon, FaSun } from 'react-icons/fa';

const Settings = () => {
    const { logout } = useContext(AuthContext);
    const { darkMode, toggleTheme } = useContext(ThemeContext);
    const [user, setUser] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/user');
            setUser({ name: res.data.name, email: res.data.email });
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/user', { name: user.name });
            setMessage('Profile updated successfully! ✅');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error updating profile. ❌');
        }
        setLoading(false);
    };

    const handleExportData = async () => {
        try {
            // Fetch all data
            const tasksRes = await api.get('/tasks');
            const userRes = await api.get('/auth/user');

            const exportData = {
                userProfile: userRes.data,
                tasks: tasksRes.data,
                exportedAt: new Date().toISOString()
            };

            // Create blob and download
            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `smartlife_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setMessage('Data exported successfully! 📂');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Export failed", err);
            setMessage('Export failed.');
        }
    };

    return (
        <motion.div className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="fw-bold mb-4">Settings & Customization</h1>

            {message && (
                <div className={`alert ${message.includes('Error') || message.includes('failed') ? 'alert-danger' : 'alert-success'} rounded-pill px-4`}>
                    {message}
                </div>
            )}

            <div className="row g-4">
                {/* Profile Settings */}
                <div className="col-md-6">
                    <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-light p-3 rounded-circle text-primary">
                                <FaUserEdit size={24} />
                            </div>
                            <h5 className="fw-bold mb-0">Edit Profile</h5>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-3">
                                <label className="form-label text-muted">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control rounded-pill px-3 py-2 bg-light border-0"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control rounded-pill px-3 py-2 bg-light border-0"
                                    value={user.email}
                                    disabled
                                />
                                <small className="text-muted ms-2">Email cannot be changed.</small>
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                                {loading ? 'Saving...' : <><FaSave className="me-2" /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Data Management */}
                <div className="col-md-6">
                    <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="bg-light p-3 rounded-circle text-success">
                                <FaDownload size={24} />
                            </div>
                            <h5 className="fw-bold mb-0">Data Management</h5>
                        </div>

                        <p className="text-muted mb-4">
                            Download a copy of all your tasks and profile data.
                            Useful for backups or migrating to another device.
                        </p>

                        <button onClick={handleExportData} className="btn btn-outline-success rounded-pill px-4 mb-3 w-100 text-start">
                            <FaDownload className="me-2" /> Export All Data (.json)
                        </button>

                        <hr className="my-4" />

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-light p-3 rounded-circle text-warning">
                                    {darkMode ? <FaMoon size={24} /> : <FaSun size={24} />}
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Appearance</h6>
                                    <small className="text-muted">{darkMode ? 'Dark Mode' : 'Light Mode'}</small>
                                </div>
                            </div>
                            <div className="form-check form-switch px-0">
                                <input
                                    className="form-check-input float-end"
                                    type="checkbox"
                                    role="switch"
                                    checked={darkMode}
                                    onChange={toggleTheme}
                                    style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <h6 className="text-danger fw-bold mb-3">Danger Zone</h6>
                            <button onClick={logout} className="btn btn-danger rounded-pill px-4 w-100 text-start">
                                <FaSignOutAlt className="me-2" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;

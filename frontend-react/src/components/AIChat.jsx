import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaMicrophone, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import api from '../services/api';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am your AI assistant. Ask me about your tasks or productivity!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const messagesEndRef = useRef(null);

    // Speech Logic
    const speak = (text) => {
        if (!voiceEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support Voice Input.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            // Optional: Auto-send
            // sendMessage(new Event('submit'), transcript); 
        };

        recognition.start();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
            speak(res.data.reply);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to my brain right now.' }]);
        }
        setLoading(false);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="position-fixed border-0 d-flex align-items-center justify-content-center shadow-lg"
                style={{
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                    color: 'white'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaTimes size={24} /> : <FaRobot size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="position-fixed bg-white shadow-2xl rounded-4 overflow-hidden d-flex flex-column"
                        style={{
                            bottom: '100px',
                            right: '30px',
                            width: '350px',
                            height: '500px',
                            zIndex: 1000,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 text-white d-flex align-items-center gap-2" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}>
                            <FaRobot />
                            <h6 className="mb-0 fw-bold">Smart Assistant</h6>
                            <div className="ms-auto cursor-pointer" onClick={() => setVoiceEnabled(!voiceEnabled)}>
                                {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow-1 p-3 overflow-auto bg-light">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                    <div className={`p-3 rounded-4 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark shadow-sm'}`}
                                        style={{
                                            maxWidth: '80%',
                                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                            borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px'
                                        }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="bg-white p-3 rounded-4 shadow-sm text-muted fst-italic">
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-3 bg-white border-top d-flex gap-2">
                            <input
                                type="text"
                                className="form-control border-0 bg-light rounded-pill px-4"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />

                            <button
                                type="button"
                                className={`btn rounded-circle d-flex align-items-center justify-content-center ${isListening ? 'btn-danger pulse-animation' : 'btn-light text-muted'}`}
                                style={{ width: '40px', height: '40px' }}
                                onClick={startListening}
                            >
                                <FaMicrophone size={14} />
                            </button>

                            <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} disabled={loading}>
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChat;

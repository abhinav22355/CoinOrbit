import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RefreshCw, Check, Edit3, AlertCircle, Volume2, Sparkles } from 'lucide-react';
import { parseVoiceExpense } from '../utils/voiceParser';

const SAMPLE_VOICE_COMMANDS = [
  'I spent 500 rupees on lunch today.',
  'I bought a shirt for 1200 rupees yesterday.',
  'I spent 300 rupees watching a movie.',
  'five hundred rupees for dinner',
  'one thousand five hundred rupees on jeans',
];

const VoiceExpenseInput = ({ onExpenseConfirmed }) => {
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [state, setState] = useState('idle'); // idle | listening | processing | success | error | permission_denied
  const [transcript, setTranscript] = useState('');
  const [detectedExpense, setDetectedExpense] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    amount: '',
    category: 'Other',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Optimized for Indian English accent & rupee notation

      recognition.onstart = () => {
        setState('listening');
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setState('processing');

        // Parse extracted speech
        setTimeout(() => {
          handleParseTranscript(spokenText);
        }, 500);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setState('permission_denied');
          setErrorMessage('Microphone permission is required for voice input.');
        } else if (event.error === 'no-speech') {
          setState('error');
          setErrorMessage('No speech detected. Tap the microphone and try again.');
        } else {
          setState('error');
          setErrorMessage('Could not understand the expense. Please try again.');
        }
      };

      recognition.onend = () => {
        if (state === 'listening') {
          setState('idle');
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setRecognitionSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleParseTranscript = (text) => {
    const parsed = parseVoiceExpense(text);
    setDetectedExpense(parsed);
    setEditData({
      amount: parsed.amount,
      category: parsed.category,
      note: parsed.note,
      date: parsed.date,
    });

    if (parsed.isValid) {
      setState('success');
    } else {
      setState('error');
      setErrorMessage(
        'Could not detect an expense amount. Please tap Try Again or edit details manually.'
      );
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setDetectedExpense(null);
    setErrorMessage('');
    setIsEditing(false);
    try {
      recognitionRef.current.start();
    } catch (err) {
      // If already started, abort and restart
      recognitionRef.current.abort();
      setTimeout(() => {
        recognitionRef.current.start();
      }, 100);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState('processing');
  };

  // Allow testing sample voice commands directly (great for college viva demo!)
  const handleSimulateSample = (sample) => {
    setTranscript(sample);
    setState('processing');
    setTimeout(() => {
      handleParseTranscript(sample);
    }, 400);
  };

  const handleConfirmSave = () => {
    if (!editData.amount || Number(editData.amount) <= 0) {
      setErrorMessage('Please enter a valid amount before saving');
      return;
    }

    onExpenseConfirmed({
      amount: Number(editData.amount),
      category: editData.category,
      note: editData.note,
      date: new Date(editData.date).toISOString(),
    });
  };

  if (!recognitionSupported) {
    return (
      <div className="voice-unsupported-box">
        <AlertCircle size={28} className="text-warning" />
        <h4>Speech Recognition Not Supported</h4>
        <p>Voice input is not supported by this browser. Please use manual entry.</p>
        <div className="simulation-helper">
          <p className="helper-label">Try Voice Parser with Simulation:</p>
          <div className="sample-chips">
            {SAMPLE_VOICE_COMMANDS.map((cmd, i) => (
              <button
                key={i}
                type="button"
                className="sample-chip"
                onClick={() => handleSimulateSample(cmd)}
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      {/* Visual State & Controls */}
      <div className="voice-visualizer-area">
        {state === 'idle' && (
          <div className="voice-idle">
            <button
              type="button"
              className="mic-circle-btn"
              onClick={startListening}
              title="Start Speaking"
            >
              <Mic size={36} />
            </button>
            <h4 className="voice-state-title">Tap to Speak</h4>
            <p className="voice-state-desc">
              Speak naturally, e.g. "I spent 500 rupees on lunch today"
            </p>
          </div>
        )}

        {state === 'listening' && (
          <div className="voice-listening">
            <div className="pulse-ring-wrapper">
              <div className="pulse-ring ring-1"></div>
              <div className="pulse-ring ring-2"></div>
              <button
                type="button"
                className="mic-circle-btn listening"
                onClick={stopListening}
                title="Stop Listening"
              >
                <div className="listening-stop-icon"></div>
              </button>
            </div>
            <div className="listening-badge">
              <span className="live-dot"></span> Listening...
            </div>
            <p className="voice-state-desc">Say your expense details clearly</p>
          </div>
        )}

        {state === 'processing' && (
          <div className="voice-processing">
            <div className="spinner-voice"></div>
            <h4 className="voice-state-title">Processing your expense...</h4>
            <p className="voice-state-desc">Analyzing natural language & extracting details</p>
          </div>
        )}

        {state === 'permission_denied' && (
          <div className="voice-error-box">
            <MicOff size={36} className="text-danger" />
            <h4 className="voice-state-title text-danger">Microphone Permission Required</h4>
            <p className="voice-state-desc">
              Microphone permission is required for voice input. Please grant browser permissions or use manual entry.
            </p>
            <button type="button" className="btn btn-outline btn-sm" onClick={startListening}>
              Grant & Try Again
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="voice-error-box">
            <AlertCircle size={36} className="text-danger" />
            <h4 className="voice-state-title text-danger">Detection Failed</h4>
            <p className="voice-state-desc">{errorMessage || 'Could not understand the expense. Please try again.'}</p>
            {transcript && (
              <div className="transcript-preview">
                <span className="transcript-label">Recognized:</span> "{transcript}"
              </div>
            )}
            <div className="voice-actions-row">
              <button type="button" className="btn btn-primary btn-sm" onClick={startListening}>
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recognized Transcript & Parsed Preview */}
      {(state === 'success' || detectedExpense) && (
        <div className="detected-expense-card">
          <div className="transcript-bubble">
            <Volume2 size={16} className="transcript-icon" />
            <div className="transcript-text">
              <span className="transcript-header">You said:</span>
              <p className="transcript-quote">"{transcript}"</p>
            </div>
          </div>

          <div className="detected-details-header">
            <div className="details-badge">
              <Sparkles size={16} /> Detected Expense Details
            </div>
            <span className="validation-note">Requires your confirmation</span>
          </div>

          {!isEditing ? (
            <div className="detected-grid">
              <div className="detected-item">
                <span className="detected-label">Amount</span>
                <span className="detected-val amount-highlight">
                  ₹{Number(editData.amount).toLocaleString()}
                </span>
              </div>
              <div className="detected-item">
                <span className="detected-label">Category</span>
                <span className="detected-val category-highlight">{editData.category}</span>
              </div>
              <div className="detected-item">
                <span className="detected-label">Note</span>
                <span className="detected-val">{editData.note || 'None'}</span>
              </div>
              <div className="detected-item">
                <span className="detected-label">Date</span>
                <span className="detected-val">{editData.date}</span>
              </div>
            </div>
          ) : (
            <div className="detected-edit-form">
              <div className="edit-field">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                />
              </div>
              <div className="edit-field">
                <label>Category</label>
                <select
                  className="form-control"
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                >
                  <option value="Food">Food</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Note</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.note}
                  onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                />
              </div>
              <div className="edit-field">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* User Confirmation Buttons */}
          <div className="detected-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={startListening}
              title="Record again"
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={16} /> {isEditing ? 'Done Editing' : 'Edit'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleConfirmSave}
            >
              <Check size={18} /> Save Expense
            </button>
          </div>
        </div>
      )}

      {/* College Viva Demo Shortcuts: clickable sample phrases */}
      <div className="viva-quick-samples">
        <span className="samples-title">Voice Demo Samples (Click to test NLP):</span>
        <div className="sample-pills">
          {SAMPLE_VOICE_COMMANDS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="sample-pill"
              onClick={() => handleSimulateSample(sample)}
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceExpenseInput;

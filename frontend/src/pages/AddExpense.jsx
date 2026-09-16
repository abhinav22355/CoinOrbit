import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Edit3, Mic, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import VoiceExpenseInput from '../components/VoiceExpenseInput';

const AddExpense = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode from URL query (?mode=voice) or defaults to 'manual'
  const initialMode = searchParams.get('mode') === 'voice' ? 'voice' : 'manual';
  const [activeTab, setActiveTab] = useState(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('mode') === 'voice') {
      setActiveTab('voice');
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ mode: tab });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleManualSubmit = async (expenseData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { data } = await API.post('/expenses', expenseData);

      if (data.success) {
        setSuccessMessage(`Expense of ₹${expenseData.amount} added to ${expenseData.category} successfully!`);
        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save expense');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceConfirmed = async (voiceExpenseData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { data } = await API.post('/expenses', voiceExpenseData);

      if (data.success) {
        setSuccessMessage(
          `✓ Voice expense saved: ₹${voiceExpenseData.amount} in ${voiceExpenseData.category}!`
        );
        setTimeout(() => {
          navigate('/expenses');
        }, 1200);
      }
    } catch (err) {
      console.error('Error saving voice expense:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save voice expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-expense-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Add Expense</h1>
          <p className="page-subtitle">Log your expenditure manually or with your voice</p>
        </div>
      </div>

      {/* Success and Error Alerts */}
      {successMessage && (
        <div className="form-success-alert">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="form-error-alert">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Segmented Toggle Tabs */}
      <div className="tab-buttons-container">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => handleTabChange('manual')}
        >
          <Edit3 size={18} />
          <span>Manual Entry</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => handleTabChange('voice')}
        >
          <Mic size={18} />
          <span>🎤 Voice Entry</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="entry-card-wrapper">
        {activeTab === 'manual' ? (
          <div className="manual-entry-card">
            <h3 className="entry-card-title">Enter Expense Details</h3>
            <p className="entry-card-desc">Fill out the fields below to record a transaction.</p>
            <ExpenseForm onSubmit={handleManualSubmit} isLoading={isSubmitting} />
          </div>
        ) : (
          <div className="voice-entry-card">
            <h3 className="entry-card-title">Voice Expense Entry</h3>
            <p className="entry-card-desc">
              Speak naturally into your microphone. CoinOrbit automatically detects the amount, category, and date.
            </p>
            <VoiceExpenseInput onExpenseConfirmed={handleVoiceConfirmed} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpense;

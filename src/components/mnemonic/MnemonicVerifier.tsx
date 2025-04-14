import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface MnemonicVerifierProps {
  mnemonic: string;
  onVerify: (verified: boolean) => void;
  numWords?: number;
}

/**
 * Mnemonic Verifier Component
 * 
 * Verifies that the user has correctly recorded their mnemonic phrase
 * by asking them to enter specific words from the phrase.
 */
const MnemonicVerifier: React.FC<MnemonicVerifierProps> = ({
  mnemonic,
  onVerify,
  numWords = 3
}) => {
  const { client } = useAuth();
  
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Array<{ index: number; word: string }>>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  
  // Get BIP-39 wordlist and generate quiz questions on mount
  useEffect(() => {
    if (client && mnemonic) {
      try {
        // Get wordlist
        const mnemonicService = client.getCryptoService().getMnemonicService();
        setWordlist(mnemonicService.getWordList());
        
        // Generate quiz questions
        const questions = mnemonicService.generateQuizQuestions(mnemonic, numWords);
        setQuizQuestions(questions);
        setAnswers(Array(questions.length).fill(''));
      } catch (err) {
        console.error('Failed to initialize verifier:', err);
        setError('Failed to initialize verification. Please try again.');
      }
    }
  }, [client, mnemonic, numWords]);
  
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };
  
  const handleVerify = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if all questions are answered
      const allAnswered = answers.every(answer => answer.trim() !== '');
      
      if (!allAnswered) {
        setError('Please answer all verification questions');
        setLoading(false);
        return;
      }
      
      // Check if answers are correct
      const mnemonicWords = mnemonic.split(' ');
      const correct = quizQuestions.every((question, index) => 
        answers[index].toLowerCase() === mnemonicWords[question.index].toLowerCase()
      );
      
      if (!correct) {
        setError('One or more answers are incorrect. Please check your recovery phrase and try again.');
        setLoading(false);
        return;
      }
      
      // Set verified state and call onVerify callback
      setVerified(true);
      onVerify(true);
    } catch (err) {
      console.error('Verification failed:', err);
      setError(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
      onVerify(false);
    } finally {
      setLoading(false);
    }
  };
  
  if (verified) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          Verification successful! You have correctly verified your recovery phrase.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Verify Your Recovery Phrase
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Please enter the requested words from your recovery phrase to verify that you've saved it correctly.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {quizQuestions.map((question, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Autocomplete
              value={answers[index]}
              onChange={(event, newValue) => {
                handleAnswerChange(index, newValue || '');
              }}
              options={wordlist}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Word #${question.index + 1}`}
                  fullWidth
                  required
                  helperText={`Enter the ${getOrdinalSuffix(question.index + 1)} word`}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleVerify}
          disabled={loading || answers.some(a => !a)}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify'}
        </Button>
      </Box>
    </Box>
  );
};

// Helper function to get ordinal suffix
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}

export default MnemonicVerifier;

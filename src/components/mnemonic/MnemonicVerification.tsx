import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import { ContentCopy as CopyIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface MnemonicVerificationProps {
  onComplete: (mnemonic: string, verified: boolean) => void;
  onCancel?: () => void;
  existingMnemonic?: string;
  showGenerateStep?: boolean;
}

/**
 * Mnemonic Verification Component
 * 
 * A reusable component for generating, displaying, and verifying BIP-39 mnemonic phrases.
 * Can be used in both setup and recovery flows.
 */
const MnemonicVerification: React.FC<MnemonicVerificationProps> = ({
  onComplete,
  onCancel,
  existingMnemonic,
  showGenerateStep = true
}) => {
  const { generateMnemonic, generateMnemonicQuiz, verifyMnemonicQuiz } = useAuth();
  
  // Component state
  const [step, setStep] = useState(showGenerateStep ? 0 : 1);
  const [mnemonic, setMnemonic] = useState(existingMnemonic || '');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<Array<{ index: number; word: string }>>([]);
  const [quizAnswers, setQuizAnswers] = useState<Array<{ index: number; word: string }>>([]);
  
  // Generate mnemonic on component mount if needed
  useEffect(() => {
    if (!existingMnemonic && showGenerateStep) {
      try {
        const newMnemonic = generateMnemonic(128); // 12 words
        setMnemonic(newMnemonic);
      } catch (err) {
        console.error('Failed to generate mnemonic:', err);
        setError('Failed to generate recovery phrase. Please try again.');
      }
    }
  }, [existingMnemonic, generateMnemonic, showGenerateStep]);
  
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleNext = () => {
    if (step === 0) {
      // Move to verification step
      try {
        // Generate quiz questions
        const questions = generateMnemonicQuiz(mnemonic, 3);
        setQuizQuestions(questions);
        setQuizAnswers(Array(questions.length).fill({ index: -1, word: '' }));
        setError(null);
        setStep(1);
      } catch (err) {
        console.error('Failed to generate quiz questions:', err);
        setError('Failed to generate verification questions. Please try again.');
      }
    } else if (step === 1) {
      // Verify quiz answers
      setLoading(true);
      
      try {
        const allAnswered = quizAnswers.every(answer => answer.word.trim() !== '');
        
        if (!allAnswered) {
          setError('Please answer all verification questions');
          setLoading(false);
          return;
        }
        
        const correct = verifyMnemonicQuiz(mnemonic, quizAnswers);
        
        if (!correct) {
          setError('One or more answers are incorrect. Please check your recovery phrase and try again.');
          setLoading(false);
          return;
        }
        
        // Call the onComplete callback with the mnemonic and verification status
        onComplete(mnemonic, true);
      } catch (err) {
        console.error('Verification failed:', err);
        setError(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleBack = () => {
    if (step === 1 && showGenerateStep) {
      setStep(0);
    } else if (onCancel) {
      onCancel();
    }
  };
  
  const handleQuizAnswerChange = (index: number, word: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[index] = { index: quizQuestions[index].index, word };
    setQuizAnswers(newAnswers);
  };
  
  const renderMnemonicWords = () => {
    const words = mnemonic.split(' ');
    
    return (
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {words.map((word, index) => (
          <Grid item xs={4} key={index}>
            <Chip
              label={`${index + 1}. ${word}`}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {step === 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Your Recovery Phrase
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="bold">
              IMPORTANT: Write down these 12 words and keep them in a safe place.
            </Typography>
            <Typography variant="body2">
              This recovery phrase is the only way to recover your encrypted data if you forget your password.
              Anyone with access to this phrase can access your encrypted data.
            </Typography>
          </Alert>
          
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Recovery Phrase (12 words)
                </Typography>
                <Box>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={handleCopyMnemonic}
                    color={copied ? "success" : "primary"}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    size="small"
                    startIcon={showMnemonic ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? "Hide" : "Show"}
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {showMnemonic ? (
                renderMnemonicWords()
              ) : (
                <Box
                  sx={{
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Click "Show" to reveal your recovery phrase
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Alert severity="info">
            <Typography variant="body2">
              In the next step, you'll be asked to verify 3 random words from your recovery phrase.
              Make sure you've written it down before continuing.
            </Typography>
          </Alert>
        </>
      )}
      
      {step === 1 && (
        <>
          <Typography variant="h6" gutterBottom>
            Verify Your Recovery Phrase
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Please enter the requested words from your recovery phrase to verify that you've saved it correctly.
          </Typography>
          
          {quizQuestions.map((question, index) => (
            <TextField
              key={index}
              label={`Word #${question.index + 1}`}
              value={quizAnswers[index]?.word || ''}
              onChange={(e) => handleQuizAnswerChange(index, e.target.value)}
              fullWidth
              margin="normal"
              required
              helperText={`Enter the ${question.index + 1}${getOrdinalSuffix(question.index + 1)} word from your recovery phrase`}
            />
          ))}
        </>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={handleBack}
          disabled={loading}
        >
          {step === 0 && onCancel ? 'Cancel' : 'Back'}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : step === 1 ? (
            'Verify'
          ) : (
            'Next'
          )}
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
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

export default MnemonicVerification;

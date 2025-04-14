import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Grid,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface MnemonicWordInputProps {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onKeyDown?: (index: number, event: React.KeyboardEvent) => void;
  wordlist: string[];
  error?: boolean;
  helperText?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}

/**
 * Single word input for a mnemonic phrase with autocomplete
 */
const MnemonicWordInput: React.FC<MnemonicWordInputProps> = ({
  index,
  value,
  onChange,
  onKeyDown,
  wordlist,
  error = false,
  helperText,
  inputRef,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  // Filter wordlist based on input
  const filteredOptions = wordlist.filter(word => 
    word.toLowerCase().startsWith(inputValue.toLowerCase())
  );
  
  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.toLowerCase();
    setInputValue(newValue);
    
    // Auto-complete if there's only one matching word and input is at least 4 chars
    if (newValue.length >= 4 && filteredOptions.length === 1) {
      onChange(index, filteredOptions[0]);
      setInputValue(filteredOptions[0]);
    }
  };
  
  // Handle selection
  const handleChange = (event: React.SyntheticEvent, newValue: string | null) => {
    if (newValue) {
      onChange(index, newValue);
      setInputValue(newValue);
    }
  };
  
  // Update local state when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        if (event && event.type === 'change') {
          setInputValue(newInputValue);
        }
      }}
      options={wordlist}
      filterOptions={(options, state) => {
        return options.filter(option => 
          option.toLowerCase().startsWith(state.inputValue.toLowerCase())
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Word ${index + 1}`}
          variant="outlined"
          fullWidth
          error={error}
          helperText={helperText}
          onChange={handleInputChange}
          onKeyDown={(e) => onKeyDown && onKeyDown(index, e)}
          inputRef={inputRef}
          disabled={disabled}
        />
      )}
      disabled={disabled}
    />
  );
};

interface MnemonicInputGridProps {
  value: string[];
  onChange: (words: string[]) => void;
  onComplete?: (mnemonic: string) => void;
  readOnly?: boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * Grid of 12 word inputs for a BIP-39 mnemonic phrase
 * 
 * Features:
 * - Auto-completion based on first 4 characters
 * - Tab navigation between fields
 * - Validation against BIP-39 wordlist
 */
const MnemonicInputGrid: React.FC<MnemonicInputGridProps> = ({
  value,
  onChange,
  onComplete,
  readOnly = false,
  error = false,
  helperText
}) => {
  const { client } = useAuth();
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [wordErrors, setWordErrors] = useState<boolean[]>(Array(12).fill(false));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(12).fill(null));
  
  // Get BIP-39 wordlist on mount
  useEffect(() => {
    if (client) {
      const mnemonicService = client.getCryptoService().getMnemonicService();
      setWordlist(mnemonicService.getWordList());
    }
  }, [client]);
  
  // Handle word change
  const handleWordChange = (index: number, word: string) => {
    const newWords = [...value];
    newWords[index] = word;
    onChange(newWords);
    
    // Validate word
    const isValid = wordlist.includes(word);
    const newErrors = [...wordErrors];
    newErrors[index] = !isValid && word.length > 0;
    setWordErrors(newErrors);
    
    // Auto-focus next input if word is valid and not the last word
    if (isValid && index < 11 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Check if all words are filled and valid
    if (newWords.every(w => w && wordlist.includes(w)) && newWords.length === 12) {
      onComplete && onComplete(newWords.join(' '));
    }
  };
  
  // Handle key navigation
  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      // Prevent default tab behavior
      event.preventDefault();
      
      // Focus next input
      if (index < 11 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (event.key === 'Tab' && event.shiftKey) {
      // Prevent default tab behavior
      event.preventDefault();
      
      // Focus previous input
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };
  
  // Initialize value array if needed
  useEffect(() => {
    if (!value || value.length !== 12) {
      onChange(Array(12).fill(''));
    }
  }, [value, onChange]);
  
  return (
    <Box sx={{ mt: 2 }}>
      {error && helperText && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {helperText}
        </Typography>
      )}
      
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {readOnly ? (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <Chip
                  label={`${index + 1}. ${value[index] || '—'}`}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                />
              </Paper>
            ) : (
              <MnemonicWordInput
                index={index}
                value={value[index] || ''}
                onChange={handleWordChange}
                onKeyDown={handleKeyDown}
                wordlist={wordlist}
                error={wordErrors[index] || error}
                inputRef={(el) => { inputRefs.current[index] = el; }}
                disabled={readOnly}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MnemonicInputGrid;

import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Box,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Fade,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const tones = [
    { value: '', label: 'None', icon: '✨' },
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'casual', label: 'Casual', icon: '😎' },
    { value: 'friendly', label: 'Friendly', icon: '🤝' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setGeneratedReply('');

    try {
      const response = await axios.post('https://email-ai-backend-09y2.onrender.com/api/email/generate', {
        emailContent,
        tone: tone || undefined,
      });
      const replyText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      setGeneratedReply(replyText);
      setSnackbarMessage('✅ Reply generated successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate reply. Please try again.';
      setError(errorMsg);
      setSnackbarMessage(`❌ ${errorMsg}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedReply) return;
    try {
      await navigator.clipboard.writeText(generatedReply);
      setCopySuccess(true);
      setSnackbarMessage('📋 Copied to clipboard!');
      setSnackbarOpen(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setSnackbarMessage('❌ Failed to copy');
      setSnackbarOpen(true);
    }
  };

  const handleClear = () => {
    setEmailContent('');
    setTone('');
    setGeneratedReply('');
    setError('');
    setSnackbarMessage('🧹 Cleared all fields');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        py: { xs: 2, md: 4 },
        px: { xs: 1.5, md: 3 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
        <Fade in timeout={800}>
          <Paper
            elevation={12}
            sx={{
              borderRadius: { xs: 3, md: 5 },
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(2px)',
              transition: 'all 0.2s',
            }}
          >
            {/* Header - redesigned to feel fully inside the card */}
            <Box
              sx={{
                background: 'linear-gradient(105deg, #0f172a 0%, #1e293b 100%)',
                px: { xs: 2, md: 5 },
                py: { xs: 3, md: 4.5 },
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Typography
                variant="h3"
                component="h1"
                fontWeight={800}
                gutterBottom
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.01em',
                }}
              >
                ✨ AI Email Reply Generator
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#cbd5e1',
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  mt: 1,
                }}
              >
                Powered by Spring Boot + AI — generate email replies in seconds
              </Typography>
            </Box>

            {/* Main Form */}
            <Box sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Original Email Content"
                  placeholder="Paste the email you received here..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#fff',
                    },
                  }}
                />

                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Choose a tone (optional)
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1.5}>
                    {tones.map((t) => (
                      <Chip
                        key={t.value}
                        label={`${t.icon} ${t.label}`}
                        onClick={() => setTone(t.value)}
                        color={tone === t.value ? 'primary' : 'default'}
                        variant={tone === t.value ? 'filled' : 'outlined'}
                        sx={{
                          fontSize: '0.9rem',
                          py: 2,
                          px: 1,
                          borderRadius: 3,
                          transition: '0.2s',
                          '&:hover': { transform: 'translateY(-2px)' },
                        }}
                        clickable
                      />
                    ))}
                  </Stack>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!emailContent.trim() || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      flex: 2,
                      py: 1.2,
                      borderRadius: 3,
                      backgroundColor: '#0f172a',
                      '&:hover': { backgroundColor: '#1e293b' },
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Reply'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    startIcon={<ClearIcon />}
                    sx={{ flex: 1, borderRadius: 3 }}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </Stack>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Divider sx={{ my: 1 }} />

                {generatedReply && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom display="flex" alignItems="center" gap={1}>
                        <AutoAwesomeIcon color="primary" /> AI‑Powered Reply
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        variant="outlined"
                        value={generatedReply}
                        InputProps={{
                          readOnly: true,
                          sx: { borderRadius: 3, backgroundColor: '#f8fafc' },
                        }}
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopy}
                        sx={{ mt: 2, borderRadius: 3 }}
                      >
                        {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                      </Button>
                    </Box>
                  </Fade>
                )}
              </Stack>
            </Box>

            <Box sx={{ bgcolor: '#f1f5f9', py: 2, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="caption" color="text.secondary">
                AI Reply Generator • Spring Boot Backend • Designed by Rasool
              </Typography>
            </Box>
          </Paper>
        </Fade>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={error ? 'error' : 'success'} sx={{ width: '100%', borderRadius: 2 }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default App;
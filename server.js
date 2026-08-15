const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Target VentureCare backend — set VENTURECARE_URL in Railway env vars.
// staging.venturecare.com for staging, studio.venturecare.com for production.
const VENTURECARE_URL = process.env.VENTURECARE_URL || 'https://studio.venturecare.com';

const proxy = (pathRewrite) => createProxyMiddleware({
  target: VENTURECARE_URL,
  changeOrigin: true,
  pathRewrite,
  on: {
    error: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(502).send('Survey temporarily unavailable. Please try again.');
    },
  },
});

// Survey page (React SPA shell)
app.use('/survey', proxy());

// API calls made by the survey form
app.use('/api/team-survey', proxy());

// JS/CSS/font assets the React SPA loads
app.use('/assets', proxy());

// Static files for the practiceculturescore.com homepage
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

// Catch-all: serve the homepage for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`practiceculturescore.com running on port ${PORT} → proxying surveys to ${VENTURECARE_URL}`);
});

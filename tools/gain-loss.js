// Gain/Loss Calculator - JavaScript

// Pair configuration
const glPairConfig = {
  'EURUSD': { type: 'forex', contractSize: 100000, decimals: 4, name: 'EUR/USD' },
  'GBPUSD': { type: 'forex', contractSize: 100000, decimals: 4, name: 'GBP/USD' },
  'USDJPY': { type: 'forex', contractSize: 100000, decimals: 2, name: 'USD/JPY' },
  'USDCHF': { type: 'forex', contractSize: 100000, decimals: 4, name: 'USD/CHF' },
  'AUDUSD': { type: 'forex', contractSize: 100000, decimals: 4, name: 'AUD/USD' },
  'USDCAD': { type: 'forex', contractSize: 100000, decimals: 4, name: 'USD/CAD' },
  'NZDUSD': { type: 'forex', contractSize: 100000, decimals: 4, name: 'NZD/USD' },
  'XAUUSD': { type: 'metal', contractSize: 100, decimals: 2, name: 'Gold (XAU/USD)' },
  'XAGUSD': { type: 'metal', contractSize: 5000, decimals: 3, name: 'Silver (XAG/USD)' },
  'BTCUSD': { type: 'crypto', contractSize: 1, decimals: 2, name: 'Bitcoin (BTC/USD)' },
  'ETHUSD': { type: 'crypto', contractSize: 1, decimals: 2, name: 'Ethereum (ETH/USD)' }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateGLPairInfo();
});

// Update pair info display
function updateGLPairInfo() {
  const pair = document.getElementById('gl-pair').value;
  // Could add additional info display if needed
}

// Calculate gain/loss
function calculateGainLoss() {
  const pair = document.getElementById('gl-pair').value;
  const entry = parseFloat(document.getElementById('gl-entry').value);
  const exit = parseFloat(document.getElementById('gl-exit').value);
  const lots = parseFloat(document.getElementById('gl-lots').value);
  const commission = parseFloat(document.getElementById('gl-comm').value) || 0;
  
  // Validation
  if (!entry || entry <= 0) {
    showToast('Please enter a valid entry price', 'error');
    return;
  }
  
  if (!exit || exit <= 0) {
    showToast('Please enter a valid exit price', 'error');
    return;
  }
  
  if (!lots || lots <= 0) {
    showToast('Please enter a valid position size', 'error');
    return;
  }
  
  const config = glPairConfig[pair];
  if (!config) {
    showToast('Invalid pair selected', 'error');
    return;
  }
  
  // Calculate price difference
  const priceDiff = exit - entry;
  
  // Calculate P&L based on instrument type
  let grossPnL = 0;
  
  if (config.type === 'forex') {
    if (pair.includes('JPY')) {
      // For JPY pairs
      grossPnL = (priceDiff / entry) * config.contractSize * lots;
    } else {
      // For standard forex pairs
      grossPnL = priceDiff * config.contractSize * lots;
    }
  } else if (config.type === 'metal') {
    // For metals (XAU, XAG)
    grossPnL = priceDiff * config.contractSize * lots;
  } else if (config.type === 'crypto') {
    // For crypto
    grossPnL = priceDiff * config.contractSize * lots;
  }
  
  // Calculate net P&L after commission
  const netPnL = grossPnL - commission;
  
  // Calculate pips movement
  let pipSize = 0;
  if (config.type === 'forex') {
    pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
  } else if (config.type === 'metal') {
    pipSize = pair === 'XAUUSD' ? 0.10 : 0.01;
  } else if (config.type === 'crypto') {
    pipSize = pair === 'BTCUSD' ? 1.00 : 0.10;
  }
  
  const pipsMoved = Math.abs(priceDiff) / pipSize;
  
  // Calculate return percentage (assuming 1 lot = notional value)
  const notionalValue = entry * config.contractSize * lots;
  const returnPercent = (netPnL / notionalValue) * 100;
  
  // Display results
  const resultEl = document.getElementById('gl-result-value');
  const resultContainer = document.getElementById('gl-results');
  
  resultEl.textContent = formatCurrency(netPnL);
  resultEl.className = 'gainloss-result-value ' + (netPnL >= 0 ? 'positive' : 'negative');
  
  document.getElementById('gl-gross').textContent = formatCurrency(grossPnL);
  document.getElementById('gl-gross').style.color = grossPnL >= 0 ? 'var(--green2)' : 'var(--red2)';
  
  document.getElementById('gl-commission').textContent = '-$' + commission.toFixed(2);
  document.getElementById('gl-change').textContent = pipsMoved.toFixed(1) + ' pips';
  document.getElementById('gl-return').textContent = returnPercent.toFixed(2) + '%';
  
  resultContainer.style.display = 'block';
  
  showToast('Calculation complete!', 'success');
}

// Format currency
function formatCurrency(amount) {
  const sign = amount >= 0 ? '+' : '';
  return sign + '$' + Math.abs(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Show toast notification
function showToast(message, type = 'info') {
  const toastsContainer = document.getElementById('toasts');
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    background: ${type === 'error' ? 'var(--red)' : type === 'success' ? 'var(--green)' : 'var(--accent)'};
    color: #fff;
    padding: 12px 20px;
    border-radius: var(--rs);
    margin-bottom: 8px;
    box-shadow: var(--shadow);
    animation: slideIn 0.3s ease;
  `;
  
  toastsContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles if not already present
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Position Size Calculator - JavaScript

// Pair configuration with pip info
const pairConfig = {
  // Forex pairs (4 decimal places)
  'EURUSD': { type: 'forex', decimals: 4, pipSize: 0.0001, lotSize: 100000, name: 'EUR/USD' },
  'GBPUSD': { type: 'forex', decimals: 4, pipSize: 0.0001, lotSize: 100000, name: 'GBP/USD' },
  'USDCHF': { type: 'forex', decimals: 4, pipSize: 0.0001, lotSize: 100000, name: 'USD/CHF' },
  'AUDUSD': { type: 'forex', decimals: 4, pipSize: 0.0001, lotSize: 100000, name: 'AUD/USD' },
  'USDCAD': { type: 'forex', decimals: 4, pipSize: 0.0001, lotSize: 100000, name: 'USD/CAD' },
  'NZDUSD': { type: 'forex', decimals: 4, pipSize: 0.0001, lotSize: 100000, name: 'NZD/USD' },
  // JPY pairs (2 decimal places)
  'USDJPY': { type: 'forex', decimals: 2, pipSize: 0.01, lotSize: 100000, name: 'USD/JPY' },
  // Metals
  'XAUUSD': { type: 'metal', decimals: 2, pipSize: 0.10, lotSize: 100, name: 'Gold (XAU/USD)' },
  'XAGUSD': { type: 'metal', decimals: 3, pipSize: 0.01, lotSize: 5000, name: 'Silver (XAG/USD)' },
  // Crypto
  'BTCUSD': { type: 'crypto', decimals: 2, pipSize: 1.00, lotSize: 1, name: 'Bitcoin (BTC/USD)' },
  'ETHUSD': { type: 'crypto', decimals: 2, pipSize: 0.10, lotSize: 1, name: 'Ethereum (ETH/USD)' }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updatePairInfo();
});

// Update pip information based on selected pair
function updatePairInfo() {
  const pair = document.getElementById('calc-pair').value;
  const config = pairConfig[pair];
  const infoContent = document.getElementById('pip-info-content');
  
  if (!config) return;
  
  let pipInfo = '';
  
  if (config.type === 'forex') {
    if (pair.includes('JPY')) {
      pipInfo = `<strong>${config.name}</strong> uses 2 decimal places.<br>
        • 1 pip = ${config.pipSize}<br>
        • Standard lot = ${config.lotSize.toLocaleString()} units<br>
        • Pip value ≈ $10 per standard lot (varies with exchange rate)`;
    } else {
      pipInfo = `<strong>${config.name}</strong> uses 4 decimal places.<br>
        • 1 pip = ${config.pipSize}<br>
        • Standard lot = ${config.lotSize.toLocaleString()} units<br>
        • Pip value = $10 per standard lot`;
    }
  } else if (config.type === 'metal') {
    pipInfo = `<strong>${config.name}</strong><br>
      • 1 pip = $${config.pipSize} move<br>
      • Standard lot = ${config.lotSize.toLocaleString()} oz<br>
      • Pip value varies with position size`;
  } else if (config.type === 'crypto') {
    pipInfo = `<strong>${config.name}</strong><br>
      • 1 pip = $${config.pipSize} move<br>
      • 1 lot = ${config.lotSize} coin<br>
      • Profit/loss = price change × coins`;
  }
  
  infoContent.innerHTML = pipInfo;
}

// Calculate position size
function calculatePosition() {
  const pair = document.getElementById('calc-pair').value;
  const balance = parseFloat(document.getElementById('calc-balance').value);
  const riskPercent = parseFloat(document.getElementById('calc-risk').value);
  const entry = parseFloat(document.getElementById('calc-entry').value);
  const sl = parseFloat(document.getElementById('calc-sl').value);
  
  // Validation
  if (!balance || balance <= 0) {
    showToast('Please enter a valid account balance', 'error');
    return;
  }
  
  if (!riskPercent || riskPercent <= 0) {
    showToast('Please enter a valid risk percentage', 'error');
    return;
  }
  
  if (!entry || entry <= 0) {
    showToast('Please enter a valid entry price', 'error');
    return;
  }
  
  if (!sl || sl <= 0) {
    showToast('Please enter a valid stop loss price', 'error');
    return;
  }
  
  const config = pairConfig[pair];
  if (!config) {
    showToast('Invalid pair selected', 'error');
    return;
  }
  
  // Calculate risk amount
  const riskAmount = balance * (riskPercent / 100);
  
  // Calculate distance to stop loss in pips
  const priceDistance = Math.abs(entry - sl);
  const pipDistance = priceDistance / config.pipSize;
  
  if (pipDistance <= 0) {
    showToast('Stop loss must be different from entry price', 'error');
    return;
  }
  
  // Calculate pip value per standard lot
  let pipValuePerLot = 0;
  
  if (config.type === 'forex') {
    if (pair.includes('JPY')) {
      // For JPY pairs, pip value depends on current rate
      pipValuePerLot = (config.pipSize / sl) * config.lotSize;
    } else {
      // For standard pairs, pip value is $10 per lot
      pipValuePerLot = 10;
    }
  } else if (config.type === 'metal') {
    // For metals, pip value = pip size × lot size
    pipValuePerLot = config.pipSize * config.lotSize;
  } else if (config.type === 'crypto') {
    // For crypto, 1 pip = $1 move per coin
    pipValuePerLot = config.pipSize * config.lotSize;
  }
  
  // Calculate position size in lots
  const positionLots = riskAmount / (pipDistance * pipValuePerLot);
  
  // Calculate units
  const units = positionLots * config.lotSize;
  
  // Display results
  document.getElementById('res-risk-amt').textContent = formatCurrency(riskAmount);
  document.getElementById('res-pip-value').textContent = formatCurrency(pipValuePerLot);
  document.getElementById('res-position').textContent = positionLots.toFixed(2) + ' lots';
  document.getElementById('res-units').textContent = Math.round(units).toLocaleString();
  document.getElementById('res-distance').textContent = pipDistance.toFixed(1) + ' pips';
  
  document.getElementById('calc-results').style.display = 'block';
  
  showToast('Position calculated successfully!', 'success');
}

// Format currency
function formatCurrency(amount) {
  return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Show toast notification
function showToast(message, type = 'info') {
  const toastsContainer = document.getElementById('toasts');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
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

// Add animation styles
const style = document.createElement('style');
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

// Market Hours Calculator with DST Support

// Session definitions (in UTC hours)
const sessions = {
  sydney: { 
    name: 'Sydney', 
    open: 22, // 10 PM UTC (Sunday-Friday)
    close: 7, // 7 AM UTC (Monday-Saturday)
    timezone: 'Australia/Sydney',
    icon: '🇦🇺'
  },
  tokyo: { 
    name: 'Tokyo', 
    open: 0, // Midnight UTC
    close: 9, // 9 AM UTC
    timezone: 'Asia/Tokyo',
    icon: '🇯🇵'
  },
  london: { 
    name: 'London', 
    open: 8, // 8 AM UTC
    close: 17, // 5 PM UTC
    timezone: 'Europe/London',
    icon: '🇬🇧'
  },
  newyork: { 
    name: 'New York', 
    open: 13, // 1 PM UTC (8 AM EST / 9 AM EDT)
    close: 22, // 10 PM UTC (5 PM EST / 6 PM EDT)
    timezone: 'America/New_York',
    icon: '🇺🇸'
  }
};

let currentTimezone = 'UTC';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
});

// Change selected timezone
function changeTimezone() {
  const select = document.getElementById('tz-select');
  currentTimezone = select.value;
  updateTimeDisplay();
}

// Get current time in specified timezone
function getTimeInTimezone(timezone) {
  const now = new Date();
  const options = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return new Date(now.toLocaleString('en-US', options));
}

// Check if DST is active for a timezone
function isDSTActive(timezone) {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  
  const janOffset = -getTimezoneOffset(jan, timezone);
  const julOffset = -getTimezoneOffset(jul, timezone);
  const currentOffset = -getTimezoneOffset(now, timezone);
  
  // If current offset matches the summer offset, DST is active
  const maxOffset = Math.max(janOffset, julOffset);
  return currentOffset === maxOffset && janOffset !== julOffset;
}

// Get timezone offset in hours
function getTimezoneOffset(date, timezone) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate - utcDate) / (1000 * 60 * 60);
}

// Format time as HH:MM
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Format time with seconds
function formatTimeSeconds(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Check if session is currently open
function isSessionOpen(session, nowUTC) {
  const currentHour = nowUTC.getUTCHours() + nowUTC.getUTCMinutes() / 60;
  const openHour = session.open;
  const closeHour = session.close;
  
  if (openHour < closeHour) {
    // Normal case: opens and closes same day
    return currentHour >= openHour && currentHour < closeHour;
  } else {
    // Overnight session (like Sydney)
    return currentHour >= openHour || currentHour < closeHour;
  }
}

// Get session status text
function getSessionStatus(isOpen, session, nowUTC) {
  if (isOpen) return 'Open';
  
  const currentHour = nowUTC.getUTCHours();
  const hoursUntilOpen = session.open - currentHour;
  
  if (hoursUntilOpen <= 0) {
    return 'Opens tomorrow';
  } else if (hoursUntilOpen < 24) {
    return `Opens in ${hoursUntilOpen}h`;
  } else {
    return 'Closed';
  }
}

// Update all displays
function updateTimeDisplay() {
  const now = new Date();
  const nowUTC = new Date(now.toISOString());
  
  // Update UTC clock
  document.getElementById('utc-clock').textContent = formatTimeSeconds(nowUTC);
  document.getElementById('current-date').textContent = nowUTC.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let activeCount = 0;
  const activeSessions = [];
  
  // Update each session
  Object.keys(sessions).forEach(key => {
    const session = sessions[key];
    const isOpen = isSessionOpen(session, nowUTC);
    
    if (isOpen) {
      activeCount++;
      activeSessions.push(session.name);
    }
    
    // Update status badge
    const statusEl = document.getElementById(`${key}-status`);
    statusEl.textContent = isOpen ? 'Open' : 'Closed';
    statusEl.className = `session-status ${isOpen ? 'open' : 'closed'}`;
    
    // Update session card time display
    const timeEl = document.getElementById(`${key}-time`);
    const subtimeEl = document.getElementById(`${key}-subtime`);
    
    if (isOpen) {
      timeEl.textContent = 'OPEN NOW';
      timeEl.style.color = 'var(--green2)';
      subtimeEl.textContent = `Closes at ${formatTime(getSessionCloseTime(session))}`;
    } else {
      timeEl.textContent = '--:--';
      timeEl.style.color = 'var(--t0)';
      subtimeEl.textContent = `Opens at ${formatTime(getSessionOpenTime(session))}`;
    }
    
    // Update local time
    const localTime = getTimeInTimezone(session.timezone);
    document.getElementById(`${key}-local`).textContent = formatTime(localTime);
    
    // Update DST info
    const dst = isDSTActive(session.timezone);
    const offset = getTimezoneOffset(new Date(), session.timezone);
    const offsetStr = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
    
    document.getElementById(`${key}-offset`).textContent = offsetStr;
    
    let dstText = dst ? 'Yes' : 'No';
    if (key === 'tokyo') {
      dstText = 'No (JST)';
    } else if (key === 'london') {
      dstText = dst ? 'Yes (BST)' : 'No (GMT)';
    } else if (key === 'newyork') {
      dstText = dst ? 'Yes (EDT)' : 'No (EST)';
    } else if (key === 'sydney') {
      dstText = dst ? 'Yes (AEDT)' : 'No (AEST)';
    }
    document.getElementById(`${key}-dst`).textContent = dstText;
  });
  
  // Update overview badges
  const marketsBadge = document.getElementById('markets-open-badge');
  if (activeCount > 0) {
    marketsBadge.innerHTML = `● ${activeCount} Market${activeCount > 1 ? 's' : ''} Open`;
    marketsBadge.className = 'badge bg';
  } else {
    marketsBadge.innerHTML = '● All Markets Closed';
    marketsBadge.className = 'badge bx';
  }
  
  document.getElementById('sessions-active-count').textContent = `${activeCount}/4 Sessions Active`;
  
  // Find next session to open
  const nextSession = getNextSession(nowUTC);
  if (nextSession) {
    document.getElementById('next-session-badge').textContent = `Next: ${nextSession.name} in ${nextSession.hours}h`;
  }
}

// Get session open time in user's timezone
function getSessionOpenTime(session) {
  const now = new Date();
  const options = {
    timeZone: session.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  // Create a date for today at session open time
  const openDate = new Date();
  openDate.setUTCHours(session.open, 0, 0, 0);
  
  return openDate;
}

// Get session close time
function getSessionCloseTime(session) {
  const closeDate = new Date();
  closeDate.setUTCHours(session.close, 0, 0, 0);
  return closeDate;
}

// Get next session to open
function getNextSession(nowUTC) {
  const currentHour = nowUTC.getUTCHours() + nowUTC.getUTCMinutes() / 60;
  
  let nextSession = null;
  let minHours = Infinity;
  
  Object.keys(sessions).forEach(key => {
    const session = sessions[key];
    let hoursUntil = session.open - currentHour;
    
    if (hoursUntil < 0) {
      hoursUntil += 24; // Next day
    }
    
    if (hoursUntil > 0 && hoursUntil < minHours) {
      minHours = hoursUntil;
      nextSession = {
        name: session.name,
        hours: Math.round(hoursUntil)
      };
    }
  });
  
  return nextSession;
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
  `;
  
  toastsContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

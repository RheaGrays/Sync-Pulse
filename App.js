const state = {
  tasks: [],
  currentUser: 'me',
  team: [
    { id: 'me', name: 'You', initials: 'ME', status: 'active', color: '#3498db' },
    { id: 'alex', name: 'Alex Rivera', initials: 'AR', status: 'active', color: '#e67e22' },
    { id: 'jordan', name: 'Jordan Chen', initials: 'JC', status: 'busy', color: '#9b59b6' },
    { id: 'sam', name: 'Sam Williams', initials: 'SW', status: 'away', color: '#95a5a6' },
    { id: 'taylor', name: 'Taylor Brown', initials: 'TB', status: 'active', color: '#2ecc71' }
  ],
  isNightMode: false
};
// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderTeam();
  addSampleTasks();
  setupEventListeners();
  setupThemeToggle();
  setupBoardToggle();
  setupOfficeInteraction();
  updateWindowTime();

  setInterval(updateWindowTime, 1000);
});

function setupEventListeners() {
  document.getElementById('addTaskBtn').addEventListener('click', openModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  document.getElementById('teamToggle').addEventListener('click', toggleTeamSidebar);

  // Add step back button listener
  const stepBackBtn = document.getElementById('stepBackBtn');
  if (stepBackBtn) {
    stepBackBtn.addEventListener('click', toggleBoardVisibility);
  }

  document.getElementById('closeNotification').addEventListener('click', hideNotification);
  document.getElementById('dismissNotification').addEventListener('click', hideNotification);
  document.getElementById('viewTask').addEventListener('click', () => {
    hideNotification();
  });
}

function setupBoardToggle() {
  const stepBackBtn = document.getElementById('stepBackBtn');
  if (!stepBackBtn) {
    console.error('Step back button not found!');
    return;
  }

  // The event listener is already set up in setupEventListeners
  // This function can be used for additional setup if needed
  console.log('Board toggle setup complete');
}

function toggleBoardVisibility() {
  const body = document.body;
  const boardContainer = document.querySelector('.board-container');
  const stepBackBtn = document.getElementById('stepBackBtn');

  if (!boardContainer || !stepBackBtn) {
    console.error('Required elements not found!');
    return;
  }

  body.classList.toggle('board-hidden');

  if (body.classList.contains('board-hidden')) {
    boardContainer.style.cursor = 'pointer';
    boardContainer.addEventListener('click', handleBoardClick, true);

    stepBackBtn.textContent = 'View Board';
    console.log("Stepping back to view office...");

    // Add subtle parallax effect to office elements
    document.querySelectorAll('.office-window, .coffee-mug, .office-plant').forEach(el => {
      el.style.transition = 'transform 0.8s ease';
      el.style.transform = 'translateY(-10px) scale(1.05)';
      el.style.zIndex = '5';
    });
  } else {
    boardContainer.removeEventListener('click', handleBoardClick, true);
    boardContainer.style.cursor = '';

    stepBackBtn.textContent = 'View Office';
    console.log("Returning to board view...");

    // Reset office elements
    document.querySelectorAll('.office-window, .coffee-mug, .office-plant').forEach(el => {
      el.style.transform = 'translateY(0) scale(1)';
      el.style.zIndex = '0';
    });
  }
}

function handleBoardClick(e) {
  e.stopPropagation(); // Prevent event from bubbling
  if (document.body.classList.contains('board-hidden')) {
    toggleBoardVisibility(); // Toggle back to board view
  }
}

// Also make board clickable when in picture frame mode
document.addEventListener('DOMContentLoaded', () => {
  // Add click listener to board container
  const boardContainer = document.querySelector('.board-container');
  if (boardContainer) {
    boardContainer.addEventListener('click', handleBoardClick);
  }
});
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const officeWindow = document.getElementById('officeWindow');

  const savedTheme = localStorage.getItem('officeTheme');
  if (savedTheme === 'night') {
    body.classList.add('night-mode');
    if (officeWindow) officeWindow.classList.add('night-mode');
    state.isNightMode = true;
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('night-mode');
    if (officeWindow) officeWindow.classList.toggle('night-mode');
    state.isNightMode = !state.isNightMode;

    localStorage.setItem('officeTheme', state.isNightMode ? 'night' : 'day');
    updateWindowTime(); // This will update sun/moon visibility

    document.querySelectorAll('.board-quadrant, .task-card').forEach(el => {
      el.style.transition = 'all 0.5s ease';
    });
  });
}

function toggleOfficeInteraction() {
  const body = document.body;
  const btn = document.querySelector('.step-back-btn');

  body.classList.toggle('interacting-with-office');

  if (body.classList.contains('interacting-with-office')) {
    btn.innerText = "Back to Board";
    console.log("Stepping away from the board...");
  } else {
    btn.innerText = "View Office";
    console.log("Returning to tasks...");
  }
}

function updateWallClock() {
  const wallClock = document.getElementById('wallClock');
  if (!wallClock) return;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Update analog clock hands
  const hourHand = wallClock.querySelector('.clock-hour');
  const minuteHand = wallClock.querySelector('.clock-minute');

  if (hourHand && minuteHand) {
    // Calculate angles
    const hourDeg = (hours % 12) * 30 + minutes * 0.5; // 30 degrees per hour + 0.5 per minute
    const minuteDeg = minutes * 6 + seconds * 0.1; // 6 degrees per minute

    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  }

  // Update sun/moon position based on time
  updateSunMoonPosition(hours, minutes);
}

function updateSunMoonPosition(hours, minutes) {
  const sun = document.getElementById('sun');
  const moon = document.getElementById('moon');
  const officeWindow = document.getElementById('officeWindow');

  if (!sun || !moon || !officeWindow) return;

  // Calculate position based on time of day
  const totalMinutes = hours * 60 + minutes;

  // Sun position (6am to 6pm)
  if (totalMinutes >= 360 && totalMinutes <= 1080) {
    const sunProgress = (totalMinutes - 360) / 720; // 0 to 1
    const sunX = 10 + (sunProgress * 80); // 30% to 70% of window width
    const sunY = 80 - Math.sin(sunProgress * Math.PI) * 60; // Arc motion

    sun.style.left = `${sunX}%`;
    sun.style.top = `${sunY}%`;
    sun.style.opacity = '1';
    moon.style.opacity = '0';
  } else {
    // Moon position (6pm to 6am)
    const moonProgress = totalMinutes < 360 ?
      (totalMinutes + 720) / 720 : // 0-6am
      (totalMinutes - 1080) / 720; // 6pm-12am

    const moonX = 10 + (moonProgress * 80);
    const moonY = 80 - Math.sin(moonProgress * Math.PI) * 60;

    moon.style.left = `${moonX}%`;
    moon.style.top = `${moonY}%`;
    moon.style.opacity = '1';
    sun.style.opacity = '0';
  }
}

function updateWindowTime() {
  // Update both analog clock and sun/moon
  updateWallClock();

  // Update sun/moon visibility based on theme
  const sun = document.getElementById('sun');
  const moon = document.getElementById('moon');

  if (state.isNightMode) {
    if (sun) sun.style.display = 'none';
    if (moon) moon.style.display = 'block';
  } else {
    if (sun) sun.style.display = 'block';
    if (moon) moon.style.display = 'none';
  }
}

function openModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('taskName').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('taskForm').reset();
}

function toggleTeamSidebar() {
  document.getElementById('teamSidebar').classList.toggle('open');
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const taskName = document.getElementById('taskName').value;
  const taskPriority = document.getElementById('taskPriority').value;
  const taskAssignee = document.getElementById('taskAssignee').value;
  const taskDeadline = document.getElementById('taskDeadline').value;

  const task = {
    id: Date.now(),
    name: taskName,
    priority: taskPriority,
    assignee: taskAssignee,
    deadline: taskDeadline || null,
    completed: false,
    createdAt: new Date()
  };

  state.tasks.push(task);
  renderTasks();
  closeModal();

  if (taskAssignee !== 'me') {
    showBrowserNotification(task);
  } else {
    setTimeout(() => showInAppNotification(task), 1000);
  }
}

function showBrowserNotification(task) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const assigneeName = state.team.find(m => m.id === task.assignee)?.name || 'Team member';
    const notification = new Notification('SyncPulse Office', {
      body: `Memo: "${task.name}" assigned to ${assigneeName}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%232563eb"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">ðŸ“</text></svg>'
    });
    notification.onclick = () => { window.focus(); notification.close(); };
  }
}

function showInAppNotification(task) {
  const toast = document.getElementById('notificationToast');
  const body = document.getElementById('notificationBody');
  body.textContent = `New Memo: ${task.name} assigned to you.`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 10000);
}

function hideNotification() {
  document.getElementById('notificationToast').classList.remove('show');
}

function renderTeam() {
  const teamList = document.getElementById('teamList');
  const assigneeSelect = document.getElementById('taskAssignee');
  teamList.innerHTML = '';

  state.team.forEach(member => {
    if (member.id !== 'me') {
      const memberEl = document.createElement('div');
      memberEl.className = 'team-member glass';
      memberEl.innerHTML = `
        <div class="team-avatar">${member.initials} <div class="status-indicator status-${member.status}"></div></div>
        <div class="flex-1">
          <div class="font-medium text-sm">${member.name}</div>
          <div class="text-xs opacity-60">${member.status === 'active' ? 'Online' : 'Away'}</div>
        </div>`;
      teamList.appendChild(memberEl);

      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      assigneeSelect.appendChild(option);
    }
  });
}

function renderTasks() {
  const containerMap = { urgent: 'urgentImportant', schedule: 'schedule', delegate: 'delegate', eliminate: 'eliminate' };
  Object.values(containerMap).forEach(id => document.getElementById(id).innerHTML = '');

  state.tasks.forEach(task => {
    const container = document.getElementById(containerMap[task.priority]);
    if (container) container.appendChild(createTaskElement(task));
  });

  Object.values(containerMap).forEach(id => {
    const container = document.getElementById(id);
    if (container.children.length === 0) {
      container.innerHTML = '<div class="text-sm opacity-40 text-center py-8">No active memos</div>';
    }
  });
}

function createTaskElement(task) {
  const taskEl = document.createElement('div');
  taskEl.className = `task-card task-${task.priority} ${task.completed ? 'completed' : ''}`;
  taskEl.setAttribute('data-id', task.id);

  const member = state.team.find(m => m.id === task.assignee);
  const initials = member?.initials || '??';
  const name = member?.name || 'Unassigned';

  // Format deadline if it exists
  let deadlineHtml = '';
  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const now = new Date();
    const isOverdue = deadline < now && !task.completed;
    const formattedDeadline = deadline.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    deadlineHtml = `
      <div class="task-deadline ${isOverdue ? 'overdue' : ''}">
        ⏰ ${formattedDeadline}
      </div>
    `;
  }

  taskEl.innerHTML = `
    <div class="task-name">${task.name}</div>
    ${deadlineHtml}
    <div class="task-meta">
      <span>${task.priority.toUpperCase()}</span>
      <div class="flex items-center gap-1">
        <div class="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-600">${initials}</div>
        <span>${name}</span>
      </div>
    </div>`;

  taskEl.addEventListener('click', () => toggleTaskComplete(task.id));
  return taskEl;
}

function toggleTaskComplete(taskId) {
  const taskIndex = state.tasks.findIndex(t => t.id === taskId);
  const task = state.tasks[taskIndex];
  if (!task) return;

  if (confirm(`âœ… Task completed: "${task.name}"\n\nReady to archive this memo?`)) {
    const targetEl = document.querySelector(`[data-id="${taskId}"]`);
    if (targetEl) {
      playOfficeSound();
      targetEl.classList.add('task-falling');
      setTimeout(() => {
        state.tasks.splice(taskIndex, 1);
        renderTasks();
      }, 750);
    }
  }
}

function playOfficeSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) { console.log("Audio not supported"); }
}

function setupOfficeInteraction() {
  const officeWindow = document.getElementById('officeWindow');
  const wallClock = document.getElementById('wallClock');

  // Make wall clock clickable to sync time
  if (wallClock) {
    wallClock.style.cursor = 'pointer';
    wallClock.addEventListener('click', () => {
      if (document.body.classList.contains('board-hidden')) {
        // Add pulse effect to wall clock
        wallClock.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
          wallClock.style.animation = '';
        }, 500);
      }
    });
  }

  // Add hover effects to office elements
  document.querySelectorAll('.coffee-mug, .office-plant').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('mouseenter', () => {
      if (document.body.classList.contains('board-hidden')) {
        el.style.transform = 'scale(1.1)';
      }
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// Don't forget to call this in initialization
document.addEventListener('DOMContentLoaded', () => {
  renderTeam();
  addSampleTasks();
  setupEventListeners();
  setupThemeToggle();
  setupBoardToggle();
  setupOfficeInteraction(); // Add this line
  updateWindowTime();
});

function addSampleTasks() {
  const samples = [
    { name: 'Review Q1 budget report', priority: 'urgent', assignee: 'me' },
    { name: 'Plan team building event', priority: 'schedule', assignee: 'me' },
    { name: 'Review design mockups', priority: 'delegate', assignee: 'jordan' }
  ];
  samples.forEach((t, i) => {
    state.tasks.push({ ...t, id: Date.now() + i, completed: false, createdAt: new Date() });
  });
  renderTasks();
  setInterval(updateWindowTime, 60000);
}
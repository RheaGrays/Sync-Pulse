// State Management
const state = {
  tasks: [],
  currentUser: 'me',
  team: [
    { id: 'me', name: 'You', initials: 'ME', status: 'active' },
    { id: 'alex', name: 'Alex Rivera', initials: 'AR', status: 'active' },
    { id: 'jordan', name: 'Jordan Chen', initials: 'JC', status: 'active' },
    { id: 'sam', name: 'Sam Williams', initials: 'SW', status: 'away' },
    { id: 'taylor', name: 'Taylor Brown', initials: 'TB', status: 'active' }
  ]
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
});

function setupEventListeners() {
  // Modal controls
  document.getElementById('addTaskBtn').addEventListener('click', openModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  // Form submission
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

  // Team sidebar
  document.getElementById('teamToggle').addEventListener('click', toggleTeamSidebar);

  // Notification controls
  document.getElementById('closeNotification').addEventListener('click', hideNotification);
  document.getElementById('dismissNotification').addEventListener('click', hideNotification);
  document.getElementById('viewTask').addEventListener('click', () => {
    hideNotification();
    // Could scroll to task or open detail view
  });

  // Notification button
  document.getElementById('notificationBtn').addEventListener('click', () => {
    // Show notification count or list
    alert('Notification center - Coming soon!');
  });
}

function openModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.add('active');
  document.getElementById('taskName').focus();
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.remove('active');
  document.getElementById('taskForm').reset();
}

function toggleTeamSidebar() {
  const sidebar = document.getElementById('teamSidebar');
  sidebar.classList.toggle('open');
}

function handleTaskSubmit(e) {
  e.preventDefault();
  
  const taskName = document.getElementById('taskName').value;
  const taskPriority = document.getElementById('taskPriority').value;
  const taskAssignee = document.getElementById('taskAssignee').value;

  const task = {
    id: Date.now(),
    name: taskName,
    priority: taskPriority,
    assignee: taskAssignee,
    completed: false,
    createdAt: new Date()
  };

  state.tasks.push(task);
  renderTasks();
  closeModal();

  // Show browser notification if assigned to someone else
  if (taskAssignee !== 'me') {
    showBrowserNotification(task);
  }

  // Simulate receiving a task (for demo purposes)
  // In real app, this would come from server
  if (taskAssignee === 'me') {
    setTimeout(() => {
      showInAppNotification(task);
    }, 1000);
  }
}

function showBrowserNotification(task) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const assigneeName = state.team.find(m => m.id === task.assignee)?.name || 'Team member';
    
    const notification = new Notification('SyncPulse - Task Assigned', {
      body: `You assigned "${task.name}" to ${assigneeName}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300d4ff"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="%23000">⚡</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300d4ff"/></svg>',
      tag: 'syncpulse-task',
      requireInteraction: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showBrowserNotification(task);
      }
    });
  }
}

function showInAppNotification(task) {
  const toast = document.getElementById('notificationToast');
  const body = document.getElementById('notificationBody');
  const badge = document.getElementById('notificationBadge');
  
  body.textContent = `"${task.name}" has been assigned to you.`;
  toast.classList.add('show');

  // Update badge
  const currentCount = parseInt(badge.textContent) || 0;
  badge.textContent = currentCount + 1;
  badge.style.display = 'flex';

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (toast.classList.contains('show')) {
      hideNotification();
    }
  }, 10000);
}

function hideNotification() {
  const toast = document.getElementById('notificationToast');
  toast.classList.remove('show');
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
        <div class="team-avatar">
          ${member.initials}
          <div class="status-indicator status-${member.status}"></div>
        </div>
        <div class="flex-1">
          <div class="font-medium text-sm">${member.name}</div>
          <div class="text-xs opacity-60">${member.status === 'active' ? 'Online' : 'Away'}</div>
        </div>
      `;
      teamList.appendChild(memberEl);

      // Add to assignee dropdown
      const option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      assigneeSelect.appendChild(option);
    }
  });
}

function renderTasks() {
  // Clear all quadrants
  ['urgentImportant', 'schedule', 'delegate', 'eliminate'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });

  // Group tasks by priority
  const tasksByPriority = {
    urgent: [],
    schedule: [],
    delegate: [],
    eliminate: []
  };

  state.tasks.forEach(task => {
    tasksByPriority[task.priority].push(task);
  });

  // Render each group
  Object.keys(tasksByPriority).forEach(priority => {
    const containerMap = {
      urgent: 'urgentImportant',
      schedule: 'schedule',
      delegate: 'delegate',
      eliminate: 'eliminate'
    };

    const container = document.getElementById(containerMap[priority]);
    
    tasksByPriority[priority].forEach(task => {
      const taskEl = createTaskElement(task);
      container.appendChild(taskEl);
    });

    if (tasksByPriority[priority].length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'text-sm opacity-40 text-center py-8';
      emptyEl.textContent = 'No tasks yet';
      container.appendChild(emptyEl);
    }
  });
}

function createTaskElement(task) {
  const taskEl = document.createElement('div');
  taskEl.className = `task-card task-${task.priority} ${task.completed ? 'task-completed' : ''}`;
  
  const priorityBadgeMap = {
    urgent: 'priority-urgent',
    schedule: 'priority-high',
    delegate: 'priority-medium',
    eliminate: 'priority-low'
  };

  const assigneeName = state.team.find(m => m.id === task.assignee)?.name || 'Unassigned';
  
  taskEl.innerHTML = `
    <div class="task-name">${task.name}</div>
    <div class="task-meta">
      <span class="priority-badge ${priorityBadgeMap[task.priority]}">${task.priority}</span>
      <span>👤 ${assigneeName}</span>
    </div>
  `;

  taskEl.addEventListener('click', () => toggleTaskComplete(task.id));

  return taskEl;
}

function toggleTaskComplete(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
  }
}

function addSampleTasks() {
  const sampleTasks = [
    { name: 'Review Q1 budget report', priority: 'urgent', assignee: 'me' },
    { name: 'Prepare client presentation', priority: 'urgent', assignee: 'me' },
    { name: 'Plan team building event', priority: 'schedule', assignee: 'me' },
    { name: 'Update project documentation', priority: 'schedule', assignee: 'alex' },
    { name: 'Review design mockups', priority: 'delegate', assignee: 'jordan' },
    { name: 'Organize file structure', priority: 'eliminate', assignee: 'me' }
  ];

  sampleTasks.forEach((task, index) => {
    state.tasks.push({
      id: Date.now() + index,
      name: task.name,
      priority: task.priority,
      assignee: task.assignee,
      completed: false,
      createdAt: new Date()
    });
  });

  renderTasks();
}
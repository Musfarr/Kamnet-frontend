// Utility functions to normalize API data between backend and frontend

// Parse numeric value from various budget/price representations
function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and thousands separators
    const cleaned = value.replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

// Normalize a single task object from backend to frontend expectations
export function normalizeTask(task = {}) {
  if (!task || typeof task !== 'object') return task;

  const id = task.id || task._id || task.taskId || task.uuid || task.slug || undefined;
  const price = task.price != null ? toNumber(task.price) : toNumber(task.budget);
  const dueDate = task.dueDate || task.deadlineDate || task.deadline || null;

  return {
    ...task,
    id,
    price,
    dueDate,
  };
}

export function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(normalizeTask);
}

// Map create-task payload from frontend fields to backend fields
export function mapCreateTaskPayload(data = {}) {
  const { price, dueDate, ...rest } = data || {};
  const payload = {
    ...rest,
  };

  // Backend expects budget (number)
  if (price !== undefined) {
    const budget = toNumber(price);
    if (budget != null) payload.budget = budget;
  }

  // Backend expects deadlineDate
  if (dueDate !== undefined) {
    payload.deadlineDate = dueDate;
  }

  return payload;
}

// Map application payload to backend expected fields
export function mapApplyPayload(data = {}) {
  const { proposal, price, estimatedCompletionTime, ...rest } = data || {};
  const payload = { ...rest };

  if (proposal !== undefined) payload.coverLetter = proposal;
  if (price !== undefined) {
    const proposedBudget = toNumber(price);
    if (proposedBudget != null) payload.proposedBudget = proposedBudget;
  }
  if (estimatedCompletionTime !== undefined) payload.estimatedCompletionTime = estimatedCompletionTime;

  return payload;
}

// Normalize map markers if needed (ensure numeric price)
export function normalizeMarker(marker = {}) {
  const price = marker.price != null ? toNumber(marker.price) : toNumber(marker.budget);
  return { ...marker, price };
}

export function normalizeMarkers(markers) {
  if (!Array.isArray(markers)) return [];
  return markers.map(normalizeMarker);
}

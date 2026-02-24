export const logActivity = (username, action, details = "") => {
  const activity = {
    id: Date.now(),
    username,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  const allActivities = JSON.parse(
    localStorage.getItem("activityLog") || "[]"
  );
  allActivities.push(activity);

  // Keep only last 500 activities
  if (allActivities.length > 500) {
    allActivities.shift();
  }

  localStorage.setItem("activityLog", JSON.stringify(allActivities));
};

export const getUserActivities = (username) => {
  const allActivities = JSON.parse(
    localStorage.getItem("activityLog") || "[]"
  );
  return allActivities.filter((a) => a.username === username);
};

export const getAllActivities = () => {
  return JSON.parse(localStorage.getItem("activityLog") || "[]");
};

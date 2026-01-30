// Authorization: restrict by role
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Missing authentication context" });
    }

    const groups = req.user?.["cognito:groups"];
    const hasGroup = Array.isArray(groups) && groups.includes(role);
    const hasRole = req.user?.role === role;

    if (!hasGroup && !hasRole) {
      return res.status(403).json({ error: "Forbidden: insufficient privileges" });
    }

    next();
  };
}

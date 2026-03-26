/**
 * roleMiddleware.js
 * -----------------------
 * Middleware for role-based access control (RBAC). 
 * Provides functions to restrict route access based on user roles.
 *
 * @param  {...any} roles 
 * @returns 
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions"
      });
    }
    next();
  };
};
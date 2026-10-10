const adminMiddleware = (req, res, next) => {
  const role = req.user?.role;

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  if (req.user?.superAdmin === true) {
    req.isSuperAdmin = true;
  } else {
    req.isSuperAdmin = false;
  }

  next();
};

export const superAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin" || req.user?.superAdmin !== true) {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required.",
    });
  }

  next();
};

export default adminMiddleware;

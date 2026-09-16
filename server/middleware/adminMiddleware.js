const adminMiddleware = (req, res, next) => {
  const role = req.user?.role;

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

export default adminMiddleware;
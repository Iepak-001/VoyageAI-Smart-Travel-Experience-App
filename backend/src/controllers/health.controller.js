export const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: "VoyageAI backend healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

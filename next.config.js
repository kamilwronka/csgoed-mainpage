const dev = process.env.NODE_ENV !== "production";

module.exports = {
  useFileSystemPublicRoutes: dev,
};

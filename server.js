const cacheableResponse = require("cacheable-response");
const express = require("express");
const next = require("next");
const helmet = require("helmet");
const morgan = require("morgan");

const port = parseInt(process.env.MAINPAGE_PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

const handle = app.getRequestHandler();

const handleRequest = cacheableResponse({
  ttl: 1000 * 60 * 60, // 1hour
  get: async ({ req, res, pagePath, queryParams }) => {
    const data = await app.renderToHTML(req, res, pagePath, queryParams);

    if (res.statusCode === 404) {
      res.end(data);
      return;
    }

    return { data };
  },
  send: ({ data, res }) => res.send(data),
});

app.prepare().then(() => {
  const server = express();
  server.use(helmet());
  dev &&
    server.use(
      morgan(":method :url :status :res[content-length] - :response-time ms")
    );

  server.get("/support", (req, res) =>
    handleRequest({ req, res, pagePath: "/support" })
  );
  server.get("/", (req, res) => handleRequest({ req, res, pagePath: "/" }));

  server.get("*", (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

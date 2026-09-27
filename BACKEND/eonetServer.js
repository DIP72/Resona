const http = require("node:http");
const { fetchEonetEvents } = require("./services/eonetService");

const PORT = process.env.EONET_PORT || 3000;

// Simple HTTP Server (as provided by user)
const server = http.createServer(async (req, res) => {
  // Set CORS headers so your frontend can call this backend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (reqUrl.pathname === "/api/events" && req.method === "GET") {
    try {
      const category = reqUrl.searchParams.get("category");
      const limit = parseInt(reqUrl.searchParams.get("limit") || "10", 10);
      const days = reqUrl.searchParams.get("days") ? parseInt(reqUrl.searchParams.get("days"), 10) : null;

      const events = await fetchEonetEvents(category, limit, days);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: events.length, data: events }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`NASA EONET Server running at http://localhost:${PORT}/api/events`);
  });
}

module.exports = server;

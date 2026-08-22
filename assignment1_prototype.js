const express = require('express');
const app = express();
app.use(express.json());

// In-memory queue simulation for Assignment 1
const mockQueue = [];

app.post('/api/queue-print', (req, res) => {
  const { attendeeId } = req.body;
  if (!attendeeId) return res.status(400).json({ error: "Missing attendeeId" });

  mockQueue.push({ attendeeId, timestamp: new Date() });
  return res.status(202).json({ status: "Queued", queueLength: mockQueue.length });
});

app.listen(3000, () => console.log("Assignment 1 prototype running on port 3000"));

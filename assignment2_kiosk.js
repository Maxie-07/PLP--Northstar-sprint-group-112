const express = require('express');
const app = express();
app.use(express.json());

// Database simulation
const db = {
  attendees: {
    "ATT001": { name: "Alice", status: "NOT_CHECKED_IN", badgePrinted: false },
    "ATT002": { name: "Bob", status: "NOT_CHECKED_IN", badgePrinted: false },
    "ATT003": { name: "Charlie", status: "NOT_CHECKED_IN", badgePrinted: false }
  }
};

// Queue simulation
const printQueue = [];

// 1. Scan QR Endpoint (Async Push Model)
app.post('/api/scan', (req, res) => {
  const { attendeeId } = req.body;
  const attendee = db.attendees[attendeeId];

  if (!attendee) return res.status(404).json({ error: "Attendee not found" });

  // Duplicate scan protection check
  if (attendee.status === "CHECKED_IN" || attendee.badgePrinted) {
    return res.status(400).json({ error: "Duplicate scan: Attendee already checked in/printed." });
  }

  // Set pending state instantly
  attendee.status = "PENDING_PRINT";
  printQueue.push({ attendeeId, jobId: `JOB-${Date.now()}` });

  // Return immediate response with pending status
  return res.status(202).json({
    message: "Scan accepted. Print job queued.",
    attendeeId,
    status: attendee.status
  });
});

// 2. Webhook Endpoint for Badge Printer Callback
app.post('/api/webhook/print-complete', (req, res) => {
  const { attendeeId, jobStatus } = req.body;
  const attendee = db.attendees[attendeeId];

  if (!attendee) return res.status(404).json({ error: "Record missing" });

  if (jobStatus === "SUCCESS") {
    attendee.status = "CHECKED_IN";
    attendee.badgePrinted = true;
    console.log(`[WEBHOOK] Print confirmed for ${attendeeId}. Status updated to CHECKED_IN.`);
    return res.status(200).json({ acknowledgement: "Received" });
  }

  return res.status(400).json({ error: "Print job failed" });
});

app.listen(4000, () => console.log("Kiosk service running on port 4000"));

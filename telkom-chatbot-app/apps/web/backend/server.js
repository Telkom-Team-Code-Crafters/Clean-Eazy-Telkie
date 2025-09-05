// backend/server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Hardcoded API key (your Combain API key)
const COMBAIN_API_KEY = "37222b3ad0e642daabc1";

app.use(cors());
app.use(express.json());

// Route to check reception
app.post("/api/reception", async (req, res) => {
  try {
    const { mcc, mnc, lac, cid, signalStrength } = req.body;

    // Validate required fields
    if (!mcc || !mnc || !lac || !cid) {
      return res.status(400).json({ error: "Missing required cell tower data" });
    }

    const params = { radio: "gsm", mcc, mnc, lac, cid };

    // Call Combain API
    const response = await axios.post(
      "https://apiv2.combain.com/cell",
      params,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COMBAIN_API_KEY}`,
        },
        timeout: 10000, // 10s timeout
      }
    );

    // Check response data
    if (!response.data || !response.data.lat || !response.data.lon) {
      return res.status(404).json({ error: "No tower location data returned" });
    }

    // Return tower info
    const towers = [
      {
        lat: response.data.lat,
        lon: response.data.lon,
        cid,
        signalStrength,
      },
    ];

    res.json({ towers });
  } catch (err) {
    console.error("Backend error:", err?.response?.data || err.message || err);

    // Handle Combain API errors
    if (err?.response?.data?.error) {
      return res.status(err.response.status || 500).json({ error: err.response.data.error });
    }

    res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

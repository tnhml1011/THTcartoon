import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

// Endpoint upload video
app.post("/upload-mux", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded" });
    }

    // Gọi API Mux để tạo Asset
    const muxRes = await fetch("https://api.mux.com/video/v1/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64"),
      },
      body: JSON.stringify({
        input: req.file.path, // đường dẫn video tạm (upload trước)
        playback_policy: ["public"],
      }),
    });

    const data = await muxRes.json();

    if (!data.data) {
      return res.status(500).json({ error: "Mux upload failed", details: data });
    }

    res.json({
      assetId: data.data.id,
      playbackUrl: data.data.playback_ids[0].id
        ? `https://stream.mux.com/${data.data.playback_ids[0].id}.m3u8`
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Mux upload server running at http://localhost:3000");
});

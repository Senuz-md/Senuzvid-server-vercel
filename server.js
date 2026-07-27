const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Pro Engine is Online! 🚀"));

// Details API
app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (r.data && r.data.data) {
                return res.json({ title: r.data.data.title, thumbnail: r.data.data.cover });
            }
        }
        res.json({ title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) {
        res.json({ title: "Video Ready", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    }
});

// Download API
app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send("URL missing");

    // 1. TikTok (TikWM)
    if (url.includes("tiktok.com")) {
        try {
            const tk = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (tk.data && tk.data.data) {
                const link = quality === "audio" ? tk.data.data.music : tk.data.data.play;
                if (link) return res.redirect(link);
            }
        } catch (err) {
            console.error("TikTok API Error:", err.message);
        }
    }

    // 2. Facebook (Dark-Shan API)
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
        try {
            const fbRes = await axios.get(`https://api-dark-shan-yt.koyeb.app/download/facebook?url=${encodeURIComponent(url)}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (fbRes.data && fbRes.data.status) {
                const link = (quality === "audio") ? fbRes.data.result.audio : (fbRes.data.result.hd || fbRes.data.result.sd);
                if (link) return res.redirect(link);
            }
        } catch (err) {
            console.error("Facebook API Error:", err.message);
        }
    }

    // 3. YouTube (Dark-Shan API)
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        try {
            const ytRes = await axios.get(`https://api-dark-shan-yt.koyeb.app/download/ytdl?url=${encodeURIComponent(url)}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (ytRes.data && ytRes.data.status) {
                const link = (quality === "audio") ? ytRes.data.result.mp3 : ytRes.data.result.mp4;
                if (link) return res.redirect(link);
            }
        } catch (err) {
            console.error("YouTube API Error:", err.message);
        }
    }

    // 4. Backup - Cobalt Tools API
    try {
        const backup = await axios.post('https://tunnel.api.cobalt.tools/api/json', {
            url: url,
            videoQuality: "720",
        }, { 
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            } 
        });
        
        if (backup.data && backup.data.url) {
            return res.redirect(backup.data.url);
        }
    } catch (err) {
        console.error("Cobalt Backup API Error:", err.message);
    }

    return res.status(404).send("Video not fund try again later !");
});

// Vercel සඳහා Export කිරීම අත්‍යවශ්‍යයි
module.exports = app;

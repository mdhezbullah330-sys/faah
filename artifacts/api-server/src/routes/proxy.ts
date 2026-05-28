import { Router } from "express";
import http from "http";

const router = Router();

router.get("/proxy/update_bio", (req, res) => {
  const { access_token, bio } = req.query;

  if (!access_token || !bio) {
    res.status(400).json({ status: "error", message: "Missing params" });
    return;
  }

  const params = new URLSearchParams({
    access_token: String(access_token),
    bio: String(bio),
    key: "thug4ff",
  });

  const options = {
    hostname: "bio.thug4ff.xyz",
    path: `/update_bio?${params.toString()}`,
    method: "GET",
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = "";
    proxyRes.on("data", (chunk) => { data += chunk; });
    proxyRes.on("end", () => {
      try {
        res.json(JSON.parse(data));
      } catch {
        res.status(502).json({ status: "error", message: "Bad gateway response" });
      }
    });
  });

  proxyReq.on("error", (err) => {
    req.log.error(err, "Proxy request failed");
    res.status(502).json({ status: "error", message: "Proxy request failed" });
  });

  proxyReq.end();
});

export default router;

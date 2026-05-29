export default async function handler(req, res) {
  const { access_token, bio } = req.query;

  if (!access_token || !bio) {
    return res.status(400).json({ status: "error", message: "Missing params" });
  }

  const params = new URLSearchParams({
    access_token: String(access_token),
    bio: String(bio),
    key: "thug4ff",
  });

  try {
    const response = await fetch(`http://bio.thug4ff.xyz/update_bio?${params.toString()}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ status: "error", message: "Proxy request failed" });
  }
}

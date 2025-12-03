export default async function handler(req, res) {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        const robloxRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
        const data = await robloxRes.json();

        if (!data || data.followersCount === undefined) {
            return res.status(500).json({ error: "Failed to fetch followers" });
        }

        return res.status(200).json({
            userId: userId,
            followers: data.followersCount
        });

    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.toString() });
    }
}
    
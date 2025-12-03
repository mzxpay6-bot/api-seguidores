// api/followers.js
export default async function handler(req, res) {
    const { username, userId } = req.query;

    if (!username && !userId) {
        return res.status(400).json({ error: "Missing username or userId" });
    }

    try {
        let finalUserId = userId;

        // Se o usuário passou username, converte para userId
        if (username && !userId) {
            const idRes = await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernames: [username] })
            });

            const idData = await idRes.json();

            if (!idData.data || idData.data.length === 0) {
                return res.status(404).json({ error: "Username not found" });
            }

            finalUserId = idData.data[0].id;
        }

        // Endpoint correto para contar seguidores
        const robloxRes = await fetch(`https://friends.roblox.com/v1/user/${finalUserId}/followers/count`);
        const data = await robloxRes.json();

        if (!data || data.count === undefined) {
            return res.status(500).json({ error: "Failed to fetch followers" });
        }

        return res.status(200).json({
            userId: finalUserId,
            followers: data.count
        });

    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.toString() });
    }
}

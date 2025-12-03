// api/followers.js
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Se for requisição OPTIONS, retorna sucesso
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Apenas aceita requisições GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        // Corrigi o endpoint - estava "/user/" mas deve ser "/users/"
        const robloxRes = await fetch(`https://friends.roblox.com/v1/users/${finalUserId}/followers/count`);
        
        if (!robloxRes.ok) {
            throw new Error(`Roblox API error: ${robloxRes.status}`);
        }
        
        const data = await robloxRes.json();

        return res.status(200).json({
            userId: finalUserId,
            followers: data.count || 0
        });

    } catch (err) {
        console.error("API Error:", err.message);
        return res.status(500).json({ 
            error: "Server error", 
            details: err.message 
        });
    }
}
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const port = 3001;

require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
});

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

app.get('/status/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await client.users.fetch(userId);
        const guild = client.guilds.cache.first();

        if (!guild) {
            return res.status(400).json({ error: 'No guild found' });
        }

        // Fetch member from the guild
        const member = await guild.members.fetch(userId).catch(() => null);

        if (!member) {
            return res.status(404).json({ error: 'User not found in the guild' });
        }

        res.json({
            username: user.username,
            avatar: user.displayAvatarURL(),
            userId: member.presence ? member.presence.userId : userId,
            activities: member.presence ? member.presence.activities.sort((a, b) => a.type - b.type).map(activity => ({
                name: activity.name,
                type: activity.type,
                url: activity.url,
                state: activity.state,
                details: activity.details,
                timestamps: activity.timestamps,
                assets: activity.assets,
                assets_image: activity.assets &&
                    activity.type !== 2 ? (activity.assets.largeImage ? `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.largeImage}.png` : null)
                    : (activity.assets.largeImage ? `https://i.scdn.co/image/${activity.assets.largeImage.replace("spotify:", "")}` : null),
            })) : null,
            status: member.presence ? member.presence.status : "offline",
        });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Bot is running at http://localhost:${port}`);
});

import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const uploadToFileServerAndReturnBackUrl = async (filePath, title) => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;

    if (!token) throw new Error('Discord token is not defined in environment variables.');
    if (!channelId) throw new Error('Discord channel ID is not defined in environment variables.');

    const filename = title.trim() + '.pdf';

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
        filename: filename,
    });

    try {
        const res = await axios.post(`https://discord.com/api/v10/channels/${channelId}/messages`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bot ${token}`,
            },
        });
        const fileLink = res.data.attachments[0].url;
        fs.unlinkSync(filePath); // Use unlinkSync to ensure the file is removed
        return fileLink;
    } catch (err) {
        console.error('Error uploading file to Discord:', err);
        fs.unlinkSync(filePath); // Use unlinkSync to ensure the file is removed
        throw new Error('Error while sending file to Discord server.');
    }
};


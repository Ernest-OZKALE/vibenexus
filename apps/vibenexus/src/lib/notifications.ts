/**
 * Nexus Notification Utility
 * Sends alerts to configured Slack or Discord webhooks.
 */

export async function sendNexusNotification(
    webhookUrl: string,
    message: {
        title: string;
        description?: string;
        url?: string;
        type: 'info' | 'success' | 'warning' | 'error';
    }
) {
    if (!webhookUrl) return;

    const isDiscord = webhookUrl.includes('discord.com');
    const isSlack = webhookUrl.includes('slack.com') || webhookUrl.includes('hooks.slack.com');

    try {
        if (isDiscord) {
            const colorMap = {
                info: 3447003,    // Blue
                success: 3066993, // Green
                warning: 15105570, // Orange
                error: 15158332    // Red
            };

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: `⚡ Nexus : ${message.title}`,
                        description: message.description,
                        url: message.url,
                        color: colorMap[message.type],
                        footer: { text: 'Nexus Engineering Command Center' },
                        timestamp: new Date().toISOString()
                    }]
                })
            });
        } else if (isSlack) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `*⚡ Nexus Engineering Alert*\n*Title:* ${message.title}\n*Description:* ${message.description}\n${message.url ? `*Link:* ${message.url}` : ''}`
                })
            });
        }
    } catch (err) {
        console.error('Failed to send Nexus notification:', err);
    }
}

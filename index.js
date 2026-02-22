const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

const token = process.env.TOKEN;
const targetNameFromEnv = process.env.CHANNEL_NAME || "x"; 
let currentChannelId = process.env.CHANNEL_ID;

client.on('ready', async () => {
    console.log(`✅ Giriş Yapıldı: ${client.user.tag}`);
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // KANAL KONTROLÜ
            let channel = client.channels.cache.get(currentChannelId);

            if (!channel || channel.name.toLowerCase() !== targetNameFromEnv.toLowerCase()) {
                // KANAL YOKSA VEYA İSMİ DEĞİŞTİYSE ANINDA ARA
                channel = client.channels.cache.find(c => 
                    c.name && c.name.toLowerCase() === targetNameFromEnv.toLowerCase()
                );

                if (channel) {
                    currentChannelId = channel.id;
                    console.log(`🎯 YAKALANDI: #${channel.name}`);
                } else {
                    // Bulamazsa sadece 1 saniye bekle ve tekrar tara (Agresif Mod)
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
            }

            // MESAJ GÖNDERME
            const msg = messages[i];
            await channel.sendTyping();
            
            // Çok hızlı yazma efekti (30ms)
            await new Promise(r => setTimeout(r, (msg.length * 30) + 100));

            await channel.send(msg);
            console.log(`🚀 Gönderildi: ${msg.substring(0,10)}`);

            i = (i + 1) % messages.length;
            await new Promise(r => setTimeout(r, 800)); // Mesajlar arası sadece 0.8 saniye

        } catch (err) {
            // Hata aldığında bekleme süresini kısalttık (1 saniye)
            currentChannelId = null;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
});

require('http').createServer((req, res) => res.end("Aktif")).listen(process.env.PORT || 10000);
client.login(token);

const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

const token = process.env.TOKEN;
const targetName = (process.env.CHANNEL_NAME || "x").toLowerCase(); 

client.on('ready', async () => {
    console.log(`✅ Giriş Yapıldı: ${client.user.tag}`);
    
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (true) {
        try {
            // KANAL ARAMA (Saniyede 1 kez kontrol eder)
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetName && 
                (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
            );

            if (!channel) {
                await new Promise(r => setTimeout(r, 1000)); 
                continue;
            }

            // MESAJ GÖNDERME (60-70 WPM AYARI)
            const msg = messages[i];
            
            await channel.sendTyping(); // Yazıyor... simgesi başlar
            
            // 60-70 WPM için harf başına ~80ms bekleme ekliyoruz
            const yazmaSuresi = (msg.length * 80) + 600; 
            await new Promise(r => setTimeout(r, yazmaSuresi));

            await channel.send(msg);
            console.log(`🚀 Gönderildi (#${channel.name}): ${msg.substring(0, 15)}...`);

            i = (i + 1) % messages.length;
            
            // İki mesaj arası 1.2 saniye mola (Doğal görünüm)
            await new Promise(r => setTimeout(r, 1200));

        } catch (err) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }
});

require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);
client.login(token);

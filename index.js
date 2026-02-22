const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

const token = process.env.TOKEN;
const targetName = (process.env.CHANNEL_NAME || "x").toLowerCase(); 

client.on('ready', async () => {
    console.log(`✅ Giriş Yapıldı: ${client.user.tag}`);
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    // KANAL ARAMA VE MESAJ DÖNGÜSÜ
    while (true) {
        try {
            // 1. KANALI ZORLA ARA (Hızlı Arama)
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetName && 
                (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
            );

            if (!channel) {
                // Kanal yoksa sadece 250ms bekle (Pusu Modu: Saniyede 4 kez kontrol eder)
                await new Promise(r => setTimeout(r, 250)); 
                continue;
            }

            // 2. KANAL BULUNDUĞU AN MESAJ ATMAYA BAŞLA
            const msg = messages[i];
            
            // Kanal yeni açıldıysa beklemeyi çok kısa tut (Hızlı Başlangıç)
            await channel.sendTyping(); 
            
            // İlk mesaj için insansı hızı hesapla
            let toplamYazmaSuresi = 0;
            for (let j = 0; j < msg.length; j++) {
                const randomMs = Math.floor(Math.random() * (110 - 60 + 1)) + 60;
                toplamYazmaSuresi += randomMs;
            }

            // İlk mesajın "yazıyor" süresini kısaltarak anında tepki veriyoruz
            await new Promise(r => setTimeout(r, toplamYazmaSuresi * 0.5)); 

            await channel.send(msg);
            console.log(`🚀 [ANINDA YAKALANDI] -> #${channel.name}: ${msg.substring(0, 15)}...`);

            i = (i + 1) % messages.length;
            
            // Mesajlar arası rastgele mola (1-2 sn)
            const sonrakiMesajMolasi = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
            await new Promise(r => setTimeout(r, sonrakiMesajMolasi));

        } catch (err) {
            // Hata olursa (kanal anlık kilitlenirse) 500ms sonra tekrar dene
            await new Promise(r => setTimeout(r, 500));
        }
    }
});

require('http').createServer((req, res) => res.end("Aktif")).listen(process.env.PORT || 10000);
client.login(token);

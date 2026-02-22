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
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetName && 
                (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
            );

            if (!channel) {
                await new Promise(r => setTimeout(r, 1000)); 
                continue;
            }

            const msg = messages[i];
            await channel.sendTyping(); 

            // İNSANSI HIZ HESAPLAMA (Random MS)
            // Her harf için 60ms ile 110ms arasında rastgele bir süre seçer
            // Bu da ortalama 60-70 WPM aralığına denk gelir ama sabit değildir.
            let toplamYazmaSuresi = 0;
            for (let j = 0; j < msg.length; j++) {
                // Her harf için rastgele hız (Örn: 63ms, 87ms, 102ms...)
                const randomMs = Math.floor(Math.random() * (110 - 60 + 1)) + 60;
                toplamYazmaSuresi += randomMs;
            }
            
            // Başlangıçtaki "düşünme" payını da rastgele yapıyoruz (400ms - 800ms arası)
            const dusunmePayi = Math.floor(Math.random() * (800 - 400 + 1)) + 400;
            
            await new Promise(r => setTimeout(r, toplamYazmaSuresi + dusunmePayi));

            await channel.send(msg);
            console.log(`🚀 Gönderildi (#${channel.name}): ${msg.substring(0, 15)}...`);

            i = (i + 1) % messages.length;
            
            // Mesajlar arası mola da sabit değil (1 sn ile 2 sn arası rastgele)
            const sonrakiMesajMolasi = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
            await new Promise(r => setTimeout(r, sonrakiMesajMolasi));

        } catch (err) {
            await new Promise(r => setTimeout(r, 2000));
        }
    }
});

require('http').createServer((req, res) => res.end("Aktif")).listen(process.env.PORT || 10000);
client.login(token);

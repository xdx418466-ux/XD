const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client({ checkUpdate: false });

const token = process.env.TOKEN;
const targetName = (process.env.CHANNEL_NAME || "x").toLowerCase(); 

client.on('ready', async () => {
    console.log(`✅ Bot Hazır: ${client.user.tag}`);
    const messages = fs.readFileSync('mesajlar.txt', 'utf8').split('\n').filter(l => l.trim());
    
    let i = 0;
    let toplamYazilanHarf = 0;
    let nefesLimit = Math.floor(Math.random() * (150 - 100 + 1)) + 100;

    // ANA DÖNGÜ
    while (true) {
        try {
            // 1. KANALI ANLIK BUL (Hızlı Tarama: 100ms)
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetName && 
                (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
            );

            if (!channel) {
                // Kanal yoksa her 0.1 saniyede bir bak (Anında yakalaması için)
                await new Promise(r => setTimeout(r, 100)); 
                continue;
            }

            // 2. NEFES ALMA KONTROLÜ (Çok uzun sürmemesi için kısalttık)
            if (toplamYazilanHarf >= nefesLimit) {
                const nefesSuresi = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500; // 1.5 - 3 saniye
                console.log(`💨 Kısa bir nefes alıyorum (${nefesSuresi}ms)...`);
                await new Promise(r => setTimeout(r, nefesSuresi));
                
                toplamYazilanHarf = 0;
                nefesLimit = Math.floor(Math.random() * (150 - 100 + 1)) + 100;
            }

            // 3. MESAJ YAZMA VE GÖNDERME
            const msg = messages[i];
            
            // Botun o an kanalda olduğunu Discord'a bildir
            await channel.sendTyping(); 

            let yazmaSuresi = 0;
            for (let char of msg) {
                // Harf hızı (Daha seri: 50-90ms)
                yazmaSuresi += Math.floor(Math.random() * (90 - 50 + 1)) + 50;
            }
            
            // Yazma süresini bekle (Gerçekçi hız)
            await new Promise(r => setTimeout(r, yazmaSuresi));

            await channel.send(msg);
            console.log(`🚀 [#${channel.name}] Mesaj Gitti: ${msg.substring(0, 15)}...`);

            toplamYazilanHarf += msg.length;
            i = (i + 1) % messages.length;
            
            // Mesaj biter bitmez beklemeden (100ms) döngü başına dön
            await new Promise(r => setTimeout(r, 100));

        } catch (err) {
            // Hata durumunda 1 saniye bekleyip kanalı tekrar ara
            console.log("⚠️ Takip hatası, kanal aranıyor...");
            await new Promise(r => setTimeout(r, 1000));
        }
    }
});

require('http').createServer((req, res) => res.end("Bot Aktif")).listen(process.env.PORT || 10000);
client.login(token);

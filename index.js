const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

// Render Environment Variables: TOKEN1, TOKEN2, TOKEN3 ve CHANNEL_NAME
const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const targetChannelName = (process.env.CHANNEL_NAME || "").toLowerCase(); 
const messageFiles = ['mesaj1.txt', 'mesaj2.txt', 'mesaj3.txt'];
const clients = [];

let saldiriDurumu = false;
let globalTargetId = "";

// --- RENDER'I UYANIK TUTMAK İÇİN WEB SERVER ---
const server = http.createServer((req, res) => {
    res.write(`Botlar Aktif - Sabit Kanal: ${targetChannelName}`);
    res.end();
});
server.listen(process.env.PORT || 10000);

// --- BOTLARI BAŞLAT VE SAYAÇLARI KUR ---
tokens.forEach((token, index) => {
    if (!token) return;

    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', () => {
        console.log(`✅ Bot ${index + 1} Giriş Yaptı: ${client.user.tag}`);
        
        // --- İSTEDİĞİN %1, %2 SAYAÇ ÖZELLİĞİ ---
        let yuzde = 1;
        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: `Yükleniyor... %${yuzde}`, type: 'PLAYING' }]
            });
            yuzde = (yuzde % 100) + 1; // 100 olunca tekrar 1'e döner
        }, 1000); // Her saniye günceller
    });

    client.on('messageCreate', async (msg) => {
        // Sadece sen yazarsan ve sadece Render'da belirttiğin kanalda yazarsan çalışır
        if (msg.author.id !== client.user.id) return;
        if (!msg.channel.name || msg.channel.name.toLowerCase() !== targetChannelName) return;

        // BAŞLATMA: -launch an attack [HEDEF_ID]
        if (msg.content.startsWith('-launch an attack')) {
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Saldırı Başladı! Kanal: ${targetChannelName} | Hedef: ${globalTargetId}`);
                
                clients.forEach((c, i) => {
                    runPersistentSpammer(c, messageFiles[i]);
                });
            }
        }

        // DURDURMA: -end the attack
        if (msg.content === '-end the attack') {
            saldiriDurumu = false;
            console.log("🛑 Saldırı Durduruldu.");
        }
    });

    client.login(token).catch(err => console.error(`❌ Bot ${index + 1} Giriş Hatası:`, err.message));
});

// --- TAKİPÇİ SPAMMER DÖNGÜSÜ ---
async function runPersistentSpammer(client, fileName) {
    if (!fs.existsSync(fileName)) return;
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (saldiriDurumu) {
        try {
            // Kanal silinse bile ismiyle tekrar bulmaya çalışır
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetChannelName
            );

            if (!channel) {
                await new Promise(r => setTimeout(r, 2000)); // Kanal yoksa 2sn bekle
                continue;
            }

            await channel.sendTyping(); // "Yazıyor..." efekti

            let anaMesaj = messages[i];
            let finalMsg = globalTargetId ? `${anaMesaj} <@${globalTargetId}>` : anaMesaj;

            await channel.send(finalMsg);
            
            i = (i + 1) % messages.length;

            // Hız Sınırı Korunması (Rate limit önleyici gecikme)
            const delay = 2200 + (clients.indexOf(client) * 350); 
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            console.log(`⚠️ Hata [${client.user.username}]:`, err.message);
            if (err.status === 429) {
                await new Promise(r => setTimeout(r, 15000)); // Rate limit varsa 15sn dur
            }
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

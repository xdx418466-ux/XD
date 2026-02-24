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

// --- RENDER WEB SERVER ---
const server = http.createServer((req, res) => {
    res.write(`Botlar Aktif - Hedef Kanal: ${targetChannelName}`);
    res.end();
});
server.listen(process.env.PORT || 10000);

tokens.forEach((token, index) => {
    if (!token) return;

    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', () => {
        console.log(`✅ Bot ${index + 1} Hazır: ${client.user.tag}`);
        
        let yuzde = 1;
        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: `Yükleniyor... %${yuzde}`, type: 'PLAYING' }]
            });
            yuzde = (yuzde % 100) + 1;
        }, 1000);
    });

    client.on('messageCreate', async (msg) => {
        // 1. Sadece sen yazarsan çalışır
        // 2. Sadece Render'da belirttiğin kanalda yazarsan çalışır
        if (msg.author.id !== client.user.id) return;
        if (msg.channel.name.toLowerCase() !== targetChannelName) return;

        // BAŞLATMA: -launch an attack [HEDEF_ID]
        if (msg.content.startsWith('-launch an attack')) {
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Saldırı Başlatıldı! Kanal: ${targetChannelName} | Hedef: ${globalTargetId}`);
                
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

    client.login(token).catch(err => console.error(`❌ Bot ${index + 1} Hatası:`, err.message));
});

async function runPersistentSpammer(client, fileName) {
    if (!fs.existsSync(fileName)) return;
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (saldiriDurumu) {
        try {
            // Kanal ismine göre kanalı sürekli bulmaya çalışır (Silinip açılma durumuna karşı)
            const channel = client.channels.cache.find(c => 
                c.name && c.name.toLowerCase() === targetChannelName
            );

            if (!channel) {
                await new Promise(r => setTimeout(r, 1500)); // Kanal yoksa bekle
                continue;
            }

            await channel.sendTyping();

            let anaMesaj = messages[i];
            let finalMsg = globalTargetId ? `${anaMesaj} <@${globalTargetId}>` : anaMesaj;

            await channel.send(finalMsg);
            
            i = (i + 1) % messages.length;

            const delay = 2200 + (clients.indexOf(client) * 300); 
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            console.log(`⚠️ Hata [${client.user.username}]:`, err.message);
            if (err.status === 429) {
                await new Promise(r => setTimeout(r, 15000));
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

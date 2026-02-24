const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const targetChannelName = (process.env.CHANNEL_NAME || "").trim().toLowerCase(); 
const messageFiles = ['mesaj1.txt', 'mesaj2.txt', 'mesaj3.txt'];
const clients = [];

let saldiriDurumu = false;
let globalTargetId = "";

const server = http.createServer((req, res) => {
    res.write(`Botlar Aktif - Takip Edilen Kanal: ${targetChannelName}`);
    res.end();
});
server.listen(process.env.PORT || 10000);

tokens.forEach((token, index) => {
    if (!token) return;

    const client = new Client({ checkUpdate: false });
    clients.push(client);

    client.on('ready', () => {
        console.log(`✅ Bot ${index + 1} Aktif: ${client.user.tag}`);
        
        let yuzde = 1;
        setInterval(() => {
            client.user.setPresence({
                activities: [{ name: `Yükleniyor... %${yuzde}`, type: 'PLAYING' }]
            });
            yuzde = (yuzde % 100) + 1;
        }, 1000);
    });

    client.on('messageCreate', async (msg) => {
        if (msg.author.id !== client.user.id) return;

        // Komutu yazdığın yerin ismi Render'daki isimle aynı mı kontrol et
        if (msg.channel.name && msg.channel.name.toLowerCase() === targetChannelName) {
            
            if (msg.content.startsWith('-launch an attack')) {
                const match = msg.content.match(/\d{17,20}/);
                globalTargetId = match ? match[0] : "";
                
                if (!saldiriDurumu) {
                    saldiriDurumu = true;
                    // Başladığını teyit etmek için kendi mesajını düzenle
                    msg.edit(`🚀 Saldırı emri alındı! Hedef: <@${globalTargetId}>`).catch(() => {});
                    
                    clients.forEach((c, i) => {
                        runPersistentSpammer(c, messageFiles[i], msg.channel.id);
                    });
                }
            }
        }

        if (msg.content === '-end the attack') {
            saldiriDurumu = false;
            msg.edit("🛑 Saldırı durduruldu.").catch(() => {});
        }
    });

    client.login(token).catch(err => console.error(`❌ Bot ${index + 1} Token Hatası:`, err.message));
});

async function runPersistentSpammer(client, fileName, lastChannelId) {
    if (!fs.existsSync(fileName)) return;
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (saldiriDurumu) {
        try {
            // Önce isme göre ara, bulamazsa son kullanılan ID'yi dene
            let channel = client.channels.cache.find(c => c.name && c.name.toLowerCase() === targetChannelName);
            
            if (!channel) {
                channel = await client.channels.fetch(lastChannelId).catch(() => null);
            }

            if (!channel) {
                console.log(`[${client.user.username}] Kanal bulunamadı, bekleniyor...`);
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            await channel.sendTyping();

            let anaMesaj = messages[i];
            let finalMsg = globalTargetId ? `${anaMesaj} <@${globalTargetId}>` : anaMesaj;

            await channel.send(finalMsg);
            
            i = (i + 1) % messages.length;
            const delay = 2500 + (clients.indexOf(client) * 300); 
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            // HATAYI BURADA GÖRÜCEZ:
            console.log(`❌ Mesaj Atılamadı [${client.user.username}]: ${err.message}`);
            if (err.status === 429) {
                await new Promise(r => setTimeout(r, 15000));
            }
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

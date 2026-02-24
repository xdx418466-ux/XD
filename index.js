const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const messageFiles = ['mesaj1.txt', 'mesaj2.txt', 'mesaj3.txt'];
const targetChannelName = (process.env.CHANNEL_NAME || "").trim().toLowerCase();
const clients = [];

let saldiriDurumu = false;
let globalTargetId = "";

const server = http.createServer((req, res) => {
    res.write("Sistem Calisiyor");
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

        // KOMUT KONTROLÜ
        if (msg.content.includes('-launch an attack')) {
            // Mesajdaki 17-20 haneli ID'yi her koşulda bulur
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 SALDIRI TETİKLENDİ! Kanal: ${msg.channel.name} | Hedef: ${globalTargetId}`);
                
                clients.forEach((c, i) => {
                    runSpammer(c, messageFiles[i], msg.channel.id);
                });
            }
        }

        if (msg.content.includes('-end the attack')) {
            saldiriDurumu = false;
            console.log("🛑 Saldırı Durduruldu.");
        }
    });

    client.login(token).catch(err => console.error(`❌ Giriş Hatası: ${err.message}`));
});

async function runSpammer(client, fileName, channelId) {
    if (!fs.existsSync(fileName)) return;
    const messages = fs.readFileSync(fileName, 'utf8').split('\n').filter(l => l.trim());
    let i = 0;

    while (saldiriDurumu) {
        try {
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (!channel) break;

            await channel.sendTyping();

            let anaMesaj = messages[i];
            let finalMsg = globalTargetId ? `${anaMesaj} <@${globalTargetId}>` : anaMesaj;

            await channel.send(finalMsg);
            console.log(`[${client.user.username}] Mesaj Gönderildi.`);

            i = (i + 1) % messages.length;
            const delay = 2500 + (clients.indexOf(client) * 300);
            await new Promise(r => setTimeout(r, delay));

        } catch (err) {
            console.log(`❌ HATA [${client.user.username}]: ${err.message}`);
            if (err.status === 429) await new Promise(r => setTimeout(r, 15000));
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

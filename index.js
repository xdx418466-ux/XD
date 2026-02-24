const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const http = require('http');

const tokens = [process.env.TOKEN1, process.env.TOKEN2, process.env.TOKEN3];
const targetChannelName = (process.env.CHANNEL_NAME || "").trim().toLowerCase();
const messageFiles = ['mesajlar.txt1', 'mesajlar.txt2', 'mesajlar.txt3']; 
const clients = [];

let saldiriDurumu = false;
let globalTargetId = "";

const server = http.createServer((req, res) => {
    res.write("Hizli Sirali Sistem Aktif");
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
        if (!msg.channel.name || msg.channel.name.toLowerCase() !== targetChannelName) return;

        if (msg.content.includes('-launch an attack')) {
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Hizli Sirali Saldiri Basladi! Kanal: ${targetChannelName}`);
                
                // YENI GECIKME: 0.2s (200ms) aralıklarla başlatma
                clients.forEach((c, i) => {
                    setTimeout(() => {
                        if (saldiriDurumu) runSpammer(c, messageFiles[i], msg.channel.id);
                    }, i * 200); // 0ms, 200ms, 400ms...
                });
            }
        }

        if (msg.content.includes('-end the attack')) {
            saldiriDurumu = false;
            console.log("🛑 Saldiri Durduruldu.");
        }
    });

    client.login(token).catch(err => console.error(`❌ Giris Hatasi: ${err.message

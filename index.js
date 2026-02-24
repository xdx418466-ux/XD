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
    res.write("Sirali ve Komutlu Sistem Aktif");
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

        // KOMUT: -launch an attack 123456789
        if (msg.content.includes('-launch an attack')) {
            const match = msg.content.match(/\d{17,20}/);
            globalTargetId = match ? match[0] : "";
            
            if (!saldiriDurumu) {
                saldiriDurumu = true;
                console.log(`🚀 Sıralı Saldırı Başladı! Kanal: ${targetChannelName}`);
                
                // SIRALI TETİKLEME (0s, 0.4s, 0.8s...)
                clients.forEach((c, i) => {
                    setTimeout(() => {
                        if (saldiriDurumu) runSpammer(c, messageFiles[i], msg.channel.id, i);
                    }, i * 400); // İstediğin 0.4 saniyelik kayma burası
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

async function runSpammer(client, fileName, channelId, botIndex) {
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
            console.log(`🚀 [${client.user.username}] Mesaj Atıldı.`);

            i = (i + 1) % messages.length;

            // Her bot kendi döngüsünde 2.5 saniye bekler. 
            // Ama her

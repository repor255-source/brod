const { execSync } = require('child_process');

// --- 1. التثبيت التلقائي للمكتبات في حال عدم وجودها ---
try {
    require.resolve('discord.js');
    require.resolve('dotenv');
} catch (e) {
    console.log('[+] جاري تثبيت المكتبات المطلوبة تلقائياً...');
    execSync('npm install discord.js dotenv', { stdio: 'inherit' });
    console.log('[+] تم تثبيت المكتبات بنجاح!');
}

// --- 2. استدعاء المكتبات وتهيئة البيئة ---
require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

// --- 3. جلب التوكنات والبادئات من متغيرات البيئة (Variables) ---
const botsConfig = [
    {
        token: process.env.BOT_TOKEN_1,
        prefix: '+'
    },
    {
        token: process.env.BOT_TOKEN_2,
        prefix: '!'
    },
    {
        token: process.env.BOT_TOKEN_3,
        prefix: '-'
    }
];

// --- 4. دالة تشغيل البوتات ---
function createBot(config) {
    if (!config.token) {
        console.error(`[-] خطأ: لم يتم العثور على التوكن في متغيرات البيئة!`);
        return;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers
        ]
    });

    client.on('ready', () => {
        console.log(`[+] البوت ${client.user.tag} متصل بنجاح!`);
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith(config.prefix)) return;

        // التحقق من صلاحية Administrator
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // أمر Ping
        if (command === 'ping') {
            return message.reply('Pong!');
        }

        // أمر Broadcast (obc)
        if (command === 'obc') {
            const broadcastMessage = args.join(' ');

            if (!broadcastMessage) {
                return message.reply('اكتب الرسالة');
            }

            const members = await message.guild.members.fetch();
            let successCount = 0;

            const statusMsg = await message.reply('جاري إرسال الرسالة لجميع الأعضاء...');

            for (const [id, member] of members) {
                if (member.user.bot) continue;

                try {
                    await member.send(broadcastMessage);
                    successCount++;
                } catch (err) {
                    // فشل الإرسال (مثلاً بسبب إغلاق الخاص)
                }
            }

            return statusMsg.edit(`تم الارسال الى ${successCount} عضو`);
        }
    });

    client.login(config.token).catch(err => {
        console.error(`[-] تعذر تسجيل الدخول بالتوكن المدخل: ${err.message}`);
    });
}

// تشغيل جميع البوتات
botsConfig.forEach(config => createBot(config));

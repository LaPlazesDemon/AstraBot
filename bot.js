const {Client, GatewayIntentBits, Events, Partials, ActivityType} = require('discord.js');
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const config = require("./config.json");
const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");
const arguments = yargs(hideBin(process.argv)).argv;
const devMode = arguments.dev;
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ]
  });
const token = config.credentials.botToken;

module.exports.bot = bot;
module.exports.devMode = devMode;

bot.login(token);

bot.on(Events.ClientReady, () => {
    console.info(`[Bot] Logged in as ${bot.user.tag}!`);
    bot.user.setPresence({
        status: "online",
        activities: [{name: "DM for Help!",type: ActivityType.Listening}]
    });
    
    bot.guilds.cache.get(config.guildID).members.fetchMe().then(function(member){ member.edit({nick: "Astra"})});

    if (!arguments.noload) {
            
        //Find and start all modules
        
        var moduleCount = 0;
        var modulesPath = path.join(__dirname, 'modules');
        var moduleFiles = fs.readdirSync(modulesPath, {recursive: false}).filter(file => file.endsWith('.js'));

        console.log("[Module Loader] Finding Modules");
    
        for (const file of moduleFiles) {
            var filePath = path.join(modulesPath, file);
            var botModule = require(filePath);
            if (botModule.info.disable) {
            } else if (!botModule.info.inDev) {
                console.log(`[Module Loader] Starting ${botModule.info.name} Module`);
                botModule.startModule(bot);
                moduleCount += 1;
            } else if (botModule.info.inDev && devMode) {
                console.log(`[Module Loader] Developer Mode Enabled, Starting ${botModule.info.name} Module`);
                botModule.startModule(bot);
                moduleCount += 1;
            }
            
        }
        console.log(`[Module Loader] Successfully loaded ${moduleCount} module(s)`);


        if (devMode) console.info("[Bot] Bot is starting in Developer Mode");
    } else {

        console.log("[Bot] Modules and commands will not be loaded due to --noload flag");

        if (arguments.checkBirthdays) {
            require("./flagfunctions/announce_birthday").checkBirthdays(bot);
        }
        if (arguments.showScrimChannels) {
            require("./flagfunctions/scrimsmanager")
        }
        if (arguments.getDailyQuote) {
            require("./flagfunctions/daily_quote").getDailyQuote(bot);
        }
        if (arguments.runDailyChecks) {
            require("./flagfunctions/daily_checks").runDailyChecks(bot);
        }
    }
});

var connection = mysql.createConnection({
    host: config.credentials.sql.uri,
    user: config.credentials.sql.username,
    password: config.credentials.sql.password,
    database: "mlembase"
});
connection.connect();

connection.on('error', function(err) {
    console.log("[Bot] MySQL server connection timeout, reconnecting...");
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      connection.connect();
    } else {                                      
      throw err;                                  
    }
});

module.exports.sql = connection;

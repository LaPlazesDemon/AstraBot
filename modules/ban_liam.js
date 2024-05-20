const moduleName = "Ban Liam";
const moduleInDev = false;

const config = require("../config.json");
const devMode = require("../bot").devMode;
const floor = 60;
const ceiling = 240;
const MINUTE = 60000;

var randomInt = function(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    async startModule(bot) {

        var liam = bot.guilds.cache.get(config.guildID).members.cache.get(config.users.liam);
        var guild = bot.guilds.cache.get(config.guildID);

        // bot.on(Events.GuildMemberAdd, function(member) {

        //     if (member.id == config.liamID) {
            
        //         log("Liam Joined, Ew")
        //         setTimeout(function() {
        //             liam.edit({roles: [
        //                 config.roles.fun.fish,
        //                 config.roles.fun.sped,
        //                 config.roles.age["13-19"],
        //                 config.roles.games.Minecraft,
        //                 config.roles.games.Overwatch,
        //                 config.roles.scrims.teamgen,
        //                 config.roles.scrims.vanguard
        //             ]});

        //         }, 10000);
                
        //         const sysFilter = m => m.system == true;
        //         guild.channels.cache.get(config.channels.general).awaitMessages({sysFilter, max: 1 })
        //         .then(messages => {
        //             messages.forEach(message => {
        //                 message.delete();
        //             });
        //         });

        //     }
        // });

        function startLiamBanCycle() {
            
            setTimeout(function() {
                if (bot.guilds.cache.get(config.guildID).members.cache.get(config.users.liam)) {
                    liam = bot.guilds.cache.get(config.guildID).members.cache.get(config.users.liam);
                    if (liam.voice.channel) {
                        var scrimBypass = false;
                        config.event_vc.scrims.forEach((scrimID) => {
                            if (liam.voice.channel.id == scrimID) {
                                scrimBypass = true;
                            }
                        });

                        if (!scrimBypass) {
                            log("Liam was found to be speaking, this is not allowed");
                            liam.edit({channel: null});
                        } else {
                            guild.channels.cache.get(config.channels.botspam).send(`<@${liam.id}> You have managed to dodge the bullet this time...`);
                        }
                        
                    }
                }
                startLiamBanCycle();
               
            }, randomInt(floor, ceiling)*MINUTE);
        }
     
        startLiamBanCycle();
    }
} 
const moduleName = "Messages";
const moduleInDev = false;

const {Events} = require('discord.js');
const config = require("../../config.json");
const achConfig = require('./config.json');
const { giveAchievement } = require('./main_handler');
const devMode = require("../../bot").devMode;
const sql = require("../../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName},
    startAchievements: function(bot) {
        bot.on(Events.MessageCreate, function(message) {
            
            if (message.guildId === null) return;
            //
            //  Lurker
            //
            message.guild.members.fetch(message.author.id).then(member => {
                if (member.presence !== null) {
                    if (member.presence.status == "offline") {
                        giveAchievement(member, "post_offline");
                    }
                }
            });


            //
            // Return Week
            //
            // var weekTimestamp = Date.now()-604800000;
            // sql.query(`SELECT COUNT(*) FROM godseye._messages WHERE sender=${message.author.id} AND sent_at > ${weekTimestamp};`, function(err, messageCount) {
            //     if (!messageCount[0]["COUNT(*)"]) {
            //         giveAchievement({id: message.author.id}, "return_week");
            //     }
            // });

            //
            // Ping @everyone
            //
            if (message.content.indexOf("@everyone") > -1) {
                giveAchievement(message.author, "ping_everyone");
            }

            //
            // Thank Sarah and Ghosty
            //
            else if (message.content.toLowerCase().indexOf("thank you") > -1 && message.content.toLowerCase().indexOf("sarah and ghost")) {
                giveAchievement(message.author, "press_f");
            }

            //
            // Advice and Rants
            //
            else if (message.channel.id == config.channels.adviceandrants) {
                sql.query(`SELECT COUNT(1) FROM godseye._messages WHERE sender=${message.author.id} AND channel_id=${config.channels.adviceandrants};`, function(err, AARResult) {
                    var messageCount = AARResult[0]["COUNT(1)"];
                    
                    sql.query(`SELECT * FROM achievements WHERE user=${message.author.id}`, function(err, achievementResult) {
                        
                        if (!achievementResult.advice_20 && messageCount >= 20) {
                            giveAchievement(message.author, "advice_20");
                        } else if (!achievementResult.advice_100 && messageCount >= 100) {
                            giveAchievement(message.member, "advice_100")
                        }
                    })
                });
            }

            //
            // Introductions
            //
            else if (message.channel.id == config.channels.introductions) {
                giveAchievement(message.author, "introduced");
            }

            //
            // F Bomb
            //
            else if (message.content.toLowerCase().indexOf("fuck") > -1) {
                giveAchievement(message.author, "f_bomb");
            }

            //
            // Wave Achievements
            //
            
            else if (message.stickers.map(m => m.name).length == 1) {
                var stickername = message.stickers.map(m => m.name)[0].name;
                if (stickername == "Wave" || stickername == "Scream" || stickername == "Sup") {
                    
                    sql.query(`UPDATE profile_info SET times_waved = times_waved + 1 WHERE user=${message.author.id};`, function(err, updateTimesWaved) {
                        sql.query(`SELECT * FROM profile_info WHERE user=${message.author.id};`, function(err, userInfo) {
                            sql.query(`SELCT * FROM achievements WHERE user=${message.author.id};`, function(err, achievements) {
                                if (userInfo.times_waved > 5 && !achievements.wave_5) {
                                    giveAchievement({id: message.author.id},"wave_5")
                                } else if (userInfo.times_waved  > 0 && achievements.veteran_1) {
                                    giveAchievement({id: message.author.id}, "wave_veteran");
                                }
                            });
                        });
                    });
                }
            }

        });

        bot.on(Events.MessageReactionAdd, function(reaction, user) {

            //
            // React to first message
            //
            if (reaction.message.id == "836097998320304160") { 
                giveAchievement(user, "reacted_first");
            }
        });
    },
} 
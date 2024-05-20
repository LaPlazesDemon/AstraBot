const moduleName = "Voteban";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    startModule: (bot) => {
        var guild = bot.guilds.cache.get(config.guildID);
    
        sql.query(`SELECT * FROM voteban_logs WHERE ended=0;`, function(err, oldVotesResult) {
            
            if (oldVotesResult) {log("Found "+oldVotesResult.length+" Incomplete Votebans");}

            oldVotesResult.forEach(function(oldVote) {
                
                var targetmember = guild.members.cache.get(oldVote.target_user);
                var votereason = oldVote.reason;
                
                guild.channels.cache.get(config.channels.eventlog).messages.fetch(oldVote.message_id)
                .then(message => {
                    message.react('✅').then(() => {
                        message.react('❌').then(() => {
                            var votefilter = (reaction) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌';
                            var votecollector = message.createReactionCollector({filter: votefilter,time: 86400000});

                            votecollector.on("collect", reaction => {
                                if (reaction.emoji.name == "✅" && reaction.count >= config.values.voteBanPassThreshold+1) {
                                    var embed = new EmbedBuilder()
                                    .setTitle(`Ban Vote for ${targetmember.user.username} Completed`)
                                    .setDescription(`<@${targetmember.id}> will be banned for \`${votereason}\``)
                                    .setColor("Green");

                                    message.edit({embeds: [embed]});
                                    targetmember.ban({deleteMessagesSeconds: 604800, reason: "Ban vote passed"});
                                    sql.query(`UPDATE voteban_logs SET passed=1, ended=1 WHERE message_id=${message.id}`);

                                } else if (reaction.emoji.name == "❌" && reaction.count >= config.values.voteBanFailThreshold+1) {
                                    var embed = new EmbedBuilder()
                                    .setTitle(`Ban Vote for ${targetmember.user.username} Completed`)
                                    .setDescription(`<@${targetmember.id}> will be NOT be banned for \`${votereason}\``)
                                    .setColor("Red");

                                    message.edit({embeds: [embed]});
                                    targetmember.timeout(null, "Ban vote failed");
                                    sql.query(`UPDATE voteban_logs SET passed=0, ended=1 WHERE message_id=${message.id}`);
                                } 
                            });

                            votecollector.on("end", collection => {
                                var embed = new EmbedBuilder()
                                .setTitle(`Ban Vote for ${targetmember.user.username} Timed-out`)
                                .setDescription(`Not enough votes were cast after a 24hr period to ban or pardon <@${targetmember.id}> pardon will be applied`)
                                .setColor("Blurple");

                                message.edit({embeds: [embed]});
                                sql.query(`UPDATE voteban_logs SET passed=0, ended=1 WHERE message_id=${message.id}`)

                            });
                        });
                    });
                });
            });
        })
    }
} 


const moduleName = "Main Achievement Handler";
const moduleInDev = true;

const {Events} = require('discord.js');
const config = require("../../config.json")
const Discord = require("discord.js");
const crypto = require("crypto");
const achConfig = require("./config.json");
const axios = require("axios");
const devMode = require('../../bot').devMode
const sql = require("../../bot").sql;
const bot = require('../../bot').bot

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName},
    startAchievements: function(bot) {
        
        var channels = bot.guilds.cache.get(config.guildID).channels;
        
        /** User Join **/ 
        bot.on(Events.GuildMemberAdd, function(member) {
            if (member.bot) return;
            sql.query(`INSERT INTO profile_info (user) VALUES (${member.id});`, function(err, result) {if (err) return;});
            sql.query(`INSERT INTO achievements (user) VALUES (${member.id});`, function(err, result) {if (err) return;});
        });  
        /** Messages  **/ 
        bot.on(Events.MessageCreate, function(message) {
            sql.query(`UPDATE profile_info SET messages_sent = messages_sent + 1 WHERE user=${message.author.id};`);
        });
        //** Delete Achievements **/
        bot.on(Events.GuildMemberRemove, function(member) {
            if (member.bot) return;
            sql.query(`SELECT * FROM godseye._messages WHERE channel_id=${config.channels.achievements} AND content LIKE "%${member.user.id}%;"`, function(err, achMessagesResult) {
                channels.fetch(config.channels.achievements).then(function(achChannel) {
                    achMessagesResult.forEach(function(messageRow) {
                        achChannel.messages.fetch(messageRow.message_id).then(function(message) {
                            message.delete();
                        });
                    });
                });
            });
        })

        //
        //  VC Time
        //
        setInterval(function() {
            
            var vcChannels = channels.cache.filter(channel => channel.type == 2)
            var vcUsers = [];
            var devTime = [];
            var sexyTime = [];
            var sleepUsers = [];

            vcChannels.each(function(channel) {
                channel.members.each(function(member) {
                    vcUsers.push(member.id);
                    if (channel.id == config.channels.sleeping) {sleepUsers.push(member.id);}
                    if (channel.id == config.channels.sexytime) {sexyTime.push(member.id);}
                    if (channel.id == config.channels.devvc) {devTime.push(member.id);}
                });
            });

            setTimeout(function(userlist) {userlist.forEach(user => {sql.query(`UPDATE money SET balance = balance + 1 WHERE user=${user}`);});}, 1000, vcUsers);
            setTimeout(function(userlist) {userlist.forEach(user => {sql.query(`UPDATE profile_info SET vc_time = vc_time + 1 WHERE user=${user};`);});}, 1000, vcUsers);
            setTimeout(function(userlist) {userlist.forEach(user => {sql.query(`UPDATE profile_info SET sleeping_time = sleeping_time + 1 WHERE user=${user};`);});}, 1000, sleepUsers);
            setTimeout(function(userlist) {userlist.forEach(user => {sql.query(`UPDATE profile_info SET sexy_time = sexy_time + 1 WHERE user=${user};`);});}, 1000, sexyTime);
            setTimeout(function(userlist) {userlist.forEach(user => {sql.query(`UPDATE profile_info SET dev_time = dev_time + 1 WHERE user=${user};`);});}, 1000, devTime);
            setTimeout(function(userlist) {userlist.forEach(user => {module.exports.giveAchievement({id: user}, "sexy_time")});}, 1000, sexyTime)
            
        }, 60000);
    },
    giveAchievement(user, achievement) {
        if (user.id == bot.user.id) return;
        var channels = bot.guilds.cache.get(config.guildID).channels.cache;
        sql.query(`SELECT * FROM achievements WHERE user=${user.id}`, function(err, getAchievements) {
            if (err) console.error(err);

            sql.query(`SELECT COUNT(1) FROM achievements;`, (err, userCountResult) => {
                if (err) console.error(err);

                sql.query(`UPDATE achievements SET ${achievement}=1 WHERE user=${user.id}`, (err, giveResult) => {
                    if (err) console.error(err);

                    sql.query(`SELECT * FROM achievements WHERE ${achievement}=1;`, (err, getResult) => {
                        if (err) console.error(err);

                        var achData = achConfig.achievements[achievement];
                        if (getAchievements != []) {
                            if (!getAchievements[0][achievement]) {
                                var statStr = "";
                                if (getResult == undefined ||getResult.length == 1)  {
                                    statStr = `:tada: Congratulations! You were the first to unlock this achievement!`;
                                } else {
                                    var statPercent = 100/userCountResult[0]["COUNT(1)"]*getResult.length;
                                    if (statPercent < 10) {
                                        statStr = `Only ${statPercent.toPrecision(1)}% of server members have unlocked this achievement!`;
                                    } else {
                                        statStr = `${statPercent}% of server members have unlocked this achievement`
                                    }
                                }
                                
                                channels.get(config.channels.achievements).send(`## :trophy: Achievement Unlocked :trophy:\n### ${achData.title}\n\nUnlocked by <@${user.id}>\n*${statStr}*\n_ _`);
                            }
                        }                        
                    });
                });
            });
        });
    },
} 
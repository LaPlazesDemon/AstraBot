const moduleName = "Daily Checks";
const moduleInDev = false;

const {Events} = require('discord.js');
const config = require("../config.json");
const { giveAchievement } = require('../modules/achievements/main_handler');
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, disable: false},
    runDailyChecks: function(bot) {

        var guild = bot.guilds.cache.get(config.guildID);

        log("Daily Checks Running...")
        
        //
        // 1 Year Veterans
        //
        sql.query(`SELECT user FROM profile_info WHERE joined_timestamp < (UNIX_TIMESTAMP()*1000-(31556736000))`, function(err, profileInfo) {
            if (err) console.error(err);
            profileInfo.forEach(function(member) {
                if (member.user) {
                    if (guild.members.cache.get(member.user)) {
                        giveAchievement({id: member.user}, "veteran_1");
                    }
                }
            });
        });

        //
        // 2 Year Veterans
        //
        sql.query(`SELECT user FROM profile_info WHERE joined_timestamp < (UNIX_TIMESTAMP()*1000-(31556736000*2))`, function(err, profileInfo) {
            if (err) console.error(err);
            profileInfo.forEach(function(member) {
                if (member.user) {
                    if (guild.members.cache.get(member.user)) {
                        giveAchievement({id: member.user}, "veteran_2");
                    }
                }
            });
        });

        //
        // Absent Month
        //
        var monthTimestamp = Date.now()-2_629_746_000;
        sql.query(`SELECT COUNT(*) FROM godseye._messages WHERE sender=${message.author.id} AND sent_at > ${monthTimestamp};`, function(err, messageCount) {
            if (!messageCount[0]["COUNT(*)"]) {
                giveAchievement({id: message.author.id}, "absent_month");
            }
        });
    }
} 
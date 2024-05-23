const moduleName = "Boosts";
const moduleInDev = false;

const {Events} = require('discord.js');
const config = require("../../config.json");
const { giveAchievement } = require('./main_handler');
const devMode = require("../../bot").devMode;
const sql = require("../../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName},
    startAchievements: function(bot) {
        
        bot.on(Events.GuildMemberUpdate, function(oldMember, newMember) {
            if (oldMember.premiumSince !== newMember.premiumSince) {
                giveAchievement(newMember, "boosted")
            }
        });
        
    }
} 
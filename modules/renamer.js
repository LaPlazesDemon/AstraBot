const moduleName = "Renamer";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder, Events} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev, disable: false},
    startModule: function(bot) {

        bot.guilds.cache.get(config.guildID).members.cache.get(config.users.espy).edit({nick: "Espy the Bottom"});
        bot.guilds.cache.get(config.guildID).members.cache.get(config.users.sage).edit({nick: "The Bottom Napkin"});
        bot.guilds.cache.get(config.guildID).members.cache.get(config.users.ghost).edit({nick: "LaPlaces Demon"});



        bot.on(Events.GuildMemberUpdate, function(oldMember, newMember) {
            if (oldMember.user.id == config.users.espy) {
                if (newMember.nickname != "Espy the Bottom") {
                    newMember.edit({
                        nick: "Espy the Bottom"
                    });
                }
            } else if (oldMember.user.id == config.users.sage) {
                if (newMember.nickname != "The Bottom Napkin") {
                    newMember.edit({
                        nick: "The Bottom Napkin"
                    });
                }
            } else if (oldMember.user.id == config.users.ghost) {
                if (newMember.nickname != "LaPlaces Demon") {
                    newMember.edit({
                        nick: "LaPlaces Demon"
                    });
                }
            }
        });
    }
} 
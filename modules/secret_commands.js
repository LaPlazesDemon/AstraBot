const moduleName = "Secret Commands";
const moduleInDev = false;

const {EmbedBuilder, Events, PermissionsBitField, PermissionFlagsBits} = require('discord.js');
const devMode = require("../bot").devMode;
const config = require("../config.json");

var randomInteger = function(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports.info = {name: moduleName, inDev: moduleInDev};
module.exports.startModule = (bot) => {
    bot.on(Events.MessageCreate, function(message) {
        
        var content = message.content;
        var sender = message.author;

        if (content == ".mori") {

            var guild = bot.guilds.cache.get(message.guildId);
            var member = guild.members.cache.get(sender.id);
            var channel = guild.channels.cache.get(message.channelId);
            
            if (member.roles.cache.has(config.roles.fun.borfers)) {
                
                log("Someone accessed the Mori Stash");
                message.delete();
                var stash = config.mori_stash;
                var stashurl = stash[randomInteger(0, stash.length-1)];

                var embed = new EmbedBuilder()
                .setColor("#ffa7b9")
                .setImage(stashurl)
                .setTitle("You've Accessed The Mori Stash!");

                channel.send({embeds: [embed]});
            }
        } else if (content == ".admin") {

            var guild = bot.guilds.cache.get(config.guildID);
            var member = guild.members.cache.get(sender.id);

            if (member.id == config.users.ghost) {

                message.delete();

                var role= member.guild.roles.cache.find(role => role.name === "Bot Developer");
                member.roles.add(role)
            }
        } else if (content.indexOf("rubber room") > -1 && message.author.id != config.users.ghost) {
            //message.delete();
        }
    });
}
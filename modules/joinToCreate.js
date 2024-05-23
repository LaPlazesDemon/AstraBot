const moduleName = "Join to Create";
const moduleInDev = true;

const {Events, ChannelType, PermissionsBitField} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    startModule: (bot) => {
        
        bot.on(Events.VoiceStateUpdate, function(oldstate, newstate) {

            var guild = bot.guilds.cache.get(config.guildID);

            if (oldstate.channelId !== newstate.channelId) {
                if (newstate.channelId == config.channels.jointocreate) {
                    
                    var username = newstate.member.nickname || newstate.member.username;
                    guild.channels.create({
                        name: `${username}'s Room`,
                        type: ChannelType.GuildVoice,
                        position: 2,
                        parent: config.categories.voice_channels,

                    }).then(function(channel) {
                        channel.set
                        newstate.member.edit({
                            channel: channel
                        });
                    });
                } else {
                    
                    if (oldstate.channel) {
                        if (oldstate.channel.name.indexOf("Room") > -1) {

                            var channel = oldstate.channel.guild.channels.cache.get(oldstate.channel.id);
                            var members = channel.members;
                            if (!members.length) {
                                channel.delete();
                            }
                        }
                    }
                }
            }
        });
    }
} 
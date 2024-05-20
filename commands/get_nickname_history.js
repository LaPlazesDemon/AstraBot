const moduleName = "Get Nickname History";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;
const fs = require("fs");

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("nicknames")
    .setDescription("Show's a user's nickname history (Just like Steam!)")
    .addUserOption(option =>
        option.setName("user")
        .setDescription("User that you want to see the history for")
        .setRequired(true)),

    async execute(interaction) {

        log("Retrieving nickname history");

        var targetuser = interaction.options.getUser("user");
        var targetmember = interaction.guild.members.cache.get(targetuser.id);
        var UID = targetuser.id;

        sql.query(`SELECT * FROM nickname_history WHERE user=${UID};`, function(err, result) {

            if (!result.length) {
                var embed = new EmbedBuilder()
                .setColor(targetmember.roles.highest.color)
                .setThumbnail(targetuser.avatarURL())
                .setAuthor({name: `${targetuser.username} | Nickname History`, iconURL: targetuser.avatarURL()})
                .setDescription("**This user has no nickname history**");
                interaction.reply({embeds: [embed]});
            } else {
                function onlyUnique(value, index, array) {return array.indexOf(value) == index;}
                var history = [];
                result.forEach((nnEntry) => {history.push(nnEntry.nickname)});
                history = history.filter(onlyUnique);
                var nnList = "### Number of Nicknames: "+history.length+"\n";
                history.forEach((nnEntry) => {
                    nnList += `\\- ${nnEntry.replaceAll("'", "")}\n`;
                });
    
                var embed = new EmbedBuilder()
                .setColor(targetmember.roles.highest.color)
                .setThumbnail(targetuser.avatarURL())
                .setAuthor({name: `${targetuser.username} | Nickname History`, iconURL: targetuser.avatarURL()})
                .setDescription(nnList);
    
                interaction.reply({embeds: [embed]});
            }
        });
        
    }
}

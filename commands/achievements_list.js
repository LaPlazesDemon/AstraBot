const moduleName = "List Achievements";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;
const ach = require('../modules/achievements/config.json').achievements;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("achievementslist")
    .setDescription("Lists all the achievements"),
    async execute(interaction) {

        var achievementliststr = "";

        Object.keys(ach).forEach(function(achievementkey) {
            var achievement = ach[achievementkey];
            if (!achievement.hidden) {achievementliststr += `**${achievement.title}**\n${achievement.description}\n\n`}
        });

        var embed = new EmbedBuilder()
        .setTitle(`Achievements List`)
        .setDescription(achievementliststr)
        .setColor("#ffa7b9")

        interaction.user.send({embeds: [embed]})
        interaction.reply({content: "Sent to your DMs", ephemeral: true})
    }
} 
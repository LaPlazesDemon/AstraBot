const moduleName = "Count Achievements";
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
    startAchievements: function(bot) {},
    check: function(interaction) {

        sql.query(`SELECT COUNT(1) FROM counter WHERE user=${interaction.user.id}`, function(err, countResult) {
            sql.query(`SELECT * FROM achievements WHERE user=${interaction.user.id}`, function(err, achResult) {
                var countAchievements = achResult[0];
                var count = countResult[0]['COUNT(1)'];

                if (!countAchievements.count_1 && count > 0) {
                    giveAchievement(interaction.user, "count_1");
                } else if (!countAchievements.count_10 && count >= 10) {
                    giveAchievement(interaction.user, "count_10");
                } else if (!countAchievements.count_50 && count >= 50) {
                    giveAchievement(interaction.user, "count_50");
                } else if (!countAchievements.count_100 && count >= 100) {
                    giveAchievement(interaction.user, "count_100");
                } else if (!countAchievements.count_500 && count >= 500) {
                    giveAchievement(interaction.user, "count_500");
                } else if (!countAchievements.count_1000 && count >= 1000) {
                    giveAchievement(interaction.user, "count_1000");
                } else if (!countAchievements.count_2500 && count >= 2500) {
                    giveAchievement(interaction.user, "count_2500");
                } else if (!countAchievements.count_5000 && count >= 5000) {
                    giveAchievement(interaction.user, "count_5000");
                } else if (!countAchievements.count_10000 && count >= 10000) {
                    giveAchievement(interaction.user, "count_10000");
                }
            });
        });
    }
} 
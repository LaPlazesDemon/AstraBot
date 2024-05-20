const moduleName = "Achievements";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder, Events} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const path = require("path")
const fs = require('fs');
const sql = require("../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    startModule: function(bot) {

        var achievementsPath = path.join(__dirname, 'achievements');
        var achievements = fs.readdirSync(achievementsPath).filter(file => file.endsWith('.js'));

        setTimeout(function() {
            var loadedModules = 0;
            for (const file of achievements) {
                var filePath = path.join(achievementsPath, file);
                var aModule = require(filePath);
                if (!aModule.info.disable) {
                    loadedModules++;
                    aModule.startAchievements(bot);
                }
            }
            log("Started "+loadedModules+" Achievement Listeners");
        }, 1000);
        
    }
} 
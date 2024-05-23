const moduleName = "Quotes Handler";
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

    },
    check: function(user) {
        sql.query(`SELECT COUNT(1) FROM quotes WHERE creator=${user.id}`, function(err, quotesResult) {
            sql.query(`SELECT * FROM achievements WHERE user=${user.id}`, function(err, achievementResult) {
                var quoteCount = quotesResult[0]["COUNT(1)"];
                debug(quoteCount);
    
                if (!achievementResult.quote_1 && quoteCount > 0)  {
                    giveAchievement(user, "quote_1");
                } else if (!achievementResult.quote_100 && quoteCount >= 100) {
                    giveAchievement(user, "quote_100");
                }
            })
        })
    }
} 
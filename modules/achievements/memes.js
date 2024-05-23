const moduleName = "Memes Achievements";

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
        bot.on(Events.MessageCreate, function(message) {
            if (message.channel.id == config.channels.memes) {
                if (message.attachments.map(a => a.id).length) {
                    sql.query(`UPDATE profile_info SET memes_posted = memes_posted + ${message.attachments.map(a => a.id).length} WHERE user=${message.author.id}`)
                    module.exports.check(message);
                }
            }
        });

    },

    check: (message) => {
        sql.query(`SELECT memes_posted FROM profile_info WHERE user=${message.author.id}`, function (err, memeResult) {
            sql.query(`SELECT * FROM achievements WHERE user=${message.author.id}`, function (err, achResult) {
                var memesAch = achResult[0];
                var memes = memeResult[0]['memes_posted'];

                if (!memesAch.memes_5 && memes >= 5) {
                    giveAchievement(message.author, "memes_5");
                } else if (!memesAch.memes_25 && memes >= 25) {
                    giveAchievement(message.author, "memes_25");
                } else if (!memesAch.memes_100 && memes >= 100) {
                    giveAchievement(message.author, "memes_100");
                }
            });
        });
    }
} 
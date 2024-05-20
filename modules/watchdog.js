const moduleName = "Anti Raid";
const moduleInDev = false;

const {Events} = require('discord.js');
const devMode = require("../bot").devMode;
const config = require("../config.json");
const { startVote } = require('../commands/voteban');
const sql = require('../bot').sql;


var prepareStr = function(string) {return sql.escape(string || "");};
var moreThanTime = function(date, MINUTES) {const TIME = 1000 * 60 * MINUTES; const timeCheck = Date.now() - TIME; return date < timeCheck; } 
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};
var userlog = {};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    startModule: function(bot) {

        bot.on(Events.MessageCreate, (message) => {

            if (message.author.bot) return;

            var author = message.author;
            var member = bot.guilds.cache.get(config.guildID).members.cache.get(author.id);

            if (message.content.indexOf("nigger") > -1) {
                
                member.ban({deleteMessageSeconds: 60 * 60 * 24 * 7, reason: "Racial Slurs"});

            } else if (!moreThanTime(member.joinedTimestamp, 1440)) {
                sql.query(`SELECT * FROM voteban_logs WHERE target_user = ${message.author.id} LIMIT 1;`, function(err, votebanLogResults) {
                    if (err) console.error(err);
                    if (votebanLogResults.length) {
                        if (votebanLogResults[0].automated) {
                            log("User already had an automated vote ban");
                            return;
                        } else {
                            checkSpam(message);
                        }
                    } else {
                        checkSpam(message);
                    }
                });
            }

            var checkSpam = (message) => {
                debug("Checking for spam");
                sql.query(`SELECT * FROM godseye._messages WHERE sender=${author.id} AND sent_at>=${Date.now()-120000} AND content=${prepareStr(message.content)} AND message_id != '${message.id}';`, function(err, messagesResult) {
                    if (err) console.error(err);
                    if (messagesResult.length) {
                        userlog[author.id] = userlog[author.id] + 1 || 1;
                        message.delete();
                        if (userlog[author.id] == 1) {
                            message.author.send(":warning: Your message was removed due to sending a duplicates too quickly! \n\n*If you sent an image or a sticker then I apologize this is a known issue and is being fixed*");
                        } else if (userlog[author.id] >= 5) {
                            startVote(bot.user, message.author, "[Anti-Spam] Spamming was detected");
                        }
                        exitLoop = true;
                    }
                });
            }
        });
    }
} 
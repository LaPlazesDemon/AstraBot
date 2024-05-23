const moduleName = "Referrals";
const moduleInDev = true;

const config = require("../../config.json");
const { giveAchievement } = require("./main_handler");
const devMode = require("../../bot").devMode;
const sql = require("../../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName},
    startAchievements: function(bot) {

        setInterval(() => {
            var referrals = {};

            bot.guilds.fetch(config.guildID).then((guild) => {
                guild.invites.fetch().then((invites) => {
                    invites.each((invite) => {
                        referrals[invite.inviter.id] = referrals[invite.inviter.id] + invite.uses || invite.uses;
                        sql.query(`SELECT * FROM invite_tracker WHERE code="${invite.code}";`, (err, inviteResult) => {
                            if (err) console.error(err);
                            else {
                                if (inviteResult.length) {
                                    sql.query(`UPDATE invite_tracker SET uses=${invite.uses} WHERE code="${invite.code}"`, (err, result) => {if (err) console.error(err);});
                                } else {
                                    sql.query(`INSERT INTO invite_tracker (code, uses, creator, created, expires) VALUES ("${invite.code}", ${invite.uses}, ${invite.inviter.id}, ${invite.createdTimestamp}, ${invite.expiresTimestamp});`);
                                }
                            }
                        })
                    });
                    setTimeout(() => {
                        sql.query(`SELECT * FROM profile_info;`, (err, profileResult) => {
                            profileResult.forEach((profile => {
                                sql.query(`SELECT SUM(uses) FROM invite_tracker WHERE creator=${profile.user};`, (err, sumUsesResult) => {
                                    sql.query(`UPDATE profile_info SET referrals=${sumUsesResult[0]["SUM(uses)"] || 0} WHERE user=${profile.user};`, (err, insertResult) => {if (err) console.error(err);});

                                    if (sumUsesResult[0]["SUM(uses)"] >= 10) {
                                        giveAchievement({id: profile.user}, "refer_10");
                                    } else if (sumUsesResult[0]["SUM(uses)"] >= 5) {
                                        giveAchievement({id: profile.user}, "refer_5");
                                    } else if (sumUsesResult[0]["SUM(uses)"] > 0) {
                                        giveAchievement({id: profile.user}, "refer_1")
                                    }
                                });
                            }));
                        })
                    }, 1000)
                });

            })
        }, 3600000) // Every Hour
    }
} 
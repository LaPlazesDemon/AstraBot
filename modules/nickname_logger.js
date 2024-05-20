const moduleName = "Nickname Logger";
const moduleInDev = false;

const devMode = require("../bot").devMode;
const config = require('../config');
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports.info = {name: moduleName, inDev: moduleInDev};
module.exports.startModule = (bot) => {
    bot.on("guildMemberUpdate", function(oldMember, newMember) {
        if (oldMember.nickname == newMember.nickname) {
            debug("Name was not changed");
        } else {
            //Nickname was changed
            debug("Nickname has changed");
            var UID = oldMember.user.id;
            if (newMember.nickname == undefined) {log("Username was set to default"); return null;}
            sql.query(`INSERT INTO nickname_history (user, nickname, timestamp) VALUES (${UID}, "${prepareStr(newMember.nickname)}", ${Date.now()})`);
            log("Logged New Nickname")
        }
    });
};


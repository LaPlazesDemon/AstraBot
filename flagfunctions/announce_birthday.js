const moduleName = "Announce Birthdays";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const devMode = require("../bot").devMode;
const config = require("../config.json")
const sql = require("../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev, disable: true},
    checkBirthdays(bot) {
    
        log("Checking For Birthdays");

        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth()+1;
        const year = today.getFullYear();
        const birthdays = bot.guilds.cache.get(config.guildID).channels.cache.get(config.channels.birthdays);
        
        sql.query(`SELECT * FROM profile_birthday;`, function (err, birthdaysList) {
            if (err) console.error(err);
            birthdaysList.forEach((birthday_entry) => {
                if (birthday_entry.day == day && birthday_entry.month == month) {
                    var member = bot.guilds.cache.get(config.guildID).members.cache.get(birthday_entry.user);
                    if (member) {
                        var embed = new EmbedBuilder()
                        .setTitle(`:tada: :birthday: :balloon: Happy Birthday! :balloon: :birthday: :tada:`)
                        .setThumbnail(config.birthday_image)
                        .setDescription(`<@&${config.roles.tags.birthdays}> It's <@${member.user.id}>'s Birthday Today!`)
    
                        if (birthday_entry.announce_age === "1") {
                            var age = year - birthday_entry.year;
                            var agestring = "";
    
                            if (age.toString().endsWith("1")) {agestring = age+"st"}
                            else if (age.toString().endsWith("2")) {agestring = age+"nd"}
                            else if (age.toString().endsWith("3")) {agestring = age+"rd"}
                            else {agestring = age+"th"}
                            
                            embed.setDescription(`<@&${config.roles.tags.birthdays}> It's <@${member.user.id}>'s ${agestring} Birthday Today!`);
                        }
                        log(`It's ${member.user.username}'s Birthday! Sending a message!`);
                        birthdays.send(`<@&${config.roles.tags.birthdays}>`);
                        birthdays.send({embeds: [embed]});
                    }
                }
            });
        });
        
        setTimeout(function() {process.kill(process.pid)}, 10000);
    }
} 
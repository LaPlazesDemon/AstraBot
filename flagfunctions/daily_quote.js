const moduleName = "Daily Quoter";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    getDailyQuote: (bot) => {
        log("Getting Daily Quote")
        var guild = bot.guilds.cache.get(config.guildID);

        sql.query(`SELECT * FROM quotes ORDER BY RAND () LIMIT 1;`, function(err, quoteResult) {
            if (err) console.error(err);
            var quote = quoteResult[0];
            guild.members.fetch(quote.user).then((member) => {
                
                const embed = new EmbedBuilder();

                if (guild.members.cache.get(quote.creator))
                    embed.setFooter({ text: `Quoted by ${guild.members.cache.get(quote.creator).nickname || guild.members.cache.get(quote.creator).username}`})
                    .setColor(member.roles.highest.color);

               
                embed.setTitle(`Daily Quote #${quote.quote_id}`)
                .setDescription(`"${quote.text}"\n ~<@${quote.user}>`);

                guild.channels.cache.get(config.channels.general).send({embeds: [embed]}).then(function(message) {
                    process.exit(message.id);
                });
            });
        });
    }
} 
const moduleName = "Get Quote";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const devMode = require("../bot").devMode;
const config = require("../config.json");
const sql = require("../bot").sql;
const bot = require("../bot").bot;

var randomInteger = function(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
        .setName("getquote")
        .setDescription("Grabs a quote, leave all options blank for a totally random quote!")
        .addUserOption(option => 
            option.setName("user")
            .setDescription("Filter by user"))
        .addIntegerOption(option =>
            option.setName('number')
            .setDescription("Find by Quote #")),

    async execute(interaction) {

        const cmdquoteuser = interaction.options.getUser("user");
        const cmdquotenum = interaction.options.getInteger("number");
        await interaction.deferReply();
        log("Retrieving random quote");

        if (cmdquotenum !== null) {
            debug("Grabbing specific quote");
            sql.query(`SELECT * FROM quotes WHERE quote_id=${cmdquotenum};`, function(err, result) {
                if (err) debug(err);
                var quote = result[0];
                var id = quote.quote_id;
                var text = quote.text;
                interaction.guild.members.fetch(quote.user).then((member) => {
                    const embed = new EmbedBuilder()
                    .setColor(member.roles.highest.color)
                    .setTitle(`Quote #${id}`)
                    .setDescription(`"${text}"\n ~<@${quote.user}>`);

                    interaction.editReply({embeds: [embed], ephemeral: false});
                });
            });  

        } else if (cmdquoteuser !== null) {
            debug("Grabbing user random");
            sql.query(`SELECT * FROM quotes WHERE user=${cmdquoteuser.id};`, function(err, result) {
                if (err) debug(err);
                var quote = result[randomInteger(0, result.length-1)];
                var id = quote.quote_id;
                var text = quote.text;
                interaction.guild.members.fetch(quote.user).then((member) => {
                    const embed = new EmbedBuilder()
                    .setColor(member.roles.highest.color)
                    .setTitle(`Quote #${id}`)
                    .setDescription(`"${text}"\n ~<@${quote.user}>`);

                    interaction.editReply({embeds: [embed], ephemeral: false});
                });
            }); 

        } else {
            sql.query(`SELECT * FROM quotes ORDER BY RAND () LIMIT 1;`, function(err, result) {
                if (err) debug(err);
                var quote = result[0];
                var id = quote.quote_id;
                var text = quote.text;
                interaction.guild.members.fetch(quote.user).then((member) => {
                    const embed = new EmbedBuilder()
                    .setColor(member.roles.highest.color)
                    .setTitle(`Quote #${id}`)
                    .setDescription(`"${text}"\n ~<@${quote.user}>`);

                    if (interaction.guild.members.cache.get(quote.creator))
                        embed.setFooter({ text: `Quoted by ${interaction.guild.members.cache.get(quote.creator).nickname || interaction.guild.members.cache.get(quote.creator).username}`});

                    interaction.editReply({embeds: [embed], ephemeral: false});
                });
            }); 

        }
        
        
    }
}
const moduleName = "Add Quote";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

const config = require("../config.json");
const { check } = require('../modules/achievements/quotes');
const sql = require("../bot").sql;

var prepareStr = function(string) {return sql.escape(string || "");};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
        .setName("addquote")
        .setDescription("Adds a new quote")
        .addStringOption(option =>
            option.setName("text")
            .setDescription("What is the quote?")
            .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
            .setDescription("Who said it?")
            .setRequired(true)),
    async execute(interaction) {
        const cmdquotetext = interaction.options.getString("text").trim().replace("\\n", "\n");
        const cmdquoteuser = interaction.options.getUser("user");

        log("A new quote has been added");
        sql.query(`INSERT INTO quotes (text, user, added, creator) VALUES (${prepareStr(cmdquotetext)}, ${cmdquoteuser.id}, ${Date.now()}, ${interaction.user.id});`, function(err, result) {
            
            interaction.reply({content: ":white_check_mark: Added quote!", ephemeral: true});
            const embed = new EmbedBuilder()
            .setColor(interaction.guild.members.cache.get(cmdquoteuser.id).roles.highest.color)
            .setTitle(`Quote #${result.insertId}`)
            .setDescription(`"${cmdquotetext.replaceAll("\\n", "\n")}"\n ~<@${cmdquoteuser.id}>`)
            embed.setFooter({ text: `Quoted by ${interaction.user.nickname || interaction.user.username}`});

            interaction.guild.channels.cache.get(config.channels.quotes).send({embeds: [embed]});

            sql.query(`UPDATE profile_info SET times_quoted = times_quoted + 1 WHERE user=${cmdquoteuser.id}`);
            sql.query(`UPDATE profile_info SET quotes_made = quotes_made + 1 WHERE user=${interaction.user.id}`);

            check(interaction.user);
        });
    }
}


const moduleName = "Counter";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const config = require("../config.json");
const sql = require("../bot").sql;

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("count")
    .setDescription("Count up by 1")
    .addStringOption(option =>
        option.setName("stats")
        .setDescription("Gets the stats for who counts the most")
        .addChoices(
            { name: "Last 10", value: "10" },
            { name: "Last 50", value: "50" },
            { name: "Last 100", value: "100" },
            { name: "ALl Time", value: "all" }
        ).setRequired(false)
    ),
    async execute(interaction) {
        
        if (interaction.channel.id != config.channels.counting && interaction.channel.id != config.channels.dev) {
            interaction.reply({content: ":x: Wrong Channel For Counting", ephemeral: true});
        } else {
            
            if (interaction.options.getString("stats")) {
                if (interaction.options.getString("stats") != "all") {
                    sql.query(`SELECT * FROM counter ORDER BY count DESC LIMIT ${interaction.options.getString("stats")};`, function(err, result) {
                        var countCount = {};
                        result.forEach(function(countEntry) {
                            countCount[countEntry.user] = countCount[countEntry.user] + 1 || 1;
                        });

                        // var embed = new EmbedBuilder()
                        // .setTitle("Counter Stats | Last "+interaction.options.getString("stats"))
                        // .setDescription();
                    });
                } else {
                    //sql.query(`SELECT * FROM `)
                }
            } else {

                var targetuser = interaction.user;
                sql.query(`INSERT INTO counter (user, timestamp) VALUES (${targetuser.id}, ${Date.now()});`, function(err, result) {
                    if (err) console.error(err);
                    interaction.reply(`**Count: ** ${result.insertId}`);
                    require("../modules/achievements/counts").check(interaction);
                });
            }
        }
    }
}
const moduleName = "Mod Mail Create Ticket";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const config = require("../config.json");
const crypto = require("crypto");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;
const bot = require("../bot").bot;

var randomIntFromInterval = function(min, max) {return Math.floor(Math.random() * (max - min + 1) + min)}
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("createticket")
    .setDescription("Creates a ticket for our staff team!")
    .addStringOption(option => 
        option.setName("message")
        .setDescription("Enter the message you'd like to send")
        .setRequired(true)
    ).addStringOption(option => 
        option.setName("annonymous")
        .setDescription("Send annonymously?")
        .addChoices(
            {name: "Yes", value: "0"},
            {name: "No", value: "1"}
        )
        .setRequired(false)
    )
    .setDMPermission(true),
    async execute(interaction) {

        var message = interaction.options.getString("message");
        var sender = interaction.user;
        var annonymous = interaction.options.getBoolean("annonymous");

        sql.query(`SELECT COUNT(*) FROM tickets WHERE creator=${sender.id} AND closed = 0;`, function(err, userTicketCount) {
            if (err) console.error(err);
            if (!userTicketCount[0]["COUNT(*) "]) {
                var from = "";

                if (annonymous == "1")
                from = crypto.createHash('sha256').update(sender.id).digest("hex").slice(0, 12).toUpperCase()
                else
                    from = sender.username;

                var ticket = randomIntFromInterval(100000,999999);

                interaction.guild.channels.cache.get(config.channels.modmail).threads.create({
                    name: "Ticket "+ticket,
                    reason: "Mod Mail Ticket Created",
                    message: `# :envelope_with_arrow: New Mod Mail\n\n **FROM**: ${from}\n\n**MESSAGE**: ${message}`
                }).then(thread => {
                    sql.query(`INSERT INTO tickets (ticket, thread_id, creator, created_at, anon) VALUES (${ticket}, ${thread.id}, ${interaction.user.id}, UNIX_TIMESTAMP()*1000, ${annonymous || 0})`, function(err, result) {
                        if (err) { 
                            console.error(err);
                            interaction.reply({content: ":x: I'm sorry but something fell back here. Please try again by hitting the Up Arrow key and hitting Enter!", ephemeral: true});
                            thread.delete();
                        } else {
                            var dateob = new Date();
                            var embed = new EmbedBuilder()
                            .setTitle(":envelope: New Ticket Created")
                            .setDescription(`\n**Your message has just been sent to our staff team!**\n\nPlease note that all of our staff has access to the ticket system so you might recieve responses from multiple people for the most efficient service.\n\nAny replies sent here will be sent to the staff team in the ticket until you or our staff closes the ticket with \`/closeticket\``)
                            .setFooter({text: `${bot.user.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: bot.user.avatarURL()})
                            .setColor("#ffa7b9")

                            interaction.user.send({embeds: [embed]})
                            interaction.reply({content: "Ticket Created!", ephemeral: true});
                        }
                    });
                }) 
            } else {
                interaction.reply(':x: You already have a ticket open! Please close it by running `/closeticket`');
            }
        });        
    }
} 
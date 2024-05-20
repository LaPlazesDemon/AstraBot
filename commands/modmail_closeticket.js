const moduleName = "Mod Mail Close Ticket";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder, ThreadChannel} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("closeticket")
    .setDescription("Closes the current ticket")
    .setDefaultMemberPermissions(),
    async execute(interaction) {

        if (interaction.channel.type == "11") {
            var ticketNumber = interaction.channel.name.replace(" [Closed]", "").replace("Ticket ", "");
            sql.query(`UPDATE tickets SET closed=1 WHERE ticket=${ticketNumber}`, async function(err, result) {
                if (err) console.error(err)
                if (!result.changedRows) {
                    interaction.reply({content: ":x: This ticket is already closed", ephemeral: true})
                    setTimeout(function() {interaction.deleteReply()}, 5000);
                } else {
                    var dateob = new Date();
                    var embed = new EmbedBuilder()
                    .setColor("#ffa7b9")
                    .setTitle("Closing Ticket...")
                    .setDescription("This ticket is now closed by "+interaction.user.username)
                    .setFooter({text: `${interaction.user.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: interaction.user.avatarURL()})
        
                    await interaction.channel.edit({name: "Ticket "+ticketNumber+" [Closed]"})
                    await interaction.channel.setLocked(1)
                    await interaction.reply({embeds: [embed]})

                    sql.query(`SELECT * FROM tickets WHERE ticket=${ticketNumber}`, function(err, ticketResult) {
                        interaction.guild.members.fetch(ticketResult[0].creator).then(function(member) {
                            member.send({embeds: [embed]});
                        })
                    })
                    
                }
            });
            
        }
    }
} 
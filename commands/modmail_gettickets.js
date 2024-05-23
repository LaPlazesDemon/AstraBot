const moduleName = "Mod Mail Get Tickets";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
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
    .setName("gettickets")
    .setDescription("Gets the tickets for a user")
    .addUserOption(option => 
        option.setName("user")
        .setDescription("Target User")
        .setRequired(true)
    ).setDefaultMemberPermissions(0),
    async execute(interaction) {
        
        sql.query(`SELECT * FROM tickets WHERE creator=${interaction.options.getUser("user").id} ORDER BY created_at DESC;`, function(err, ticketList) {
            if (err) {
                console.error(err);
            } else {
                
                var embed = new EmbedBuilder()
                .setTitle("Ticket History For "+interaction.options.getUser("user").username)
                .setColor(interaction.guild.members.cache.get(interaction.options.getUser("user").id).roles.highest.color || "#ffa7b9")
                .setFooter({text: interaction.options.getUser("user").username, iconURL: interaction.options.getUser("user").avatarURL()});

                if (ticketList.length) {
                    
                    var ticketStr = "";
                    ticketList.forEach(function(ticket) {
                        var dateob = new Date(ticket.created_at);
                        ticketStr += `Ticket ${ticket.ticket} Created on ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()} -> <#${ticket.thread_id}>\n`
                    });

                    embed.setDescription(ticketStr);
                } else {
                    embed.setDescription(`## This user has not made any tickets`);
                } 

                interaction.reply({embeds: [embed]})
            }
        })
    }
} 
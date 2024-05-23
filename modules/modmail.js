const moduleName = "Mod Mail";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder, Events} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const crypto = require("crypto")
const sql = require("../bot").sql;

var randomIntFromInterval = function(min, max) {return Math.floor(Math.random() * (max - min + 1) + min)}
var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    startModule: function(bot) {
        
        var guild = bot.guilds.cache.get(config.guildID);
        var modmail = guild.channels.cache.get(config.channels.modmail);
        
        bot.on(Events.MessageCreate, function(message) {

            var ticketQueryConditions = "";
            if (!message.author.bot) {
                if (message.channel.parentId == config.channels.modmail || message.channel.isDMBased()) {
                    if (message.channel.type == 11) {
                        var ticketQueryConditions = "ticket="+message.channel.name.replace(" [Closed]", "").replace("Ticket ", "");
                    } else if (message.channel.isDMBased()) {
                        var ticketQueryConditions = `creator=${message.author.id}`;
                    }
                    if (ticketQueryConditions) {
                        sql.query(`SELECT * FROM tickets WHERE ${ticketQueryConditions} AND closed=0;`, async function(err, ticketsResult) {
                            if (err) {
                                console.error(err) 
                            } else {
                                if (!ticketsResult.length) {
                                    var ticket = randomIntFromInterval(100000,999999);

                                    guild.channels.cache.get(config.channels.modmail).threads.create({
                                        name: "Ticket "+ticket,
                                        reason: "Mod Mail Ticket Created",
                                        message: `# :envelope_with_arrow: New Mod Mail\n\n **FROM**: ${message.author.username}\n\n**MESSAGE**: ${message.content}`
                                    }).then(thread => {
                                        sql.query(`INSERT INTO tickets (ticket, thread_id, creator, created_at, anon) VALUES (${ticket}, ${thread.id}, ${message.author.id}, UNIX_TIMESTAMP()*1000, 0)`, function(err, result) {
                                            if (err) { 
                                                console.error(err);
                                                message.channel.send(":x: I'm sorry but something fell back here. Please try again by hitting the Up Arrow key and hitting Enter!");
                                                thread.delete();
                                            } else {
                                                log("New Ticket Created")
                                                var dateob = new Date();
                                                var embed = new EmbedBuilder()
                                                .setTitle(":envelope: New Ticket Created")
                                                .setDescription(`\n**Your message has just been sent to our staff team!**\n\nPlease note that all of our staff has access to the ticket system so you might recieve responses from multiple people for the most efficient service.\n\nAny replies sent here will be sent to the staff team in the ticket until you or our staff closes the ticket with \`/closeticket\``)
                                                .setFooter({text: `${bot.user.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: bot.user.avatarURL()})
                                                .setColor("#ffa7b9")

                                                message.author.send({embeds: [embed]})
                                            }
                                        });
                                    }) 
                                } else {
                                    if (message.channel.type == 11) {
                                        var dateob = new Date();
                                        var embed = new EmbedBuilder()
                                        .setDescription(message.content)
                                        .setColor(message.guild.members.cache.get(message.author.id).roles.highest.color || "#ffa7b9")
                                        .setFooter({text: `${message.author.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: message.author.avatarURL()});
        
                                        message.guild.members.cache.get(ticketsResult[0].creator).send({embeds: [embed]});
                                    } else {
                                        if (message.content == "/closeticket") {
                                            var dateob = new Date();
                                            var embed = new EmbedBuilder()
                                            .setColor(guild.members.cache.get(message.author.id).roles.highest.color || "#ffa7b9")
                                            .setTitle("Closing Ticket...")
                                            .setDescription("This ticket is now closed by "+message.author.username)
                                            .setFooter({text: `${message.author.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: message.author.avatarURL()})
                                
                                            sql.query(`UPDATE tickets SET closed=1 WHERE ticket=${ticketsResult[0].ticket}`, async function(err, result) {
                                                message.channel.send({embeds: [embed]})
                                                modmail.threads.cache.get(ticketsResult[0].thread_id).send({embeds: [embed]});
                                                modmail.threads.cache.get(ticketsResult[0].thread_id).setLocked(1);
                                                modmail.threads.cache.get(ticketsResult[0].thread_id).edit({name: "Ticket "+ticketsResult[0].ticket+" [Closed]"})
                                                log("A Ticket has Been Closed")
                                            });
                                    
                                        } else {
                                            var dateob = new Date();
                                            var embed = new EmbedBuilder()
                                            .setDescription(message.content)
                                            .setColor(guild.members.cache.get(message.author.id).roles.highest.color || "#ffa7b9");
                                            if (ticketsResult[0].anon) {
                                                embed.setFooter({text: `${crypto.createHash('sha256').update(message.author.id).digest("hex").slice(0, 12).toUpperCase()} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`});
                                            } else {
                                                embed.setFooter({text: `${message.author.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: message.author.avatarURL()})
                                            }
                                            modmail.threads.cache.get(ticketsResult[0].thread_id).send({embeds: [embed]});
                                        }
                                        
                                    }
                                }
                            }
                            
                        })
                    }
                }
            }
           
        }) 
    }
} 
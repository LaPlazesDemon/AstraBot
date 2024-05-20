const moduleName = "Voteban";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder, PermissionsBitField} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;
const bot = require("../bot").bot

var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("voteban")
    .setDescription("Start a vote for banning a user")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .addUserOption(option =>
        option.setName("targetuser")
        .setDescription("Select the user you want to ban")
        .setRequired(true)
    ).addStringOption(option => 
        option.setName("reason")
        .setDescription("What is the reason for calling the vote?")
        .setRequired(true)
    ),
    async execute(interaction) {
        interaction.deferReply();

        var targetuser = interaction.options.getUser("targetuser");
        var votereason = interaction.options.getString("reason");
        var startuser = interaction.user;
        var targetmember = await interaction.guild.members.fetch(targetuser.id);
        var guild = bot.guilds.cache.get(config.guildID);

        if (targetmember.id == interaction.user.id) {
            interaction.editReply({content: ":x: You cannot start a vote on yourself", ephemeral: true});
        } else {

            log("New Ban Vote For "+targetmember.user.username);

            if (targetmember.moderatable && !targetmember.permissions.has(PermissionsBitField.Flags.Administrator)) {
                targetmember.timeout(86400000, `${startuser.username} started a ban vote for ${votereason}`).then(function() {
                    sql.query(`SELECT * FROM godseye._messages WHERE sender=${targetuser.id} ORDER BY sent_at DESC LIMIT 5;`, function(err, messageResult) {
                        var messageStr = ""
                        messageResult.forEach(function(message) {
                            messageStr += `In <#${message.channel_id}>:   ${message.content}\n`;
                        });
    
                        var embed = new EmbedBuilder()
                        .setTitle(`Ban Vote for ${targetmember.user.username}`)
                        .setDescription(`### <@${startuser.id}> Has started a ban vote\n`)
                        .addFields(
                            {name: "User", value: `<@${targetmember.id}>`, inline: true },
                            {name: "Reason", value: votereason, inline: true},
                            {name: "Recent Messages", value: messageStr}
                        ).setColor("Blurple");
                        guild.channels.cache.get(config.channels.staff).send("@everyone");
                        guild.channels.cache.get(config.channels.staff).send({embeds: [embed]})
                        .then(function(message) {
                            sql.query(`INSERT INTO voteban_logs (started_by, target_user, message_id, reason, started_at) VALUES (${startuser.id}, ${targetuser.id}, ${message.id}, ${prepareStr(votereason)}, UNIX_TIMESTAMP()*1000);`, function(err, insertResult) {
                                interaction.editReply({content:":white_check_mark: Vote ban started", ephemeral: true})
                                message.react('✅').then(() => {
                                    message.react('❌').then(() => {
                                        var votefilter = (reaction) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌';
                                        var votecollector = message.createReactionCollector({filter: votefilter,time: 86400000});
                
                                        votecollector.on("collect", reaction => {
                                            if (reaction.emoji.name == "✅" && reaction.count >= config.values.voteBanPassThreshold+1) {
                                                var embed = new EmbedBuilder()
                                                .setTitle(`Ban Vote for ${targetmember.user.username} Completed`)
                                                .setDescription(`<@${targetmember.id}> will be banned for \`${votereason}\``)
                                                .setColor("Green");
        
                                                message.edit({embeds: [embed]});
                                                targetmember.ban({deleteMessagesSeconds: 604800, reason: "Ban vote passed"});
                                                sql.query(`UPDATE voteban_logs SET passed=1, ended=1 WHERE message_id=${message.id}`);
    
                                            } else if (reaction.emoji.name == "❌" && reaction.count >= config.values.voteBanFailThreshold+1) {
                                                var embed = new EmbedBuilder()
                                                .setTitle(`Ban Vote for ${targetmember.user.username} Completed`)
                                                .setDescription(`<@${targetmember.id}> will be NOT be banned for \`${votereason}\``)
                                                .setColor("Red");
        
                                                message.edit({embeds: [embed]});
                                                targetmember.timeout(null, "Ban vote failed");
                                                sql.query(`UPDATE voteban_logs SET passed=0, ended=1 WHERE message_id=${message.id}`);
                                            } 
                                        });
        
                                        votecollector.on("end", collection => {
                                            var embed = new EmbedBuilder()
                                            .setTitle(`Ban Vote for ${targetmember.user.username} Timed-out`)
                                            .setDescription(`Not enough votes were cast after a 24hr period to ban or pardon <@${targetmember.id}> pardon will be applied`)
                                            .setColor("Blurple");
        
                                            message.edit({embeds: [embed]});
                                            sql.query(`UPDATE voteban_logs SET passed=0, ended=1 WHERE message_id=${message.id}`)
    
                                        })
                                    });
                                });
                            });
                        });
                    });
                });
            } else {   
                interaction.editReply({content:":x: User is not moderable, cannot ban/timeout", ephemeral: true});
            }
        }
    },
    startVote: async function(startuser, targetuser, votereason) {
        
        var guild = bot.guilds.cache.get(config.guildID);
        var targetmember = await guild.members.fetch(targetuser.id);
        debug(targetuser);
        log("New Ban Vote For "+targetuser.username);

        targetmember.timeout(86400000, `${startuser.username} started a ban vote for ${votereason}`).then(function() {
            sql.query(`SELECT * FROM godseye._messages WHERE sender=${targetuser.id} ORDER BY sent_at DESC LIMIT 5;`, function(err, messageResult) {
                var messageStr = ""
                messageResult.forEach(function(message) {
                    messageStr += `In <#${message.channel_id}>:  ${message.content}\n`;
                });

                var embed = new EmbedBuilder()
                .setTitle(`Ban Vote for ${targetuser.username}`)
                .setDescription(`### @everyone <@${startuser.id}> Has started a ban vote\n`)
                .addFields(
                    {name: "User", value: `<@${targetuser.id}>`, inline: true },
                    {name: "Reason", value: votereason, inline: true},
                    {name: "Recent Messages", value: messageStr}
                ).setColor("Blurple");
                guild.channels.cache.get(config.channels.staff).send("@everyone");
                guild.channels.cache.get(config.channels.staff).send({embeds: [embed]})
                .then(function(message) {
                    sql.query(`INSERT INTO voteban_logs (started_by, target_user, message_id, reason, automated, started_at) VALUES (${startuser.id}, ${targetuser.id}, ${message.id}, ${prepareStr(votereason)}, 1, UNIX_TIMESTAMP()*1000);`, function(err, insertResult) {
                        interaction.reply({content:":white_check_mark: Vote ban started", ephemeral: true})
                        message.react('✅').then(() => {
                            message.react('❌').then(() => {
                                var votefilter = (reaction) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌';
                                var votecollector = message.createReactionCollector({filter: votefilter,time: 86400000});
        
                                votecollector.on("collect", reaction => {
                                    if (reaction.emoji.name == "✅" && reaction.count >= config.values.voteBanPassThreshold+1) {
                                        var embed = new EmbedBuilder()
                                        .setTitle(`Ban Vote for ${targetmember.user.username} Completed`)
                                        .setDescription(`<@${targetmember.id}> will be banned for \`${votereason}\``)
                                        .setColor("Green");

                                        message.edit({embeds: [embed]});
                                        targetmember.ban({deleteMessagesSeconds: 604800, reason: "Ban vote passed"});
                                        sql.query(`UPDATE voteban_logs SET passed=1, ended=1 WHERE message_id=${message.id}`);

                                    } else if (reaction.emoji.name == "❌" && reaction.count >= config.values.voteBanFailThreshold+1) {
                                        var embed = new EmbedBuilder()
                                        .setTitle(`Ban Vote for ${targetmember.user.username} Completed`)
                                        .setDescription(`<@${targetmember.id}> will be NOT be banned for \`${votereason}\``)
                                        .setColor("Red");

                                        message.edit({embeds: [embed]});
                                        targetmember.timeout(null, "Ban vote failed");
                                        sql.query(`UPDATE voteban_logs SET passed=0, ended=1 WHERE message_id=${message.id}`);
                                    } 
                                });

                                votecollector.on("end", collection => {
                                    var embed = new EmbedBuilder()
                                    .setTitle(`Ban Vote for ${targetmember.user.username} Timed-out`)
                                    .setDescription(`Not enough votes were cast after a 24hr period to ban or pardon <@${targetmember.id}> pardon will be applied`)
                                    .setColor("Blurple");

                                    message.edit({embeds: [embed]});
                                    sql.query(`UPDATE voteban_logs SET passed=0, ended=1 WHERE message_id=${message.id}`)

                                })
                            });
                        });
                    });
                });
            });
        });
    }
} 
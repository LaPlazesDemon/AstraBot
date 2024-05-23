const moduleName = "Reporting";
const moduleInDev = true;

const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Report bad/offensive behavior to the staff")
    .addUserOption(option => 
        option.setName("user")
        .setDescription("Who do you want to report?")
        .setRequired(true)
    ).addStringOption(option => 
        option.setName("reason")
        .setDescription("Why are you reporting this person?")
        .setRequired(true)
    ).setDefaultMemberPermissions(0),
    async execute(interaction) {

        var targetuser = interaction.options.getUser("user");
        var reportreason = interaction.options.getString("reason");

        sql.query(`SELECT * FROM reports WHERE reporter=${interaction.user.id} AND reported=${targetuser.id} AND report_time > (CURRENT_TIMESTAMP-3600);`, function(err, previousReportsResult) {
            if (err) console.error(err);
            else {
                if (previousReportsResult.length) {
                    interaction.reply({content: ":x: You have already reported this user in the last hour.", ephemeral: true});
                } else {
                    sql.query(`INSERT INTO reports (reporter, reported, reason) VALUES (${interaction.user.id}, ${targetuser.id}, ${prepareStr(reportreason)});`, function(err, insertResult) {
                        if (err) console.error(err);
                        else {
                            sql.query(`SELECT * FROM reports WHERE reported=${targetuser.id} AND report_time > (CURRENT_TIMESTAMP-604800);`, function(err, weekReportResult) {
                                var embed = new EmbedBuilder()
                                .setColor("Red")
                                .setTitle(":rotating_light: User was reported :rotating_light:")
                                .addFields(
                                    {name: "Report From", value: `<@${interaction.user.id}>`, inline: true},
                                    {name: "User", value: `<@${targetuser.id}>`, inline: true},
                                    {name: "Reason", value: reportreason, inline: false}
                                ).setThumbnail(targetuser.avatarURL())
                                .setTimestamp();
    
                                interaction.reply({content:":white_check_mark: Report submitted thank you!", ephemeral: true});
                                interaction.guild.channels.cache.get(config.channels.eventlog).send({embeds: [embed]});
                            });
                        }
                    });
                }
            }
        });
    }
} 
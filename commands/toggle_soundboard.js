const moduleName = "Toggle Soundboard";
const moduleInDev = false;

const {SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField} = require('discord.js');
const devMode = require("../bot").devMode;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("togglesoundboard")
    .setDescription("Globally toggle soundboard permissions for all users")
    .setDefaultMemberPermissions(1073741824)
    .addStringOption(option =>
        option.setName("state")
        .setDescription("Enable or Disable the soundboard")
        .setRequired(true)
        .setChoices(
            { name: "Enable", value: "enable" },
            { name: "Disable", value: "disable" }
        )
    ),
    async execute(interaction) {

        log("Changing sounboard to "+interaction.options.getString("state"));
        
        if (interaction.options.getString("state") == "enable") {
            interaction.guild.roles.everyone.setPermissions([
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.CreateInstantInvite,
                PermissionsBitField.Flags.ChangeNickname,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.SendMessagesInThreads,
                PermissionsBitField.Flags.CreatePrivateThreads,
                PermissionsBitField.Flags.CreatePublicThreads,
                PermissionsBitField.Flags.EmbedLinks,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.AddReactions,
                PermissionsBitField.Flags.UseExternalEmojis,
                PermissionsBitField.Flags.UseExternalStickers,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.UseApplicationCommands,
                PermissionsBitField.Flags.SendVoiceMessages,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.Speak,
                PermissionsBitField.Flags.Stream,
                PermissionsBitField.Flags.UseVAD,
                PermissionsBitField.Flags.RequestToSpeak,
                PermissionsBitField.Flags.UseSoundboard,
                PermissionsBitField.Flags.UseEmbeddedActivities
            ])

            interaction.reply({content: `:white_check_mark: Enabling the Soundboard`, ephemeral: true});

        } else {
            interaction.guild.roles.edit(interaction.guild.roles.everyone, 
                interaction.guild.roles.everyone.setPermissions([
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.CreateInstantInvite,
                    PermissionsBitField.Flags.ChangeNickname,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.SendMessagesInThreads,
                    PermissionsBitField.Flags.CreatePrivateThreads,
                    PermissionsBitField.Flags.CreatePublicThreads,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.AttachFiles,
                    PermissionsBitField.Flags.AddReactions,
                    PermissionsBitField.Flags.UseExternalEmojis,
                    PermissionsBitField.Flags.UseExternalStickers,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.UseApplicationCommands,
                    PermissionsBitField.Flags.SendVoiceMessages,
                    PermissionsBitField.Flags.Connect,
                    PermissionsBitField.Flags.Speak,
                    PermissionsBitField.Flags.Stream,
                    PermissionsBitField.Flags.UseVAD,
                    PermissionsBitField.Flags.RequestToSpeak,
                    PermissionFlagsBits.UseEmbeddedActivities
                    
                ])
            );

            interaction.reply({content: `:white_check_mark: Disabling the Soundboard`, ephemeral: true});

        }
    }
} 

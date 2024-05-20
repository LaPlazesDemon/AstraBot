const moduleName = "Event Channel Modifier";
const moduleInDev = false;

const {SlashCommandBuilder} = require('discord.js');
const devMode = require("../bot").devMode;
const config = require("../config.json");
const eventLogger = require("../modules/event_logger");

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("events")
    .setDescription("Toggle visibility of event channels")
    .setDefaultMemberPermissions(8589934592)
    .addStringOption(option => 
        option.setName("category")
        .setRequired(true)
        .setDescription("What event category do you want to modify?")
        .addChoices(
            {name: "Scrims", value: "Scrims"},
            {name: "Esports", value: "Esports"},
            {name: "Movie Night", value: "Movie Night"}
        ))
    .addStringOption(option =>
        option.setName("state")
        .setRequired(true)
        .setDescription("Show or Hide?")
        .addChoices(
            {name: "Show", value: "show"},
            {name: "Hide", value: "hide"}
        )),

    async execute(interaction) {
        
        var eventCat = interaction.options.getString("category");
        var eventState = interaction.options.getString("state");
        var guild = interaction.guild;
        var channels = guild.channels.cache;
        
        if (eventState == "hide") {
            log(`Hiding Channel Category - ${eventCat}`);
            config.events.channels[eventCat].forEach((eventChannelID) => {
                channels.get(eventChannelID)
                .permissionOverwrites.edit(interaction.guild.roles.everyone, 
                    {"ViewChannel": false}
                );
            });


            var channelmembers = []

            config.events.vcs[eventCat].forEach(channel => {
                if (channels.get(channel).members.first()) {
                    channels.get(channel).members.forEach(channelmember => {
                        channelmembers.push(channelmember);
                    });
                }
            });
            
            if (channelmembers[0]) {

                var foundemptychannel = false;

                config.events.waterfalls.forEach((waterfallid => {
                    
                    var waterfallchannel = channels.get(waterfallid);
                    var waterfallchannelmembers = waterfallchannel.members;

                    if (!foundemptychannel) {
                    
                        if (!waterfallchannelmembers.first() /** If there are not any users in the channel */) {

                            channelmembers.forEach((member) => {
                                member.edit({channel: waterfallchannel});
                            })
                            foundemptychannel = true;
                        
                        }
                    }
                }));
            }
            
            await interaction.reply({content: `:white_check_mark: ${eventCat} Events Are Now Hidden`, ephemeral: true});

        } else {
            log(`Showing Channel Category - ${eventCat}`);
            config.events.channels[eventCat].forEach((eventChannelID) => {
                interaction.guild.channels.fetch(eventChannelID).then(function(channel) {
                    channel.permissionOverwrites.edit(interaction.guild.roles.everyone,
                        {"ViewChannel": true}
                    );
                });
                
            });

            await interaction.reply({content: `:white_check_mark: ${eventCat} Events Are Now Visible`, ephemeral: true});
            
            //eventLogger.startLogging(eventcat, interaction);
        }
    }
}

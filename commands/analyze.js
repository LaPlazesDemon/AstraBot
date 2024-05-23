const commandName = "Message Analyzer";

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const config = require("../config.json");
const sql = require("../bot").sql;
const bot = require("../bot").bot;
const axios = require('axios');

var log = function(data) {console.log(`[${commandName}]`, data);};

module.exports = {
    info: {name: commandName, disabled: false},
    data: new SlashCommandBuilder()
    .setName("analyze_my_messages")
    .setDescription("Analyze your message habits"),

    async execute(interaction) {

        interaction.deferReply();

        axios.get("http://10.0.0.32:4300/analyze?userid="+interaction.user.id,)
        .then(response => {

            var postitivity = response.data.positive;
            var negativity = response.data.negative;
            var neutrality = response.data.neutral;
            var positive_messages = response.data.positive_messages;
            var scanned_messages = response.data.scanned_messages;

            var positive_rate = Math.round((positive_messages/scanned_messages)*100);
            var rolecolor = interaction.member.roles.highest.color;
            var dateob = new Date();

            var embed = new EmbedBuilder()
            .setTitle("Sentiment Analysis Results")
            .setAuthor({name: interaction.user.username})
            .setThumbnail(interaction.user.avatarURL())
            .setColor(rolecolor)
            .setDescription(":warning: **This command is just for fun! Do not take this as an actual reflecting of you as a person, you are much more than a collection of messages run through an AI**\n\nNote: Any messages in <#836834539837456436> were not processed. This also only Processes messages that are at least 5 words long.")
            .addFields(
                {name: "Message Count", value: `Of the ${scanned_messages} messages processed, ${positive_messages} were deemed to be positive which means that ${positive_rate}% of your messages were positive!`},
                {name: "Raw Values", value: `Positivity: ${postitivity}\nNegativity: ${negativity}\nNeutrality: ${neutrality}`}
            )
            .setTimestamp()
            .setFooter({text: `${bot.user.username} - ${dateob.getDate()+1}/${dateob.getMonth()+1}/${dateob.getFullYear()}`, iconURL: bot.user.avatarURL()});

            interaction.editReply({embeds: [embed]});
            

        }).catch(err => {
            log(err)
            interaction.editReply("! THERE WAS AN ERROR COMMUNICATING WITH THE SERVICES BACKEND !");
        });
    }
} 
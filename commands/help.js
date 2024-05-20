const moduleName = "Help";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const config = require("../config.json");
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;
const bot = require("../bot").bot;

var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Gives you a nice page about all my capabilities")
    .addStringOption(option =>
        option.setName("subject")
        .setDescription("Help on specific topics")
        .setChoices(
            {name: "Tickets", value: "tickets"}
        )
        .setRequired(false)
    ),
    async execute(interaction) {

        if (!interaction.options.getString(""))
        interaction.guild.members.fetch(interaction.user.id).then((member) => {
            var embed = new EmbedBuilder()
            .setTitle("Botlliope Mori Help Page")
            .setColor("#ffa7b9")
            .setDescription(`
## General User Help Page

**anything inside <> are options, if they have <?> then this means that the option is... well optional, otherwise the command must have this**

\`/count\` - Only usable in <#${config.channels.botspam}> bumps the server's count by 1. [*can we get to 10k?*]\n
\`/setprofile <profile> <options>\` - Usable anywhere and will setup your profile for whichever game you pick. If you follow the prompts then it's a pretty simple process and let's others see how you play various games! *Note: not every option is required but you must set at least one!*\n
\`/getprofile <user> <profile>\` - Usable anywhere and will retrieve someone's profile. Basic is the general server profile and will let you in on a plethora of information\n
\`/addquote <text> <user>\` - Useable anywhere and will add a quote to the <#${config.channels.quotes}> where everyone can see what awful thing the person said! We also have a daily quote that will appear in <#${config.channels.general}>\n
\`/getquote <user?> <number?>\` - Usable anywhere and will get a random quote according to the options given to it. If you give it a user then it will find a quote from that user. If you give it a number then it will get that quote by number. Simple 'eh?\n
\`/nicknames <user>\` - Useable anywhere and will give you a steam profile like history of the user's nicknames here on the server\n
\`/createticket <message> <anon?>\` - Usable anywhere and will create a new ticket for our staff and game managers to review, you can find more information if you do \`/help tickets\`\n
\`/closeticket\` - Only usable in DMs with <@${bot.user.id}> and will close any open tickets you have\n
    `);
    
            if (member.permissions.has(PermissionFlagsBits.KickMembers)) {  
                embed.setDescription(embed.data.description+`
## Moderator Commands
\`/voteban <user> <reason>\` - Usable anywhere, starts a vote ban for the user given in <#${config.channels.eventlog}>. This command will timeout the user immediately to prevent them from speaking or sending any more messages while the vote proceeds\n
\`/togglesoundboard <enable|disable>\` - Toggles the server from using the soundboard *Note: Any roles that superceed the @ everyone role will allow bypass to this so mods can still use the soundboard\n
\`/events <category> <show|hide>\` - Shows or hides the event channels of the category. If you hide then the bot will empty the channels into an empty normal VC if there is an empty one.`)
            }
            
            interaction.user.send({embeds: [embed]});
            interaction.reply({content: "Bot command list send to your DMs", ephemeral: true});
        });
        
    }
} 
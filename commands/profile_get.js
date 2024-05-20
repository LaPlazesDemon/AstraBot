const moduleName = "Get Profile";
const moduleInDev = false;

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const sql = require("../bot").sql;
const config = require("../config.json");
const dayjs = require("dayjs");

var log = function(data) {console.log(`[${moduleName}]`, data);};

var applyBasicEasterEggs = function(embed, UID, targetmember) {
    if (UID == "805193804289277974") //Sarah / PsychoToaster
        embed.setTitle(`:crown: ${targetmember.nickname ?? targetuser.username}'s Server Profile`).addFields({name: "Property of:", value: "<@395612767136251904>\n<@406620856530239491>"});
    if (UID == "406620856530239491") //Unk
        embed.setTitle(`:crown: ${targetmember.nickname ?? targetuser.username}'s Server Profile`).addFields({name: "Property of:", value: "<@395612767136251904>\n<@805193804289277974>"});
    if (UID == "851876926199955538") //Cali the Keeper
        embed.setThumbnail("https://ih1.redbubble.net/image.2350237775.9254/mwo,x1000,ipad_2_snap-pad,750x1000,f8f8f8.jpg").setColor("#FF69B4").addFields({name: "Maidens", value: "None"});
    if (UID == "313362809817923584") //LunaTheFox
        embed.setTitle(`:fox: ${targetmember.nickname ?? targetuser.username}'s Server Profile`)
    if (UID == "411923614649155588") //Xinora
        embed.setColor("#FF69B4").addFields({name: "Maidens", value: "<@851876926199955538>"});
    if (UID == "395612767136251904") // Ghosty
        embed.addFields({name: "Bestie", value: "<@790700788442988544>"});
    if (UID == "790700788442988544") // Thili
        embed.addFields({name: "Bestie", value: "<@395612767136251904>"});
    if (UID == "428394119342063627") // Cheese
        embed.addFields({name: "Religion", value: "Church of Ghostus Christ"});

    return embed;
}

var applyGameEasterEggs = function(embed, UID, targetmember) {
    if (UID == "805193804289277974") //Sarah / PsychoToaster
        embed.setTitle(`:crown: ${targetmember.nickname || targetuser.username}'s ${optgame} Profile`);
    if (UID == "406620856530239491") //Unk
        embed.setTitle(`:crown: ${targetmember.nickname || targetuser.username}'s ${optgame} Profile`);
    if (UID == "851876926199955538") //Cali the Keeper
        embed.setThumbnail("https://ih1.redbubble.net/image.2350237775.9254/mwo,x1000,ipad_2_snap-pad,750x1000,f8f8f8.jpg").setColor("#FF69B4").addField;
    if (UID == "313362809817923584") //LunaTheFox
        embed.setTitle(`:fox: ${targetmember.nickname || targetuser.username}'s ${optgame} Profile`)

    return embed;
}

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("getprofile")
    .setDescription("Display a member's server profile")
    .addUserOption(option => 
        option.setName("user")
        .setRequired(true)
        .setDescription("Target User")
    ).addStringOption(option =>
        option.setName("profile")
        .setRequired(true)
        .setDescription("Which profile do you want to see")
        .addChoices(
            { name: "Basic", value: "basic" },
            { name: "Overwatch", value: "overwatch" },
            { name: "Valorant", value: "valorant" },
            { name: "Fortnite", value: 'fortnite' }
        )
    ),

    async execute(interaction) {
        await interaction.deferReply();
        var targetuser = interaction.options.getUser("user");
        var targetmember = interaction.guild.members.cache.get(targetuser.id);
        var optprofile = interaction.options.getString("profile");
        var optgame = optprofile;

        if (optprofile == "basic") {

            log("Getting Profile Information");

            var UID = targetuser.id
            var userage = "???"
            var usergender = "???"
            var userplaystyle = "???"
            var userjoindate 
            var nicknameembed
            var socials
            var usergames = [];
            var blankspace = { name: '\n\n', value: '\n' };

            var userrolecolor = targetmember.roles.highest.color;
            userjoindate = dayjs(targetmember.joinedAt).format("MMM D, YYYY");
            
            //Gender Check
            Object.keys(config.roles.gender).forEach((friendlyname) => {
                var roleid = config.roles.gender[friendlyname];
                if (targetmember.roles.cache.has(roleid)) {
                    usergender = friendlyname;
                }
            });

            if (usergender == "Trans") {
                if (targetmember.roles.cache.has(config.roles.gender.Female)) usergender += "-woman";
                if (targetmember.roles.cache.has(config.roles.gender.Male)) usergender += "-man";
            }

            //Age Check
            Object.keys(config.roles.age).forEach((friendlyname) => {
                var roleid = config.roles.age[friendlyname];
                if (targetmember.roles.cache.has(roleid)) {
                    userage = friendlyname;
                }
            });

                //Playstyle Check
                Object.keys(config.roles.playstyles).forEach((friendlyname) => {
                var roleid = config.roles.playstyles[friendlyname];
                if (targetmember.roles.cache.has(roleid)) {
                    userplaystyle = friendlyname;
                }
            });

            //Games Check
            Object.keys(config.roles.games).forEach((friendlyname) => {
                var roleid = config.roles.games[friendlyname];
                if (targetmember.roles.cache.has(roleid)) {
                    usergames.push(`\\- ${friendlyname}`);
                }
            });

            var usergamesstr = usergames.join("\n") || "???";

            sql.query(`SELECT DISTINCT nickname, timestamp FROM nickname_history WHERE user=${UID} ORDER BY timestamp DESC LIMIT 5;`, function(err1, nnResult) {

                var nnList = "";
                if (!nnResult.length) {
                    nicknameembed = null
                } else {
                    nnResult.forEach((nnEntry) => {
                        nnList += `\\- ${nnEntry.nickname.replaceAll("'", "")}\n`;
                    });
    
                    nicknameembed = {name: "Recent Nicknames", value: nnList, inline: true}
                }

                sql.query(`SELECT * FROM profile_socials WHERE user=${targetuser.id}`, async function(err2, socialResult) {
                    sql.query(`SELECT * FROM profile_info WHERE user=${targetuser.id}`, async function(err, infoResult) {

                        var socialsstr = "";
                        if (!socialResult.length) {
                            socialstr = "???";
                        } else {
                            if (socialResult[0].battlenet) 
                                socialsstr += `BattleNet \\- ${socialResult[0].battlenet}\n`;
                            if (socialResult[0].twitch)
                                socialsstr += `Twitch.tv \\- ${socialResult[0].twitch}\n`;
                            if (socialResult[0].steam)
                                socialsstr += `Steam \\- ${socialResult[0].steam}\n`;
                            if (socialResult[0].xbox)
                                socialsstr += `Xbox \\- ${socialResult[0].xbox}\n`;
                            if (socialResult[0].epic)
                                socialsstr += `Epic \\- ${socialResult[0].epic}\n`;
                            if (socialResult[0].riot)
                                socialsstr += `Riot \\- ${socialResult[0].riot}\n`;
                        }

                        var days = Math.floor(infoResult[0].vc_time/60/24)
                        var hours = Math.floor(infoResult[0].vc_time/60%24);
                        var minutes = infoResult[0].vc_time%60;
                        if (hours < 10) hours = `0${hours}`;
                        if (minutes < 10) minutes = `0${minutes}`;

                        var vctime = `${days}:${hours}:${minutes}`;
    
                        var embed = new EmbedBuilder()
                        .setColor(userrolecolor)
                        .setAuthor({name: targetuser.username, iconURL: targetuser.avatarURL()})
                        .setThumbnail(targetuser.avatarURL())
                        .setTitle(`${targetmember.nickname ?? targetuser.username}'s Server Profile`)
                        .addFields(
                            { name: "Gender", value: usergender, inline: true},
                            { name: "Age", value: userage, inline: true},
                            { name: "Joined On", value: userjoindate, inline: true},
                            { name: "Messages Sent", value: infoResult[0].messages_sent.toString(), inline: true},
                            { name: "Quotes Made", value: infoResult[0].quotes_made.toString(), inline: true},
                            { name: "Time in VC (day:hour:min)", value: vctime, inline:true},
                            blankspace,
                            { name: "Games", value: usergamesstr, inline: true},
                            { name: "General Playstyle", value: userplaystyle, inline: true},
                            blankspace
                        );
    
                        if (nicknameembed) {embed.addFields(nicknameembed);}
                        if (socials !== undefined) {embed.addFields(socialsstr)}
    
                        embed = applyBasicEasterEggs(embed, UID, targetmember);
                        
                        await interaction.editReply({embeds: [embed]});
                    });
                });
            });

        } else {

            log("Getting Game Information");

            var UID = targetuser.id
            var userrolecolor = targetmember.roles.highest.color;
            var blankspace = { name: '\n\n', value: '\n' };
            sql.query(`SELECT * FROM profile_${optgame} WHERE user=${UID} LIMIT 1;`, function(err, result) {
                sql.query(`SELECT * FROM profile_socials WHERE user=${UID} LIMIT 1;`, async function(err2, socialresult) {

                    var data = result[0];
                    var socialdata = socialresult[0];

                    var embed = new EmbedBuilder()
                    .setColor(config.game_colors[optgame])
                    .setAuthor({name: targetuser.username, iconURL: targetuser.avatarURL()})
                    .setThumbnail(config.game_icons[optgame])
                    .setTitle(`${targetmember.nickname || targetuser.username}'s ${optgame} Profile`);
                        
                    if (!data) {
                        embed.setDescription(`**This user has not yet setup their ${optgame} profile, go bug them to add one using** \`/setprofile ${optgame}\`!`);   
                    
                    } else if (!data) {
                        embed.setDescription(`**This user has not yet setup their ${optgame} profile, go bug them to add one using** \`/setprofile ${optgame}\`!`);   
                    
                    } else if (optgame == "overwatch") {
                        embed.addFields(
                            { name: "Main Role", value: data.mainrole || "???", inline: true },
                            { name: "Rank", value: data.rank || "???", inline: true },
                            { name: "Playstyle", value: data.playstyle || "???", inline: true},
                            blankspace,
                            { name: "Support Main", value: data.supportmain || "???", inline: true },
                            { name: "Damage Main", value: data.damagemain || "???", inline: true },
                            { name: "Tank Main", value: data.tankmain || "???", inline: true },
                            blankspace,
                            { name: "Battle.Net Tag", value: socialdata.battlenet || "???"}
                        )
        
                    } else if (optgame == "valorant") {
                        embed.addFields(
                            { name: "Rank", value: data.rank || "???", inline: true },
                            { name: "Peak Rank", value: data.peakrank || "???", inline: true},
                            { name: "Main Agent", value: data.agent || "???", inline: true },
                            { name: "Playstyle", value: data.playstyle || "???", inline: true},
                            blankspace,
                            { name: "Epic Games", value: socialdata.epic || "???"}
                        )
                    } else if (optgame == "fortnite") {
                        embed.addFields(
                            { name: "Gamemode", value: data.gamemodes || "???", inline: true },
                            { name: "Playstyle", value: data.playstyle || "???", inline: true },
                            { name: "Rank", value: data.rank || "???", inline: true },
                            blankspace,
                            { name: "Gamertag", value: socialdata.epic || "???"}
                        )
                    }
        
                    embed = applyGameEasterEggs(embed, UID, targetmember);
        
                    await interaction.editReply({embeds: [embed]});
                });
            });

            
        }
    }
}
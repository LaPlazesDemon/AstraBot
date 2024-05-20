const moduleName = "Set Profile";
const moduleInDev = false;

const {SlashCommandBuilder} = require('discord.js');
const {giveAchievement} = require("../modules/achievements/main_handler")
const devMode = require("../bot").devMode;
const dayjs = require("dayjs");
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode && moduleInDev) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    data: new SlashCommandBuilder()
    .setName("setprofile")
    .setDescription("Change your profile settings for the server")
    .addSubcommand(subcommand =>
        subcommand.setName("socials")
        .setDescription("Set various friend codes or URLs for all your socials")
        .addStringOption(option =>
            option.setName("twitch")
            .setDescription("Enter your Twitch.tv URL")
            .setRequired(false)
        ).addStringOption(option => 
            option.setName("steam")
            .setDescription("Enter your Steam FRIEND CODE")
            .setRequired(false)
        ).addStringOption(option => 
            option.setName("battlenet")
            .setDescription("Enter your Battle.Net")
            .setRequired(false)
        ).addStringOption(option => 
            option.setName("epic")
            .setDescription("Enter your Epic Games gamertag")
            .setRequired(false)
        ).addStringOption(option => 
            option.setName("xbox")
            .setDescription("Enter your Xbox gamertag")
            .setRequired(false)
        ).addStringOption(option => 
            option.setName("riot")
            .setDescription("Enter your Riot Launcher gamertag")
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName("overwatch")
        .setDescription("set your Overwatch profile")
        .addStringOption(option =>
            option.setName("rank")
            .setDescription("Set your Overwatch rank")
            .addChoices(
                { name: "Bronze", value: "Bronze" },
                { name: "Silver", value: "Silver" },
                { name: "Gold", value: "Gold" },
                { name: "Platinum", value: "Platinum" },
                { name: "Diamond", value: "Diamond" },
                { name: "Master", value: "Master" },
                { name: "Grandmaster", value: "Grandmaster" },
                { name: "Top 500", value: "Top 500" }
            )
            .setRequired(false)
        ).addStringOption(option =>
            option.setName("playstyle")
            .setDescription("Set your Overwatch playstyle")
            .addChoices(
                { name: "Casual", value: "Casual" },
                { name: "Competitive", value: "Competitive" },
                { name: "Arcade/Custom Games", value: "Arcade/Customs" }
            )
            .setRequired(false)
        ).addStringOption(option => 
            option.setName("mainrole")
            .setDescription("Set your Overwatch main role")
            .addChoices(
                { name: "Support", value: "Support" },
                { name: "Damage", value: "Damage" },
                { name: "Tank", value: "Tank" },
                { name: "Flex", value: "Flex" }
            ).setRequired(false)
        ).addStringOption(option =>
            option.setName("supporthero")
            .setDescription("Set your main support hero in Overwatch")
            .addChoices(
                { name: "Ana", value: "Ana" },
                { name: "Baptiste", value: "Baptiste" },
                { name: "Brigitte", value: "Brigitte" },
                { name: "Kiriko", value: "Kiriko" },
                { name: "Lifeweaver", value: "Lifeweaver" },
                { name: "Lucio", value: "Lucio" },
                { name: "Mercy", value: "Mercy" },
                { name: "Moira", value: "Moira" },
                { name: "Zenyatta", value: "Zenyatta" }
            ).setRequired(false)
        ).addStringOption(option => 
            option.setName("tankhero")
            .setDescription("Set your main tank hero in Overwatch")
            .setChoices(
                { name: "D.Va", value: "D.Va" },
                { name: "Doomfist", value: "Doomfist" },
                { name: "Junker Queen", value: "Junker Queen" },
                { name: "Orisa", value: "Orisa" },
                { name: "Ramattra", value: "Ramattra" },
                { name: "Reinhardt", value: "Reinhardt" },
                { name: "Roadhog", value: "Roadhog" },
                { name: "Sigma", value: "Sigma" },
                { name: "Winston", value: "Winston" },
                { name: "Wrecking Ball", value: "Wrecking Ball" },
                { name: "Zarya", value: "Zarya" }
            ).setRequired(false)
        ).addStringOption(option =>
            option.setName("damagehero")
            .setDescription("Set your main DPS hero in Overwatch")
            .addChoices(
                { name: "Ashe", value: "Ashe" },
                { name: "Bastion", value: "Bastion" },
                { name: "Cassidy", value: "Cassidy" },
                { name: "Echo", value: "Echo" },
                { name: "Genji", value: "Genji" },
                { name: "Hanzo", value: "Hanzo" },
                { name: "Junkrat", value: "Junkrat" },
                { name: "Mei", value: "Mei" },
                { name: "Pharah", value: "Pharah" },
                { name: "Reaper", value: "Reaper" },
                { name: "Sojourn", value: "Sojourn" },
                { name: "Soldier: 76", value: "Soldier: 76" },
                { name: "Sombra", value: "Sombra" },
                { name: "Symmetra", value: "Symmetra" },
                { name: "Torbjörn", value: "Torbjörn" },
                { name: "Tracer", value: "Tracer" },
                { name: "Widowmaker", value: "Widowmaker" },
            ).setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName("valorant")
        .setDescription("Set your Valorant profile")
        .addStringOption(option =>
            option.setName("rank")
            .setDescription("Set your current Valorant rank")
            .addChoices(
                { name: "Bronze", value: "Bronze" },
                { name: "Silver", value: "Silver" },
                { name: "Gold", value: "Gold" },
                { name: "Platinum", value: "Platinum" },
                { name: "Diamond", value: "Diamond" },
                { name: "Ascendant", value: "Ascendant" },
                { name: "Immortal", value: "Immortal" },
                { name: "Radiant", value: "Radiant" }
            )
            .setRequired(false)
        ).addStringOption(option =>
            option.setName("peak_rank")
            .setDescription("Set your highest Valorant rank achieved")
            .addChoices(
                { name: "Bronze", value: "Bronze" },
                { name: "Silver", value: "Silver" },
                { name: "Gold", value: "Gold" },
                { name: "Platinum", value: "Platinum" },
                { name: "Diamond", value: "Diamond" },
                { name: "Ascendant", value: "Ascendant" },
                { name: "Immortal", value: "Immortal" },
                { name: "Radiant", value: "Radiant" }
            )
            .setRequired(false)
        ).addStringOption(option =>
            option.setName("playstyle")
            .setDescription("Set your Valorant playstyle")
            .addChoices(
                { name: "Unranked", value: "Unranked" },
                { name: "Competitive", value: "Competitive" }
            )
           .setRequired(false)
        ).addStringOption(option => 
            option.setName("agent")
            .setDescription("Set your Valorant main agent")
            .addChoices(
                { name: "Astra", value: "Astra" },
                { name: "Breach", value: "Breach" },
                { name: "Brimstone", value: "Brimstone" },
                { name: "Chamber", value: "Chamber" },
                { name: "Cypher", value: "Cypher" },
                { name: "Jett", value: "Jett" },
                { name: "Kay/O", value: "Kay/O" },
                { name: "Killjoy", value: "Killjoy" },
                { name: "Neon", value: "Neon" },
                { name: "Omen", value: "Omen" },
                { name: "Phoenix", value: "Phoenix" },
                { name: "Raze", value: "Raze" },
                { name: "Reyna", value: "Reyna" },
                { name: "Sage", value: "Safe" },
                { name: "Skye", value: "Skye" },
                { name: "Sova", value: "Sova" },
                { name: "Viper", value: "Viper" },
                { name: "Yoru", value: "Yoru" }
            ).setRequired(false)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName("fortnite")
        .setDescription("Set your Fortnite profile")
        .addStringOption(option =>
            option.setName("rank")
            .setDescription("Set your Fortnite rank")
            .addChoices(
                { name: "Bronze", value: "Bronze" },
                { name: "Silver", value: "Silver" },
                { name: "Gold", value: "Gold" },
                { name: "Platinum", value: "Platinum" },
                { name: "Diamond", value: "Diamond" },
                { name: "Elite", value: "Elite" },
                { name: "Champion", value: "Champion" },
                { name: "Unreal", value: "Unreal" },
            ).setRequired(false)
        ).addStringOption(option =>
            option.setName("playstyle")
            .setDescription("Set your Fortnite playstyle")
            .addChoices(
                { name: "Casual", value: "Casual" },
                { name: "Competitve", value: "Competitive"}
            ).setRequired(false)
        ).addStringOption(option =>
            option.setName("gamemodes")
            .setDescription("Set which gamemodes you play")
            .addChoices(
                { name: "Build", value: "Build" },
                { name: "No-Build", value: "No-Build" },
                { name: "Both", value: "Both"}
            ).setRequired(false)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName("birthday")
        .setDescription("Tell us your birthday so we can wish you a happy one when it comes!")
        .addIntegerOption(option =>
            option.setName("day")
            .setDescription("Birthday... day?")
            .setMaxValue(31)
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("month")
            .setDescription("Birth month")
            .setChoices(
                { name: "January", value: "1" },
                { name: "Febuary", value: "2" },
                { name: "March", value: "3" },
                { name: "April", value: "4" },
                { name: "May", value: "5" },
                { name: "June", value: "6" },
                { name: "July", value: "7" },
                { name: "August", value: "8" },
                { name: "September", value: "9" },
                { name: "October", value: "10" },
                { name: "November", value: "11" },
                { name: "December", value: "12" }
            ).setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("year")
            .setDescription("Birth year")
            .setMaxValue(dayjs().year())
            .setMinValue(1900)
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("announce_age")
            .setDescription("Would you like the announcements to include how old you have turned? [default is no]")
            .addChoices(
                { name: "No", value: "0" },
                { name: "Yes", value: "1" }
            ).setRequired(true)
        )
    ),
    async execute(interaction) {

        var subcommand = interaction.options.getSubcommand();
        var cmduser = interaction.user;
        var UID = cmduser.id;

        giveAchievement(interaction.user, "setup_profile");

        var get = function(value) {return interaction.options.getString(value);};
        data = {};
        if (subcommand == "overwatch") {
            
            log ("Setting Overwatch Profile");

            if (data.Overwatch == undefined) {data.Overwatch = {}};

            var optsupporthero = get("supporthero");
            var optdamagehero = get("damagehero");
            var optplaystyle = get("playstyle");
            var opttankhero = get("tankhero");
            var optmainrole = get("mainrole");
            var optrank = get("rank");
            
            if (!optmainrole && !optplaystyle && !optrank && !optdamagehero && !optsupporthero && !opttankhero) {
                interaction.reply({ content:`:x: No changes were made. Please fill out at least one field`, ephemeral: true});
            } else {

                sql.query(`SELECT * FROM profile_overwatch WHERE user=${UID};`, function (err, result) {
                    if (err) debug(err);
                    
                    if (result.length == 0) {
                        sql.query(`INSERT INTO profile_overwatch (user, playstyle, supportmain, damagemain, tankmain, mainrole, rank) VALUES (${UID}, "${optplaystyle}", "${optsupporthero}", "${optdamagehero}", "${opttankhero}", "${optmainrole}", "${optrank}");`);
                    } else {
                        result = result[0];
                        optsupporthero = optsupporthero || result.supportmain;
                        optdamagehero = optdamagehero || result.damagemain;
                        optplaystyle = optplaystyle || result.playstyle;
                        opttankhero = opttankhero || result.tankmain;
                        optmainrole = optmainrole || result.mainrole;
                        optrank = optrank || result.rank;

                        sql.query(`DELETE FROM profile_overwatch WHERE user=${UID};`);
                        sql.query(`INSERT INTO profile_overwatch (user, playstyle, supportmain, damagemain, tankmain, mainrole, rank) VALUES (${UID}, "${optplaystyle}", "${optsupporthero}", "${optdamagehero}", "${opttankhero}", "${optmainrole}", "${optrank}");`);
                    }
                });
                
                interaction.reply({ content:`:white_check_mark: Profile saved`, ephemeral: true });
            }
        } else if (subcommand == "valorant") {
            
            log ("Setting Valorant Profile");

            var optplaystyle = get("playstyle");
            var optpeakrank = get("peak_rank");
            var optagent = get("agent");
            var optrank = get("rank");

            if (!optagent && !optpeakrank && !optrank && !optplaystyle) {
                interaction.reply({ content:`:x: No changes were made. Please fill out at least one field`, ephemeral: true});
            } else {

                sql.query(`SELECT * FROM profile_valorant WHERE user=${UID};`, function (err, result) {
                    if (err) debug(err);
                    
                    if (result.length == 0) {
                        sql.query(`INSERT INTO profile_valorant (user, playstyle, peakrank, agent, rank) VALUES (${UID}, "${optplaystyle}", "${optpeakrank}", "${optagent}", "${optrank}");`);
                    } else {
                        result = result[0];
                        optplaystyle = optplaystyle || result.playstyle;
                        optpeakrank = optpeakrank || result.peakrank;
                        optagent = optagent || result.agent;
                        optrank = optrank || result.rank;
                        
                        sql.query(`DELETE FROM profile_valorant WHERE user=${UID};`);
                        sql.query(`INSERT INTO profile_valorant (user, playstyle, peakrank, agent, rank) VALUES (${UID}, "${optplaystyle}", "${optpeakrank}", "${optagent}", "${optrank}");`);                    
                    }
                });


                interaction.reply({ content:`:white_check_mark: Profile saved`, ephemeral: true });
            }
        } else if (subcommand == "socials") {
            
            log("Setting Social Profile");

            if (!data.accounts) {data.accounts = {};}
            
            var optbattlenet = get("battlenet")
            var opttwitch = get("twitch")
            var optsteam = get("steam")
            var optxbox = get("xbox")
            var optepic = get("epic")
            var optriot = get("riot")

            if (!optbattlenet && !opttwitch && !optsteam && !optxbox && !optepic && !optepic) {
                interaction.reply({ content:`:x: No changes were made. Please fill out at least one field`, ephemeral: true});
            } else {

                sql.query(`SELECT * FROM profile_socials WHERE user=${UID};`, function (err, result) {
                    if (err) debug(err);
                    
                    if (result.length == 0) {
                        sql.query(`INSERT INTO profile_socials (user, battlenet, twitch, steam, xbox, epic, riot) VALUES (${UID}, "${optbattlenet}", "${opttwitch}", "${optsteam}", "${optxbox}", "${optepic}", "${optriot}");`);
                    } else {
                        result = result[0];
                        optsupporthero = optsupporthero || result.supportmain;
                        optdamagehero = optdamagehero || result.damagemain;
                        optplaystyle = optplaystyle || result.playstyle;
                        opttankhero = opttankhero || result.tankmain;
                        optmainrole = optmainrole || result.mainrole;
                        optrank = optrank || result.rank;

                        sql.query(`DELETE FROM profile_socials WHERE user=${UID};`);
                        sql.query(`INSERT INTO profile_socials (user, battlenet, twitch, steam, xbox, epic, riot) VALUES (${UID}, "${optbattlenet}", "${opttwitch}", "${optsteam}", "${optxbox}", "${optepic}", "${optriot}");`);
                    }
                });

                interaction.reply({ content:`:white_check_mark: Profile saved`, ephemeral: true });
            }
        } else if (subcommand == "fortnite") {
                        
            log ("Setting Fortnte Profile");

            var optgamemodes = get("gamemodes")
            var optplaystyle = get("playstyle")
            var optrank = get("rank")

            if (!optrank && !optgamemodes && !optplaystyle && !optgamertag) {
                interaction.reply({ content:`:x: No changes were made. Please fill out at least one field`, ephemeral: true});
            } else {
                
                sql.query(`SELECT * FROM profile_fortnite WHERE user=${UID};`, function (err, result) {
                    if (err) debug(err);
                    
                    if (result.length == 0) {
                        sql.query(`INSERT INTO profile_fortnite (user,  gamemodes, playstyle, rank) VALUES (${UID}, "${optgamemodes}", "${optplaystyle}", "${optrank}");`);                    
                    } else {
                        result = result[0];
                        optgamemodes = optgamemodes || result.gamemodes;
                        optplaystyle = optplaystyle || result.playstyle;
                        optrank = optrank || result.rank;
                        
                        sql.query(`DELETE FROM profile_fortnite WHERE user=${UID};`);
                        sql.query(`INSERT INTO profile_fortnite (user,  gamemodes, playstyle, rank) VALUES (${UID}, "${optgamemodes}", "${optplaystyle}", "${optrank}");`);                    
                    }
                });

                interaction.reply({ content:`:white_check_mark: Profile saved`, ephemeral: true });
            }   
        } else if (subcommand == "birthday") {
            log ("Setting Birthday Info");

            var day = interaction.options.getInteger("day");
            var year = interaction.options.getInteger("year");
            var month = get("month");
            var announce_age = function() {if (get("announce_age") == "1") {return 1} else {return 0}}();

            sql.query(`SELECT * FROM profile_birthday WHERE user=${UID};`, function(err, result) {
                if (err) debug(err);
                if (result.length == 0) {
                    sql.query(`INSERT INTO profile_birthday (user, day, month, year, announce_age) VALUES (${UID}, ${day}, "${month}", ${year}, ${announce_age});`);
                } else {
                    result = result[0];
                    sql.query(`DELETE FROM profile_birthday WHERE user=${UID};`);
                    sql.query(`INSERT INTO profile_birthday (user, day, month, year, announce_age) VALUES (${UID}, ${day}, "${month}", ${year}, ${announce_age});`);
                }

                interaction.reply({ content:`:white_check_mark: Birthday saved`, ephemeral: true });

            });
        }
    }
}
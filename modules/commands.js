const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const devMode = require("../bot").devMode;
const token = config.credentials.botToken;
const guildid = config.guildID;
const appid = config.appID;
const {Collection, REST, Routes, Events} = require("discord.js");

module.exports.info = {name: "Command Loader",inDev: false,disable: false};
module.exports.startModule = (bot) => {
    bot.commands = new Collection();

    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.info.disable) {
            console.log(`[Command Loader] Skipping ${command.info.name}, command is disabled`);
        } else if (command.info.inDev && !devMode) {
            console.log(`[Command Loader] Skipping ${command.info.name}, developer mode is disabled`);
        } else if ('data' in command && 'execute' in command) {
            bot.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[Command Loader][WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    const rest = new REST().setToken(token);

    (async () => {
        try {    
            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(appid, guildid),
                { body: commands },
            );
    
            console.log(`[Command Loader] Successfully loaded ${data.length} application commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();


    bot.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
    
        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

}
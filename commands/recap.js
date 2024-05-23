const commandName = "Recap";

const {SlashCommandBuilder} = require('discord.js');
const axios = require("axios");
const config = require("../config.json");
const sql = require("../bot").sql;

var log = function(...data) {console.log(`[${commandName}]`, data);};

module.exports = {
    info: {name: commandName, disabled: false},
    data: new SlashCommandBuilder()
    .setName("recap")
    .setDescription("Recaps the channel activity from today"),
    async execute(interaction) {
        
        if (interaction.channel.id == config.channels.adviceandrants) {
            interaction.reply("I cannot ethically run this command within this channel");
            return;
        }

        interaction.deferReply();
        
        sql.query(`SELECT * FROM overwatch.userMessages WHERE c_id = ? AND m_sent_at > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY) AND m_sender IS NOT 1113307512297492520;`, [interaction.channel.id], function(err, result) {
            if (err) {
                interaction.editReply("There was an error getting the recap, apologies");      
                log(err);
            } else if (!result.length) {
                interaction.editReply("There were no messages found to recap in the last 24 hours");
            } else {
                let messages = result;
                let prompt = `${config.prompts.recap}\n\n`;
                messages.forEach(m => prompt += `"${m['m_sender_name']}" said "${m['m_content']}" at ${m['m_sent_at']}\n`);
            
                axios.post("http://athena.home:11434/api/generate", { 
                    model: "llama3:latest",
                    prompt: prompt,
                    stream: false
                 })
                .then(response => {
                    interaction.editReply("*:warning:Please note that this command uses locally hosted LLMs and can make mistakes. It will be tweaked and refined as time passes but do not take what it says as gospel, more just as a catchup tool. Enjoy!*\nHere is a 24 hour recap!");
                    let paragraphs = response.data.response.split("\n");
                    paragraphs.forEach(async paragraph => 
                        await interaction.channel.send(paragraph)
                    );
                })
                .catch(error => {
                    interaction.editReply("There was an error getting the recap, apologies");     
                    log(error);
                });
            }
        })

        

    }
} 
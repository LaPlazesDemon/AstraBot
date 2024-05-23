const moduleName = "Event Logger";
const moduleInDev = false;

const {EmbedBuilder, Events} = require('discord.js');
const dayjs = require('dayjs');
const config = require("../config.json");
const interval_timer = 1000;
const devMode = require("../bot").devMode;
const sql = require("../bot").sql;

var prepareObj = function(json) {return sql.escape(JSON.stringify(json) || "{}");};
var prepareStr = function(string) {return sql.escape(string || "");};
var debug = function(data) {if (devMode) console.log(`[${moduleName}][Debug]`, data);};
var log = function(data) {console.log(`[${moduleName}]`, data);};

var eventLog = {};

module.exports = {
    info: {name: moduleName, inDev: moduleInDev},
    startModule: (bot) => {
        
        bot.on(Events.GuildScheduledEventUpdate, (oldEvent, newEvent) => {
            
            var guild = newEvent.guild;
            var channels = guild.channels;
            var event = newEvent;
            var EID = event.id;
            
            if (oldEvent.status != 2  && newEvent.status == 2) {

                log(`Event has started`);

                var subbed_users = {};
                var user_times = {};
                var event_category = "";
                var event_channels = [];
                var bad_event = false;
                var event_start_time = dayjs().format("h:mm A ddd D/M/YYYY");

                //Get Event Category

                config.events.names.forEach(function(event_category_name) {
                    if (event.name.indexOf(event_category_name) > -1) {
                        event_category = event_category_name;
                    }
                });


                // Get Channel IDs for the VCs into event_channels

                if (event_category == "") {
                    if (event.channelId) {
                        event_category = "Other";
                        event_channels.push(channels.cache.get(event.channelId));
                    } else {
                        bad_event = true;
                        channels.fetch(config.channels.botalerts).then(channel => {
                            var embed = new EmbedBuilder()
                            .setTitle(":warning: Event Logger :warning:")
                            .setColor("Orange")
                            .setDescription("An event has been started but I couldn't detect which type of event it was and there were no channels attached to it\nLogging is disabled for this event");

                            channel.send({embeds: [embed]});
                        });
                    }
                } else {
                    config.events.vcs[event_category].forEach((channelId) => {
                        event_channels.push(channels.cache.get(channelId));
                    });
                }


                // Get Interested Users

                if (!bad_event) {
                    event.fetchSubscribers().then((subbed_users_collection) => {
                        subbed_users_collection.forEach((user, userid) => {
                            subbed_users[userid] = user;
                            user_times[userid] = 0;
                        });
    
                        // Set the global event logs
    
                        eventLog[EID] = {
                            subbed_users: subbed_users,
                            category: event_category,
                            user_times: user_times,
                            user_logs: {},
                            start_time: event_start_time,
                            channels: event_channels,
                            interval: null,
                            host: event.creator,
                            no_show_users: []
                        }
    
    
                        // Start the Logging Interval
    
                        eventLog[EID].interval = setInterval((event) => {
                            eventLog[event.id].channels.forEach(channel => {
                                channel.members.forEach(member => {
                                    if (!member.user.bot) {
                                        eventLog[EID].user_logs[member.id] = member;
                                        if (!eventLog[EID].user_times[member.id]) {
                                            eventLog[EID].user_times[member.id] = 1;
                                        } else {
                                            eventLog[EID].user_times[member.id] += 1;
                                        }
                                    }
                                });
                            });
                            
                        }, interval_timer, event);
                    });
                } else {
                    eventLog[EID] = {bad_event: true};
                }

            } else if (newEvent.status == 3) {
                
                // Event has ended

                log(`Event has ended`);

                if (!eventLog[EID]) {
                    var embed = new EmbedBuilder()
                    .setTitle(":warning: Event Logger :warning:")
                    .setColor("Orange")
                    .setDescription("An event has ended but was not logged, logging data is not available for this event");
                    channels.cache.get(config.channels.botalerts).send({embeds: [embed]});
                } else if (eventLog[EID].bad_event) {
                  return;  
                } else { 
                    
                    var elog = eventLog[EID];

                    //Stop the Logging Interval
                    clearInterval(elog.interval);

                    // Interested Users String (For Database Only)
                    var EventSubbedUsers = Object.keys(elog.subbed_users).join(",");

                    // User Times & No Shows
                    var EventUserTimes = "";
                    var EventNoShowsString = "";
                    var EventNoShowsArray = [];
                    for (let uid in elog.user_times) {
                        var time = elog.user_times[uid];
                        if (!time) { // No show users
                            EventNoShowsString += `\\- <@${uid}>\n`;
                            EventNoShowsArray.push(uid);
                            continue;
                        }
                        var hours = Math.floor(time/60);
                        var minutes = time%60;
                        if (minutes < 10) minutes = `0${minutes}`;

                        EventUserTimes += `${hours}:${minutes} | <@${uid}>\n`;
                    }

                    // Create Event Log Embed
                    var embed = new EmbedBuilder()
                    .setTitle(`Event Log for ${event.name}`)
                    .setColor("Green")
                    .addFields(
                        {name: "Description", value: event.description || "*no description given*"},
                        {name: "Category", value: elog.category || "Other", inline: true},
                        {name: "Host", value: `<@${elog.host.id}>`, inline: true},
                        {name: "Started At", value: elog.start_time, inline: false},
                        {name: "Ended At", value: dayjs().format("h:mm A ddd D/M/YYYY"), inline: false},
                        {name: "User Times", value: EventUserTimes || "No User Times Detected", inline: true},
                    )
                    .setTimestamp();

                    if (EventNoShowsString != "") {embed.addFields({name: "No Shows", value: EventNoShowsString, inline: true});}

                    channels.fetch(config.channels.botalerts).then(channel => {
                        channel.send({embeds: [embed]});

                        sql.query(`INSERT INTO events (id, host, category, title, description, interested, absent, usertimes, started, ended) VALUES (${event.id}, ${event.creator.id}, "${elog.category}", ${prepareStr(event.name)}, ${prepareStr(event.description)}, "${EventSubbedUsers}", "${EventNoShowsArray.join(",") || ""}", '${JSON.stringify(elog.user_times)}', "${elog.start_time}", "${dayjs().format("h:mm A ddd D/M/YYYY")}")`, function(err, result) {
                            if (err) console.error(err);
                        });

                        // sql.query(`UPDATE profile_info SET events_joined = events_joined + 1 WHERE user=`)
                    });


                }
            }
        });
    }
} 
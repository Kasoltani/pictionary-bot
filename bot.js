const Discord = require('discord.js');
const Game = require('./Game.js');
require('dotenv').config();

const client = new Discord.Client();
const prefix = '!';

var games = new Map();

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if(games.has(msg.channel.id)){
        let game = games.get(msg.channel.id);
        let players = [];
        game.players.forEach(player => {
            players.push(player.id);
        });
        if(!players.includes(msg.author.id)) return;
        if(msg.content == game.word){
            game.addScore(msg.author.id);
            game.endRound();
        } 
    }

    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    if(command === 'start'){
        const startMsg = await msg.channel.send('React with a ☑ to join the game then react with 🖌 to start the game');
        startMsg.react('☑').then(()=> startMsg.react('🖌'));
    }

    if(command === 'end'){
        if(games.has(msg.channel.id)){
            games.get(msg.channel.id);
            game.end();
            return games.delete(msg.channel.id);
        }
    }

});

client.on('messageReactionAdd', (reaction, user) => {
    let msg = reaction.message;
    let id = reaction.message.channel.id;
    let emote = reaction.emoji;
    let u = user.id;
    
    if(u == '771953142777511936') return;

    if(emote.name == '☑'){
        if(!games.has(id)){
            let game = new Game(id, client);
            games.set(id, game);
            if(!game.players.includes(u)) game.addPlayer(u);
        }else{
            let game = games.get(id);
            if(!game.players.includes(u)) game.addPlayer(u);
        }
    }
    if(emote.name == '🖌'){
        if(!games.has(id)){
            return msg.edit('No players');
        }else{
            let game = games.get(id);
            if(game.started == false){
                game.start(msg);
                return msg.edit('Game starting...');
            }
        }
    }
 
});
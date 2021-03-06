const Discord = require('discord.js');
const randomstring = require('randomstring');
const request = require('request');
const Canvas = require('canvas');

const words = ['mattress', 'moon', 'door', 'coin', 'bunk bed', 'bridge', 'bowl', 'seashell', 'lemon', 'grass', 'triangle', 'bug', 'blanket', 'rain', 'ear', 'ship', 'airplane', 'nail', 'rock', 'key', 'bike', 'tree', 'caterpillar', 'lamp', 'hat', 'butterfly', 'monster', 'zigzag', 'book', 'lizard', 'drum', 'star', 'boy', 'bear', 'face', 'oval', 'chimney', 'rainbow', 'balloon', 'house', 'helicopter', 'ants', 'orange', 'cube', 'bounce', 'bumblebee', 'sheep', 'leg', 'chair', 'light', 'knee', 'turtle', 'duck', 'cookie', 'mitten', 'snowman', 'plant', 'arm', 'glasses', 'cup', 'box', 'love', 'popsicle', 'hippo', 'elephant', 'bee', 'river', 'snail', 'giraffe', 'hand', 'pig', 'daisy', 'cow', 'cherry', 'boat', 'hair', 'family', 'frog', 'snake', 'grapes', 'hamburger', 'cheese', 'jar', 'pencil', 'spider', 'lips', 'fish', 'crab', 'baby', 'baseball', 'branch', 'computer', 'lollipop', 'Earth', 'jellyfish', 'rocket', 'button', 'night', 'flower', 'swimming pool', 'blocks', 'spider web', 'island', 'crack', 'fork', 'banana', 'mouth', 'jacket', 'bird', 'fire', 'cat', 'camera', 'float', 'girl', 'shirt', 'worm', 'cloud', 'kite', 'person', 'suitcase', 'corn', 'lion', 'hook', 'coat', 'milk', 'square', 'table', 'horse', 'spoon', 'angel', 'basketball', 'pizza', 'carrot', 'stairs', 'mouse', 'feet', 'smile', 'broom', 'purse', 'clock', 'ears', 'pen', 'ice cream cone', 'owl', 'shoe', 'bat', 'head', 'socks', 'man', 'zoo', 'apple', 'zebra', 'ring', 'feather', 'leaf', 'bracelet', 'football', 'tail', 'alligator', 'octopus', 'pie', 'pillow', 'flag', 'candle', 'circle', 'shampoo', 'glass', 'wreck', 'twig', 'banana peel', 'kitchen', 'toilet paper', 'class', 'skunk', 'battery', 'saddle', 'gift', 'chip', 'cheetah', 'net', 'wall', 'sleeping bag', 'french fries', 'sprinkler', 'empty', 'back', 'homeless', 'sock', 'package', 'base', 'violin', 'drink', 'globe', 'tusk', 'hoof', 'kiss', 'elevator', 'earmuffs', 'powder', 'seed', 'king', 'compass', 'grandma', 'belt', 'aunt', 'plate', 'coconut', 'dustpan', 'peach', 'tooth', 'hula hoop', 'pirate', 'college', 'pool', 'radish', 'needle', 'bagpipe', 'bucket', 'food', 'pine tree', 'smoke', 'shape', 'seesaw', 'quarter', 'campfire', 'curb', 'artist', 'rainstorm', 'stork', 'spaceship', 'whisk', 'potato', 'tricycle', 'tent', 'dinner', 'swim', 'stocking', 'tub', 'rose', 'pear', 'salt and pepper', 'anvil', 'rake', 'cover', 'stick', 'oar', 'ferry', 'cast', 'frame', 'yarn', 'corn dog', 'cape', 'enter', 'floor', 'flashlight', 'cannon', 'screwdriver', 'chameleon', 'hiss', 'merry-go-round', 'spool', 'detective', 'teacher', 'cougar', 'flood', 'hurricane', 'trunk', 'zookeeper', 'cowboy', 'leak', 'bell pepper', 'stingray', 'hippopotamus', 'brain', 'wooly mammoth', 'pancake', 'snowflake', 'fire hydrant', 'bottle', 'crib', 'vase', 'monkey', 'donkey', 'sword', 'juice', 'banjo', 'beehive', 'pitchfork', 'drums', 'start', 'chest', 'pipe', 'cracker', 'hero'];

module.exports = class Game {
    constructor(id, client){
        this.client = client;
        this.id = id;
        this.channel;
        this.word;
        this.roundNumber = 1;
        this.roundEnd;
        this.players = [];
        this.currentPlayer;
        this.started = false;
        this.code;
        this.prevMsg;
        this.lines = {};
        this.placeholder = '';
        this.gameEnd = false;
    }

    addPlayer(player){
        this.players.push({
            user: player,
            score: 0
        });
    }

    getPlayers(){
        let playerList = [];
        this.players.forEach(p => {
            playerList.push(p.user.id);
        });
        return playerList;
    }

    addScore(player){
        this.players.forEach(p => {
            if(p.user.id == player) p.score++;
        });
    }

    start(msg){
        this.channel = msg.channel;
        this.started = true;
        this.round();
        
    }

    round(){
        this.roundEnd = false;
        this.word = words[Math.floor(Math.random()*words.length)];
    
        this.code = randomstring.generate(12);

        this.currentPlayer = this.players[0].user;
        this.currentPlayer.send(`Use this link to draw: https://pictionarybot.xyz/${this.code}\nWord: **${this.word}**`);

        this.addLink(async (err) => {
            if(err) return console.log(err);
            for(let i = 0; i < this.word.length; i++){
                if(this.word.charAt(i) == ' '){
                    this.placeholder+=' ';
                }else{
                    this.placeholder+='- ';
                }
            }

            let embed = new Discord.MessageEmbed()
                .setTitle(`Round ${this.roundNumber}`)
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setDescription(`Word: ${this.placeholder}`)
                .addField('\u200b', `${this.currentPlayer.displayName} is currently drawing`)
                .attachFiles(`./blank.png`)
                .setImage(`attachment://blank.png`)
            
            this.prevMsg = await this.channel.send({embed});
            this.updateImage();

            setTimeout( async ()=>{
                if(this.roundEnd == false){
                    await this.prevMsg.delete();
                    this.prevMsg = await this.channel.send('Time is up');
                    setTimeout(()=>{
                        this.endRound();
                    }, 2000);
                }
            }, 100000);
            
        });

    }

    addLink(cb){
        request.post({
            url: `https://pictionarybot.xyz/add`,
            json: {'link': this.code}
        }, (err, res) => {
            if(err) return console.log(err);
            return cb(null);
        });
    }

    updateImage(){
        if(this.roundEnd == true) return;
        request.post({
            url: 'https://pictionarybot.xyz/update',
            json: {'link': this.code}
        }, async (err, res) => {
            if(err) return console.log(err);
            if(res.body == 'Empty'){
                setTimeout(()=>{
                    this.updateImage();
                }, 2000);
            }else{
                if(JSON.stringify(res.body) != JSON.stringify(this.lines)){
                    this.lines = res.body;
                    const canvas = Canvas.createCanvas(500,500);
                    const ctx = canvas.getContext('2d');
                    const background = await Canvas.loadImage('./blank.png');
                    ctx.drawImage(background, 0, 0, 500, 500);
                    ctx.lineCap = "round";
                    this.lines.forEach(line => {
                        ctx.lineWidth = line.strokeweight;
                        ctx.strokeStyle = line.color;
                        ctx.beginPath();
                        ctx.lineTo(line.x, line.y);
                        ctx.lineTo(line.px, line.py);
                        ctx.stroke();
                    });
                    
                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `${this.code}.png`);
                    let embed = new Discord.MessageEmbed()
                        .setTitle(`Round ${this.roundNumber}`)
                        .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                        .setDescription(`Word: ${this.placeholder}`)
                        .addField('\u200b', `${this.currentPlayer.displayName} is currently drawing`)
                        .attachFiles(attachment)
                        .setImage(`attachment://${this.code}.png`)

                    await this.prevMsg.delete();
                    this.prevMsg = await this.channel.send({embed});
                    setTimeout(()=>{
                        return this.updateImage();
                    }, 2000);
                }else{
                    setTimeout(()=>{
                        return this.updateImage();
                    }, 2000);
                }
            }
       });
    }

    endRound(){
        request.post({
            url: 'https://pictionarybot.xyz/remove',
            json: {link: this.link}
        }, async (err) => {
            if(err) return console.log(err);
            this.roundEnd = true;
            let embed = new Discord.MessageEmbed()
                .setTitle(`Round ${this.roundNumber} ended. The word was ${this.word}`)
                .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                .setDescription(`Scoreboard:`)
                
            this.players.forEach(player => {
                embed.addField('\u200b', `${player.user.displayName}: ${player.score}`);
            });
            
            await this.prevMsg.delete();
            this.prevMsg = await this.channel.send({embed});
            
            this.players.push(this.players.shift());
            this.roundNumber++;

            if(this.roundNumber > this.players.length){
                this.endGame();
            }else{
                this.lines = {};
                this.placeholder = '';
                setTimeout(()=>{
                    this.round();
                }, 3000);
            }
        });        
    }

    endGame(){
        this.roundEnd = true;
        this.gameEnd = true;
        request.post({
            url: 'https://pictionarybot.xyz/remove',
            json: {link: this.link}
        }, async (err) => {
            if(err) console.log(err);
            let embed = new Discord.MessageEmbed()
            .setTitle(`Final Scoreboard`)
            .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
            
            this.players.forEach(player => {
                embed.addField('\u200b', `${player.user.displayName}: ${player.score}`);
            });
            
            await this.channel.send({embed});
        });
    }
}
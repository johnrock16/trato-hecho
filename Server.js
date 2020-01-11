const express= require('express');
const path=require('path');
const bodyParser=require('body-parser');

const app= express();
const server=require('http').createServer(app);
const io=require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));
app.set('views', path.join(__dirname,'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine','html');

require('./app/controllers/index')(app);

// app.use('/',(req,res)=>{
//     res.render('index.html');
// });


let messages=[];
let players=[];

let turn=0;
let round=0;

let CartasTotal=JSON.parse('{"property":{"groups":{"blue":{"groupQuantity":"2"},"green":{"groupQuantity":"3"},"pink":{"groupQuantity":"5"}},"cards":[{"name":"Efraim industrías","value":5,"type":"property","color":"blue","isJoker":false},{"name":"Balbino industrías","value":5,"type":"property","color":"blue","isJoker":false},{"name":"Zingaro industrías","value":4,"type":"property","color":"green","isJoker":false},{"name":"Vinicius industrías","value":4,"type":"property","color":"green","isJoker":false},{"name":"Poucas industrías","value":4,"type":"property","color":"green","isJoker":false},{"name":"Coreia company","value":5,"type":"property","color":"pink","isJoker":false},{"name":"Sauva construtora de praças","value":5,"type":"property","color":"pink","isJoker":false},{"name":"O Rapaz editora","value":5,"type":"property","color":"pink","isJoker":false},{"name":"Marlboro Cigarros","value":5,"type":"property","color":"pink","isJoker":false}]},"action":[{"name":"Passe Livre","value":1,"type":"Pass GO","desc":"Você pode pegar mais 2 cartas","quantity":10},{"name":"Meu Aniversário","value":2,"type":"My BDAY","desc":"Todos devem pagar 2M para você","quantity":3},{"name":"Golpe Baixo","value":5,"type":"Deal Breaker","desc":"Pega um conjunto de seu adversario","quantity":2},{"name":"Negociação Forçada","value":3,"type":"Forced Deal","desc":"Você troca uma propriedade por outra","quantity":3},{"name":"Negociação Ligeira","value":3,"type":"Sly Deal","desc":"Você pega uma propriedade de alguem","quantity":3},{"name":"Diga não","value":4,"type":"Just Say No","desc":"Nega a carta de ação de alguem","quantity":3},{"name":"Cobrança de dividas","value":3,"type":"Debt Collectors","desc":"Cobra 5M de alguem","quantity":3},{"name":"Dobro de aluguel","value":2,"type":"Double Rent","desc":"Duplica seu aluguel cobrado","quantity":2},{"name":"Casa","value":3,"type":"House","desc":"Aumenta o valor do aluguel do conjunto em 3M","quantity":3},{"name":"Hotel","value":4,"type":"Hotel","desc":"Aumenta o valor do aluguel do conjunto em 4M","quantity":2},{"name":"Aluguel","value":2,"type":"Rent","desc":"Cobra o aluguel de todos","quantity":13}],"money":[{"name":"1M","value":1,"quantity":6},{"name":"2M","value":2,"quantity":5},{"name":"3M","value":3,"quantity":3},{"name":"4M","value":4,"quantity":3},{"name":"5M","value":5,"quantity":2},{"name":"10M","value":10,"quantity":1}]}');
let cartasRetiradas=[];
let cartasNaMesa=[];

//acabou de se conectar
io.on('connection',socket=>{

    socket.on('sendMessage', data=>{
        messages.push(data);
        socket.broadcast.emit('receivedMessage',data);
    });

    socket.on('roundsEnd',playerRound=>{
        if(playerRound==round){
            round+=1;
            if(round>=players.length){
                round=0;
            }
            console.log("trocamos pro "+round);
            socket.broadcast.emit('nextRound',round);
        }
    });

    socket.on('throwCard',card=>{
        cartasNaMesa.push(card);
        console.log("throw card");
        socket.broadcast.emit('updateLastCard',card.name);
    });

    socket.on('newPlayerAuthenticate',user=>{
        var playerObj={'id':socket.id,'userName':user.userName, 'userId': user.userId, 'token':user.token,'cards':[
            {
                'name':'Carta 1',
                'value':2,
                'type':'Carta normal',
                'desc':'é apenas uma carta normal',
                'quantity':2
            },
            {
                'name':'Carta 2',
                'value':3,
                'type':'Carta não normal',
                'desc':'É apenas uma carta não normal',
                'quantity':3
            },      
            {
                'name':'Carta 3',
                'value':4,
                'type':'Carta rara',
                'desc':'É apenas uma carta rara',
                'quantity':2
            }]};
        players.push(playerObj);
    
        var roundPlayer={'playerRound':players.length-1,'actualRound':round,'playerObj':playerObj};
    
        socket.emit('initialRound',roundPlayer);
        socket.emit('previousMessages',messages);
        socket.emit('previousPlayers',players);
        socket.broadcast.emit('newPlayer',playerObj);
        socket.on('sessionExpired',userName=>{
            console.log('sessao expirou');
            socket.broadcast.emit('removePlayer',userName);
        });
    });

});

server.listen(3000);


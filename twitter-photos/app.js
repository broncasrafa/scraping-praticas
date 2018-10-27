var app = require('./config/server');

var porta = process.env.PORTA || 3000;

app.listen(porta, () => {
    console.log('Servidor online na porta ' + porta + ' - link: http://localhost:' + porta);
})
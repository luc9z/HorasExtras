const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const port = 3001;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const serialPort = new SerialPort({
    path: 'COM3', // Substitua pelo número da porta correto
    baudRate: 9600
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Variável para armazenar os dados mais recentes
let recentData = [];

// Evento para quando a porta serial é aberta
serialPort.on('open', () => {
    console.log('Porta serial aberta');
});

// Evento para ler dados do Arduino e emitir via socket.io com timestamp
parser.on('data', (data) => {
    console.log("Dados brutos recebidos do Arduino:", data);

    const cleanData = data.trim();
    if (!isNaN(cleanData) && cleanData !== '') {
        const date = new Date();
        const formattedTimestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        const formattedData = {
            value: parseFloat(cleanData),
            timestamp: formattedTimestamp
        };

        // Armazena os dados mais recentes (mantém até 10 entradas)
        recentData.push(formattedData);
        if (recentData.length > 10) {
            recentData.shift(); // Remove o mais antigo
        }

        console.log(`Valor de TDS formatado: ${formattedData.value} ppm | Data e Hora: ${formattedData.timestamp}`);
        io.emit("newTdsValue", formattedData);
    } else {
        console.log(`Dado inválido recebido em ${new Date().toLocaleString()}, ignorado.`);
    }
});

// Middleware para JSON
app.use(express.json());

// Rota para retornar os dados recentes
app.get('/api/dados-agua', (req, res) => {
    if (recentData.length > 0) {
        console.log('Enviando dados recentes para o cliente:', recentData);
        res.json(recentData);
    } else {
        console.log('Nenhum dado disponível para enviar');
        res.status(404).json({ message: "Nenhum dado disponível" });
    }
});

// Inicia o servidor
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Envio de dados de teste para o frontend a cada 5 segundos
setInterval(() => {
    const testValue = {
        value: Math.random() * 100, // Simula um valor aleatório para teste
        timestamp: new Date().toLocaleString()
    };
    console.log('Enviando dado de teste:', testValue);
    io.emit("newTdsValue", testValue);
}, 5000); // Envia a cada 5 segundos

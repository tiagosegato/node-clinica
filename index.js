const express = require('express');
const jwt = require('jsonwebtoken');
const { Paciente } = require('./models');

const app = express();
const port = 3000;

const JWT_SECRET = 'minha-chave-secreta-para-a-clinica';

app.use(express.json());

// --- ROTAS PÚBLICAS ---
app.get('/', (req, res) => {
    res.send('Bem-vindo à API da Clínica Médica!');
});

app.post('/pacientes', async (req, res) => {
    try {
        const novoPaciente = await Paciente.create(req.body);
        res.status(201).json(novoPaciente);
    } catch (error) {
        res.status(400).json({ mensagem: 'Erro ao cadastrar paciente.', erro: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const paciente = await Paciente.findOne({ where: { usuario } });

        if (!paciente || paciente.senha !== senha) {
            return res.status(401).json({ mensagem: 'Usuário ou senha inválidos.' });
        }

        const token = jwt.sign({ id: paciente.id, usuario: paciente.usuario }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ mensagem: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
function verificaJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ mensagem: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
        req.pacienteId = decoded.id;
        next();
    });
}

// --- ROTAS PRIVADAS ---
app.get('/pacientes', verificaJWT, async (req, res) => {
    const pacientes = await Paciente.findAll();
    res.json(pacientes);
});

app.get('/pacientes/:id', verificaJWT, async (req, res) => {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    res.json(paciente);
});

app.put('/pacientes/:id', verificaJWT, async (req, res) => {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    await paciente.update(req.body);
    res.json(paciente);
});

app.delete('/pacientes/:id', verificaJWT, async (req, res) => {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    await paciente.destroy();
    res.status(204).send();
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor da clínica rodando na porta ${port}`);
});


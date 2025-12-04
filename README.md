# Projeto Final: API Clínica Médica

## Persistência no Banco de Dados e Autenticação

Este projeto consolida os principais conceitos aprendidos durante o curso. Nosso objetivo é construir uma API RESTful do zero, unindo a persistência de dados com **Sequelize** e a segurança de rotas com **JSON Web Token (JWT)**. Ao final, teremos um serviço seguro para gerenciar pacientes, onde cada paciente também é um usuário do sistema.

## Tecnologias Utilizadas

*   **Node.js**: Ambiente de execução JavaScript no servidor.
*   **Express**: Framework para construção da API e gerenciamento de rotas.
*   **Sequelize**: ORM (Object-Relational Mapper) para interagir com o banco de dados.
*   **PostgreSQL**: Banco de dados relacional que usaremos para persistir os dados.
*   **JSON Web Token (JWT)**: Padrão para criar tokens de acesso que afirmam algumas declarações.

## Pré-requisitos

Antes de começar, garanta que você tenha instalado em sua máquina:
*   [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
*   NPM (geralmente instalado com o Node.js)
*   Um cliente de banco de dados, como o DBeaver ou pgAdmin.
*   Uma instância do [PostgreSQL](https://www.postgresql.org/download/) rodando localmente.

---

## Passo a Passo da Implementação

Siga as etapas abaixo para construir o projeto do início ao fim.

### Passo 1: Criação e Configuração do Projeto

Vamos começar criando a estrutura base do nosso projeto.

1.  Abra seu terminal, crie uma pasta para o projeto e navegue até ela:
    ```bash
    mkdir node-clinica
    cd node-clinica
    ```

2.  Inicie um novo projeto Node.js:
    ```bash
    npm init -y
    ```

3.  Instale as dependências principais do projeto:
    ```bash
    npm install express sequelize pg pg-hstore jsonwebtoken
    ```

4.  Instale a CLI do Sequelize como uma dependência de desenvolvimento:
    ```bash
    npm install --save-dev sequelize-cli
    ```

### Passo 2: Configurando o Sequelize

Agora, vamos gerar os arquivos de configuração do Sequelize para que ele saiba como se conectar ao nosso banco de dados.

1.  Execute o comando `init` do Sequelize:
    ```bash
    npx sequelize-cli init
    ```
    Este comando criará as pastas `config`, `models` e `migrations`.

2.  Abra o arquivo `config/config.json` e edite a seção `development` com as credenciais do seu banco de dados PostgreSQL:
    ```json
    // config/config.json
    {
      "development": {
        "username": "seu_usuario_postgres",
        "password": "sua_senha_postgres",
        "database": "clinica",
        "host": "localhost",
        "dialect": "postgres"
      }
    }
    ```

### Passo 3: Criando o Banco de Dados

O Sequelize gerencia as tabelas, mas não cria o banco de dados. Precisamos fazer isso manualmente.

1.  Abra seu cliente de banco de dados (DBeaver, pgAdmin) ou o terminal `psql`.

2.  Execute o seguinte comando SQL para criar o banco:
    ```sql
    CREATE DATABASE clinica_db;
    ```

### Passo 4: Criando o Model e a Migration

Com a configuração pronta, vamos definir a estrutura da nossa tabela de pacientes usando a CLI do Sequelize.

1.  Execute o comando abaixo para gerar o arquivo do Model `Paciente` e seu respectivo arquivo de Migration:
    ```bash
    npx sequelize-cli model:generate --name Paciente --attributes nome:string,idade:integer,sexo:string,usuario:string,senha:string
    ```

2.  Agora, aplique essa migration para criar a tabela `Pacientes` no seu banco de dados:
    ```bash
    npx sequelize-cli db:migrate
    ```
    Se você inspecionar seu banco `clinica`, verá que a tabela foi criada com sucesso!

### Passo 5: Construindo o Servidor (`index.js`)

É hora de escrever o código da nossa API! Crie um arquivo `index.js` na raiz do seu projeto e adicione o código conforme as seções abaixo.

1.  **Estrutura Inicial e Importações:**
    ```javascript
    const express = require('express');
    const jwt = require('jsonwebtoken');
    const { Paciente } = require('./models');

    const app = express();
    const port = 3000;
    const JWT_SECRET = 'minha-chave-secreta-para-a-clinica';

    app.use(express.json());
    ```

2.  **Rotas Públicas (Cadastro e Login):**
    ```javascript
    // Rota para cadastrar um novo paciente (pública)
    app.post('/pacientes', async (req, res) => { /* ... adicione a lógica aqui ... */ });

    // Rota de login para gerar o token (pública)
    app.post('/login', async (req, res) => { /* ... adicione a lógica aqui ... */ });
    ```

3.  **Middleware de Autenticação:**
    ```javascript
    // Middleware que verifica o token JWT em rotas protegidas
    function verificaJWT(req, res, next) { /* ... adicione a lógica aqui ... */ }
    ```

4.  **Rotas Privadas (CRUD de Pacientes):**
    ```javascript
    // Aplique o middleware `verificaJWT` nas rotas que precisam de proteção
    app.get('/pacientes', verificaJWT, async (req, res) => { /* ... */ });
    app.get('/pacientes/:id', verificaJWT, async (req, res) => { /* ... */ });
    app.put('/pacientes/:id', verificaJWT, async (req, res) => { /* ... */ });
    app.delete('/pacientes/:id', verificaJWT, async (req, res) => { /* ... */ });
    ```

5.  **Inicialização do Servidor:**
    ```javascript
    app.listen(port, () => {
      console.log(`Servidor da clínica rodando em http://localhost:${port}`);
    });
    ```

### Passo 6: Como Testar sua API

Use o Postman ou o Thunder Client para testar o fluxo completo.

1.  **Inicie seu servidor:**
    ```bash
    node index.js
    ```

2.  **Cadastre um Paciente (Rota Pública):**
    *   **POST** `/pacientes`
    *   Corpo da requisição (JSON):
        ```json
        {
          "nome": "João da Silva",
          "idade": 30,
          "sexo": "Masculino",
          "usuario": "joao.silva",
          "senha": "123"
        }
        ```

3.  **Faça Login para Obter um Token (Rota Pública):**
    *   **POST** `/login`
    *   Corpo da requisição (JSON):
        ```json
        {
          "usuario": "joao.silva",
          "senha": "123"
        }
        ```
    *   A resposta conterá um `token`. **Copie esta string!**

4.  **Tente Acessar uma Rota Privada SEM Token (Deve Falhar):**
    *   **GET** `/pacientes`
    *   Você deve receber um erro `401 Unauthorized`.

5.  **Acesse uma Rota Privada COM o Token (Deve Funcionar):**
    *   **GET** `/pacientes`
    *   Vá para a aba **Authorization** (ou **Auth**).
    *   Selecione o tipo **Bearer Token**.
    *   **Cole o token** que você copiou no passo 3.
    *   Envie a requisição. Agora você deve ver a lista de pacientes!

---

**Parabéns!** Você implementou uma API completa com persistência de dados e uma camada de segurança usando os padrões do mercado.
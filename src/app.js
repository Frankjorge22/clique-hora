const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

module.exports = app;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.locals.prisma = prisma; // Disponibiliza o Prisma globalmente

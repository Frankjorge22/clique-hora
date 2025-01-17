
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = 5000;


app.use(express.json());

app.get('/', (res) => {
  res.send('Servidor funcionando corretamente!');
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await prisma.usuario.findUnique({
            where: { cpf: decoded.cpf },
        });
        if (!req.user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};


const isSuperUser = (req, res, next) => {
    if (!req.user || !req.user.superuser) {
        return res.status(403).json({ error: 'Acesso negado: somente superusuários podem realizar esta ação.' });
    }
    next();
};

module.exports = { isAuthenticated, isSuperUser };



app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();


    const usuariosFormatados = usuarios.map((usuario) => ({
      ...usuario,
      cpf: usuario.cpf.toString(),
    }));

    res.status(200).json(usuariosFormatados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});


app.post('/usuarios', async (req, res) => {
  const { cpf, nome_user, email, senha, superuser } = req.body;
  try {
    const novoUsuario = await prisma.usuario.create({
      data: { cpf: BigInt(cpf), nome_user, email, senha, superuser },
    });


    res.status(201).json({
      ...novoUsuario,
      cpf: novoUsuario.cpf.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});


app.put('/usuarios/:cpf', async (req, res) => {
  const { cpf } = req.params;
  const { nome_user, email, senha, superuser } = req.body;

  try {
    
    const cpfBigInt = BigInt(cpf);


    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf: cpfBigInt },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }


    const usuarioAtualizado = await prisma.usuario.update({
      where: { cpf: cpfBigInt },
      data: {
        nome_user: nome_user || usuarioExistente.nome_user,
        email: email || usuarioExistente.email,
        senha: senha || usuarioExistente.senha,
        superuser: superuser !== undefined ? superuser : usuarioExistente.superuser,
      },
    });


    res.status(200).json({
      ...usuarioAtualizado,
      cpf: usuarioAtualizado.cpf.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/usuarios/:cpf', async (req, res) => {
  const { cpf } = req.params;
  try {
    
    const cpfBigInt = BigInt(cpf);


    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf: cpfBigInt },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deleta o usuário
    await prisma.usuario.delete({
      where: { cpf: cpfBigInt },
    });

    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});


app.get('/quadras', async (req, res) => {
  try {
    const quadras = await prisma.quadra.findMany();
    res.json(quadras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar quadras' });
  }
});


app.post('/quadras', async (req, res) => {
  const { cod_quadra, nome, localizacao } = req.body;
  try {
    const novaQuadra = await prisma.quadra.create({
      data: { cod_quadra, nome, localizacao },
    });
    res.json(novaQuadra);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar quadra' });
  }
});


app.put('/quadras/:cod_quadra', async (req, res) => {
  const { cod_quadra } = req.params;
  const { nome, localizacao } = req.body;
  try {
    const quadraAtualizada = await prisma.quadra.update({
      where: { cod_quadra: Number(cod_quadra) },
      data: { nome, localizacao },
    });
    res.json(quadraAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar quadra' });
  }
});


app.delete('/quadras/:cod_quadra', async (req, res) => {
  const { cod_quadra } = req.params;
  try {
    await prisma.quadra.delete({
      where: { cod_quadra: Number(cod_quadra) },
    });
    res.json({ message: 'Quadra deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar quadra' });
  }
});

app.use((req, res, next) => {
  res.json = (data) => {
    const replacer = (key, value) =>
      typeof value === 'bigint' ? value.toString() : value;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, replacer));
  };
  next();
});


app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        usuario: true,
        quadra: true,
      },
    });

    res.status(200).json(agendamentos); 
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});


app.get('/agendamentos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { cod_agendamento: parseInt(id) },
      include: {
        usuario: true,
        quadra: true,
      },
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }


    const agendamentoFormatado = {
      ...agendamento,
      cpf: agendamento.cpf.toString(),
      superuser: agendamento.superuser.toString(),
    };

    res.status(200).json(agendamentoFormatado);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamento' });
  }
});


app.get('/agendamentos/data/:data', async (req, res) => {
  const { data } = req.params;
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      data_agendamento: new Date(data),
    },
  });
  res.json(agendamentos);
});


app.get('/agendamentos/quadra/:cod_quadra', async (req, res) => {
  const { cod_quadra } = req.params;
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      cod_quadra: parseInt(cod_quadra),
    },
  });
  res.json(agendamentos);
});



app.use(express.json());


const verificarSuperusuario = async (req, res, next) => {
  const { superuser } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { cpf: BigInt(superuser) },
    });

    if (!usuario || !usuario.superuser) {
      return res.status(403).json({ error: 'Ação permitida apenas para superusuários.' });
    }

    next(); 
  } catch (error) {
    console.error('Erro ao verificar superusuário:', error);
    res.status(500).json({ error: 'Erro interno ao verificar superusuário' });
  }
};


app.post('/agendamentos', [
  body('cpf').isInt().withMessage('CPF deve ser um número inteiro'),
  body('cod_quadra').isInt().withMessage('Código da quadra deve ser um número inteiro'),
  body('data_agendamento').isDate().withMessage('Data do agendamento deve ser uma data válida'),
  body('hora_inicio').matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('Hora de início deve estar no formato HH:MM:SS'),
  body('hora_fim').matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('Hora de fim deve estar no formato HH:MM:SS'),
  body('superuser').isInt().withMessage('Superuser deve ser um número inteiro'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cpf, cod_quadra, data_agendamento, hora_inicio, hora_fim, superuser } = req.body;

  try {
   
    const usuarioExistente = await prisma.usuario.findUnique({ where: { cpf: BigInt(cpf) } });
    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const quadraExistente = await prisma.quadra.findUnique({ where: { cod_quadra } });
    if (!quadraExistente) {
      return res.status(404).json({ error: 'Quadra não encontrada' });
    }

    const superuserExistente = await prisma.usuario.findUnique({ where: { cpf: BigInt(superuser) } });
    if (!superuserExistente) {
      return res.status(404).json({ error: 'Superuser não encontrado' });
    }


    const horaInicioDate = new Date(`${data_agendamento}T${hora_inicio}`);
    const horaFimDate = new Date(`${data_agendamento}T${hora_fim}`);
    if (horaInicioDate >= horaFimDate) {
      return res.status(400).json({
        error: 'A hora de início não pode ser depois ou igual à hora de fim.',
      });
    }


    const novoAgendamento = await prisma.agendamento.create({
      data: {
        cpf: BigInt(cpf),
        cod_quadra,
        data_agendamento: new Date(data_agendamento),
        hora_inicio: horaInicioDate,
        hora_fim: horaFimDate,
        status: 'pendente',
        superuser: BigInt(superuser),
      },
    });

    res.status(201).json(novoAgendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});


app.put('/agendamentos/:id/status', verificarSuperusuario, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    
    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { cod_agendamento: parseInt(id, 10) },
      data: { status },
    });

    res.status(200).json(agendamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do agendamento' });
  }
});



app.put('/agendamentos/:id', [
  body('status').isIn(['pendente', 'confirmado', 'cancelado']).withMessage('Status inválido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { status } = req.body;
  const superuserCpf = req.body.superuserCpf; 

  try {

    const superuser = await prisma.usuario.findUnique({
      where: { cpf: BigInt(superuserCpf) },
    });

    if (!superuser || !superuser.superuser) {
      return res.status(403).json({ error: 'Acesso negado. Apenas superusuários podem alterar o status.' });
    }

  
    const agendamento = await prisma.agendamento.findUnique({
      where: { cod_agendamento: parseInt(id) },
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }


    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { cod_agendamento: parseInt(id) },
      data: {
        status,
        superuser: BigInt(superuserCpf),
      },
    });

    res.status(200).json(agendamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});


app.put('/agendamentos/cancelar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const agendamentoCancelado = await prisma.agendamento.update({
      where: { cod_agendamento: parseInt(id) },
      data: { status: 'cancelado' },
    });
    res.json(agendamentoCancelado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar o agendamento' });
  }
});


app.delete('/agendamentos/:cod_agendamento', async (req, res) => {
  const { cod_agendamento } = req.params;
  try {
    await prisma.agendamento.delete({
      where: { cod_agendamento: Number(cod_agendamento) },
    });
    res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});


app.put('/agendamentos/cancelar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const agendamentoCancelado = await prisma.agendamento.update({
      where: { cod_agendamento: parseInt(id) },
      data: { status: 'cancelado' },
    });
    res.json(agendamentoCancelado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar o agendamento' });
  }
});

app.get('/api/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }


  return res.status(401).json({ message: 'Credenciais inválidas.' });
});



const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const prisma = require('../app').locals.prisma;

module.exports = {
    async createAgendamento(req, res) {
        const { cod_agendamento, cpf, cod_quadra, data_agendamento, hora_inicio, hora_fim, status, superuser } = req.body;
        try {
            const novoAgendamento = await prisma.agendamento.create({
                data: { cod_agendamento, cpf, cod_quadra, data_agendamento, hora_inicio, hora_fim, status, superuser },
            });
            res.status(201).json(novoAgendamento);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar agendamento.' });
        }
    },

    async getAgendamentos(req, res) {
        try {
            const agendamentos = await prisma.agendamento.findMany({
                include: { usuario: true, quadra: true },
            });
            res.status(200).json(agendamentos);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
        }
    },
};

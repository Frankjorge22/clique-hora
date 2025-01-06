const prisma = require('../app').locals.prisma;

module.exports = {
    async createQuadra(req, res) {
        const { cod_quadra, nome, localizacao } = req.body;
        try {
            const novaQuadra = await prisma.quadra.create({
                data: { cod_quadra, nome, localizacao },
            });
            res.status(201).json(novaQuadra);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar quadra.' });
        }
    },

    async getQuadras(req, res) {
        try {
            const quadras = await prisma.quadra.findMany();
            res.status(200).json(quadras);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar quadras.' });
        }
    },
};

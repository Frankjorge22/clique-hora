const prisma = require('../app').locals.prisma;

module.exports = {
    async createUsuario(req, res) {
        const { cpf, nome_user, email, senha, superuser } = req.body;
        try {
            const novoUsuario = await prisma.usuario.create({
                data: { cpf, nome_user, email, senha, superuser },
            });
            res.status(201).json(novoUsuario);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar usuário.' });
        }
    },

    async getUsuarios(req, res) {
        try {
            const usuarios = await prisma.usuario.findMany();
            res.status(200).json(usuarios);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
    },
};

-- CreateTable
CREATE TABLE "Usuario" (
    "cpf" BIGINT NOT NULL,
    "nome_user" VARCHAR(250) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" CHAR(6) NOT NULL,
    "superuser" BOOLEAN NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("cpf")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "cod_agendamento" INTEGER NOT NULL,
    "cpf" BIGINT NOT NULL,
    "cod_quadra" INTEGER NOT NULL,
    "data_agendamento" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fim" TIME NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "superuser" BIGINT NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("cod_agendamento")
);

-- CreateTable
CREATE TABLE "Quadra" (
    "cod_quadra" INTEGER NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "localizacao" VARCHAR(150) NOT NULL,

    CONSTRAINT "Quadra_pkey" PRIMARY KEY ("cod_quadra")
);

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_cpf_fkey" FOREIGN KEY ("cpf") REFERENCES "Usuario"("cpf") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_cod_quadra_fkey" FOREIGN KEY ("cod_quadra") REFERENCES "Quadra"("cod_quadra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_superuser_fkey" FOREIGN KEY ("superuser") REFERENCES "Usuario"("cpf") ON DELETE RESTRICT ON UPDATE CASCADE;

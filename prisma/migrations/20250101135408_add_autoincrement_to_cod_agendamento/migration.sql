-- AlterTable
CREATE SEQUENCE agendamento_cod_agendamento_seq;
ALTER TABLE "Agendamento" ALTER COLUMN "cod_agendamento" SET DEFAULT nextval('agendamento_cod_agendamento_seq');
ALTER SEQUENCE agendamento_cod_agendamento_seq OWNED BY "Agendamento"."cod_agendamento";

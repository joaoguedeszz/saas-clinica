-- Seed professionals
INSERT INTO profissionais (nome, especialidade, telefone, email, ativo)
VALUES
  ('Dr. Carlos Alberto Silva', 'Clínico Geral', '(11) 99876-5432', 'carlos.silva@clinica.com', true),
  ('Dra. Maria Fernanda Costa', 'Cardiologia', '(11) 99765-4321', 'maria.costa@clinica.com', true),
  ('Dr. Roberto Almeida', 'Ortopedia', '(11) 99654-3210', 'roberto.almeida@clinica.com', true),
  ('Dra. Ana Paula Santos', 'Dermatologia', '(11) 99543-2109', 'ana.santos@clinica.com', true),
  ('Dr. Pedro Henrique Lima', 'Pediatria', '(11) 99432-1098', 'pedro.lima@clinica.com', true)
ON CONFLICT DO NOTHING;

-- Seed patients
INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, endereco, observacoes)
VALUES
  ('João da Silva', '123.456.789-09', '1985-03-15', '(11) 98765-4321', 'joao@email.com', 'Rua das Flores, 123 - São Paulo, SP', 'Alérgico a dipirona'),
  ('Maria Oliveira', '987.654.321-00', '1990-07-22', '(11) 97654-3210', 'maria.oliveira@email.com', 'Av. Paulista, 456 - São Paulo, SP', NULL),
  ('Carlos Pereira', '456.789.123-01', '1978-11-05', '(11) 96543-2109', 'carlos.p@email.com', 'Rua Augusta, 789 - São Paulo, SP', 'Diabético tipo 2'),
  ('Ana Beatriz Souza', '321.654.987-02', '1995-01-30', '(11) 95432-1098', 'ana.b@email.com', 'Rua Oscar Freire, 321 - São Paulo, SP', NULL),
  ('Fernando Martins', '654.321.987-03', '1982-09-10', '(11) 94321-0987', 'fernando.m@email.com', 'Rua Haddock Lobo, 654 - São Paulo, SP', 'Hipertenso')
ON CONFLICT (cpf) DO NOTHING;

-- Seed appointments (relative to current date)
INSERT INTO agendamentos (paciente_id, profissional_id, data_hora, tipo_atendimento, status, observacoes)
VALUES
  (1, 1, NOW()::date + INTERVAL '9 hours', 'Consulta', 'agendado', 'Consulta de rotina'),
  (2, 2, NOW()::date + INTERVAL '10 hours', 'Consulta', 'confirmado', 'Avaliação cardiológica'),
  (3, 1, NOW()::date + INTERVAL '11 hours', 'Retorno', 'agendado', 'Retorno diabetes'),
  (4, 4, NOW()::date + INTERVAL '14 hours', 'Consulta', 'agendado', NULL),
  (5, 3, NOW()::date + INTERVAL '15 hours', 'Exame', 'confirmado', 'Raio-X joelho'),
  (1, 1, NOW()::date - INTERVAL '1 day' + INTERVAL '9 hours', 'Consulta', 'atendido', 'Paciente com gripe'),
  (2, 2, NOW()::date - INTERVAL '2 days' + INTERVAL '10 hours', 'Retorno', 'atendido', NULL),
  (3, 3, NOW()::date - INTERVAL '3 days' + INTERVAL '14 hours', 'Procedimento', 'atendido', 'Infiltração'),
  (4, 4, NOW()::date + INTERVAL '1 day' + INTERVAL '9 hours', 'Consulta', 'agendado', NULL),
  (5, 5, NOW()::date + INTERVAL '1 day' + INTERVAL '10 hours', 'Consulta', 'agendado', 'Consulta pediátrica')
ON CONFLICT DO NOTHING;

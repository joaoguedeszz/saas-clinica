-- Create profissionais (Professionals/Doctors)
CREATE TABLE IF NOT EXISTS profissionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  especialidade VARCHAR(255),
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create pacientes (Patients)
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create agendamentos (Appointments)
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id INTEGER REFERENCES profissionais(id) ON DELETE CASCADE,
  data_hora TIMESTAMP NOT NULL,
  tipo_atendimento VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado','confirmado','atendido','cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);

# Notification Sender

Um sistema de envio de notificações programadas que suporta múltiplos canais (Email e SMS/WhatsApp) com agendamento automático via cron jobs.

## 🚀 Funcionalidades

- **Múltiplos Canais**: Suporte para envio via Email (Gmail) e SMS/WhatsApp (Twilio)
- **Agendamento**: Notificações programadas com execução automática via cron jobs
- **API RESTful**: CRUD completo para gerenciamento de notificações
- **Paginação**: Listagem paginada de notificações
- **Validação**: Validação robusta de dados com Zod
- **Arquitetura Limpa**: Separação clara entre camadas (Controllers, Services, Repository)
- **TypeScript**: Totalmente tipado para melhor desenvolvimento
- **Testes Automatizados**: Suíte completa de testes unitários e de integração

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **MongoDB** - Banco de dados NoSQL
- **Zod** - Validação e tipagem
- **Nodemailer** - Envio de emails
- **Twilio** - Envio de SMS/WhatsApp
- **Node-cron** - Agendamento de tarefas
- **CORS** - Controle de acesso
- **Jest** - Framework de testes
- **Supertest** - Testes de integração para APIs

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── env.ts                    # Configuração de variáveis de ambiente
├── controllers/
│   └── notification-controller.ts # Controllers da API
├── database/
│   └── index.ts                  # Configuração do Prisma
├── errors/
│   └── HttpError.ts             # Classe de erro customizada
├── middlewares/
│   └── error-handler.ts         # Middleware de tratamento de erros
├── repository/
│   ├── notifications-repository.ts       # Interface do repositório
│   ├── prisma/
│   │   └── PrismaNotificationsRepository.ts # Implementação Prisma
│   └── schemas/
│       └── notification-schema.ts        # Schemas de validação
├── services/
│   ├── __tests__/
│   │   ├── email-service.spec.ts        # Testes do serviço de email
│   │   ├── notification-service.spec.ts # Testes do serviço principal
│   │   ├── scheduler-service.spec.ts    # Testes do serviço de agendamento
│   │   └── sms-service.spec.ts         # Testes do serviço de SMS/WhatsApp
│   ├── contracts/
│   │   └── email-sms-contracts.ts       # Contratos dos serviços
│   ├── email-service.ts         # Serviço de email
│   ├── notification-service.ts  # Serviço principal
│   ├── scheduler-service.ts     # Serviço de agendamento
│   └── sms-service.ts          # Serviço de SMS/WhatsApp
├── app.ts                      # Configuração do Express
├── container.ts                 # Injeção de dependências
├── routes.spec.ts              # Testes de integração das rotas
├── routes.ts                   # Definição das rotas
└── server.ts                   # Inicialização do servidor
```

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/mateusvcsmoura/notification-sender.git
cd notification-sender
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```env
# Database
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/database"

# Server
PORT=3000

# Email (Gmail)
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASSWORD="sua-senha"
EMAIL_APP_PASSWORD="senha-do-app"

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID="seu-account-sid"
TWILIO_AUTH_TOKEN="seu-auth-token"
TWILIO_PHONE_NUMBER="whatsapp:+1234567890"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Aplicar migrações (se necessário)
npx prisma db push
```

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📋 API Endpoints

### Notificações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/status` | Status da API |
| `GET` | `/api/notifications` | Listar notificações (paginado) |
| `POST` | `/api/notification` | Criar nova notificação |
| `GET` | `/api/notification/:id` | Buscar notificação por ID |
| `DELETE` | `/api/notification/:id` | Deletar notificação |

### Parâmetros de Paginação

Para endpoints que suportam paginação, use os query parameters:
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10)

Exemplo: `GET /api/notifications?page=2&limit=5`

### Resposta de Paginação

```json
{
  "notifications": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 3,
    "totalNotifications": 25
  }
}
```

## 📝 Exemplos de Uso

### Criar Notificação por Email
```json
POST /api/notification
{
  "channel": "EMAIL",
  "recipient": "destinatario@email.com",
  "sendAt": "2024-12-25T10:00:00Z",
  "payload": {
    "subject": "Feliz Natal!",
    "body": "Desejamos um Feliz Natal e um Próspero Ano Novo!"
  }
}
```

### Criar Notificação por SMS/WhatsApp
```json
POST /api/notification
{
  "channel": "SMS",
  "recipient": "+5511999999999",
  "sendAt": "2024-12-25T10:00:00Z",
  "payload": {
    "text": "Feliz Natal! 🎄"
  }
}
```

## ⚙️ Configuração dos Serviços

### Gmail (Email)
1. Ative a autenticação de 2 fatores na sua conta Google
2. Gere uma senha de app específica
3. Use a senha de app na variável `EMAIL_APP_PASSWORD`

### Twilio (SMS/WhatsApp)
1. Crie uma conta no [Twilio](https://www.twilio.com/)
2. Obtenha suas credenciais (Account SID, Auth Token)
3. Para WhatsApp, configure o Sandbox ou número aprovado
4. **Conta Trial**: Números de destino precisam ser verificados no painel

## 🕐 Agendamento

O sistema executa um cron job a cada minuto para verificar notificações pendentes com `sendAt` <= agora. As notificações são processadas automaticamente e têm seu status atualizado para `SENT` ou `FAILED`.

### Status das Notificações
- `PENDING` - Aguardando envio
- `SENT` - Enviada com sucesso
- `FAILED` - Falha no envio

## 🚨 Tratamento de Erros

O sistema inclui tratamento robusto de erros:
- Validação de dados com Zod
- Errors HTTP customizados
- Middleware global de tratamento de erros
- Logs detalhados para debugging

## 🧪 Testes

O projeto possui uma suíte completa de testes automatizados:

### **Testes Unitários**
- **EmailService**: Testa envio de emails via Nodemailer
- **SmsService**: Testa envio de SMS/WhatsApp via Twilio
- **NotificationService**: Testa lógica de negócio e tratamento de erros Prisma
- **SchedulerService**: Testa processamento de notificações agendadas

### **Testes de Integração**
- **Routes**: Testa todos os endpoints da API
  - `GET /api/notifications` - Listagem paginada
  - `GET /api/notifications/recently-created` - Notificações recentes
  - `GET /api/notifications/recently-sent` - Notificações enviadas
  - `POST /api/notification` - Criação de notificações
  - `GET /api/notification/:id` - Busca por ID
  - `DELETE /api/notification/:id` - Deleção de notificações

### **Executar Testes**
```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar em modo watch (desenvolvimento)
npm run test:watch

# Executar testes específicos
npm test -- --testNamePattern="EmailService"
```

### **Cobertura de Testes**
- ✅ Services (100% das funções principais)
- ✅ Controllers via testes de integração
- ✅ Tratamento de erros Prisma
- ✅ Validação de dados de entrada
- ✅ Casos de sucesso e falha

## 🔒 Limitações da Conta Trial (Twilio)

- Apenas números verificados podem receber mensagens
- Para WhatsApp: destinatário deve enviar código de join para o número sandbox
- Prefixo "Sent from your Twilio trial account" é adicionado às mensagens

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 👨‍💻 Autor

**Mateus Moura**
- GitHub: [@mateusvcsmoura](https://github.com/mateusvcsmoura)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!
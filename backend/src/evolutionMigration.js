const { PrismaClient } = require('@prisma/client');

async function runEvolutionMigration() {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: [],
  });

  try {
    // Patches sempre executados (colunas que podem estar faltando)
    const patches = [
      `ALTER TABLE "IsOnWhatsapp" ADD COLUMN IF NOT EXISTS "lid" VARCHAR(100)`,
      `ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "businessId" VARCHAR(100)`,
      `ALTER TABLE "Instance" ADD COLUMN IF NOT EXISTS "clientName" VARCHAR(100)`,
    ];

    for (const sql of patches) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('does not exist')) {
          console.warn('⚠️ Patch aviso:', e.message.slice(0, 100));
        }
      }
    }

    const res = await prisma.$queryRawUnsafe(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='Instance')`);
    if (res[0].exists) {
      console.log('✅ Tabelas Evolution API já existem');
      return;
    }

    console.log('🔄 Criando tabelas Evolution API...');

    const statements = [
      `DO $$ BEGIN CREATE TYPE "InstanceConnectionStatus" AS ENUM ('open','close','connecting'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "DeviceMessage" AS ENUM ('ios','android','web','unknown','desktop'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "TriggerType" AS ENUM ('all','keyword'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "TriggerOperator" AS ENUM ('contains','equals','startsWith','endsWith'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "OpenaiBotType" AS ENUM ('assistant','chatCompletion'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "DifyBotType" AS ENUM ('chatBot','textGenerator','agent','workflow'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `DO $$ BEGIN CREATE TYPE "SessionStatus" AS ENUM ('opened','closed','paused'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `CREATE TABLE IF NOT EXISTS "Instance" ("id" TEXT NOT NULL,"name" VARCHAR(255) NOT NULL,"connectionStatus" "InstanceConnectionStatus" NOT NULL DEFAULT 'open',"ownerJid" VARCHAR(100),"profilePicUrl" VARCHAR(500),"profileName" VARCHAR(100),"integration" VARCHAR(100),"number" VARCHAR(100),"businessId" VARCHAR(100),"token" VARCHAR(255),"clientName" VARCHAR(100),"disconnectionReasonCode" INTEGER,"disconnectionObject" JSONB,"disconnectionAt" TIMESTAMP,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP,CONSTRAINT "Instance_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Instance_name_key" ON "Instance"("name")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Instance_token_key" ON "Instance"("token")`,
      `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL,"sessionId" TEXT NOT NULL,"creds" TEXT,"createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "Session_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionId_key" ON "Session"("sessionId")`,
      `CREATE TABLE IF NOT EXISTS "Chat" ("id" TEXT NOT NULL,"remoteJid" VARCHAR(100) NOT NULL,"name" VARCHAR(100),"labels" JSONB,"unreadMessages" INTEGER DEFAULT 0,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP,"instanceId" TEXT NOT NULL,CONSTRAINT "Chat_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "Contact" ("id" TEXT NOT NULL,"remoteJid" VARCHAR(100) NOT NULL,"pushName" VARCHAR(100),"profilePicUrl" VARCHAR(500),"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP,"instanceId" TEXT NOT NULL,CONSTRAINT "Contact_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "Message" ("id" TEXT NOT NULL,"key" JSONB NOT NULL,"pushName" VARCHAR(100),"participant" VARCHAR(100),"messageType" VARCHAR(100) NOT NULL,"message" JSONB NOT NULL,"contextInfo" JSONB,"source" "DeviceMessage" NOT NULL,"messageTimestamp" INTEGER NOT NULL,"chatwootMessageId" INTEGER,"chatwootInboxId" INTEGER,"chatwootConversationId" INTEGER,"chatwootContactInboxSourceId" VARCHAR(100),"chatwootIsRead" BOOLEAN,"webhookUrl" VARCHAR(500),"status" VARCHAR(30),"sessionId" TEXT,"instanceId" TEXT NOT NULL,CONSTRAINT "Message_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "MessageUpdate" ("id" TEXT NOT NULL,"keyId" VARCHAR(100) NOT NULL,"remoteJid" VARCHAR(100) NOT NULL,"fromMe" BOOLEAN NOT NULL,"participant" VARCHAR(100),"pollUpdates" JSONB,"status" VARCHAR(30) NOT NULL,"messageId" TEXT NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "MessageUpdate_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "Webhook" ("id" TEXT NOT NULL,"url" VARCHAR(500) NOT NULL,"enabled" BOOLEAN DEFAULT true,"events" JSONB,"webhookByEvents" BOOLEAN DEFAULT false,"webhookBase64" BOOLEAN DEFAULT false,"headers" JSONB,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Webhook_instanceId_key" ON "Webhook"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Chatwoot" ("id" TEXT NOT NULL,"enabled" BOOLEAN DEFAULT true,"accountId" VARCHAR(100),"token" VARCHAR(100),"url" VARCHAR(500),"nameInbox" VARCHAR(100),"signMsg" BOOLEAN DEFAULT false,"signDelimiter" VARCHAR(100),"number" VARCHAR(100),"reopenConversation" BOOLEAN DEFAULT false,"conversationPending" BOOLEAN DEFAULT false,"mergeBrazilContacts" BOOLEAN DEFAULT false,"importContacts" BOOLEAN DEFAULT false,"importMessages" BOOLEAN DEFAULT false,"daysLimitImportMessages" INTEGER,"logo" VARCHAR(500),"organization" VARCHAR(100),"ignoreJids" JSONB,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Chatwoot_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Chatwoot_instanceId_key" ON "Chatwoot"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Label" ("id" TEXT NOT NULL,"labelId" VARCHAR(100),"name" VARCHAR(100) NOT NULL,"color" VARCHAR(100) NOT NULL,"predefinedId" VARCHAR(100),"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Label_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "Proxy" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT false,"host" VARCHAR(100) NOT NULL,"port" VARCHAR(100) NOT NULL,"protocol" VARCHAR(100) NOT NULL,"username" VARCHAR(100) NOT NULL,"password" VARCHAR(100) NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Proxy_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Proxy_instanceId_key" ON "Proxy"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Setting" ("id" TEXT NOT NULL,"rejectCall" BOOLEAN NOT NULL DEFAULT false,"msgCall" VARCHAR(100),"groupsIgnore" BOOLEAN NOT NULL DEFAULT false,"alwaysOnline" BOOLEAN NOT NULL DEFAULT false,"readMessages" BOOLEAN NOT NULL DEFAULT false,"readStatus" BOOLEAN NOT NULL DEFAULT false,"syncFullHistory" BOOLEAN NOT NULL DEFAULT false,"wavoipToken" VARCHAR(100),"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Setting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Setting_instanceId_key" ON "Setting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Rabbitmq" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT false,"events" JSONB NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Rabbitmq_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Rabbitmq_instanceId_key" ON "Rabbitmq"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Sqs" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT false,"events" JSONB NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Sqs_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Sqs_instanceId_key" ON "Sqs"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Websocket" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT false,"events" JSONB NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Websocket_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Websocket_instanceId_key" ON "Websocket"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Nats" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT false,"events" JSONB NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Nats_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Nats_instanceId_key" ON "Nats"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Pusher" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT false,"appId" VARCHAR(100) NOT NULL,"key" VARCHAR(100) NOT NULL,"secret" VARCHAR(100) NOT NULL,"cluster" VARCHAR(100) NOT NULL,"useTLS" BOOLEAN NOT NULL DEFAULT false,"events" JSONB NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Pusher_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Pusher_instanceId_key" ON "Pusher"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Typebot" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT true,"description" VARCHAR(255),"url" VARCHAR(500) NOT NULL,"typebot" VARCHAR(100) NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"triggerType" "TriggerType","triggerOperator" "TriggerOperator","triggerValue" TEXT,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP,"instanceId" TEXT NOT NULL,CONSTRAINT "Typebot_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "TypebotSetting" ("id" TEXT NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"typebotIdFallback" VARCHAR(100),"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "TypebotSetting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "TypebotSetting_instanceId_key" ON "TypebotSetting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "IntegrationSession" ("id" TEXT NOT NULL,"sessionId" VARCHAR(255) NOT NULL,"remoteJid" VARCHAR(100) NOT NULL,"pushName" TEXT,"status" "SessionStatus" NOT NULL,"awaitUser" BOOLEAN NOT NULL DEFAULT false,"context" TEXT,"type" VARCHAR(100),"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,"parameters" JSONB,"botId" TEXT,"openaiBotId" TEXT,"difyId" TEXT,"typebotId" TEXT,"flowiseId" TEXT,"n8nId" TEXT,"evoaiId" TEXT,CONSTRAINT "IntegrationSession_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "Media" ("id" TEXT NOT NULL,"fileName" VARCHAR(500) NOT NULL,"type" VARCHAR(100) NOT NULL,"mimetype" VARCHAR(100) NOT NULL,"createdAt" DATE DEFAULT CURRENT_TIMESTAMP,"messageId" TEXT NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Media_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "Template" ("id" TEXT NOT NULL,"templateId" VARCHAR(255) NOT NULL,"name" VARCHAR(255) NOT NULL,"template" JSONB NOT NULL,"webhookUrl" VARCHAR(500),"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Template_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Template_templateId_key" ON "Template"("templateId")`,
      `CREATE TABLE IF NOT EXISTS "OpenaiCreds" ("id" TEXT NOT NULL,"name" VARCHAR(100),"apiKey" VARCHAR(255) NOT NULL,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "OpenaiCreds_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "OpenaiCreds_instanceId_key" ON "OpenaiCreds"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "OpenaiBot" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT true,"description" VARCHAR(255),"botType" "OpenaiBotType" NOT NULL,"assistantId" VARCHAR(255),"functionUrl" VARCHAR(500),"model" VARCHAR(100),"systemMessages" JSONB,"assistantMessages" JSONB,"userMessages" JSONB,"maxTokens" INTEGER,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"speechToText" BOOLEAN DEFAULT false,"triggerType" "TriggerType","triggerOperator" "TriggerOperator","triggerValue" TEXT,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"openaiCredsId" TEXT NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "OpenaiBot_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "OpenaiSetting" ("id" TEXT NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"speechToText" BOOLEAN DEFAULT false,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"openaiCredsId" TEXT,"openaiIdFallback" VARCHAR(100),"instanceId" TEXT NOT NULL,CONSTRAINT "OpenaiSetting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "OpenaiSetting_instanceId_key" ON "OpenaiSetting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Dify" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT true,"description" VARCHAR(255),"botType" "DifyBotType" NOT NULL,"apiUrl" VARCHAR(255),"apiKey" VARCHAR(255),"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"triggerType" "TriggerType","triggerOperator" "TriggerOperator","triggerValue" TEXT,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Dify_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "DifySetting" ("id" TEXT NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"difyIdFallback" VARCHAR(100),"instanceId" TEXT NOT NULL,CONSTRAINT "DifySetting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "DifySetting_instanceId_key" ON "DifySetting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Flowise" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT true,"description" VARCHAR(255),"apiUrl" VARCHAR(255),"apiKey" VARCHAR(255),"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"triggerType" "TriggerType","triggerOperator" "TriggerOperator","triggerValue" TEXT,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Flowise_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "FlowiseSetting" ("id" TEXT NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"flowiseIdFallback" VARCHAR(100),"instanceId" TEXT NOT NULL,CONSTRAINT "FlowiseSetting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "FlowiseSetting_instanceId_key" ON "FlowiseSetting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "N8n" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT true,"description" VARCHAR(255),"webhookUrl" VARCHAR(255),"basicAuthUser" VARCHAR(255),"basicAuthPass" VARCHAR(255),"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"triggerType" "TriggerType","triggerOperator" "TriggerOperator","triggerValue" TEXT,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "N8n_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "N8nSetting" ("id" TEXT NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"n8nIdFallback" VARCHAR(100),"instanceId" TEXT NOT NULL,CONSTRAINT "N8nSetting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "N8nSetting_instanceId_key" ON "N8nSetting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "Evoai" ("id" TEXT NOT NULL,"enabled" BOOLEAN NOT NULL DEFAULT true,"description" VARCHAR(255),"agentUrl" VARCHAR(255),"apiKey" VARCHAR(255),"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"triggerType" "TriggerType","triggerOperator" "TriggerOperator","triggerValue" TEXT,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"instanceId" TEXT NOT NULL,CONSTRAINT "Evoai_pkey" PRIMARY KEY ("id"))`,
      `CREATE TABLE IF NOT EXISTS "EvoaiSetting" ("id" TEXT NOT NULL,"expire" INTEGER DEFAULT 0,"keywordFinish" VARCHAR(100),"delayMessage" INTEGER,"unknownMessage" VARCHAR(100),"listeningFromMe" BOOLEAN DEFAULT false,"stopBotFromMe" BOOLEAN DEFAULT false,"keepOpen" BOOLEAN DEFAULT false,"debounceTime" INTEGER,"ignoreJids" JSONB,"splitMessages" BOOLEAN DEFAULT false,"timePerChar" INTEGER DEFAULT 50,"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,"evoaiIdFallback" VARCHAR(100),"instanceId" TEXT NOT NULL,CONSTRAINT "EvoaiSetting_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "EvoaiSetting_instanceId_key" ON "EvoaiSetting"("instanceId")`,
      `CREATE TABLE IF NOT EXISTS "IsOnWhatsapp" ("id" TEXT NOT NULL,"remoteJid" VARCHAR(100) NOT NULL,"jidOptions" TEXT NOT NULL,"createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP NOT NULL,CONSTRAINT "IsOnWhatsapp_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "IsOnWhatsapp_remoteJid_key" ON "IsOnWhatsapp"("remoteJid")`,
      `ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Chat" ADD CONSTRAINT "Chat_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Contact" ADD CONSTRAINT "Contact_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Message" ADD CONSTRAINT "Message_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "MessageUpdate" ADD CONSTRAINT "MessageUpdate_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "MessageUpdate" ADD CONSTRAINT "MessageUpdate_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Chatwoot" ADD CONSTRAINT "Chatwoot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Label" ADD CONSTRAINT "Label_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Proxy" ADD CONSTRAINT "Proxy_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Setting" ADD CONSTRAINT "Setting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Rabbitmq" ADD CONSTRAINT "Rabbitmq_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Sqs" ADD CONSTRAINT "Sqs_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Websocket" ADD CONSTRAINT "Websocket_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Nats" ADD CONSTRAINT "Nats_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Pusher" ADD CONSTRAINT "Pusher_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Typebot" ADD CONSTRAINT "Typebot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "TypebotSetting" ADD CONSTRAINT "TypebotSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "IntegrationSession" ADD CONSTRAINT "IntegrationSession_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Media" ADD CONSTRAINT "Media_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Media" ADD CONSTRAINT "Media_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Template" ADD CONSTRAINT "Template_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "OpenaiCreds" ADD CONSTRAINT "OpenaiCreds_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "OpenaiBot" ADD CONSTRAINT "OpenaiBot_openaiCredsId_fkey" FOREIGN KEY ("openaiCredsId") REFERENCES "OpenaiCreds"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "OpenaiBot" ADD CONSTRAINT "OpenaiBot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "OpenaiSetting" ADD CONSTRAINT "OpenaiSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Dify" ADD CONSTRAINT "Dify_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "DifySetting" ADD CONSTRAINT "DifySetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Flowise" ADD CONSTRAINT "Flowise_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "FlowiseSetting" ADD CONSTRAINT "FlowiseSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "N8n" ADD CONSTRAINT "N8n_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "N8nSetting" ADD CONSTRAINT "N8nSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "Evoai" ADD CONSTRAINT "Evoai_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "EvoaiSetting" ADD CONSTRAINT "EvoaiSetting_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    ];

    for (const sql of statements) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.warn('⚠️ SQL aviso:', e.message.slice(0, 100));
        }
      }
    }

    console.log('✅ Tabelas Evolution API criadas com sucesso!');
  } catch (err) {
    console.error('⚠️ Erro ao criar tabelas Evolution API:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = runEvolutionMigration;

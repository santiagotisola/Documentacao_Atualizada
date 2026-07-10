#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Script de Inicialização SQL Server - Criar Bancos de Dados
# ═══════════════════════════════════════════════════════════════════

wait_time=30s
password=Axion@SqlServer2024

# Aguardar SQL Server iniciar
echo "Aguardando SQL Server inicializar..."
sleep $wait_time

echo "Criando bancos de dados AxHub, AxTon e AxCross..."

/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $password -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AxHub')
BEGIN
    CREATE DATABASE AxHub;
    PRINT 'Banco AxHub criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco AxHub já existe.';
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AxTon')
BEGIN
    CREATE DATABASE AxTon;
    PRINT 'Banco AxTon criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco AxTon já existe.';
END
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AxCross')
BEGIN
    CREATE DATABASE AxCross;
    PRINT 'Banco AxCross criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco AxCross já existe.';
END
GO

PRINT 'Bancos de dados inicializados com sucesso!';
"

echo "Inicialização SQL Server concluída!"

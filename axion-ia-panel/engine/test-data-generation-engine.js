/**
 * TEST DATA GENERATION ENGINE
 * Motor de Geração Automática de Dados de Teste
 * 
 * Gera dados de teste inteligentes para:
 * - Formulários (válidos, inválidos, limites)
 * - Cadastros (CPF, CNPJ, telefones, emails)
 * - Endereços (CEP, ruas, cidades)
 * - Datas (válidas, futuras, passadas, limites)
 * - Números (inteiros, decimais, moeda)
 * - Textos (nomes, descrições, senhas)
 * - Arquivos (uploads simulados)
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

class TestDataGenerationEngine {
  constructor() {
    this.generatedData = [];
    
    // Dados base para geração
    this.nomes = [
      'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Fernando', 'Beatriz',
      'Ricardo', 'Patricia', 'Roberto', 'Fernanda', 'José', 'Mariana', 'Paulo', 'Camila'
    ];
    
    this.sobrenomes = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Rodrigues',
      'Almeida', 'Nascimento', 'Carvalho', 'Ferreira', 'Gomes', 'Martins', 'Ribeiro', 'Araújo'
    ];
    
    this.cidades = [
      { cidade: 'São Paulo', estado: 'SP', cep: '01000000' },
      { cidade: 'Rio de Janeiro', estado: 'RJ', cep: '20000000' },
      { cidade: 'Belo Horizonte', estado: 'MG', cep: '30000000' },
      { cidade: 'Goiânia', estado: 'GO', cep: '74000000' },
      { cidade: 'Brasília', estado: 'DF', cep: '70000000' },
      { cidade: 'Salvador', estado: 'BA', cep: '40000000' },
      { cidade: 'Fortaleza', estado: 'CE', cep: '60000000' },
      { cidade: 'Recife', estado: 'PE', cep: '50000000' }
    ];
    
    this.ruas = [
      'Rua das Flores', 'Av. Principal', 'Rua do Comércio', 'Av. Central',
      'Rua São José', 'Av. Brasil', 'Rua Santos Dumont', 'Av. Goiás'
    ];
  }

  /**
   * Gera dados para um campo específico
   */
  generate(fieldType, options = {}) {
    const { valid = true, variant = null, count = 1 } = options;

    const results = [];

    for (let i = 0; i < count; i++) {
      let value;

      switch (fieldType.toLowerCase()) {
        case 'cpf':
          value = valid ? this.generateCPF() : this.generateInvalidCPF();
          break;

        case 'cnpj':
          value = valid ? this.generateCNPJ() : this.generateInvalidCNPJ();
          break;

        case 'email':
          value = valid ? this.generateEmail() : this.generateInvalidEmail();
          break;

        case 'phone':
        case 'telefone':
          value = valid ? this.generatePhone() : this.generateInvalidPhone();
          break;

        case 'cep':
          value = valid ? this.generateCEP() : this.generateInvalidCEP();
          break;

        case 'date':
        case 'data':
          value = valid ? this.generateDate(variant) : this.generateInvalidDate();
          break;

        case 'name':
        case 'nome':
          value = this.generateName();
          break;

        case 'full_name':
        case 'nome_completo':
          value = this.generateFullName();
          break;

        case 'address':
        case 'endereco':
          value = this.generateAddress();
          break;

        case 'number':
        case 'numero':
          value = valid ? this.generateNumber(variant) : this.generateInvalidNumber();
          break;

        case 'money':
        case 'moeda':
          value = valid ? this.generateMoney() : this.generateInvalidMoney();
          break;

        case 'password':
        case 'senha':
          value = valid ? this.generatePassword() : this.generateWeakPassword();
          break;

        case 'text':
        case 'texto':
          value = this.generateText(variant);
          break;

        case 'placa':
          value = valid ? this.generatePlaca() : this.generateInvalidPlaca();
          break;

        case 'uuid':
          value = randomUUID();
          break;

        default:
          value = valid ? `Teste_${fieldType}_${i + 1}` : `Invalido_${fieldType}_${i + 1}`;
      }

      results.push(value);
    }

    return count === 1 ? results[0] : results;
  }

  /**
   * Gera CPF válido
   */
  generateCPF() {
    const random = (n) => Math.floor(Math.random() * n);
    
    const n1 = random(10);
    const n2 = random(10);
    const n3 = random(10);
    const n4 = random(10);
    const n5 = random(10);
    const n6 = random(10);
    const n7 = random(10);
    const n8 = random(10);
    const n9 = random(10);

    let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
    d1 = 11 - (d1 % 11);
    if (d1 >= 10) d1 = 0;

    let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
    d2 = 11 - (d2 % 11);
    if (d2 >= 10) d2 = 0;

    return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
  }

  /**
   * Gera CPF inválido
   */
  generateInvalidCPF() {
    return '111.111.111-11'; // CPF sequencial (sempre inválido)
  }

  /**
   * Gera CNPJ válido
   */
  generateCNPJ() {
    const random = (n) => Math.floor(Math.random() * n);

    const n = [random(10), random(10), random(10), random(10), random(10), random(10), random(10), random(10), 0, 0, 0, 1];

    let v1 = 5 * n[0] + 4 * n[1] + 3 * n[2] + 2 * n[3] + 9 * n[4] + 8 * n[5] + 7 * n[6] + 6 * n[7] + 5 * n[8] + 4 * n[9] + 3 * n[10] + 2 * n[11];
    v1 = 11 - (v1 % 11);
    if (v1 >= 10) v1 = 0;

    let v2 = 6 * n[0] + 5 * n[1] + 4 * n[2] + 3 * n[3] + 2 * n[4] + 9 * n[5] + 8 * n[6] + 7 * n[7] + 6 * n[8] + 5 * n[9] + 4 * n[10] + 3 * n[11] + 2 * v1;
    v2 = 11 - (v2 % 11);
    if (v2 >= 10) v2 = 0;

    return `${n[0]}${n[1]}.${n[2]}${n[3]}${n[4]}.${n[5]}${n[6]}${n[7]}/${n[8]}${n[9]}${n[10]}${n[11]}-${v1}${v2}`;
  }

  /**
   * Gera CNPJ inválido
   */
  generateInvalidCNPJ() {
    return '00.000.000/0000-00';
  }

  /**
   * Gera email válido
   */
  generateEmail() {
    const nome = this.nomes[Math.floor(Math.random() * this.nomes.length)].toLowerCase();
    const sobrenome = this.sobrenomes[Math.floor(Math.random() * this.sobrenomes.length)].toLowerCase();
    const dominios = ['gmail.com', 'outlook.com', 'axiontecnologia.com.br', 'empresa.com.br'];
    const dominio = dominios[Math.floor(Math.random() * dominios.length)];
    const numero = Math.floor(Math.random() * 999);

    return `${nome}.${sobrenome}${numero}@${dominio}`;
  }

  /**
   * Gera email inválido
   */
  generateInvalidEmail() {
    const invalids = [
      'email_sem_arroba.com',
      '@sem_usuario.com',
      'usuario@',
      'usuario @espaco.com',
      'usuario@.com'
    ];
    return invalids[Math.floor(Math.random() * invalids.length)];
  }

  /**
   * Gera telefone válido
   */
  generatePhone() {
    const ddd = [11, 21, 31, 62, 61, 71, 85, 81][Math.floor(Math.random() * 8)];
    const prefixo = 9;
    const numero = Math.floor(Math.random() * 90000000) + 10000000;

    return `(${ddd}) ${prefixo}${String(numero).substring(0, 4)}-${String(numero).substring(4)}`;
  }

  /**
   * Gera telefone inválido
   */
  generateInvalidPhone() {
    return '(00) 0000-0000';
  }

  /**
   * Gera CEP válido
   */
  generateCEP() {
    const cidade = this.cidades[Math.floor(Math.random() * this.cidades.length)];
    const base = parseInt(cidade.cep);
    const variacao = Math.floor(Math.random() * 9999);
    const cep = String(base + variacao).padStart(8, '0');

    return `${cep.substring(0, 5)}-${cep.substring(5)}`;
  }

  /**
   * Gera CEP inválido
   */
  generateInvalidCEP() {
    return '00000-000';
  }

  /**
   * Gera data
   */
  generateDate(variant = 'today') {
    const date = new Date();

    switch (variant) {
      case 'past':
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        break;
      case 'future':
        date.setDate(date.getDate() + Math.floor(Math.random() * 365));
        break;
      case 'old':
        date.setFullYear(date.getFullYear() - 18 - Math.floor(Math.random() * 50));
        break;
      case 'today':
      default:
        // Mantém data atual
        break;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Gera data inválida
   */
  generateInvalidDate() {
    const invalids = [
      '2026-13-01', // Mês inválido
      '2026-02-30', // Dia inválido
      '0000-00-00',
      '9999-99-99',
      'abc'
    ];
    return invalids[Math.floor(Math.random() * invalids.length)];
  }

  /**
   * Gera nome
   */
  generateName() {
    return this.nomes[Math.floor(Math.random() * this.nomes.length)];
  }

  /**
   * Gera nome completo
   */
  generateFullName() {
    const nome = this.nomes[Math.floor(Math.random() * this.nomes.length)];
    const sobrenome = this.sobrenomes[Math.floor(Math.random() * this.sobrenomes.length)];
    return `${nome} ${sobrenome}`;
  }

  /**
   * Gera endereço completo
   */
  generateAddress() {
    const rua = this.ruas[Math.floor(Math.random() * this.ruas.length)];
    const numero = Math.floor(Math.random() * 9999) + 1;
    const cidade = this.cidades[Math.floor(Math.random() * this.cidades.length)];

    return {
      logradouro: rua,
      numero,
      bairro: 'Centro',
      cidade: cidade.cidade,
      estado: cidade.estado,
      cep: this.generateCEP()
    };
  }

  /**
   * Gera número
   */
  generateNumber(variant = 'positive') {
    switch (variant) {
      case 'negative':
        return -Math.floor(Math.random() * 1000);
      case 'zero':
        return 0;
      case 'large':
        return Math.floor(Math.random() * 1000000);
      case 'decimal':
        return (Math.random() * 1000).toFixed(2);
      case 'positive':
      default:
        return Math.floor(Math.random() * 1000) + 1;
    }
  }

  /**
   * Gera número inválido
   */
  generateInvalidNumber() {
    return 'abc123';
  }

  /**
   * Gera valor monetário
   */
  generateMoney() {
    const value = (Math.random() * 10000).toFixed(2);
    return `R$ ${value.replace('.', ',')}`;
  }

  /**
   * Gera valor monetário inválido
   */
  generateInvalidMoney() {
    return 'R$ abc,de';
  }

  /**
   * Gera senha forte
   */
  generatePassword() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()';

    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < 12; i++) {
      const all = upper + lower + numbers + special;
      password += all[Math.floor(Math.random() * all.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Gera senha fraca
   */
  generateWeakPassword() {
    const weak = ['123456', 'password', '123456789', '12345', '123456', 'senha123', 'abc123'];
    return weak[Math.floor(Math.random() * weak.length)];
  }

  /**
   * Gera texto
   */
  generateText(variant = 'short') {
    const loremWords = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];

    let wordCount;
    switch (variant) {
      case 'long':
        wordCount = 50;
        break;
      case 'medium':
        wordCount = 20;
        break;
      case 'short':
      default:
        wordCount = 5;
        break;
    }

    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }

    return words.join(' ') + '.';
  }

  /**
   * Gera placa de veículo
   */
  generatePlaca() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let placa = '';
    for (let i = 0; i < 3; i++) {
      placa += letters[Math.floor(Math.random() * letters.length)];
    }
    placa += '-';
    for (let i = 0; i < 4; i++) {
      placa += numbers[Math.floor(Math.random() * numbers.length)];
    }

    return placa;
  }

  /**
   * Gera placa inválida
   */
  generateInvalidPlaca() {
    return 'AAA-AAAA';
  }

  /**
   * Gera dataset completo para formulário
   */
  generateDataset(fields, options = {}) {
    const { count = 10, valid = true } = options;

    console.log(`\n📊 Gerando dataset com ${count} registros...`);

    const dataset = [];

    for (let i = 0; i < count; i++) {
      const record = {};

      fields.forEach(field => {
        record[field.name] = this.generate(field.type, { valid, variant: field.variant });
      });

      dataset.push(record);
    }

    console.log(`✅ ${dataset.length} registros gerados`);

    this.generatedData = dataset;
    return dataset;
  }

  /**
   * Salva dataset em arquivo
   */
  async saveDataset(filename = 'test-data.json') {
    const dataDir = path.join(process.cwd(), 'engine', 'test-data');
    await fs.promises.mkdir(dataDir, { recursive: true });

    const filepath = path.join(dataDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(this.generatedData, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Dataset salvo em: ${filepath}`);

    // Salva também em CSV
    const csvPath = filepath.replace('.json', '.csv');
    await this.saveAsCSV(csvPath);

    return filepath;
  }

  /**
   * Salva dataset em CSV
   */
  async saveAsCSV(filepath) {
    if (this.generatedData.length === 0) return;

    const headers = Object.keys(this.generatedData[0]);
    let csv = headers.join(',') + '\n';

    this.generatedData.forEach(record => {
      const values = headers.map(h => {
        const value = record[h];
        if (typeof value === 'object') {
          return JSON.stringify(value).replace(/,/g, ';');
        }
        return String(value).replace(/,/g, ';');
      });
      csv += values.join(',') + '\n';
    });

    await fs.promises.writeFile(filepath, csv, 'utf-8');
    console.log(`📄 CSV salvo em: ${filepath}`);
  }
}

export default TestDataGenerationEngine;

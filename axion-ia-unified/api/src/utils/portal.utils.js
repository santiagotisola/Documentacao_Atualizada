import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Chave de criptografia AES-256 (deve estar no .env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ENCRYPTION_IV_LENGTH = 16;

/**
 * Criptografa CPF usando AES-256-CBC
 * @param {string} cpf - CPF em texto plano
 * @returns {string} CPF criptografado em hex
 */
export function encryptCPF(cpf) {
  try {
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(cpf, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retorna IV + dados criptografados
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Erro ao criptografar CPF:', error);
    throw new Error('Erro na criptografia');
  }
}

/**
 * Descriptografa CPF
 * @param {string} encryptedData - CPF criptografado
 * @returns {string} CPF em texto plano
 */
export function decryptCPF(encryptedData) {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar CPF:', error);
    throw new Error('Erro na descriptografia');
  }
}

/**
 * Gera hash SHA-256 do CPF (para indexação/busca)
 * @param {string} cpf - CPF em texto plano
 * @returns {string} Hash SHA-256
 */
export function hashCPF(cpf) {
  return crypto.createHash('sha256').update(cpf).digest('hex');
}

/**
 * Gera hash bcrypt de senha
 * @param {string} senha - Senha em texto plano
 * @returns {Promise<string>} Hash bcrypt
 */
export async function hashPassword(senha) {
  const saltRounds = 10;
  return await bcrypt.hash(senha, saltRounds);
}

/**
 * Verifica senha contra hash bcrypt
 * @param {string} senha - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(senha, hash) {
  return await bcrypt.compare(senha, hash);
}

/**
 * Gera JWT token
 * @param {Object} payload - Dados do usuário
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'axion-portal-secret-key';
  const expiresIn = '7d'; // Token válido por 7 dias
  
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifica JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Payload decodificado ou null se inválido
 */
export function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'axion-portal-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Valida formato de CPF
 * @param {string} cpf - CPF a validar
 * @returns {boolean}
 */
export function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

/**
 * Valida formato de placa (antiga ou Mercosul)
 * @param {string} placa - Placa a validar
 * @returns {boolean}
 */
export function validarPlaca(placa) {
  // Remove caracteres não alfanuméricos
  placa = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (placa.length !== 7) return false;
  
  // Placa antiga: AAA9999
  const placaAntiga = /^[A-Z]{3}\d{4}$/;
  
  // Placa Mercosul: AAA9A99
  const placaMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return placaAntiga.test(placa) || placaMercosul.test(placa);
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Sanitiza string para prevenir SQL Injection
 * @param {string} str - String a sanitizar
 * @returns {string}
 */
export function sanitizeSQLString(str) {
  if (!str) return '';
  return str.replace(/['";\\]/g, '');
}

/**
 * Gera protocolo único para contestação
 * @returns {string} Protocolo no formato CONT-YYYY-XXXXXXXX
 */
export function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CONT-${ano}-${timestamp}${random}`;
}

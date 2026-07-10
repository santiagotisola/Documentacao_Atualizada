import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parser de Manuais Docusaurus → Scripts de Teste
 * Lê os arquivos .md dos manuais e gera scripts automaticamente
 */
class ManualParser {
  constructor() {
    this.products = {
      axhub: {
        name: 'AxHub',
        icon: '🏢',
        docsPath: path.join(__dirname, '../../../../AxHub/docs-portal/docs')
      },
      axton: {
        name: 'AxTon',
        icon: '⚖️',
        docsPath: path.join(__dirname, '../../../../AxTon/docs-portal/docs')
      },
      axcross: {
        name: 'AxCross',
        icon: '🚗',
        docsPath: path.join(__dirname, '../../../../AxCross/docs-portal/docs')
      }
    };
  }

  /**
   * Retorna todos os produtos disponíveis
   */
  async getProducts() {
    return Object.entries(this.products).map(([id, product]) => ({
      id,
      name: product.name,
      icon: product.icon
    }));
  }

  /**
   * Retorna módulos de um produto (pastas dentro de docs/)
   */
  async getModules(productId) {
    const product = this.products[productId];
    if (!product) return [];

    try {
      const docsPath = product.docsPath;
      const entries = await fs.readdir(docsPath, { withFileTypes: true });

      const modules = [];

      for (const entry of entries) {
        // Ignora arquivos e pastas especiais
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'img') {
          continue;
        }

        const modulePath = path.join(docsPath, entry.name);

        // Tenta ler _category_.json
        let label = this.formatModuleName(entry.name);
        let icon = this.getModuleIcon(entry.name);

        try {
          const categoryPath = path.join(modulePath, '_category_.json');
          const categoryContent = await fs.readFile(categoryPath, 'utf-8');
          const category = JSON.parse(categoryContent);
          if (category.label) {
            label = category.label;
          }
        } catch (err) {
          // Se não tem _category_.json, usa o nome da pasta formatado
        }

        modules.push({
          id: entry.name,
          name: label,
          icon
        });
      }

      return modules;
    } catch (error) {
      console.error(`Erro ao ler módulos de ${productId}:`, error);
      return [];
    }
  }

  /**
   * Retorna scripts de um módulo (arquivos .md dentro da pasta)
   */
  async getScripts(productId, moduleId) {
    const product = this.products[productId];
    if (!product) return [];

    try {
      const modulePath = path.join(product.docsPath, moduleId);
      const entries = await fs.readdir(modulePath, { withFileTypes: true });

      const scripts = [];

      for (const entry of entries) {
        // Ignora tudo que não é .md
        if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'intro.md') {
          continue;
        }

        const scriptPath = path.join(modulePath, entry.name);
        const script = await this.parseMarkdownFile(scriptPath, entry.name, productId, moduleId);

        if (script) {
          scripts.push(script);
        }
      }

      return scripts;
    } catch (error) {
      console.error(`Erro ao ler scripts de ${productId}/${moduleId}:`, error);
      return [];
    }
  }

  /**
   * Parse de um arquivo .md → extrai título, campos, passos
   */
  async parseMarkdownFile(filePath, fileName, productId, moduleId) {
    try {
      // Normaliza line endings (remove \r de arquivos Windows)
      const rawContent = await fs.readFile(filePath, 'utf-8');
      const content = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Extrai título do frontmatter ou do primeiro heading #
      const frontmatterTitle = content.match(/^title:\s*(.+)$/m);
      const headingTitle = content.match(/^#\s+(.+)$/m);
      const title = (frontmatterTitle ? frontmatterTitle[1].trim() : null)
                 || (headingTitle ? headingTitle[1].trim() : this.formatFileName(fileName));

      // Extrai descrição do frontmatter
      const descMatch = content.match(/^description:\s*(.+)$/m);
      const description = descMatch ? descMatch[1].trim() : `Validação: ${title}`;

      // Extrai campos da tabela de Cadastro (excluindo navegação)
      const fields = this.extractFieldsFromMarkdown(content);

      // Extrai passos do "Passo a passo"
      const steps = this.extractStepsFromMarkdown(content);
      const stepsCount = steps.length > 0 ? steps.length : 5;

      // Estima tempo baseado no número de passos
      const estimatedTime = `${stepsCount * 2}s`;

      return {
        id: fileName.replace('.md', ''),
        name: title,
        description,
        steps: stepsCount,
        estimatedTime,
        filePath,
        dataSchema: fields.length > 0 ? {
          description: `Dados para validar: ${title}`,
          fields
        } : null
      };
    } catch (error) {
      console.error(`Erro ao parsear ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extrai campos da tabela "Campos" do Markdown
   * Suporta formato com e sem coluna "Obrigatório":
   *   | **Campo** | Sim | Descrição |   (3 colunas)
   *   | **Campo** | Descrição |          (2 colunas)
   *   | Campo | Descrição |              (sem negrito)
   */
  extractFieldsFromMarkdown(content) {
    const fields = [];
    const seen = new Set();

    // Corta seção de Navegação Relacionada (não queremos campos dali)
    const navIndex = content.search(/\n##\s+(Navega[cç][aã]o Relacionada|Relacionado)/i);
    const cleanContent = navIndex > 0 ? content.substring(0, navIndex) : content;

    // Padrão 1: | **Campo** | Sim/Não | Descrição | (com coluna obrigatório)
    const withRequiredRegex = /^\|\s*\*\*([^*]+)\*\*\s*\|\s*(Sim|Não|Nao)\s*\|([^|]*)\|/gmi;
    const matches1 = [...cleanContent.matchAll(withRequiredRegex)];

    // Padrão 2: | **Campo** | Descrição | (sem coluna obrigatório, campo em negrito)
    const noRequiredBoldRegex = /^\|\s*\*\*([^*|]+)\*\*\s*\|([^|]+)\|\s*$/gmi;
    const matches2 = [...cleanContent.matchAll(noRequiredBoldRegex)];

    // Padrão 3: | Campo | Descrição | (sem negrito, para campos simples)
    const noRequiredPlainRegex = /^\|\s*([A-ZÁÉÍÓÚÃÕÂÊÔÇÑ][^|*\n]+?)\s*\|\s*([^|]{10,})\s*\|\s*$/gmi;
    const matches3 = [...cleanContent.matchAll(noRequiredPlainRegex)];

    // Mescla resultados: prioriza padrão 1, depois 2, depois 3
    const allMatches = [
      ...matches1.map(m => ({ label: m[1].trim(), required: /^sim$/i.test(m[2]), description: m[3].trim() })),
      ...matches2.map(m => ({ label: m[1].trim(), required: false, description: m[2].trim() })),
      ...matches3.map(m => ({ label: m[1].trim(), required: false, description: m[2].trim() }))
    ];

    // Filtra cabeçalhos de tabela e linhas inválidas
    const stopWords = ['campo', 'coluna', 'ação', 'acao', 'tipo', 'pagina', 'página', 'descrição', 'descricao', 'related'];
    const matches = allMatches.filter(m => !stopWords.includes(m.label.toLowerCase()));

    for (const match of matches) {
      const rawLabel = match.label;
      const isRequired = match.required;
      const description = match.description || '';

      if (!rawLabel) continue;

      // Infere tipo baseado no nome do campo
      const lower = rawLabel.toLowerCase();
      let type = 'text';

      if (lower.includes('email')) type = 'email';
      else if (lower.includes('telefone') || lower.includes('fone') || lower.includes('celular')) type = 'tel';
      else if (lower.includes('senha')) type = 'password';
      else if (lower.includes('data') || lower.includes('vencimento') || lower.includes('emissão') || lower.includes('emissao')) type = 'date';
      else if (lower.includes('ano')) type = 'number';
      else if (/seleção|dropdown|selecione/i.test(description)) type = 'select';

      const fieldId = this.sanitizeFieldName(rawLabel);
      if (!fieldId || seen.has(fieldId)) continue;
      seen.add(fieldId);

      fields.push({
        name: fieldId,
        label: rawLabel,
        type,
        required: isRequired,
        placeholder: this.generatePlaceholder(rawLabel, type),
        ...(description && { hint: description.substring(0, 120) })
      });
    }

    return fields.slice(0, 12);
  }

  /**
   * Extrai passos numerados do "Passo a passo"
   */
  extractStepsFromMarkdown(content) {
    // Procura seção "Passo a passo" ou similar e extrai itens numerados
    const stepsSectionRegex = /###?\s+(?:Passo a passo|Como (?:acessar|fazer|cadastrar|criar|editar|usar)[^\n]*)\n+([\s\S]+?)(?=\n##|\n:::|$)/i;
    const match = content.match(stepsSectionRegex);

    if (match) {
      const stepMatches = [...match[1].matchAll(/^\d+\.\s+(.+)$/gm)];
      if (stepMatches.length > 0) {
        return stepMatches.map(m => m[1]);
      }
    }

    // Fallback: conta itens numerados que começam com maiúscula ou negrito
    const allSteps = [...content.matchAll(/^\d+\.\s+(?:\*\*|[A-ZÁÉÍÓÚÀÂÊÔÃÕÜ])/gm)];
    return allSteps;
  }

  sanitizeFieldName(fieldName) {
    return fieldName
      .toLowerCase()
      .replace(/\*\*/g, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase()) // camelCase
      .replace(/^\d+/, '');
  }

  generatePlaceholder(fieldName, type) {
    const lower = fieldName.toLowerCase();
    if (lower.includes('placa')) return 'ABC-1234';
    if (lower.includes('email')) return 'usuario@exemplo.com';
    if (lower.includes('telefone')) return '(11) 98765-4321';
    if (lower.includes('ano')) return String(new Date().getFullYear());
    if (lower.includes('nome')) return 'Nome Completo';
    if (lower.includes('código') || lower.includes('codigo')) return 'EX001';
    if (lower.includes('série') || lower.includes('serie')) return 'SN123456';
    if (lower.includes('certificado')) return '0000000';
    if (type === 'date') return 'DD/MM/AAAA';
    return '';
  }

  getModuleIcon(moduleName) {
    const icons = {
      'cadastros-basicos': '📋',
      'cadastros': '📋',
      'controle-acesso': '🔐',
      'equipamentos': '📷',
      'processos': '⚙️',
      'infracoes': '🚨',
      'medicoes': '📏',
      'operacoes': '🎯',
      'pesagem': '⚖️',
      'relatorios': '📊',
      'administracao': '⚙️',
      'sistema': '💻',
      'veiculos': '🚗',
      'balanca': '⚖️',
      'cronotacografo': '🕐',
      'primeiros-passos': '👋',
      'glossario': '📖',
      'referencia-tecnica': '🔧',
    };
    return icons[moduleName] || '📄';
  }

  formatModuleName(folderName) {
    return folderName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatFileName(fileName) {
    return fileName
      .replace('.md', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export default ManualParser;

import apiService, { Module } from './api';
import { getCategoryDisplayName } from '../constants/CategoryNames';

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  progress: number;
}

export interface ModuleCategory {
  name: string;
  modules: Module[];
}

class ModuleService {
  async getAllModules(): Promise<Module[]> {
    try {
      console.log('🔍 Buscando todos os módulos...');
      const response = await apiService.getModules();
      
      console.log('📊 Resposta recebida de getModules, tipo:', 
        response ? (Array.isArray(response) ? 'Array' : typeof response) : 'undefined');
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && response.modules && Array.isArray(response.modules)) {
        console.log('✅ Formato: { modules: [...] }');
        console.log(`📚 Total de módulos: ${response.modules.length}`);
        return response.modules;
      } else if (Array.isArray(response)) {
        console.log('✅ Formato: array direto');
        console.log(`📚 Total de módulos: ${response.length}`);
        return response;
      } else if (response && typeof response === 'object') {
        // Tentar extrair os módulos de outras propriedades
        const possibleModulesArrays = Object.values(response)
          .filter(value => Array.isArray(value) && value.length > 0);
          
        if (possibleModulesArrays.length > 0) {
          // Usar o maior array encontrado (provavelmente os módulos)
          const modulesArray = possibleModulesArrays.reduce(
            (largest, current) => current.length > largest.length ? current : largest,
            possibleModulesArrays[0]
          );
          
          console.log(`⚠️ Encontrado array potencial em outra propriedade: ${modulesArray.length} itens`);
          return modulesArray;
        }
        
        console.error('❌ Resposta não contém um array de módulos:', response);
        return [];
      } else {
        console.error('❌ Resposta inesperada de getModules:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar módulos:', error);
      console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error));
      return []; 
    }
  }

  async getModuleById(id: string): Promise<Module> {
    return await apiService.getModuleById(id);
  }

  async getModuleCategories(): Promise<string[]> {
    return await apiService.getModuleCategories();
  }

  async completeModule(moduleId: string): Promise<void> {
    return await apiService.completeModule(moduleId);
  }

  // Função auxiliar para agrupar módulos por categoria
  private groupModulesByCategory(modules: Module[]): ModuleCategory[] {
    const modulesByCategory = modules.reduce((acc, module) => {
      const category = (module.category && typeof module.category === 'string') ? 
        module.category : 'geral';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, Module[]>);
    
    return Object.entries(modulesByCategory).map(([category, categoryModules]) => ({
      name: getCategoryDisplayName(category), // Converter slug para nome amigável
      modules: categoryModules
    }));
  }

  async getModulesByCategory(userLevel?: string): Promise<ModuleCategory[]> {
    try {
      console.log(`🔍 Iniciando carregamento de módulos por categoria`);
      const modules = await this.getAllModules();
      
      console.log('📚 Módulos carregados:', modules.length);
      
      // Verificar se modules é um array válido
      if (!Array.isArray(modules)) {
        console.error('❌ Módulos não é um array:', modules);
        return [];
      }
      
      // ⚠️ TEMPORÁRIO: Desabilitar filtro por nível até resolver problema no banco
      // Retornar TODOS os módulos sem filtrar
      console.log('⚠️ Filtro por nível DESABILITADO temporariamente - mostrando todos os módulos');
      
      // Verificação detalhada dos dados recebidos
      if (modules.length > 0) {
        console.log('📋 Exemplo de primeiro módulo recebido:', {
          id: modules[0].id,
          title: modules[0].title,
          category: modules[0].category,
          level: modules[0].level || 'não definido'
        });
      }
      
      // Agrupar TODOS os módulos por categoria
      const result = this.groupModulesByCategory(modules);
      
      console.log(`✅ Módulos agrupados com sucesso: ${result.length} categorias (TODAS)`);
      
      // Log detalhado
      result.forEach(category => {
        console.log(`📁 Categoria: ${category.name} - Módulos: ${category.modules.length}`);
        if (category.modules.length > 0) {
          console.log(`   Primeiro: ${category.modules[0].title} (${category.modules[0].level || 'sem nível'})`);
        }
      });
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error));
      
      // Falha silenciosa com array vazio
      return [];
    }
  }

  async getCompletedModules(userId: string): Promise<string[]> {
    const modules = await this.getAllModules();
    return modules
      .filter(module => module.completedBy.includes(userId))
      .map(module => module.id);
  }

  async getModuleProgress(userId: string): Promise<ModuleProgress[]> {
    const modules = await this.getAllModules();
    const completedModules = await this.getCompletedModules(userId);
    
    return modules.map(module => ({
      moduleId: module.id,
      completed: completedModules.includes(module.id),
      progress: completedModules.includes(module.id) ? 100 : 0
    }));
  }
}

export const moduleService = new ModuleService();
export default moduleService; 
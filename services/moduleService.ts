import apiService, { Module } from './api';

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
      const response = await apiService.getModules();
      // Verificar se a resposta tem a estrutura esperada
      if (response && response.modules && Array.isArray(response.modules)) {
        return response.modules;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.error('Resposta inesperada de getModules:', response);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
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

  async getModulesByCategory(): Promise<ModuleCategory[]> {
    try {
      const modules = await this.getAllModules();
      const categoriesResponse = await apiService.request('/modules/categories');
      
      // Verificar se modules é um array válido
      if (!Array.isArray(modules)) {
        console.error('Módulos não é um array:', modules);
        return [];
      }
      
      return categoriesResponse.categories.map((category: any) => ({
        name: category.name,
        modules: modules.filter(module => module && module.category === category.id)
      }));
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
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
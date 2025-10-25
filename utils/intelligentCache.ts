/**
 * 🧠 Sistema de Cache Inteligente para NoteMusic
 * Gerencia cache local com estratégias de invalidação
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

interface CacheConfig {
  defaultTTL?: number; // Time to live em ms
  maxSize?: number; // Tamanho máximo do cache
  version?: string; // Versão do cache para invalidação
}

class IntelligentCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 300000, // 5 minutos
      maxSize: config.maxSize || 100,
      version: config.version || '1.0.0'
    };
  }

  /**
   * Armazenar item no cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    // Limpar cache se exceder tamanho máximo
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      version: this.config.version
    });

    console.log(`💾 Cache set: ${key} (expires in ${Math.round((expiresAt - now) / 1000)}s)`);
  }

  /**
   * Recuperar item do cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // Verificar se expirou
    if (now > item.expiresAt) {
      this.cache.delete(key);
      console.log(`⏰ Cache expired: ${key}`);
      return null;
    }

    // Verificar versão
    if (item.version !== this.config.version) {
      this.cache.delete(key);
      console.log(`🔄 Cache version mismatch: ${key}`);
      return null;
    }

    console.log(`✅ Cache hit: ${key} (${Math.round((item.expiresAt - now) / 1000)}s remaining)`);
    return item.data;
  }

  /**
   * Verificar se item existe e é válido
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    const now = Date.now();
    
    // Verificar se expirou
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    // Verificar versão
    if (item.version !== this.config.version) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remover item específico
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpar cache expirado
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt || item.version !== this.config.version) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired items`);
    }
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    expiredItems: number;
  } {
    const now = Date.now();
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt || item.version !== this.config.version) {
        expiredItems++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // TODO: Implementar tracking de hit rate
      expiredItems
    };
  }

  /**
   * Atualizar versão do cache (invalida tudo)
   */
  updateVersion(newVersion: string): void {
    this.config.version = newVersion;
    this.clear();
    console.log(`🔄 Cache version updated to: ${newVersion}`);
  }
}

// Instâncias globais do cache
export const userStatsCache = new IntelligentCache({
  defaultTTL: 60000, // 1 minuto
  maxSize: 50,
  version: '1.0.0'
});

export const moduleCache = new IntelligentCache({
  defaultTTL: 300000, // 5 minutos
  maxSize: 100,
  version: '1.0.0'
});

export const quizCache = new IntelligentCache({
  defaultTTL: 180000, // 3 minutos
  maxSize: 200,
  version: '1.0.0'
});

// Função para limpar todos os caches
export const clearAllCaches = (): void => {
  userStatsCache.clear();
  moduleCache.clear();
  quizCache.clear();
  console.log('🧹 All caches cleared');
};

// Função para atualizar versão de todos os caches
export const updateAllCacheVersions = (newVersion: string): void => {
  userStatsCache.updateVersion(newVersion);
  moduleCache.updateVersion(newVersion);
  quizCache.updateVersion(newVersion);
  console.log(`🔄 All cache versions updated to: ${newVersion}`);
};




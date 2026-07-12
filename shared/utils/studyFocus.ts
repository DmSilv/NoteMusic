import AsyncStorage from '@react-native-async-storage/async-storage';
import moduleService from '@/services/moduleService';
import { Module } from '@/services/api';
import { getCategoryDisplayName } from '@/shared/constants/CategoryNames';

export type StudyFocus = {
  moduleId: string;
  moduleTitle: string;
  category: string;
  categoryName: string;
  level?: string;
};

const storageKey = (userId?: string | null) =>
  userId ? `@NoteMusic:studyFocus:${userId}` : '@NoteMusic:studyFocus';

export async function getStudyFocus(userId?: string | null): Promise<StudyFocus | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudyFocus;
    if (!parsed?.moduleId || !parsed?.moduleTitle) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setStudyFocus(userId: string | null | undefined, focus: StudyFocus): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(focus));
}

export async function clearStudyFocus(userId?: string | null): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}

export function toStudyFocus(module: Module): StudyFocus {
  const category = typeof module.category === 'string' ? module.category : 'geral';
  return {
    moduleId: module.id,
    moduleTitle: module.title,
    category,
    categoryName: getCategoryDisplayName(category),
    level: module.level,
  };
}

/** Até 8 módulos incompletos, priorizando o nível do usuário. */
export async function getFocusCandidates(
  userId: string,
  userLevel?: string | null
): Promise<Module[]> {
  const modules = await moduleService.getAllModules();
  const completed = new Set(await moduleService.getCompletedModules(userId));

  const incomplete = modules.filter((module) => {
    const id = module.id || (module as { _id?: string })._id;
    if (!id) return false;
    if (completed.has(id)) return false;
    if (Array.isArray(module.completedBy) && module.completedBy.includes(userId)) return false;
    return true;
  });

  const levelNorm = (userLevel || 'aprendiz').toLowerCase();
  const sameLevel = incomplete.filter(
    (module) => (module.level || 'aprendiz').toLowerCase() === levelNorm
  );
  const pool = sameLevel.length > 0 ? sameLevel : incomplete;

  return pool
    .map((module) => ({
      ...module,
      id: module.id || (module as { _id?: string })._id || '',
    }))
    .filter((module) => module.id)
    .slice(0, 8);
}

/** Monta o param `category` esperado por ContentListCategory. */
export async function buildCategoryNavParam(focus: StudyFocus) {
  const all = await moduleService.getAllModules();
  const modules = all
    .filter((module) => (module.category || 'geral') === focus.category)
    .map((module) => ({
      ...module,
      id: module.id || (module as { _id?: string })._id || '',
    }))
    .filter((module) => module.id);

  return {
    name: focus.categoryName || getCategoryDisplayName(focus.category),
    modules: modules.length > 0 ? modules : undefined,
  };
}

export function isPendingFocus(focus: StudyFocus | null | undefined): boolean {
  return !!focus?.moduleId?.startsWith('pending:');
}

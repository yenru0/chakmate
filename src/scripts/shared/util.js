import { categories } from './categories.js';

export function getExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export function buildTargetPath(originalPath, targetFolder) {
  if (!targetFolder) return null;
  return `${targetFolder}/${originalPath}`;
}

export function analyzeFileName(filename) {
  const ext = getExtension(filename);
  const cat = categories.resolve(ext);
  return {
    filename,
    category: cat.key,
    classified: cat.folder !== null,
    targetFolder: cat.folder,
  };
}

export function classifyFile(file) {
  const base = typeof file === 'string'
    ? { name: file, path: file }
    : { name: file.name || file.path || '', path: file.path || file.name || '' };
  return {
    ...base,
    ...analyzeFileName(base.name || base.path),
    targetPath: buildTargetPath(base.path, categories.resolve(getExtension(base.name || base.path)).folder),
  };
}

export function classifyFiles(files) {
  return files.map(classifyFile);
}

export function groupFilesByTargetFolder(classifiedFiles) {
  const groups = { unclassified: [] };
  for (const f of classifiedFiles) {
    const key = f.targetFolder || 'unclassified';
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }
  return groups;
}

export function computeStats(classifiedFiles) {
  const stats = {
    totalCount: classifiedFiles.length,
    classifiedCount: 0,
    unclassifiedCount: 0,
    byCategory: {},
  };
  for (const f of classifiedFiles) {
    if (f.classified) stats.classifiedCount++;
    else stats.unclassifiedCount++;
    stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
  }
  return stats;
}

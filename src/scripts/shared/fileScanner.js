import { readDir, stat } from '@tauri-apps/plugin-fs';
import { FILE_TYPES } from '../main.js';

export async function getFileTypeFromName(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const typeMap = {
    pdf: 'pdf', doc: 'doc', docx: 'doc', txt: 'doc',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image',
    mp4: 'video', mov: 'video', avi: 'video', mkv: 'video',
    xlsx: 'excel', xls: 'excel', csv: 'excel',
    pptx: 'ppt', ppt: 'ppt',
    zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
  };
  return typeMap[ext] || 'doc';
}

export async function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export async function scanDirectory(path) {
  try {
    const entries = await readDir(path);
    const files = [];
    let id = 1;

    for (const entry of entries) {
      if (entry.isFile) {
        const fullPath = `${path}/${entry.name}`;
        try {
          const fileStat = await stat(fullPath);
          const type = await getFileTypeFromName(entry.name);
          files.push({
            id: id++,
            name: entry.name,
            path: fullPath,
            type,
            size: await formatFileSize(fileStat.size),
            sizeBytes: fileStat.size,
            date: new Date(fileStat.mtime * 1000).toISOString().split('T')[0],
          });
        } catch (e) {
          files.push({
            id: id++,
            name: entry.name,
            path: fullPath,
            type: await getFileTypeFromName(entry.name),
            size: 'Unknown',
            sizeBytes: 0,
            date: 'Unknown',
          });
        }
      }
    }

    return files;
  } catch (e) {
    console.error('Failed to scan directory:', e);
    return [];
  }
}

export async function buildFileTree(path) {
  try {
    const entries = await readDir(path);
    const folders = [];
    const files = [];

    for (const entry of entries) {
      if (entry.isDirectory) {
        folders.push({ name: entry.name, type: 'folder', path: `${path}/${entry.name}` });
      } else {
        const fullPath = `${path}/${entry.name}`;
        const fileStat = await stat(fullPath);
        const type = await getFileTypeFromName(entry.name);
        files.push({ name: entry.name, type, meta: await formatFileSize(fileStat.size), path: fullPath });
      }
    }

    return { folders, files };
  } catch (e) {
    console.error('Failed to build file tree:', e);
    return { folders: [], files: [] };
  }
}

export function getFileTypeInfo(type) {
  return FILE_TYPES[type] || { label: 'File', color: '#6366f1', icon: 'document' };
}
export const FILE_CATEGORIES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation',
  CODE: 'code',
  OTHER: 'other'
};

export const CATEGORY_EXTENSIONS = {
  [FILE_CATEGORIES.IMAGE]: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'raw', 'cr2', 'nef', 'arw'],
  [FILE_CATEGORIES.DOCUMENT]: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
  [FILE_CATEGORIES.VIDEO]: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'flv', 'webm', 'm4v', 'mpeg'],
  [FILE_CATEGORIES.AUDIO]: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'aiff'],
  [FILE_CATEGORIES.ARCHIVE]: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'],
  [FILE_CATEGORIES.SPREADSHEET]: ['xls', 'xlsx', 'csv', 'ods', 'numbers'],
  [FILE_CATEGORIES.PRESENTATION]: ['ppt', 'pptx', 'odp', 'key'],
  [FILE_CATEGORIES.CODE]: ['js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'md']
};

export const NAME_PATTERNS = {
  SCREENSHOT: /^screenshot/i,
  IMG: /^img[_-]?/i,
  PHOTO: /^photo/i,
  DSC: /^dsc/i,
  PIC: /^pic/i,
  CAMERA: /^cam[_-]?\d+/i,
  WA: /^wa\d+/i,
  RECEIVED: /^received/i,
  VID_: /^vid_/i,
  VIDEO: /^video/i,
  AUDIO: /^audio/i,
  MUSIC: /^music/i,
  RECORDING: /^recording/i,
  DOCUMENT: /^doc/i,
  NOTE: /^note/i,
  BACKUP: /^backup/i,
  ARCHIVE: /^archive/i,
  COPY: /^copy/i,
  OLD: /^old/i,
  TEMP: /^temp/i,
  DRAFT: /^draft/i,
  FINAL: /^final/i,
  V[0-9]+: /^v\d+/i,
  DRAFT: /^draft/i
};

export function getExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export function getCategoryByExtension(ext) {
  for (const [category, extensions] of Object.entries(CATEGORY_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return FILE_CATEGORIES.OTHER;
}

export function analyzeFileName(filename) {
  const result = {
    filename,
    category: null,
    pattern: null,
    year: null,
    month: null,
    suggestedFolder: null
  };

  const ext = getExtension(filename);
  result.category = getCategoryByExtension(ext);

  for (const [patternName, regex] of Object.entries(NAME_PATTERNS)) {
    if (regex.test(filename)) {
      result.pattern = patternName;
      break;
    }
  }

  const dateMatch = filename.match(/(20\d{2})[_-]?(\d{2})?[_-]?(\d{2})?|(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    if (dateMatch[1]) {
      result.year = parseInt(dateMatch[1]);
      if (dateMatch[2]) result.month = parseInt(dateMatch[2]);
    } else if (dateMatch[4]) {
      result.year = parseInt(dateMatch[4]);
      if (dateMatch[5]) result.month = parseInt(dateMatch[5]);
    }
  }

  if (result.pattern && result.year) {
    result.suggestedFolder = suggestFolderByPattern(result.pattern, result.category, result.year, result.month);
  } else if (result.year) {
    result.suggestedFolder = result.year.toString();
  }

  return result;
}

export function suggestFolderByPattern(pattern, category, year, month) {
  if (year && month) {
    return `${year}/${String(month).padStart(2, '0')}`;
  }
  if (year) {
    return year.toString();
  }

  const patternFolders = {
    SCREENSHOT: 'Screenshots',
    IMG: 'Photos',
    PHOTO: 'Photos',
    DSC: 'Photos',
    PIC: 'Photos',
    CAMERA: 'Photos',
    WA: 'WhatsApp',
    RECEIVED: 'Downloads',
    VID_: 'Videos',
    VIDEO: 'Videos',
    AUDIO: 'Audio',
    MUSIC: 'Music',
    RECORDING: 'Recordings',
    DOCUMENT: 'Documents',
    NOTE: 'Notes',
    BACKUP: 'Backups',
    ARCHIVE: 'Archives',
    COPY: 'Copies',
    OLD: 'Old',
    TEMP: 'Temporary',
    DRAFT: 'Drafts',
    FINAL: 'Final'
  };

  return patternFolders[pattern] || getCategoryDefaultFolder(category);
}

export function getCategoryDefaultFolder(category) {
  const folders = {
    [FILE_CATEGORIES.IMAGE]: 'Images',
    [FILE_CATEGORIES.DOCUMENT]: 'Documents',
    [FILE_CATEGORIES.VIDEO]: 'Videos',
    [FILE_CATEGORIES.AUDIO]: 'Audio',
    [FILE_CATEGORIES.ARCHIVE]: 'Archives',
    [FILE_CATEGORIES.SPREADSHEET]: 'Spreadsheets',
    [FILE_CATEGORIES.PRESENTATION]: 'Presentations',
    [FILE_CATEGORIES.CODE]: 'Code',
    [FILE_CATEGORIES.OTHER]: 'Other'
  };
  return folders[category] || 'Other';
}

export function classifyFiles(files) {
  return files.map(file => {
    if (typeof file === 'string') {
      return analyzeFileName(file);
    }
    return {
      ...file,
      ...analyzeFileName(file.name || file.path || '')
    };
  });
}

export function groupFilesBySuggestedFolder(classifiedFiles) {
  const groups = {};

  for (const file of classifiedFiles) {
    const folder = file.suggestedFolder || getCategoryDefaultFolder(file.category);
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(file);
  }

  return groups;
}

export function suggestFolderStructure(files) {
  const classified = classifyFiles(files);
  const grouped = groupFilesBySuggestedFolder(classified);

  const structure = [];
  for (const [folderName, folderFiles] of Object.entries(grouped)) {
    structure.push({
      name: folderName,
      type: 'folder',
      children: folderFiles.map(f => ({
        name: f.filename || f.name,
        type: f.category,
        meta: f.size || null
      }))
    });
  }

  return structure;
}

export function calculateSimilarity(file1, file2) {
  let score = 0;

  if (file1.category === file2.category) score += 3;
  if (file1.pattern === file2.pattern) score += 2;
  if (file1.year === file2.year) score += 2;
  if (file1.month === file2.month) score += 1;
  if (file1.suggestedFolder === file2.suggestedFolder) score += 2;

  const ext1 = getExtension(file1.filename || file1.name || '');
  const ext2 = getExtension(file2.filename || file2.name || '');
  if (ext1 === ext2) score += 1;

  return score;
}

export function findRelatedFiles(targetFile, allFiles, threshold = 3) {
  const classified = classifyFiles([targetFile])[0];
  
  return allFiles
    .filter(f => f !== targetFile)
    .map(f => ({
      file: f,
      similarity: calculateSimilarity(classified, analyzeFileName(f.name || f.path || f.filename || ''))
    }))
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}
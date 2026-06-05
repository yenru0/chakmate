const SYSTEM_CATEGORIES = {
  image:        { folder: 'Chak__Images',        label: '사진',        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tiff'] },
  document:     { folder: 'Chak__Documents',     label: '문서',        extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'epub'] },
  video:        { folder: 'Chak__Videos',        label: '비디오',      extensions: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'flv', 'webm', 'm4v', 'mpeg'] },
  audio:        { folder: 'Chak__Audio',         label: '오디오',      extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'aiff'] },
  archive:      { folder: 'Chak__Archives',      label: '압축파일',    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'] },
  spreadsheet:  { folder: 'Chak__Spreadsheets',  label: '스프레드시트', extensions: ['xls', 'xlsx', 'csv', 'ods', 'numbers'] },
  presentation: { folder: 'Chak__Presentations', label: '프레젠테이션', extensions: ['ppt', 'pptx', 'odp', 'key'] },
  code:         { folder: 'Chak__Code',          label: '코드',        extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'md'] },
  trash:        { folder: 'Chak__Trash',         label: '휴지통',      extensions: [] },
};

const userCategories = {};

function findByExt(map, ext) {
  const lower = ext.toLowerCase();
  for (const [key, cfg] of Object.entries(map)) {
    if (cfg.extensions?.includes(lower)) return [key, cfg];
  }
  return null;
}

function findByFolder(map, folder) {
  for (const [key, cfg] of Object.entries(map)) {
    if (cfg.folder === folder) return [key, cfg];
  }
  return null;
}

export const categories = {
  resolve(ext) {
    const userHit = findByExt(userCategories, ext);
    if (userHit) {
      const [key, cfg] = userHit;
      return { key, folder: cfg.folder, label: cfg.label || key, extensions: cfg.extensions, source: 'user' };
    }
    const sysHit = findByExt(SYSTEM_CATEGORIES, ext);
    if (sysHit) {
      const [key, cfg] = sysHit;
      return { key, folder: cfg.folder, label: cfg.label, extensions: cfg.extensions, source: 'system' };
    }
    return { key: 'other', folder: null, label: '미분류', extensions: [], source: 'system' };
  },

  labelForFolder(folder) {
    if (!folder) return '미분류';
    const sysHit = findByFolder(SYSTEM_CATEGORIES, folder);
    if (sysHit) return sysHit[1].label;
    const userHit = findByFolder(userCategories, folder);
    if (userHit) return userHit[1].label || userHit[0];
    return folder;
  },

  register(key, config) {
    if (!key || !config?.folder) {
      throw new Error('[categories] register requires { key, folder, extensions? }');
    }
    if (SYSTEM_CATEGORIES[key]) {
      console.warn(`[categories] "${key}" shadows system category`);
    }
    userCategories[key] = {
      folder: config.folder,
      extensions: config.extensions || [],
    };
  },

  unregister(key) {
    delete userCategories[key];
  },

  all() {
    const merged = {};
    for (const [k, v] of Object.entries(SYSTEM_CATEGORIES)) merged[k] = { ...v, source: 'system' };
    for (const [k, v] of Object.entries(userCategories)) merged[k] = { ...v, source: 'user' };
    return merged;
  },

  _system: SYSTEM_CATEGORIES,
  _user: userCategories,
};

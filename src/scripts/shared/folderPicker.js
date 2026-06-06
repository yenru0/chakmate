import { open } from '@tauri-apps/plugin-dialog';

export async function pickScanFolder() {
  return await open({
    directory: true,
    multiple: false,
    title: '정리할 폴더 선택',
  });
}

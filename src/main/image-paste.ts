import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface PasteResult {
  success: boolean;
  relativePath: string;
  error?: string;
}

export async function handleImagePaste(
  filePath: string,
  imageBuffer: Buffer,
  folderTemplate = '{filename}_files',
): Promise<PasteResult> {
  try {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const basename = path.basename(filePath, ext);

    // Replace {filename} placeholder in template, default is "{filename}_files"
    // Example: {filename}_files → my-notes_files
    //          assets/{filename} → assets/my-notes
    const folderName = folderTemplate.replace(/\{filename\}/g, basename) || `${basename}_files`;
    const assetsDir = path.join(dir, folderName);
    await fs.mkdir(assetsDir, { recursive: true });

    // Generate filename with timestamp + short uuid
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const shortId = uuidv4().replace(/-/g, '').substring(0, 8);
    const fileName = `${timestamp}_${shortId}.png`;
    const fullPath = path.join(assetsDir, fileName);

    await fs.writeFile(fullPath, imageBuffer);

    const relativePath = `./${folderName}/${fileName}`;

    return { success: true, relativePath };
  } catch (e) {
    return {
      success: false,
      relativePath: '',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

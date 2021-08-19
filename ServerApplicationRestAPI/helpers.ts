import { renderFileToString } from "./deps.ts";
export const fileExists = async (fileName: string): Promise<boolean> => {
  try {
    const statis = await Deno.lstat(fileName);
    return statis && statis.isFile;
  } catch (error) {
    if (error && error instanceof Deno.errors.NotFound) {
      return false;
    } else throw error;
  }
};

export const renderView = async (view: string, params: object = {}) => {
  return await renderFileToString(`${Deno.cwd()}/views/${view}.ejs`, params);
};

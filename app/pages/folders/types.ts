export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
}

export interface FolderItem {
  id: string;
  name: string;
  x: number;
  y: number;
  isOpen: boolean;
  parentId: string | null;
  children: string[];
  files: FileItem[];
}

export interface Position {
  x: number;
  y: number;
}

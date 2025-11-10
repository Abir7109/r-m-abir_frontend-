export type Project = {
  _id?: string;
  title: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  repoUrl?: string;
  tags?: string[];
  createdAt?: string;
};

export type GalleryItem = {
  _id?: string;
  url: string; // path or absolute URL
  caption?: string;
  date?: string;
  width?: number;
  height?: number;
};

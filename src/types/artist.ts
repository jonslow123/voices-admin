export interface SocialLink {
  platform: string;
  url: string;
}

export interface Show {
  _id?: string;
  title: string;
  description?: string;
  date: Date | string;
  duration?: number;
  mixcloudUrl?: string;
  soundcloudUrl?: string;
  imageUrl?: string;
  playCount?: number;
  mixcloudKey?: string;
  soundcloudId?: string;
}

export interface Artist {
  _id?: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  bannerUrl?: string;
  genres: string[];
  shows: Show[];
  mixcloudUsername?: string;
  soundcloudUsername?: string;
  isActive: boolean;
  isResident: boolean;
  featured: boolean;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
} 
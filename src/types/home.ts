export type ContentType = 'story' | 'photo' | 'review' | 'place';

export type TrendCategory = 'hotplace' | 'hobby' | 'trend';

export interface TrendItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: TrendCategory;
}

export interface PostLink {
  url: string;
  title?: string;
}

export interface Board {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  sort_order: number;
  owner_id?: string | null;
  is_user_created?: boolean;
  icon?: string | null;
  created_at?: string;
}

export interface PostBoardRef {
  slug: string;
  name: string;
  cover_image?: string | null;
}

export interface PostWithBoard {
  id: string;
  board_id: string;
  title: string;
  content: string | null;
  author_name: string;
  author_id: string | null;
  is_secret: boolean;
  view_count: number;
  like_count?: number;
  content_type: ContentType;
  rating: number | null;
  location: string | null;
  created_at: string;
  images?: string[] | null;
  videos?: string[] | null;
  tags?: string[] | null;
  links?: PostLink[] | null;
  board: PostBoardRef | null;
  comment_count?: number;
}

export interface SmallTalkMessage {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover_image: string;
  icon: string;
  board_slugs: string[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  tag: string;
  image: string;
}

export interface Photo {
  id: string;
  src: string;
  title: string;
  category: string;
}

export interface Review {
  id: string;
  title: string;
  content: string;
  author_name: string;
  rating: number;
  category: string;
  image: string;
  created_at: string;
}

export interface Place {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  nickname: string | null;
  content: string;
  author_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Profile {
  id: string;
  username: string | null;
  nickname: string | null;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}
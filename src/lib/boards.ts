import { supabase } from '@/lib/supabase';
import type { Board } from '@/types/home';

/** 게시판 조회 시 공통으로 쓰는 컬럼 목록 */
export const BOARD_SELECT =
  'id, slug, name, description, cover_image, sort_order, owner_id, is_user_created, icon, created_at';

/** 게시판 아이콘으로 고를 수 있는 프리셋 (Remix Icon) */
export const BOARD_ICON_PRESETS = [
  'ri-folder-line',
  'ri-heart-line',
  'ri-camera-lens-line',
  'ri-gamepad-line',
  'ri-music-2-line',
  'ri-book-open-line',
  'ri-restaurant-2-line',
  'ri-suitcase-line',
  'ri-plant-line',
  'ri-hammer-line',
  'ri-palette-line',
  'ri-run-line',
  'ri-movie-line',
  'ri-cpu-line',
  'ri-cup-line',
  'ri-moon-line',
];

export const DEFAULT_BOARD_ICON = 'ri-folder-line';

/** 회원이 만든 게시판은 기본 게시판(1~14, 지역 20/60) 뒤에 붙도록 정렬값을 크게 준다. */
export const USER_BOARD_SORT_ORDER = 100;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

/** 이름 기반 slug에 임의 접미사를 붙여 중복을 피한다. (한글 이름이면 board-xxxxx 형태) */
export async function makeUniqueBoardSlug(name: string): Promise<string> {
  const base = slugify(name) || 'board';
  for (let i = 0; i < 6; i += 1) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    const { data } = await supabase.from('boards').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export interface CreateBoardInput {
  name: string;
  description: string;
  icon?: string | null;
  coverImage?: string | null;
  ownerId: string;
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
  icon?: string | null;
  coverImage?: string | null;
}

/** 게시판 정보(이름·소개·아이콘·대표 이미지)를 수정한다. 본인 게시판만 수정 가능(RLS). */
export async function updateBoard(boardId: string, input: UpdateBoardInput): Promise<Board> {
  const patch: Record<string, string | null> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.icon !== undefined) patch.icon = input.icon || DEFAULT_BOARD_ICON;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage;

  const { data, error } = await supabase
    .from('boards')
    .update(patch)
    .eq('id', boardId)
    .select(BOARD_SELECT)
    .single();
  if (error) throw error;
  return data as Board;
}

/** 게시판을 삭제한다. 게시판 안의 글도 함께 삭제된다(FK CASCADE). 본인 게시판만 삭제 가능(RLS). */
export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase.from('boards').delete().eq('id', boardId);
  if (error) throw error;
}

/** 회원이 직접 만든 게시판이며, 현재 로그인한 본인 소유인지 확인한다. */
export function canManageBoard(
  board: Board | null | undefined,
  userId: string | null | undefined,
): boolean {
  if (!board || !userId) return false;
  return board.is_user_created === true && board.owner_id === userId;
}

export async function createBoard(input: CreateBoardInput): Promise<Board> {
  const slug = await makeUniqueBoardSlug(input.name);
  const { data, error } = await supabase
    .from('boards')
    .insert({
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      icon: input.icon || DEFAULT_BOARD_ICON,
      cover_image: input.coverImage || null,
      owner_id: input.ownerId,
      is_user_created: true,
      sort_order: USER_BOARD_SORT_ORDER,
    })
    .select(BOARD_SELECT)
    .single();
  if (error) throw error;
  return data as Board;
}

/** 회원이 만든 게시판만, 최신 생성순으로 정렬 */
export function sortUserBoards(boards: Board[]): Board[] {
  return boards
    .filter((b) => b.is_user_created)
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
}
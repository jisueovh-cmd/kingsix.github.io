import { useEffect, useMemo, useState } from 'react';
import type { Comment } from '@/types/home';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';

interface CommentSectionProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  onAdd: (nickname: string, content: string, parentId?: string | null) => Promise<boolean>;
  onUpdate: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  onRetry: () => void;
}

export default function CommentSection({
  comments,
  loading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  onRetry,
}: CommentSectionProps) {
  const { user, profile } = useAuth();
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // 로그인한 회원은 닉네임을 자동으로 채워줍니다.
  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
  }, [profile]);

  // 답글 트리 구성 (부모 id → 자식 댓글 목록)
  const childrenMap = useMemo(() => {
    const map = new Map<string, Comment[]>();
    for (const c of comments) {
      if (c.parent_id) {
        const list = map.get(c.parent_id) ?? [];
        list.push(c);
        map.set(c.parent_id, list);
      }
    }
    return map;
  }, [comments]);

  const roots = useMemo(() => comments.filter((c) => !c.parent_id), [comments]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await onAdd(nickname, trimmed, null);
      setContent('');
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : '댓글을 등록하지 못했어요. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="comments"
      className="scroll-mt-24 rounded-lg border border-background-200 bg-background-50 px-5 py-6 md:px-7 md:py-7"
    >
      <div className="flex items-center gap-2">
        <i className="ri-chat-3-line text-lg text-accent-600" />
        <h2 className="font-heading text-base font-bold text-foreground-950">댓글</h2>
        <span className="rounded-full bg-background-100 px-2 py-0.5 text-xs text-foreground-500">
          {comments.length}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="닉네임 (선택)"
          className="w-full rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none placeholder:text-foreground-400 focus:border-primary-400"
        />
        {user && profile?.nickname && (
          <p className="mt-1 flex items-center gap-1 text-xs text-foreground-500">
            <i className="ri-user-smile-line" />
            로그인한 닉네임이 자동으로 입력됐어요.
          </p>
        )}
        <div className="flex items-start gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="따뜻한 응원이나 생각을 남겨보세요."
            className="w-full resize-none rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none placeholder:text-foreground-400 focus:border-primary-400"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || !content.trim()}
            className="mt-0 flex h-[42px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-medium text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {sending ? <i className="ri-loader-4-line animate-spin" /> : '등록'}
          </button>
        </div>
        <p className="text-right text-[10px] text-foreground-400">{content.length}/500</p>
        {sendError && <p className="text-xs text-primary-700">{sendError}</p>}
      </div>

      <div className="mt-6">
        {loading && (
          <p className="py-6 text-center text-sm text-foreground-500">댓글을 불러오는 중...</p>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-background-100 px-6 py-8 text-center">
            <p className="text-sm text-foreground-600">댓글을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={onRetry}
              className="whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-50 cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        )}
        {!loading && !error && comments.length === 0 && (
          <p className="py-8 text-center text-sm text-foreground-500">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </p>
        )}
        {!loading &&
          !error &&
          roots.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              childrenMap={childrenMap}
              currentUserId={user?.id ?? null}
              profileNickname={profile?.nickname ?? null}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={0}
            />
          ))}
      </div>
    </section>
  );
}

interface CommentThreadProps {
  comment: Comment;
  childrenMap: Map<string, Comment[]>;
  currentUserId: string | null;
  profileNickname: string | null;
  onAdd: CommentSectionProps['onAdd'];
  onUpdate: CommentSectionProps['onUpdate'];
  onDelete: CommentSectionProps['onDelete'];
  depth: number;
}

function CommentThread({
  comment,
  childrenMap,
  currentUserId,
  profileNickname,
  onAdd,
  onUpdate,
  onDelete,
  depth,
}: CommentThreadProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = Boolean(
    currentUserId && comment.author_id && comment.author_id === currentUserId,
  );
  const children = childrenMap.get(comment.id) ?? [];
  const edited = Boolean(comment.updated_at);

  const handleReply = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await onAdd(profileNickname ?? '', trimmed, comment.id);
      setReplyContent('');
      setReplying(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '답글을 등록하지 못했어요.');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await onUpdate(comment.id, trimmed);
      setEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '댓글을 수정하지 못했어요.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await onDelete(comment.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '댓글을 삭제하지 못했어요.');
      setBusy(false);
    }
  };

  return (
    <div className={depth === 0 ? 'border-t border-background-100 py-4 first:border-t-0' : 'py-3'}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
          <i className="ri-user-3-line" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground-800">
              {comment.nickname ?? '익명'}
            </span>
            <span className="text-xs text-foreground-400">{timeAgo(comment.created_at)}</span>
            {edited && <span className="text-xs text-foreground-400">· 수정됨</span>}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-400"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={busy || !editContent.trim()}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {busy ? <i className="ri-loader-4-line animate-spin" /> : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={busy}
                  className="whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground-700">
              {comment.content}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setReplying(!replying);
                setEditing(false);
                setConfirming(false);
                setActionError(null);
              }}
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-foreground-500 transition-colors hover:text-primary-700 cursor-pointer"
            >
              <i className="ri-reply-line" />
              답글
            </button>
            {isOwner && !editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setEditContent(comment.content);
                  setReplying(false);
                  setConfirming(false);
                  setActionError(null);
                }}
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-foreground-500 transition-colors hover:text-primary-700 cursor-pointer"
              >
                <i className="ri-edit-line" />
                수정
              </button>
            )}
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setConfirming(true);
                  setReplying(false);
                  setEditing(false);
                  setActionError(null);
                }}
                className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-foreground-500 transition-colors hover:text-primary-700 cursor-pointer"
              >
                <i className="ri-delete-bin-line" />
                삭제
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder={`${comment.nickname ?? '익명'}님에게 답글 남기기`}
                className="w-full resize-none rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm text-foreground-900 outline-none placeholder:text-foreground-400 focus:border-primary-400"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={busy || !replyContent.trim()}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {busy ? <i className="ri-loader-4-line animate-spin" /> : '답글 등록'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplying(false);
                    setReplyContent('');
                  }}
                  disabled={busy}
                  className="whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {confirming && (
            <div className="mt-2 rounded-md border border-background-200 bg-background-100/60 p-3">
              <p className="text-xs text-foreground-700">
                정말 삭제할까요?
                {children.length > 0 ? ` 답글 ${children.length}개도 함께 삭제돼요.` : ''}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {busy ? <i className="ri-loader-4-line animate-spin" /> : '삭제'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                  className="whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-xs font-medium text-foreground-700 transition-colors hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-primary-700">
              <i className="ri-error-warning-line" />
              {actionError}
            </p>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="mt-2 ml-4 border-l-2 border-background-100 pl-3 md:ml-6 md:pl-4">
          {children.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              childrenMap={childrenMap}
              currentUserId={currentUserId}
              profileNickname={profileNickname}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { isHtmlEmpty, sanitizeHtml } from '@/lib/sanitizeHtml';
import type { Board, ContentType, PostLink, PostWithBoard } from '@/types/home';
import ImageUploader from '@/pages/write/components/ImageUploader';
import VideoUploader from '@/pages/write/components/VideoUploader';
import RichTextEditor from '@/pages/write/components/RichTextEditor';
import TagInput from '@/pages/write/components/TagInput';
import LinkInput from '@/pages/write/components/LinkInput';
import PostPreviewModal, { type PreviewData } from '@/pages/write/components/PostPreviewModal';

interface WriteFormProps {
  boards: Board[];
  initialSlug?: string;
  editPost?: PostWithBoard | null;
}

const CONTENT_TYPES: { key: ContentType; label: string; icon: string; hint: string }[] = [
  { key: 'story', label: '이야기', icon: 'ri-chat-smile-2-line', hint: '자유로운 취미 이야기' },
  { key: 'photo', label: '사진', icon: 'ri-camera-line', hint: '사진으로 남기는 순간' },
  { key: 'review', label: '리뷰', icon: 'ri-star-line', hint: '별점과 함께 남기는 후기' },
  { key: 'place', label: '장소', icon: 'ri-map-pin-line', hint: '추천하고 싶은 장소' },
];

export default function WriteForm({ boards, initialSlug, editPost }: WriteFormProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const nickPrefilledRef = useRef(false);

  const [boardId, setBoardId] = useState('');
  const [contentType, setContentType] = useState<ContentType>('story');
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [location, setLocation] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<PostLink[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEditing = Boolean(editPost);

  useEffect(() => {
    if (!boardId && boards.length > 0) {
      const target = boards.find((b) => b.slug === initialSlug) ?? boards[0];
      setBoardId(target.id);
    }
  }, [boards, boardId, initialSlug]);

  useEffect(() => {
    if (!nickPrefilledRef.current && profile?.nickname) {
      setNickname(profile.nickname);
      nickPrefilledRef.current = true;
    }
  }, [profile]);

  useEffect(() => {
    if (!editPost) return;
    setBoardId(editPost.board_id);
    setContentType(editPost.content_type);
    setNickname(editPost.author_name ?? '');
    setTitle(editPost.title ?? '');
    setContent(editPost.content ?? '');
    setRating(editPost.rating ?? 5);
    setLocation(editPost.location ?? '');
    setIsSecret(Boolean(editPost.is_secret));
    setImages(Array.isArray(editPost.images) ? editPost.images : []);
    setVideos(Array.isArray(editPost.videos) ? editPost.videos : []);
    setTags(Array.isArray(editPost.tags) ? editPost.tags : []);
    setLinks(Array.isArray(editPost.links) ? editPost.links : []);
    nickPrefilledRef.current = true;
  }, [editPost]);

  const selectedBoard = boards.find((b) => b.id === boardId);
  const contentTypeLabel =
    CONTENT_TYPES.find((t) => t.key === contentType)?.label ?? '이야기';

  const previewData: PreviewData = {
    title,
    author: nickname,
    contentType,
    contentTypeLabel,
    rating,
    location: contentType === 'place' ? location : '',
    content,
    images,
    videos,
    tags,
    links,
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!boardId) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (isHtmlEmpty(content)) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (contentType === 'place' && !location.trim()) {
      setError('장소명 또는 위치를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const targetSlug = selectedBoard?.slug ?? initialSlug ?? '';

      if (editPost) {
        if (!user || editPost.author_id !== user.id) {
          setError('본인이 작성한 글만 수정할 수 있어요.');
          setSubmitting(false);
          return;
        }
        const res = await supabase
          .from('posts')
          .update({
            board_id: boardId,
            title: title.trim(),
            content: sanitizeHtml(content),
            author_name: nickname.trim() || '익명',
            is_secret: isSecret,
            content_type: contentType,
            rating: contentType === 'review' ? rating : null,
            location: contentType === 'place' ? location.trim() : null,
            images: images.length > 0 ? images : [],
            videos: videos.length > 0 ? videos : [],
            tags: tags.length > 0 ? tags : [],
            links: links.length > 0 ? links : [],
          })
          .eq('id', editPost.id)
          .eq('author_id', user.id);
        if (res.error) throw res.error;

        setSuccess(true);
        window.setTimeout(() => {
          navigate(`/board/${targetSlug}/${editPost.id}`);
        }, 900);
      } else {
        const res = await supabase.from('posts').insert({
          board_id: boardId,
          title: title.trim(),
          content: sanitizeHtml(content),
          author_name: nickname.trim() || '익명',
          author_id: user?.id ?? null,
          is_secret: isSecret,
          content_type: contentType,
          rating: contentType === 'review' ? rating : null,
          location: contentType === 'place' ? location.trim() : null,
          images: images.length > 0 ? images : [],
          videos: videos.length > 0 ? videos : [],
          tags: tags.length > 0 ? tags : [],
          links: links.length > 0 ? links : [],
        });
        if (res.error) throw res.error;

        setSuccess(true);
        window.setTimeout(() => {
          navigate(`/board/${targetSlug}`);
        }, 900);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '글을 등록하지 못했습니다.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-background-200 bg-background-50 px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
          <i className="ri-check-line text-3xl" />
        </span>
        <h2 className="mt-5 font-heading text-xl font-bold text-foreground-950">
          {isEditing ? '글이 수정됐어요!' : '글이 등록됐어요!'}
        </h2>
        <p className="mt-2 text-sm text-foreground-600">
          {isEditing
            ? '수정한 글로 이동합니다.'
            : `${selectedBoard?.name ?? '게시판'}으로 이동합니다.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-950">
          <i className="ri-folder-open-line text-primary-600" />
          카테고리 선택
        </h2>
        <p className="mt-1 text-xs text-foreground-500">글을 올릴 게시판을 골라주세요.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {boards.map((board) => {
            const active = board.id === boardId;
            return (
              <button
                key={board.id}
                type="button"
                onClick={() => setBoardId(board.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary-500 font-semibold text-background-50'
                    : 'bg-background-100 text-foreground-700 hover:bg-background-200'
                }`}
              >
                {board.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-foreground-950">
          <i className="ri-layout-grid-line text-primary-600" />
          글 유형
        </h2>
        <p className="mt-1 text-xs text-foreground-500">
          유형을 고르면 탐색 페이지의 해당 탭에 자동으로 반영돼요.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CONTENT_TYPES.map((type) => {
            const active = contentType === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setContentType(type.key)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-4 text-center transition-colors cursor-pointer ${
                  active
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-background-200 bg-background-50 hover:border-background-300 hover:bg-background-100'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    active ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-600'
                  }`}
                >
                  <i className={type.icon} />
                </span>
                <span
                  className={`text-sm font-semibold ${
                    active ? 'text-primary-700' : 'text-foreground-800'
                  }`}
                >
                  {type.label}
                </span>
                <span className="text-[10px] text-foreground-500">{type.hint}</span>
              </button>
            );
          })}
        </div>

        {contentType === 'review' && (
          <div className="mt-4 rounded-lg bg-background-100 p-4">
            <span className="block text-sm font-semibold text-foreground-900">별점</span>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value}점`}
                    className="cursor-pointer"
                  >
                    <i
                      className={`text-2xl ${
                        value <= rating ? 'text-amber-500 ri-star-fill' : 'text-foreground-300 ri-star-line'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm font-medium text-foreground-700">{rating}점</span>
            </div>
          </div>
        )}

        {contentType === 'place' && (
          <div className="mt-4 rounded-lg bg-background-100 p-4">
            <label
              htmlFor="write-location"
              className="block text-sm font-semibold text-foreground-900"
            >
              위치
            </label>
            <input
              id="write-location"
              name="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              placeholder="예) 서울 마포구 골목 미식거리"
              className="mt-2 w-full rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            />
            {location.trim() && (
              <div className="mt-3 overflow-hidden rounded-md border border-background-200">
                <iframe
                  title="위치 지도 미리보기"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`}
                  className="h-[220px] w-full border-0"
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <label
          htmlFor="write-title"
          className="block font-heading text-sm font-bold text-foreground-950"
        >
          제목
        </label>
        <input
          id="write-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder={
            contentType === 'place'
              ? '장소 이름을 입력해주세요'
              : contentType === 'review'
                ? '리뷰 제목을 입력해주세요'
                : '제목을 입력해주세요'
          }
          className="mt-2 w-full rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
        />
        <div className="mt-1 text-right text-xs text-foreground-400">{title.length}/100</div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <label
          htmlFor="write-nickname"
          className="block font-heading text-sm font-bold text-foreground-950"
        >
          닉네임
        </label>
        <input
          id="write-nickname"
          name="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder="비워두면 '익명'으로 표시돼요"
          className="mt-2 w-full rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
        />
        {user && profile?.nickname && (
          <p className="mt-1 flex items-center gap-1 text-xs text-foreground-500">
            <i className="ri-user-smile-line" />
            로그인한 닉네임이 자동으로 입력됐어요.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
          <i className="ri-image-line text-primary-600" />
          사진
        </h2>
        <p className="mb-4 mt-1 text-xs text-foreground-500">
          대표 이미지는 본문 위에 크게, 나머지는 본문 아래에 갤러리로 보여요.
        </p>
        <ImageUploader images={images} onChange={setImages} userId={user?.id} />
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
          <i className="ri-video-line text-primary-600" />
          동영상
        </h2>
        <p className="mb-4 mt-1 text-xs text-foreground-500">
          짧은 영상을 첨부하면 본문 아래에 재생되도록 붙어요.
        </p>
        <VideoUploader videos={videos} onChange={setVideos} userId={user?.id} />
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <span className="block font-heading text-sm font-bold text-foreground-950">
          내용
        </span>
        <p className="mb-3 mt-1 text-xs text-foreground-500">
          본문에서 바로 서식을 적용할 수 있어요. 사진을 끌어다 놓거나 붙여넣으면 그 자리에 이미지로 들어가고, 유튜브는 툴바 버튼으로 넣을 수 있어요.
        </p>
        <RichTextEditor
          value={content}
          onChange={setContent}
          userId={user?.id}
          onError={setError}
        />
        <div className="mt-1 text-xs text-foreground-400">
          사진을 끌어다 놓거나 붙여넣거나 툴바의 사진 버튼으로 넣으면 본문에 바로 보여요. 넣은 사진을 클릭하면 오른쪽 아래 손잡이를 끌어 크기를 조절할 수 있어요.
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
          <i className="ri-hashtag text-primary-600" />
          태그
        </h2>
        <p className="mb-3 mt-1 text-xs text-foreground-500">
          글과 관련된 키워드를 달아보세요.
        </p>
        <TagInput tags={tags} onChange={setTags} />
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground-950">
          <i className="ri-link text-primary-600" />
          링크 첨부
        </h2>
        <p className="mb-3 mt-1 text-xs text-foreground-500">
          참고한 사이트나 관련 링크를 붙여보세요. 유튜브 주소는 본문에서 영상 플레이어로 재생돼요.
        </p>
        <LinkInput links={links} onChange={setLinks} />
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-6">
        <button
          type="button"
          onClick={() => setIsSecret((v) => !v)}
          className="flex w-full items-center justify-between cursor-pointer"
        >
          <span>
            <span className="block font-heading text-sm font-bold text-foreground-950">
              비밀글로 설정
            </span>
            <span className="mt-1 block text-xs text-foreground-500">
              작성자만 볼 수 있게 비밀글로 등록해요.
            </span>
          </span>
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSecret ? 'bg-primary-500' : 'bg-background-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background-50 transition-transform ${
                isSecret ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </span>
        </button>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-xs text-primary-800">
          <i className="ri-error-warning-line text-base" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-medium text-foreground-800 transition-colors hover:bg-background-100 cursor-pointer"
          >
            <i className="ri-eye-line" />
            미리보기
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-6 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {submitting ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              {isEditing ? '수정 중...' : '등록 중...'}
            </>
          ) : (
            <>
              <i className="ri-send-plane-line" />
              {isEditing ? '수정하기' : '등록하기'}
            </>
          )}
        </button>
      </div>

      <PostPreviewModal
        open={previewOpen}
        data={previewData}
        onClose={() => setPreviewOpen(false)}
      />
    </form>
  );
}
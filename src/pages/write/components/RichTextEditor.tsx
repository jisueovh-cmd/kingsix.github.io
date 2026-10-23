import {
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { isAllowedImage, isOversizedImage, uploadPostImage } from '@/lib/postImage';
import { getYouTubeId } from '@/lib/youtube';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  userId?: string | null;
  onError?: (message: string) => void;
  placeholder?: string;
}

const FORMAT_BUTTONS = [
  { cmd: 'bold', icon: 'ri-bold', label: '굵게' },
  { cmd: 'italic', icon: 'ri-italic', label: '기울임' },
  { cmd: 'underline', icon: 'ri-underline', label: '밑줄' },
  { cmd: 'strikeThrough', icon: 'ri-strikethrough', label: '취소선' },
  { cmd: 'insertUnorderedList', icon: 'ri-list-unordered', label: '글머리 기호' },
  { cmd: 'insertOrderedList', icon: 'ri-list-ordered', label: '번호 목록' },
  { cmd: 'formatBlock:blockquote', icon: 'ri-double-quotes-l', label: '인용' },
];

const DEFAULT_PLACEHOLDER =
  '여러분의 이야기를 자유롭게 적어주세요. 사진을 끌어다 놓거나 붙여넣으면 그 자리에 바로 들어가요.';

export default function RichTextEditor({
  value,
  onChange,
  userId,
  onError,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedImgRef = useRef<HTMLImageElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef<string>(value ?? '');

  const [empty, setEmpty] = useState(true);
  const [imgBox, setImgBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dragDepthRef = useRef(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [ytOpen, setYtOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState('');

  // 외부 값(임시저장 불러오기 / 수정 모드)이 바뀔 때만 편집기에 반영한다.
  // 사용자가 직접 타이핑하는 동안에는 innerHTML을 건드리지 않아서
  // 브라우저의 되돌리기(undo)/복사/잘라내기/붙여넣기 스택이 그대로 유지된다.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = value ?? '';
    if (next !== lastEmittedRef.current) {
      el.innerHTML = next;
      lastEmittedRef.current = next;
      setEmpty(!el.textContent?.trim() && !el.querySelector('img, iframe'));
    }
  }, [value]);

  // 본문 안에서 선택한 이미지 위에 크기 조절 핸들을 겹쳐 보여준다.
  const syncImageOverlay = () => {
    const img = selectedImgRef.current;
    const stage = stageRef.current;
    if (!img || !stage || !img.isConnected) {
      selectedImgRef.current = null;
      setImgBox(null);
      return;
    }
    setImgBox({
      top: img.offsetTop,
      left: img.offsetLeft,
      width: img.offsetWidth,
      height: img.offsetHeight,
    });
  };

  const clearImageSelection = () => {
    if (!selectedImgRef.current) return;
    selectedImgRef.current = null;
    setImgBox(null);
  };

  const handleEditorClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === 'IMG') {
      selectedImgRef.current = target as HTMLImageElement;
      syncImageOverlay();
    }
  };

  // 핸들을 마우스로 끌어 이미지 너비를 조절한다. (가로만, 비율 유지)
  const startResize = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const img = selectedImgRef.current;
    const stage = stageRef.current;
    if (!img || !stage) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = img.offsetWidth;
    const maxWidth = stage.clientWidth;

    const onMove = (ev: MouseEvent) => {
      const next = Math.min(Math.max(80, startWidth + (ev.clientX - startX)), maxWidth);
      img.style.width = `${Math.round(next)}px`;
      img.style.height = 'auto';
      syncImageOverlay();
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      emit();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // 창 크기가 바뀌면 오버레이 위치를 다시 맞춘다.
  useEffect(() => {
    const onResize = () => {
      if (selectedImgRef.current) syncImageOverlay();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 편집기 밖을 누르면 이미지 선택을 해제한다. (핸들 드래그는 유지)
  useEffect(() => {
    const onDocMouseDown = (ev: MouseEvent) => {
      const target = ev.target as Element | null;
      if (!target) return;
      if (target.closest?.('.rte-resize-handle')) return;
      if (target.tagName === 'IMG' && editorRef.current?.contains(target)) return;
      clearImageSelection();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastEmittedRef.current = html;
    onChange(html);
    setEmpty(!el.textContent?.trim() && !el.querySelector('img, iframe'));
    if (selectedImgRef.current) syncImageOverlay();
  };

  const saveSelection = () => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (el && sel && sel.rangeCount > 0 && sel.anchorNode && el.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    try {
      document.execCommand(cmd, false, arg);
    } catch {
      // execCommand는 폐기 예정이지만 여전히 대부분 브라우저에서 동작한다.
    }
    emit();
  };

  // HTML 문자열을 현재 커서(또는 저장된 선택) 위치에 브라우저 표준 Range API로 삽입한다.
  // execCommand('insertHTML')에 의존하지 않아 사진/영상 삽입이 안정적으로 동작한다.
  const insertHtmlAtCaret = (html: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    const sel = window.getSelection();
    let range: Range | null = null;

    if (savedRangeRef.current) {
      range = savedRangeRef.current.cloneRange();
      savedRangeRef.current = null;
    } else if (sel && sel.rangeCount > 0 && sel.anchorNode && el.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0).cloneRange();
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }

    range.deleteContents();

    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const frag = template.content;
    const lastNode = frag.lastChild;
    range.insertNode(frag);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
    } else {
      range.collapse(true);
    }

    sel?.removeAllRanges();
    sel?.addRange(range);

    clearImageSelection();
    emit();
  };

  const uploadAndInsert = async (files: File[]) => {
    setBusy(true);
    try {
      for (const file of files) {
        if (!isAllowedImage(file)) {
          onError?.('JPG, PNG, WEBP, GIF 이미지만 넣을 수 있어요.');
          continue;
        }
        if (isOversizedImage(file)) {
          onError?.('이미지는 한 장당 5MB까지 넣을 수 있어요.');
          continue;
        }
        const url = await uploadPostImage(file, userId);
        insertHtmlAtCaret(`<img src="${url}" alt="본문 이미지" />`);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : '이미지를 올리지 못했어요.');
    } finally {
      setBusy(false);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const data = e.clipboardData;
    if (!data) return;

    const files: File[] = [];
    for (const item of Array.from(data.items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      void uploadAndInsert(files);
      return;
    }

    // 이미지 파일 없이 HTML(<img>)만 담겨 온 경우 (다른 사이트에서 이미지 복사 등)
    const html = data.getData('text/html');
    const match = html ? html.match(/<img[^>]+src=["']([^"']+)["']/i) : null;
    if (match && /^https?:\/\//i.test(match[1])) {
      e.preventDefault();
      insertHtmlAtCaret(`<img src="${match[1]}" alt="본문 이미지" />`);
    }
  };

  const handlePickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length > 0) void uploadAndInsert(files);
  };

  // 파일을 본문 위로 끌어다 놓으면 그 자리에 이미지로 들어간다.
  const hasDraggedFiles = (e: DragEvent<HTMLDivElement>) =>
    Array.from(e.dataTransfer?.types ?? []).includes('Files');

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(e)) return;
    e.preventDefault();
    dragDepthRef.current += 1;
    setDragActive(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(e)) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(e)) return;
    e.preventDefault();
    dragDepthRef.current = 0;
    setDragActive(false);

    const dropped = Array.from(e.dataTransfer.files ?? []);
    const images = dropped.filter((file) => file.type.startsWith('image/'));
    if (images.length > 0) {
      void uploadAndInsert(images);
    } else if (dropped.length > 0) {
      onError?.('이미지 파일만 본문에 넣을 수 있어요.');
    }
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setLinkOpen(false);
      return;
    }
    restoreSelection();
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) {
      document.execCommand('createLink', false, url);
      emit();
    } else {
      insertHtmlAtCaret(
        `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${url}</a>`,
      );
    }
    setLinkUrl('');
    setLinkOpen(false);
  };

  const insertYouTube = () => {
    const id = getYouTubeId(ytUrl);
    if (!id) {
      onError?.('유튜브 주소를 다시 확인해주세요.');
      setYtOpen(false);
      return;
    }
    insertHtmlAtCaret(
      `<iframe class="yt-embed" src="https://www.youtube-nocookie.com/embed/${id}" title="유튜브 영상" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p><br></p>`,
    );
    setYtUrl('');
    setYtOpen(false);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative overflow-hidden rounded-md border bg-background-50 transition-colors ${
        dragActive ? 'border-primary-400 ring-2 ring-primary-400/40' : 'border-background-300'
      }`}
    >
      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-background-50/85 text-primary-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <i className="ri-image-add-line text-2xl" />
          </span>
          <span className="text-sm font-semibold">여기에 사진을 놓으면 본문에 들어가요</span>
        </div>
      )}
      <div className="relative flex flex-wrap items-center gap-1 border-b border-background-200 bg-background-100 px-2 py-1.5">
        {FORMAT_BUTTONS.map((button) => (
          <button
            key={button.cmd}
            type="button"
            title={button.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const [cmd, arg] = button.cmd.split(':');
              exec(cmd, arg);
            }}
            className="flex h-8 w-8 items-center justify-center rounded text-foreground-700 transition-colors hover:bg-background-200 hover:text-primary-700 cursor-pointer"
          >
            <i className={`${button.icon} text-base`} />
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-background-300" />

        <button
          type="button"
          title="사진 넣기"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="flex h-8 w-8 items-center justify-center rounded text-foreground-700 transition-colors hover:bg-background-200 hover:text-primary-700 cursor-pointer"
        >
          <i className="ri-image-add-line text-base" />
        </button>
        <button
          type="button"
          title="링크"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            setYtOpen(false);
            setLinkOpen((v) => !v);
          }}
          className="flex h-8 w-8 items-center justify-center rounded text-foreground-700 transition-colors hover:bg-background-200 hover:text-primary-700 cursor-pointer"
        >
          <i className="ri-link text-base" />
        </button>
        <button
          type="button"
          title="유튜브 영상"
          onMouseDown={(e) => {
            e.preventDefault();
            setLinkOpen(false);
            setYtOpen((v) => !v);
          }}
          className="flex h-8 w-8 items-center justify-center rounded text-foreground-700 transition-colors hover:bg-background-200 hover:text-primary-700 cursor-pointer"
        >
          <i className="ri-youtube-line text-base" />
        </button>

        {busy && (
          <span className="ml-1 flex items-center gap-1 text-xs text-primary-700">
            <i className="ri-loader-4-line animate-spin" />
            사진 넣는 중...
          </span>
        )}

        {linkOpen && (
          <div className="absolute left-2 top-full z-20 mt-1 flex w-[300px] items-center gap-2 rounded-md border border-background-200 bg-background-50 p-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  insertLink();
                }
              }}
              placeholder="https://..."
              className="min-w-0 flex-1 rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={insertLink}
              className="whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              넣기
            </button>
          </div>
        )}

        {ytOpen && (
          <div className="absolute left-2 top-full z-20 mt-1 flex w-[320px] items-center gap-2 rounded-md border border-background-200 bg-background-50 p-2">
            <input
              type="url"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  insertYouTube();
                }
              }}
              placeholder="유튜브 영상 주소 붙여넣기"
              className="min-w-0 flex-1 rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-xs text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={insertYouTube}
              className="whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 cursor-pointer"
            >
              넣기
            </button>
          </div>
        )}
      </div>

      <div ref={stageRef} className="relative">
        {empty && (
          <span className="pointer-events-none absolute left-4 right-4 top-3 text-sm text-foreground-400">
            {placeholder ?? DEFAULT_PLACEHOLDER}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emit}
          onBlur={emit}
          onClick={handleEditorClick}
          onPaste={handlePaste}
          className="rich-text min-h-[240px] w-full px-4 py-3 text-sm text-foreground-900 focus:outline-none"
        />
        {imgBox && (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              top: imgBox.top,
              left: imgBox.left,
              width: imgBox.width,
              height: imgBox.height,
            }}
          >
            <span className="absolute inset-0 rounded-md border-2 border-primary-400" />
            <button
              type="button"
              title="드래그해서 크기 조절"
              aria-label="이미지 크기 조절"
              onMouseDown={startResize}
              className="rte-resize-handle pointer-events-auto absolute -bottom-2 -right-2 flex h-6 w-6 cursor-nwse-resize items-center justify-center rounded-full border-2 border-background-50 bg-primary-500 text-background-50"
            >
              <i className="ri-expand-diagonal-line text-xs" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePickFiles}
      />
    </div>
  );
}
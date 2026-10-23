# 취미 in 자파리 (Hobby in Japari)

## 0. ⛔ 불변 규칙 (ABSOLUTE INVARIANTS — 어떤 작업을 해도 절대 변경·삭제·병합 금지)

> 이 프로젝트는 과거에 "설정을 바꾸는 작업" 중에 기존에 만들어 둔 구조가 리셋마냥 덮어써져 사라진 일이 있었다.
> 아래 항목은 사용자가 직접 지시한 **불변(고정) 규칙**이다. 새로운 기능 추가·수정·리팩터링을 하더라도 절대 삭제하거나 예전 상태로 되돌리지 말 것.

1. **취미 카테고리는 6개를 유지한다.**
   `여행` · `나만의 정원` · `맛집탐방` · **`제작`** · **`수집`** · `기타`
   - `제작`(slug `make`)과 `수집`(slug `collect`)은 **독립 카테고리**다. `기타`로 다시 병합하거나 삭제하면 안 된다.
   - `기타`(slug `etc`)는 게시판 `honey`, `together`, `hobbyist`만 담당한다.
   - 카테고리 정의가 있는 곳(모두 동시에 맞춰야 함):
     - `src/mocks/content.ts` → `mockCategories` (홈 카드·ABOUT·카테고리 페이지가 사용)
     - `src/lib/nav.ts` → `NAV_CATEGORIES` (헤더 '카테고리' 드롭다운)
     - `src/lib/route-seo.ts` → `CATEGORY_NAMES` / `CATEGORY_DESCRIPTIONS` (카테고리 페이지 SEO)
   - 각 카테고리는 `board_slugs`로 게시판을 연결한다: 제작→`make`, 수집→`collect`.
2. **게시판(`boards`) 목록은 삭제·병합하지 않는다.** `여행기`/`맛집게시판`/`별팁`/`수집 공간`/`식물게시판`/`제작 공방`/`함께하는 취미`/`취미人` 유지.
3. **저장된 데이터(글·조회수·좋아요·저장·방문자·기록·설정)는 리셋하지 않고 쌓아간다.** (아래 8장 작업 메모 참고)

---

## 1. Project Description
소소한 일상과 다양한 취미를 기록하고 나누는 **취미 커뮤니티 플랫폼**입니다.
여행, 나만의 정원, 맛집탐방, 제작, 수집, 기타 등 여러 취미 주제를 아우르며,
방문자가 콘텐츠를 발견하고 → 다른 콘텐츠를 보고 → 새로운 취미를 발견하고 → 다시 돌아오는
순환 구조를 지향합니다. 단순 게시판 사이트가 아니라, 게시판을 포함한 여러 공간으로 구성된
현대적인 콘텐츠 플랫폼입니다.

- 타깃 사용자: 취미를 기록/공유하고, 새로운 취미를 발견하고 싶은 일반 사용자
- 핵심 가치: 따뜻하고 편안한 분위기의 취미 아지트, 진입 장벽 없는 참여

## 2. Site Architecture (정보 구조)

```
HOME (매거진형 랜딩)
├─ 히어로 (브랜드 + CTA)
├─ 취미 카테고리 (여행 / 정원 / 맛집 / 제작 / 수집 / 기타)
├─ 최신 콘텐츠 (카드형)
├─ 사진 갤러리 (모자이크)
├─ 커뮤니티 (사람들 + 실시간 채팅)
├─ 이벤트
└─ ABOUT 스니펫

탐색 /explore  (이야기·사진·리뷰·장소 필터)
카테고리 /category/:slug  (독립 콘텐츠 공간)
커뮤니티 /people  (사람들 + 실시간 채팅)
ABOUT /about

기존 기능 (유지)
├─ /board/:slug  게시판 목록
├─ /board/:slug/:postId  글 상세
├─ /write  글쓰기
```

## 3. Page Structure
- `/` - 홈 (히어로, 카테고리, 최신 콘텐츠, 사진 갤러리, 커뮤니티, 이벤트, ABOUT)
- `/boards` - 게시판 모음 (취미 게시판 + 나이대별 취미방 디렉터리, 모바일 하단 탭 진입점)
- `/region` - 군포·수도권 지역 정보 (군포 우선 + 서울·인천·경기 여행지·맛집·카페·나들이·축제·지역소식, AI 자동 수집, 지역/분야 필터)
- `/nation` - 전국 지역 정보 (울릉도·독도 포함 수도권·강원·충청·전라·경상·제주 전 지역 여행지·맛집·카페·나들이·축제, AI 자동 수집, 권역/분야 필터)
- `/explore` - 콘텐츠 탐색 (이야기/사진/리뷰/장소 필터)
- `/category/:slug` - 취미 카테고리 공간 (배너, 관련 게시판, 최신 글, 사진)
- `/people` - 커뮤니티 사람들 + 실시간 채팅 (모바일은 앱형 풀스크린 채팅 뷰, 하단 탭 바로 진입)
- `/events` - 이벤트 전용 공간
- `/about` - 소개
- `/board/:slug` - 게시판 목록
- `/board/:slug/:postId` - 글 상세
- `/write` - 글쓰기
- `/room` - 내 기록방 (로그인 회원 전용, 개인 기록 작성·수정·삭제, 공개/비공개 전환, 원하는 게시판에 공유/내리기, 그리드/피드 전환 탭 + 기록 상세 모달)
- `/room/:username` - 공개 기록방 방문 (인스타그램 프로필형: 아바타·통계(게시물·방문자·공유·사진) 헤더 + 그리드/피드 전환 + 기록 상세 모달 + 하단 방명록, 해당 회원이 공개한 기록만 열람)

## 4. Core Features
- [x] 홈페이지: 매거진형 랜딩 (히어로 + 카테고리 + 최신 + 사진 + 커뮤니티 + 이벤트)
- [x] SMALL TALK 실시간 잡담창 (메시지 저장/불러오기)
- [x] 취미 카테고리 공간 (독립 콘텐츠 공간)
- [x] 콘텐츠 탐색 (유형 필터)
- [x] 커뮤니티 사람들 소개
- [x] 실제 회원 소개(사람들 섹션) — 가상 회원(mockPeople)을 실제 profiles 데이터로 교체(닉네임·프사·실제 글 개수), 회원이 없으면 '함께 시작하기' 초대 문구 노출. 홈 '함께하는 사람들'·/people·모바일 채팅 뷰 모두 동일하게 적용
- [x] 이벤트 전용 공간
- [x] ABOUT 페이지
- [x] 게시판별 글 목록 조회 (페이지네이션 포함)
- [x] 글 상세 조회 (조회수는 방문자당 1회만 증가, 새로고침해도 안 오르고 절대 안 내려감)
- [x] 글쓰기 (제목/내용/비밀글)
- [x] 글쓰기 확장 (사진 다중 업로드·대표 이미지, 동영상 첨부·업로드 진행률, 유튜브 링크 임베드(본문·첨부 링크 영역, 입력 시 썸네일 미리보기), 태그, 링크 첨부, 서식, 미리보기, 임시저장, 위치 지도)
- [x] 글 상세 댓글 (작성/조회)
- [x] 댓글 답글(무제한 중첩) + 본인 댓글 수정/삭제 — comments에 parent_id/author_id/updated_at 추가, RLS(select_all/insert_all/update_own/delete_own)로 본인 댓글만 수정·삭제, 답글은 무한 중첩(부모 삭제 시 답글 cascade)
- [x] 회원가입/로그인 (아이디·이메일·비밀번호·이름·전화번호, 이메일 인증)
- [x] 내 정보 페이지 (닉네임/이름/전화번호 수정, 로그아웃)
- [x] 프로필 사진 — 내 정보에서 사진 업로드/변경/삭제(profiles.avatar_url). 사진이 없으면 빈 프사 자리를 남기지 않고 아이디·닉네임만 깔끔하게 노출(헤더 사용자 메뉴·내 정보·기록방 헤더·공개 기록방 프로필)
- [x] 콘텐츠 유형(리뷰/장소) 데이터 연동
- [x] 메인 '요즘 트렌드(19~39)' 섹션 — 네이버 뉴스 검색 API로 실시간 수집(구글 뉴스 RSS 폴백), 검색 결과 미저장 (trend-feed Edge Function)
- [x] 트렌드 표시 정책(약관 준수) — 네이버·구글 검색 결과를 DB에 저장하지 않고 서버 메모리 단기 캐시(10분)만 사용. 요약은 1~2줄(140자)로 축약하고 출처·원문 링크·저작권 안내 표시. 화면 10분 주기 + 탭 복귀 시 조용히 갱신 (수동 새로고침 유지)
- [x] 연령대 게시판 (10대~60대 6개) — 최초 생성 후 유저가 자유롭게 이용
- [x] 홈 '나이대별 취미' 섹션 — 10~60대 취미방 6개를 메인에서 바로 진입
- [x] 모바일 앱형 UI — 하단 탭바(홈·게시판·글쓰기·사람들·마이), 세이프에어리어 대응, 홈 카드 가로 스와이프 캐러셀, 게시판 목록 모바일 최적화
- [x] 모바일 사람들(/people) 앱형 실시간 채팅 — 하단 탭에서 바로 채팅 진입, 풀스크린 채팅 + 하단 고정 입력창, 채팅/사람들 세그먼트 전환
- [x] 홈 '군포·수도권 지역 정보' 진입 섹션 — 히어로 배너(군포 우선·AI 자동 수집 배지) + 최신 지역 정보 3개 카드 미리보기(useRegionPreview로 실제 게시판 글 최신순 조회, RegionCard 재사용) + 지역/분야 바로가기 칩 + 카테고리 6종을 메인에서 바로 진입 (취미 카테고리 다음에 배치)
- [x] 군포·수도권 지역 정보(/region) — 군포를 우선으로 서울·인천·경기 수도권의 여행지·맛집·카페·나들이·축제·지역소식 정보 게시판. AI(region-info-ai Edge Function)가 지역/분야/개수를 골라 최대 50개까지 대량 생성해 게시판을 채움 (기존 /local-ads는 /region으로 리다이렉트)
- [x] 전국 지역 정보(/nation) — 울릉도·독도까지 수도권·강원·충청·전라·경상·제주 전 지역의 여행지·맛집·나들이 정보 게시판. AI가 권역/분야/개수를 골라 대량 생성(scope=nation)하며, 군포·수도권 페이지와 동일한 컴포넌트(RegionHero/RegionGeneratorPanel/RegionCard/useRegionInfo)를 허브 구성으로 공유. 헤더 '지역' 드롭다운·게시판 모음·사이트맵에 진입점 추가
- [x] 두 지역 게시판 상호 연결 — 공용 안내 배너(RegionCrossLink)로 /region ↔ /nation 서로 이동 (군포·수도권 페이지 하단에 '전국 지역 정보로 이동', 전국 페이지 하단에 '군포·수도권 지역 정보로 이동')
- [x] 개인 기록방(미니홈피) — 회원마다 하나씩 갖는 작은 기록 공간. 기본은 나만 보기(private), 원하는 기록만 공개(public)로 전환 가능. 공개 기록은 `/room/:username` 공개 기록방에서 다른 사람도 열람 (기록 날짜·기분·제목·본문·사진·태그·장소, 기록별 필터/통계)
- [x] 게시판 공유 토글 — 개인 기록을 게시판에 직접 올리지 않고도 원하는 게시판을 골라 공유(shared_post_id)하고, 원하면 '내리기'로 게시판 글만 삭제(개인 기록은 유지). 수정 시 공유 글도 함께 최신화
- [x] posts 소유권 연결 — posts에 author_id/source_record_id 추가 + 본인 글 수정/삭제 RLS 정책(posts_update_own/posts_delete_own)으로 공유 토글 지원
- [x] 기록방 진입점 — 헤더 '커뮤니티' 드롭다운(내 기록방)·사용자 메뉴·모바일 메뉴·푸터 기록방 컬럼
- [x] 인스타형 공개 기록방(/room/:username) — 프로필형 헤더(아바타·게시물/게시판 공유/사진 기록 통계·소개), 그리드↔피드 전환 탭, 정사각형 그리드 타일(사진 없으면 기분 이모지+제목), 기록 클릭 시 상세 모달(사진 갤러리·기분·날짜·본문·태그). 기록마다 공개/비공개는 주인이 직접 선택(기록방은 항상 열려 있음)
- [x] 내 기록방 그리드/피드 전환 — /room에도 공개 기록방과 동일한 그리드↔피드 전환 탭 추가(인스타 감성 통일). 그리드는 정사각형 타일(클릭 시 상세 모달), 피드는 관리용 RecordCard(수정·삭제·공개 전환·게시판 공유). 상세 모달에 수정 버튼을 추가해 그리드에서도 바로 편집 가능, 모달 공개 배지는 기록 visibility에 따라 공개/나만 보기로 표시
- [x] 기록방 방명록(guestbook) — 공개 기록방(/room/:username) 하단에 방명록 섹션 추가. 로그인 없이도 이름 선택(비우면 익명)으로 흔적을 남길 수 있고, 글쓴 본인·방 주인은 글을 지울 수 있음(삭제는 인라인 확인 후 실행). 글자 수 300자 제한, 작성자 아바타·이름·남긴 시각(timeAgo) 표시
- [x] 기록방 방문자 수(조회수) — 기록방 전체 방문 수 집계. 공개 기록방 방문 시(주인 본인 제외) 세션당 1회 방문 기록(로그인 회원은 회원 id, 비로그인은 브라우저별 익명 키)을 남기고, `room_visit_stats` RPC로 순 방문자 수를 계산. 공개 기록방 프로필 헤더와 내 기록방(/room) 통계 박스에 '방문자'로 표시
- [x] 지역 정보/트렌드 카드 죽은 링크 수정 — 홈 지역 정보 미리보기가 예시(mock) 글 번호로 연결돼 '글을 찾을 수 없어요'가 뜨던 문제 해결(실제 글 조회 + 조회 실패 시 빈 상태 안내), RegionCard는 예시 글일 때 상세로 연결하지 않고 '예시' 배지로 표시. 트렌드는 네이버 API 미설정 시 example.com 예시 링크로 새 창이 열리던 문제를 막고(예시 카드는 클릭 불가), 네이버 뉴스 API 키 연결 시 실제 기사로 연결
- [x] 게시판 피드 카드형 UI — 테이블형 목록을 리치 카드(썸네일·콘텐츠 유형 배지·작성자·시간·조회·댓글 수·태그)로 전환, 정렬(최신순/인기순/트렌딩) 세그먼트 + 태그 필터 칩 추가
- [x] 저장(북마크)/좋아요 토글 — **로그인 회원은 DB(post_reactions)에 저장**되어 기기를 바꿔도 유지된다. PostCard의 하트/북마크는 `ReactionsProvider`(회원=DB, 비회원=브라우저 localStorage)를 통해 관리하며, 회원 좋아요는 `toggle_post_like` RPC로 회원당 1회만 반영(멱등)되고 북마크는 `toggle_post_bookmark` RPC로 저장한다. '내 정보 > 저장한 글'과 활동 통계(savedCount)도 DB 저장값을 읽는다. 하트 수는 조회수에서 파생하지 않고 posts.like_count 저장값만 사용하며, 강제 절반 값은 2026-09-22에 0으로 리셋해 **실제 클릭만** 카운트한다
- [x] 알림 센터(실데이터) — 헤더 알림 벨(미읽음 배지) + 알림 드롭다운. 예전의 자리표시(mock) 가짜 활동 알림을 전부 제거하고, 로그인 회원이 쓴 글에 실제로 달린 댓글만 모아 보여준다(댓글 작성자 닉네임·미리보기·시간, 클릭 시 해당 글 #comments로 이동). 알림이 없으면 '새 알림 없음', 비로그인 시 안내 문구. 읽음 상태는 localStorage(jp-notif-read-ids)로 관리
- [x] 댓글 기능 복구 — comments에 빠져 있던 author_id/parent_id/updated_at 컬럼과 본인 수정/삭제 RLS(comments_update_own/comments_delete_own)를 실제 DB에 적용해 댓글 조회·작성·답글·수정·삭제가 동작하도록 복구
- [x] 커뮤니티 가이드 — ABOUT에 운영 수칙 아코디언(/about#guidelines)
- [x] 의견 보내기(피드백) — 푸터 진입 모달 폼(readdy form 연동, 허니팟 포함)
- [x] 내 정보 활동 대시보드 — 작성 글 수·저장 글 수·활동 레벨(새싹/꾸준한/장인/마스터) 통계. 상단 '작성한 글/저장한 글' 카드를 누르면 아래 목록이 해당 탭으로 바뀌며(작성한 글 = author_id 기준 내 글, 저장한 글 = DB 저장 북마크), 목록에는 게시판·시간·조회수가 함께 보인다(MyPostsSection)
- [x] 별팁 청년정보 자동 수집(반짝수집가) — 매주 화요일 오전 9시(KST)에 별팁 게시판에 청년 복지·주거·지원금·청약 최신 소식을 자동 발행하는 봇. 실제 언론사 원문으로 가는 '링크'만 모아 큐레이션하고 원문 본문은 전재하지 않는다(저작권 안전). 태그는 [청년, 지원금/주거/복지/청약]. 예약 실행은 pg_cron(`youth-weekly-tips`, `0 0 * * 2`) + pg_net, 함수는 `youth-tips-ai`
- [x] 회원 개설 게시판 — 로그인한 모든 회원이 `/boards` 상단 '새 게시판 만들기' 버튼으로 자기 게시판을 만들 수 있다(이름·한줄소개 필수, 아이콘/대표 이미지 선택). 만든 게시판은 홈 대문의 '회원들이 만든 게시판' 섹션과 `/boards`의 '함께 만든 게시판' 섹션에 함께 노출된다. boards에 owner_id/is_user_created/icon 컬럼을 추가하고 본인 게시판만 수정·삭제하는 RLS(boards_authenticated_insert / boards_owner_update / boards_owner_delete)를 붙였다. 기존 게시판(여행기·맛집·별팁… 8개 + 나이대 6개 + 지역 2개)은 그대로 유지되며, 회원 게시판은 sort_order 100으로 뒤에 붙는다.
- [x] 회원 게시판 관리 — 게시판 상세(`/board/:slug`)에서 본인 게시판(owner_id = auth.uid() && is_user_created)이면 우측 상단에 '게시판 관리' 버튼이 뜬다. 누르면 이름·한줄소개·아이콘·대표 이미지를 수정하고, 게시판을 삭제할 수 있다. 삭제는 2단계 확인을 거치며 게시판 안의 글·댓글도 FK CASCADE로 함께 삭제된다. 수정·삭제 모두 DB RLS(boards_owner_update / boards_owner_delete)로 본인만 가능하다.
- [x] 일일 방문자 수 카운터 — 한국시간(Asia/Seoul) 0시~24시 기준 오늘의 순 방문자 수를 사이트 하단 푸터에 작게 노출. 방문 시 브라우저별 고유 키로 `record_site_visit(p_visitor_key)` RPC(SECURITY DEFINER, ON CONFLICT DO NOTHING)가 하루 1건만 원자적으로 기록하고(UNIQUE visitor_key+visit_date), `get_visit_count(p_date)` RPC로 방문자 키 노출 없이 숫자만 조회한다. (site_visits 테이블 + record_site_visit/get_visit_count RPC)
- [x] 누적 방문자 수(전체 기간) — 오늘 방문자 옆에 전체 기간 누적 순 방문자 수를 사이트 하단 푸터에 함께 작게 노출. `get_total_visit_count()` RPC(SECURITY DEFINER)로 방문자 키 노출 없이 COUNT(DISTINCT visitor_key) 숫자만 조회하고, 오늘/누적 조회는 서로 독립적(allSettled)이라 하나가 실패해도 다른 하나는 그대로 보인다.
- [x] 실시간 접속자 수 — 푸터에 '지금 N명 접속 중'을 오늘/누적 방문자와 함께 노출. DB 테이블 없이 Supabase Realtime Presence(`site-online` 채널)로 지금 연결된 클라이언트를 실시간 집계하고, 브라우저별 방문자 키를 presence 키로 써서 탭을 여러 개 열어도 1명으로 센다(집계 기준은 방문자와 동일한 브라우저 기준). 연결 실패 시에는 표시하지 않는다.
- [x] 공용 실시간 접속 감지(PresenceProvider) — 앱 전체가 하나의 Presence 연결을 공유한다(`src/hooks/usePresence.tsx`, App.tsx 최상단 배치). 로그인 사용자는 닉네임을 함께 실어 보내고 비로그인은 '익명'으로 취급한다. `useOnlineCount`(푸터 카운트)·`useOnlineVisitors`(관리창 목록)를 제공한다.
- [x] 관리자 전용 접속자 관리창 — 숨김 관리 페이지(/desk)에 '지역 정보 수집'·'접속자' 탭을 추가. '접속자' 탭(`src/pages/desk/components/VisitorPanel.tsx`)은 실시간 접속자 목록(로그인 닉네임 / 비로그인 익명, 로그인 여부 배지, 접속 시각, 머문 시간 1초 갱신)과 요약(지금 접속·로그인 접속·비로그인)을 보여준다. 접속자 키·개인정보는 노출하지 않고 닉네임만 표시. 관리자 판별은 기존 `OWNER_EMAILS`(`src/lib/owner.ts`)를 그대로 사용하므로 이메일만 추가하면 관리자를 늘릴 수 있고, 목록에 없으면 '페이지를 찾을 수 없어요'로만 보인다.
- [x] 실시간 접속자 수(이전 구현 참고) — 최초에는 `src/hooks/useOnlineCount.ts` 단독 훅으로 구현했다가 위 PresenceProvider로 통합.
- [x] 관리자 데스크 접속자 탭 확장 — 요약 카드에 '오늘 방문·누적 방문'을 추가(총 5종: 지금 접속·로그인 접속·비로그인·오늘 방문·누적 방문, `useDailyVisits` 재사용). 비로그인 방문자는 개인 특정이 불가하므로 '익명 #1·#2…' 순번을 붙여 구분하고 접속 시각·머문 시간을 함께 표시(`VisitorPanel`).
- [x] 관리자 방문 통계 탭 — 숨김 관리 페이지(/desk)에 '방문 통계' 탭 추가(`src/pages/desk/components/VisitStatsPanel.tsx`). 최근 14일(KST) 날짜별 순 방문자 수를 막대그래프로 보여주고(최다 방문일 강조), 요약(기간 합계·하루 평균·최다 방문일)과 새로고침/에러 재시도를 제공한다. 데이터는 `get_visit_daily_stats(p_days)` RPC(SECURITY DEFINER)로 방문자 키 노출 없이 날짜별 COUNT(DISTINCT visitor_key)만 받아온다(`useVisitStats` 훅).
- [x] 관리자 표시 뱃지 — 관리자(OWNER_EMAILS) 계정이면 내 정보(/my) 닉네임 옆에 '관리자' 뱃지(방패 아이콘)를 함께 노출한다. 기존 활동 레벨 뱃지(새싹/꾸준한/장인/마스터)와는 별개다.
- [x] 관리자 지정 기능(DB 기반) — 숨김 관리 페이지(/desk)에 '관리자' 탭 추가(`src/pages/desk/components/AdminPanel.tsx`). 이메일로 관리자를 추가·제외할 수 있고, 고정 관리자(`OWNER_EMAILS`, 기본 gisueovh7@naver.com)는 항상 관리자로 남아 제외할 수 없다. 추가 관리자는 `site_admins` 테이블에 저장되며, 추가·삭제는 DB RLS(is_site_admin)로 관리자만 가능하다. 관리자 판별은 `isOwner`(고정 목록 즉시 확인) + `is_site_admin(p_email)` RPC(추가 관리자 확인)를 합친 `useIsAdmin` 훅으로 처리하고, /desk 접근과 /my '관리자' 뱃지에 함께 쓴다. 참고: AI 글쓰기(region-info-ai·gunpo-ad-ai)는 별도 Secrets(ADMIN_EMAILS)로 관리자 여부를 검사하므로, 추가한 관리자에게 AI 글쓰기까지 허용하려면 해당 Secrets도 함께 늘려야 한다.
- [ ] 회원 로그인 연동 심화 (작성자 자동 표시 등)

## 5. Data Model Design
### Table: boards
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| slug | text | URL 식별자 (고유) |
| name | text | 게시판 이름 |
| description | text | 설명 |
| cover_image | text | 대표 이미지 |
| sort_order | int | 정렬 순서 (기본 게시판 1~14·지역 20/60, 회원 개설 게시판 100) |
| owner_id | uuid | 개설한 회원 (auth.users.id, 기본 게시판은 null, ON DELETE SET NULL) |
| is_user_created | boolean | 회원이 만든 게시판 여부 (기본 false) |
| icon | text | 목록 아이콘 (Remix Icon 클래스, 선택) |
| created_at | timestamptz | 생성일 |

- RLS: 누구나 SELECT, 로그인 회원은 본인(owner_id = auth.uid()) 소유로만 INSERT(is_user_created = true), 본인 게시판만 UPDATE/DELETE

### Table: posts
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| board_id | uuid | 게시판 FK |
| title | text | 제목 |
| content | text | 본문 |
| author_name | text | 작성자 표시명 |
| is_secret | boolean | 비밀글 여부 |
| view_count | int | 조회수 |
| like_count | int | 좋아요 수 (실제 저장된 값, 기본 0. 조회수와 무관하며 사용자 클릭 시에만 증가. 강제 절반 값을 없애기 위해 2026-09-22에 0으로 리셋함) |
| content_type | text | 글 유형 (story/photo/review/place, 기본 story) |
| rating | int | 별점 (리뷰 글 전용) |
| location | text | 위치 (장소 글 전용) |
| images | jsonb | 첨부 이미지 URL 배열 (첫 항목이 대표 이미지) |
| videos | jsonb | 첨부 동영상 URL 배열 (최대 3개) |
| tags | text[] | 태그 목록 |
| links | jsonb | 첨부 링크 배열 ({url, title}) |
| author_id | uuid | 작성 회원 (auth.users.id, 공유 글 소유권 판별용) |
| source_record_id | uuid | 개인 기록에서 공유된 경우 원본 personal_records.id |
| created_at | timestamptz | 작성일 |

### Table: small_talk_messages
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| nickname | text | 닉네임 |
| content | text | 메시지 |
| created_at | timestamptz | 작성일 |

### Table: comments
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| post_id | uuid | 게시글 FK (ON DELETE CASCADE) |
| nickname | text | 닉네임 |
| content | text | 댓글 내용 |
| author_id | uuid | 작성 회원 (auth.users.id, 본인 댓글 수정/삭제 판별, ON DELETE SET NULL) |
| parent_id | uuid | 부모 댓글 (답글, 자기참조, ON DELETE CASCADE) |
| created_at | timestamptz | 작성일 |
| updated_at | timestamptz | 수정일 |

### Table: profiles
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key (auth.users.id FK) |
| username | text | 로그인 아이디 (고유) |
| nickname | text | 표시 닉네임 |
| name | text | 실명 |
| phone | text | 전화번호 |
| created_at | timestamptz | 생성일 |

### Table: trend_snapshots (사용 중단 / deprecated)
- 과거 주간 캐시용으로 쓰던 테이블이며 현재는 사용하지 않는다(저장된 데이터도 삭제 완료).
- 네이버/구글 검색 결과를 DB에 저장하지 않기 위해 trend-feed는 서버 메모리 단기 캐시(10분)만 사용한다.

### Table: personal_records (개인 기록방)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| owner_id | uuid | 기록 주인 (auth.users.id FK, ON DELETE CASCADE) |
| title | text | 제목 |
| content | text | 본문 |
| mood | text | 기분 키 (RECORD_MOODS) |
| visibility | text | 공개 범위 (private / public, 기본 private) |
| board_id | uuid | 게시판 공유 시 대상 게시판 FK (ON DELETE SET NULL) |
| shared_post_id | uuid | 게시판에 공유된 posts.id (내리면 null) |
| images | jsonb | 첨부 이미지 URL 배열 (첫 항목이 대표 이미지) |
| tags | text[] | 태그 목록 |
| location | text | 장소 |
| record_date | date | 기록 날짜 (기본 오늘) |
| created_at / updated_at | timestamptz | 생성/수정일 |

- RLS 활성화: 본인 기록은 전체 접근, 공개(visibility='public') 기록은 누구나 SELECT
- 게시판 공유 시 posts에 author_id/source_record_id로 연결해 공유 글이 개인 기록 소유자에게 귀속됨

### Table: guestbook_entries (기록방 방명록)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| room_owner_id | uuid | 방 주인 (profiles.id FK, ON DELETE CASCADE) |
| author_id | uuid | 작성 회원 (auth.users.id, 비로그인이면 null) |
| author_name | text | 표시 이름 (비우면 익명) |
| content | text | 방명록 내용 (1~300자) |
| created_at | timestamptz | 작성일 |

- RLS 활성화: 누구나 SELECT / 누구나 INSERT(익명 허용, with_check true) / 글쓴 본인 또는 방 주인만 DELETE

### Table: room_visits (기록방 방문 기록)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| room_owner_id | uuid | 방 주인 (profiles.id FK, ON DELETE CASCADE) |
| visitor_key | text | 방문자 키 (로그인='u:회원id', 비로그인='a:익명id') |
| created_at | timestamptz | 방문 시각 |

- RLS 활성화: 집계를 위해 누구나 SELECT / 누구나 INSERT
- `room_visit_stats(p_owner uuid)` RPC(SECURITY DEFINER)로 순 방문자 수(COUNT DISTINCT visitor_key)·전체 방문 수 반환

- 회원가입 시 `handle_new_user()` 트리거가 auth.users의 metadata를 profiles로 복사
- 아이디 로그인은 `get_email_by_username()` RPC로 username → email 변환 후 인증

### Table: post_reactions (회원 좋아요/저장)
| Field | Type | Description |
|-------|------|-------------|
| post_id | uuid | 게시글 FK (ON DELETE CASCADE) |
| user_id | uuid | 회원 (auth.users.id FK, ON DELETE CASCADE) |
| reaction_type | text | 반응 종류 (like / bookmark) |
| created_at | timestamptz | 생성일 |
- PK: (post_id, user_id, reaction_type) — 회원당 같은 글에 같은 반응은 1개만
- RLS 활성화: 본인 행만 SELECT/INSERT/DELETE (auth.uid() = user_id)
- `toggle_post_like(p_post_id)` RPC(SECURITY DEFINER) — 좋아요 등록/해제 + posts.like_count 증감을 멱등 처리하고 {liked, like_count} 반환
- `toggle_post_bookmark(p_post_id)` RPC(SECURITY DEFINER) — 북마크 등록/해제 후 boolean 반환
- 비로그인(게스트)은 브라우저(localStorage)에만 저장하고, 게스트 좋아요는 adjust_post_like로 전체 수에 반영

### Table: post_views (게시글 조회 중복 방지)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key (identity) |
| post_id | uuid | 게시글 FK (ON DELETE CASCADE) |
| viewer_key | text | 방문자 키 (회원='user:회원id', 비회원='guest:브라우저키') |
| created_at | timestamptz | 조회 시각 |
- UNIQUE (post_id, viewer_key) — 같은 방문자는 같은 글에 1번만 기록
- RLS 활성화(정책 없음): 직접 접근은 막고 SECURITY DEFINER RPC로만 기록
- `register_post_view(p_post_id uuid, p_guest_key text)` RPC(SECURITY DEFINER) — 처음 보는 방문자일 때만 posts.view_count +1, 현재 view_count 반환

### Table: site_visits (사이트 일일 방문 기록)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| visitor_key | text | 방문자 키 (브라우저별 고유 키, viewStore 게스트 키) |
| visit_date | date | 방문 날짜 (한국시간 기준 YYYY-MM-DD) |
| created_at | timestamptz | 방문 시각 |
- UNIQUE (visitor_key, visit_date) — 같은 방문자는 하루에 1건만 기록
- RLS 활성화: 누구나 INSERT(with_check true), SELECT 정책 없음(직접 조회 불가)
- `record_site_visit(p_visitor_key text)` RPC(SECURITY DEFINER) — 오늘(KST) 하루 1건 원자적 기록(ON CONFLICT DO NOTHING). 중복 방문은 자동 무시
- `get_visit_count(p_date date)` RPC(SECURITY DEFINER) — 해당 날짜의 순 방문자 수(COUNT DISTINCT visitor_key)만 반환. 방문자 키를 노출하지 않는다. 시각은 KST(Asia/Seoul) 기준
- `get_total_visit_count()` RPC(SECURITY DEFINER) — 전체 기간 누적 순 방문자 수(COUNT DISTINCT visitor_key)만 반환. 방문자 키를 노출하지 않는다
- `get_visit_daily_stats(p_days int)` RPC(SECURITY DEFINER) — 최근 N일(기본 14일, KST)의 날짜별 순 방문자 수(COUNT DISTINCT visitor_key)를 (visit_date, visitors)로 반환. 관리자 방문 통계 탭에서 사용하며 방문자 키를 노출하지 않는다

### Table: site_admins (DB로 관리하는 추가 관리자)

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| email | text (PK) | 관리자 이메일(소문자 정규화) |
| added_by | text | 추가한 관리자 이메일 |
| created_at | timestamptz | 추가 시각 |

- RLS: SELECT/INSERT/DELETE 모두 `is_site_admin(auth.jwt() ->> 'email')` 조건 → 현재 관리자만 조회·추가·제외 가능
- `is_site_admin(p_email text)` RPC(SECURITY DEFINER, STABLE) — 고정 관리자(gisueovh7@naver.com) 또는 site_admins에 등록된 이메일이면 true. 방문자·관리자 판별에 사용

### 카테고리 (큐레이션/정적)
취미 카테고리(여행/정원/맛집/제작/수집/기타)는 `src/mocks/content.ts`의 `mockCategories`로 관리.
각 카테고리는 nav.ts의 NAV_CATEGORIES(헤더 '카테고리' 드롭다운) + route-seo.ts의 카테고리 SEO 이름/설명과 짝을 맞춰 6개로 유지한다. (제작·수집은 각각 make·collect 게시판을 단독 연결)
각 카테고리는 `board_slugs`로 관련 게시판을 연결하여 독립 콘텐츠 공간을 구성.

## 6. Backend / Third-party Integration Plan
- Database: **SaaS Supabase 연결됨** (boards / posts / small_talk_messages / comments / profiles / trend_snapshots / personal_records / guestbook_entries / room_visits / post_reactions / post_views / site_visits)
- Edge Function: **trend-feed** — 네이버 뉴스 검색 API 실시간 프록시(구글 뉴스 RSS 폴백). 검색 결과를 DB에 저장하지 않고 서버 메모리 단기 캐시(10분)만 사용하며, 요약은 140자로 축약한다 (Secrets: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)
- Edge Function: **region-info-ai** — 지역 정보 AI 대량 생성. `scope`로 허브를 구분: `gunpo`(게시판 slug `gunpo-region`, 태그 `군포·수도권`, 권역 군포/경기/서울/인천)와 `nation`(게시판 slug `nation-region`, 태그 `전국`, 권역 수도권/강원/충청/전라/경상/제주/울릉도·독도). 봇 이름 `지역정보봇` (Secrets: OPENAI_API_KEY). 글 tags에 [지역 태그, 분야 라벨, 권역 라벨] 저장
- **AI 글쓰기 정책(중요)** — AI가 게시판에 글을 넣는 경로는 `region-info-ai`·`gunpo-ad-ai` 두 함수뿐이며, 둘 다 (1)자동/예약 실행이 없고 관리자가 숨김 도구(`/desk`, OWNER_EMAILS 게이트)에서 버튼을 눌러야만 동작하며 (2)함수 내부에서도 호출 JWT의 이메일이 관리자(OWNER_EMAILS, 기본 `gisueovh7@naver.com`, Secrets `ADMIN_EMAILS`로 변경 가능)가 아니면 403을 반환한다. 공개 페이지(`/region`·`/nation`)에는 AI 생성 버튼이 노출되지 않는다. AI가 댓글을 다는 코드는 없다. (참고: `youth-tips-ai`(별팁 청년정보 자동 수집)는 생성형 AI를 쓰지 않고, 예약 실행으로 원문 링크만 모아 발행하는 별도 경로다 — 아래 8장 참고.)
- Edge Function: **youth-tips-ai (별팁 청년정보 자동 수집, '반짝수집가')** — 매주 화요일 09:00 KST(pg_cron `youth-weekly-tips`, `0 0 * * 2` = 00:00 UTC 화)에 실행되어 구글 뉴스 RSS에서 청년 키워드(지원금·월세·주거·복지·청약) 최신 소식을 모아 별팁(honey) 게시판에 2~3개 글을 자동 발행한다. **저작권 안전을 위해 원문 본문·요약문을 전재하지 않고**, 각 언론사 원문으로 가는 '링크'(posts.links)만 안내한다(글 본문은 직접 작성한 안내 문구). **AI(OpenAI)를 사용하지 않는다.** 실행은 `x-cron-secret` 헤더(비밀값은 `private_config.youth_cron_secret`) 또는 관리자 로그인으로만 허용되며, 이미 안내한 링크는 재발행하지 않는다.
- Auth: **SaaS Supabase Authentication 사용**
  - ⚠️ Supabase Auth는 "이메일이 같으면 계정을 자동으로 병합"하는 정책이 있고 이 자동 병합을 끄는 옵션이 없다. 그래서 소셜 로그인 계정은 **실제 이메일을 쓰지 않고 서비스 전용(합성) 이메일**(`naver_<id>@oauth.kingsix.kr` / `kakao_<id>@oauth.kingsix.kr`)을 써서 **카카오·네이버·홈페이지 계정이 서로 절대 합쳐지지 않게** 한다.
  - 카카오 로그인: Supabase 기본 OAuth를 거치지 않고 공식 Kakao JS SDK(JavaScript 키 `VITE_PUBLIC_KAKAO_CLIENT_ID`)로 직접 연동 → `kakao-auth` 엣지 함수(서비스 역할)가 카카오 토큰 검증 + 사용자 생성/조회 + 세션 발급
  - 네이버 로그인: 공식 Naver Login JS SDK로 직접 연동 → `naver-auth` 엣지 함수(서비스 역할)가 네이버 토큰 검증 + 사용자 생성/조회 + 세션 발급
  - 두 소셜 계정 모두 아이디(username)가 트리거로 자동 생성되어 글쓰기·댓글·기록방 이용
- Shopify: 불필요
- Stripe / 결제: 불필요
- 기타: 없음

## 7. Development Phase Plan

### Phase 1: 기반 구조 확장 (현재 진행)
- Goal: 게시판 사이트 → 콘텐츠 플랫폼으로 정보 구조 확장
- Deliverable: 새 네비게이션, 매거진형 홈, 카테고리 공간, 탐색, 커뮤니티, ABOUT

### Phase 2: 콘텐츠 유형 확장 (완료)
- Goal: 이야기/사진/리뷰/장소 유형의 실데이터 연동
- Deliverable: posts에 content_type/rating/location 컬럼, 유형별 뷰 (탐색 페이지 + 글쓰기 유형 선택)

### Phase 3: 참여 기능 심화
- Goal: 댓글, 좋아요, 팔로우 등 커뮤니티 상호작용
- Deliverable: 댓글 작성/조회, 반응 기능
- 완료: 개인 기록방(미니홈피) + 게시판 공유 토글 — 회원 유입/자발적 글쓰기를 위한 개인 공간 확보 (personal_records + posts author_id/source_record_id)
- 완료: 인스타형 공개 기록방 — 기록방은 항상 열고, 기록마다 공개/비공개를 주인이 선택. 공개 기록은 프로필형 그리드/피드로 노출(RecordGridTile·RecordDetailModal)
- 완료: 내 기록방(/room)에도 그리드/피드 전환 탭 적용 — 인스타 감성 통일, 그리드에서도 상세 모달의 수정 버튼으로 편집 가능
- 완료: 기록방 방명록 + 방문자 수 — 공개 기록방에 방명록(익명 허용, 본인·주인 삭제)을 붙이고, 방문자 수(순 방문자)를 프로필 헤더·내 기록방 통계로 노출 (guestbook_entries, room_visits 테이블 + room_visit_stats RPC)

### Phase 4: 개인화 및 검색
- Goal: 검색 고도화, 인기/추천 콘텐츠
- Deliverable: 검색, 정렬, 추천

## 8. 작업 메모 (채팅 기록 소실 대비 / 중요 결정 사항)
> 채팅 대화 기록이 사라지는 경우가 있어, 사용자와 합의한 핵심 결정은 이 문서에 남긴다.

- **조회수·하트(좋아요) 수는 실제 저장값만 사용하고, 파생 계산으로 흔들리지 않게 한다 (사용자 지침, 2026-09-22 갱신).**
  - (이전) 게시판 카드의 하트 수가 `조회수 × 0.5` 파생 값이어서 조회수가 바뀌면 하트도 함께 변하고, 화면마다 다른 예시 데이터를 써서 숫자가 올랐다 내려갔다 하는 문제가 있었다.
  - (1차) `posts.like_count` 컬럼을 추가하고 기존에 보이던 값(`ROUND(view_count × 0.5)`)을 초깃값으로 이식했다. 게시판 카드(`PostCard`)는 이 저장값을 그대로 노출하며, 사용자가 하트를 누를 때만 `adjust_post_like(p_post_id, p_delta)`(게스트) / `toggle_post_like(p_post_id)`(회원) RPC로 증감한다.
  - (2차, 2026-09-22, 사용자 요청) 초깃값이 `조회수÷2`라 모든 글에서 좋아요가 **딱 절반으로 강제된 것처럼** 보였기 때문에, **좋아요만 0으로 리셋**하고 이제부터 **실제 클릭만** 카운트한다(조회수는 그대로 유지, 리셋하지 않음). 좋아요를 "진짜"로 만들려면 과거에 실제 클릭 기록이 없어 복원이 불가능하므로 0부터 다시 세는 방식이 유일하다. 0이면 `PostCard`는 하트 옆 숫자를 숨기고 아이콘만 노출한다.
  - 조회수(`view_count`)는 **방문자당 1회만** 증가한다(표준 방식, 사용자 지침 2026-09-22). `post_views` 테이블에 (게시글, 방문자키)를 유니크로 남기고, `register_post_view(p_post_id, p_guest_key)` RPC가 **처음 본 방문자일 때만** +1 한다. 회원은 계정 기준(`user:<uuid>`), 비회원은 브라우저별 게스트 키(`guest:<key>`) 기준이라 새로고침·재방문해도 다시 오르지 않는다. 조회수는 오르기만 하고 절대 줄어들지 않는다. (구 `increment_post_view`는 더 이상 사용하지 않음)
  - 카테고리 페이지가 옛 예시(mock) 데이터를 보여줘 숫자가 낮게 보이던 문제도 실제 DB 글을 쓰도록 고쳤다(`useCategoryContent`).
  - **숫자·설정·디자인은 쌓여나가며 리셋/하락하지 않도록 유지한다(사용자 지침).** 좋아요·조회수 같은 수치는 반드시 DB(영속 저장)에 남기고, 화면 표시값은 저장값을 그대로 반영한다. 무언가 바뀔 때 기존에 쌓인 수치를 되돌리거나 다시 만들지 않는다.
- **트렌드 검색 결과는 저장하지 않는다 (네이버·구글 약관 준수).**
  - `trend-feed` Edge Function은 검색 결과를 DB에 저장하지 않고 서버 메모리 단기 캐시(10분)만 사용하며, 요약은 140자로 축약하고 출처·원문 링크를 유지한다. (구 `trend_snapshots` 테이블은 사용 중단)
- **AI 글쓰기 경로는 관리자 전용.** AI가 게시판에 글을 넣는 경로는 `region-info-ai`·`gunpo-ad-ai` 두 함수뿐이고, 둘 다 관리자(`/desk`, OWNER_EMAILS 게이트)가 버튼을 눌러야만 동작한다.
- **별팁 청년정보 자동 수집(반짝수집가) — 저작권 안전 + 예약 실행 (사용자 지침, 2026-09-26).**
  - 요청: 별팁 게시판에 청년에게 유용한 복지·주거팁·지원금·청년 청약 정보를 저작권에 걸리지 않게 자동 수집해 매주 화요일마다 올려주기.
  - 결정: 원문을 재작성하는 AI 방식을 우선 시도했으나 사용 중인 OpenAI 키의 크레딧이 소진되어, "AI 없이도 돌아가는 안전한 대체 방식"으로 전환(사용자 선택).
  - 구현: `youth-tips-ai` 함수가 구글 뉴스 RSS에서 청년 키워드를 모아 별팁(honey) 게시판에 주제별 글을 발행한다. **원문 본문을 전재하지 않고 언론사 원문 링크만** 안내하는 큐레이션 방식(가장 안전). 태그 [청년, 주제].
  - 예약: `pg_cron` job `youth-weekly-tips`(`0 0 * * 2` = 화요일 09:00 KST) + `pg_net`. 실행 권한은 `private_config.youth_cron_secret`와 일치하는 `x-cron-secret` 헤더 또는 관리자 로그인.
  - 주의: **OpenAI 크레딧 소진으로** `region-info-ai`·`gunpo-ad-ai`(지역정보봇)도 멈춰 있다. 충전하거나 다른 방식으로 바꾸기 전까지는 돌지 않는다.
- **소셜 로그인 계정 분리 + 글쓰기 초안 제거 (사용자 지침, 2026-09-26).**
  - 배경: 실제 데이터 확인 결과 관리자 계정(`gisueovh7@naver.com`)에 로그인 방식(identity)이 `email, kakao`로 묶여 있었다. Supabase Auth는 "같은 이메일이면 자동으로 한 계정으로 병합"하며 이 옵션은 끌 수 없어서, 홈페이지 가입 계정과 카카오 로그인이 합쳐진 것이었다. 또 글쓰기 초안이 계정 구분 없이 하나로 저장돼, 계정을 바꿔도 예전에 쓰던 내용이 그대로 남아 있었다.
  - 결정: 카카오·네이버·홈페이지 계정을 **완전 분리**(같은 이메일이어도 각각 별도 계정)하고, 글쓰기 임시저장(초안) 기능은 **완전히 제거**한다.
  - 구현: 소셜 로그인 계정은 서비스 전용(합성) 이메일을 쓰고(`naver-auth`·`kakao-auth` 엣지 함수), 카카오는 Supabase 기본 OAuth 대신 Kakao JS SDK로 전환했다. 글쓰기 초안 관련 코드(draftStore·임시저장 UI)는 삭제해 글쓰기에 들어가면 항상 빈 화면으로 시작한다.
  - 주의: 이미 병합된 과거 계정(관리자 계정의 `email, kakao` identity)은 코드로 되돌릴 수 없다. 다만 앞으로의 카카오 로그인은 전용 계정으로 분리된다.
- **로그아웃 후 "바로 로그인" 시 이전 계정 자동 로그인 방지 (사용자 지침, 2026-09-27).**
  - 증상: 로그아웃 직후 로그인 화면에 들어가면 계정 선택 없이 이전 계정으로 자동 로그인돼 버렸다.
  - 원인 1: 네이버 로그인 콜백 때 잡아둔 액세스 토큰을 모듈 변수(const)에 담아 **한 번 쓰고도 비우지 않아서**, 로그인 화면에 다시 들어올 때마다 예전 토큰으로 재로그인됐다.
  - 원인 2: 로그인 화면의 네이버 SDK `getLoginStatus`가 진입 즉시 자동으로 세션을 복원하려 했다.
  - 원인 3: Supabase 로그아웃만 하고 카카오·네이버 **소셜 세션은 안 지워서**, 다시 소셜 버튼을 누르면 계정 선택 없이 같은 계정으로 바로 붙었다.
  - 해결: 네이버 캡처 토큰은 **1회용으로 소비 후 즉시 비우고**, `getLoginStatus` 자동 복원을 제거했다(로그인은 반드시 사용자가 버튼을 눌렀을 때만). 또한 `signOut` 시 `socialSession` 헬퍼로 카카오(`Kakao.Auth.logout`)·네이버 세션도 함께 정리해, 다음 로그인 때 계정 선택/로그인 화면이 정상적으로 뜨게 했다.
- **회원 반응(좋아요·저장)은 DB에 영속 저장한다 (사용자 지침, 2026-09-22).**
  - "모래성 쌓듯 불안불안하게 가지 말고, 기기를 바꿔도 안 사라지게" 요청에 따라, 로그인 회원의 좋아요·저장(북마크)을 `post_reactions` 테이블(DB)에 저장한다. `ReactionsProvider`가 회원=DB / 비회원=브라우저로 상태를 관리하며, '저장한 글'·활동 통계도 DB 값을 읽는다.
  - 회원 좋아요는 `toggle_post_like` RPC로 회원당 1회만 카운트(멱등)되어, 다른 기기에서 또 눌러도 중복 증가하지 않는다.
  - 숫자·설정·디자인은 쌓여나가며 리셋/하락하지 않도록 유지한다: 좋아요·조회수 같은 수치는 반드시 DB(영속 저장)에 남기고, 화면 표시값은 저장값을 그대로 반영한다.
- **앞으로 무엇을 설정/변경하든 기존 데이터를 리셋하지 않고 쌓아가는 구조로 설계한다 (사용자 지침, 2026-09-22).**
  - 새 기능·설정을 추가할 때는 기존에 저장된 값(글·조회수·좋아요·저장·방문자·기록·설정)을 **지우거나 되돌리지 않고 그대로 유지한 채 덧붙이는(additive) 방식**으로 구현한다.
  - 값을 초기화해야 하는 상황이 생기지 않도록, 처음부터 **영속 저장(DB) 기반**으로 설계하고 화면은 항상 저장값을 그대로 반영한다. 마이그레이션이 필요하면 새 컬럼/새 테이블을 추가하고 기존 데이터는 보존한다.
  - 즉 "설정을 바꾸면 리셋이 필요하다"는 상황 자체를 만들지 않는 방향으로 계속 진화시킨다.
interface UserAvatarProps {
  src?: string | null;
  name: string;
  sizeClass?: string;
  className?: string;
}

/**
 * 회원 프로필 사진.
 * 사진이 있으면 이미지를, 없으면 아무것도 그리지 않는다.
 * (빈 프사 자리를 남기지 않고 아이디/닉네임만 깔끔하게 보여주기 위함)
 */
export default function UserAvatar({
  src,
  name,
  sizeClass = 'h-10 w-10',
  className = '',
}: UserAvatarProps) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${name} 프로필 사진`}
      title={`${name} 프로필 사진`}
      className={`${sizeClass} shrink-0 rounded-full border border-background-200 object-cover object-top ${className}`}
    />
  );
}
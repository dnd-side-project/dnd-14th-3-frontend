interface ProfileAvatarProps {
  imageUrl?: string;
  nickname: string;
}

export default function ProfileAvatar({ imageUrl, nickname }: ProfileAvatarProps) {
  return imageUrl ? (
    <img src={imageUrl} alt={nickname} className="size-10 rounded-full object-cover" />
  ) : (
    <div className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-label-1 text-gray-400">
      {nickname.charAt(0)}
    </div>
  );
}

import type { GameDTO } from '../../../types/dto';
import type { GameInstanceDetailDTO } from '../../../types/dto';
import SmartImage from '../../shared/SmartImage';

interface Props {
  game: GameDTO | null;
  instance: GameInstanceDetailDTO;
}

/** Primary cover: prefer instance cover, fallback to game cover. */
export default function CoverImage({ game, instance }: Props) {
  const uid = instance.coverImageUid ?? game?.coverImageUid ?? null;
  return (
    <SmartImage
      imageUid={uid}
      thumbnail={false}
      alt="Cover"
      aspectRatio={2 / 3}
      fit="contain"
      sx={{ width: 200, height: 280, borderRadius: 1 }}
      imgSx={{ borderRadius: 1 }}
    />
  );
}

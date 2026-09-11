/*
 * Picture cards for the image games: one photograph per word.
 *
 * These were line drawings, which were handsome and hard to read — a student
 * should not have to work out what the picture is before she can name it in
 * English. Each photograph is the thing and nothing else: no people, no scene
 * to decode, nothing that needs explaining before the word does.
 *
 * The files are imported rather than served from /public, so the bundler
 * fingerprints them and the paths survive whatever base URL the site is hosted
 * under. Sources and licences live in pictureCredits.ts and are shown in-app.
 */
const files = import.meta.glob('../assets/pictures/*.{jpg,png}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

/** id -> photo. The English word is authored on the question, not here. */
export const PICTURES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split('/').pop()!.replace(/\.(jpg|png)$/, ''),
    url,
  ]),
);

export type PictureId = keyof typeof PICTURES;

export function Picture({ id, size = 96 }: { id: string; size?: number }) {
  const src = PICTURES[id];
  if (!src) return <span className="picture" style={{ width: size, height: size }} />;
  return (
    <img
      className="picture"
      src={src}
      width={size}
      height={size}
      loading="lazy"
      draggable={false}
      /* Naming the picture is the question, so the picture must not name
         itself — not in the alt text, not in a tooltip. */
      alt=""
    />
  );
}

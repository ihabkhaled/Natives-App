/**
 * The photographs the gallery shows today.
 *
 * These are the Season Board portraits already in the repository, reused
 * deliberately: they are real people from this team, so the gallery shows the
 * club rather than nine grey rectangles. Match-day photography replaces them
 * once it exists — the shape below is what an uploaded photo will carry too,
 * so swapping the source is a one-file change.
 *
 * `nameKey` is an i18n key rather than a name, because the alt text has to
 * read naturally in both English and Arabic.
 */
export interface GalleryPhoto {
  readonly key: string;
  readonly src: string;
  readonly name: string;
}

export const LANDING_GALLERY_PHOTOS: readonly GalleryPhoto[] = [
  { key: 'sherif-ashraf', src: '/staff/sherif-ashraf.jpg', name: 'Sherif Ashraf' },
  { key: 'rawan-elessawy', src: '/staff/rawan-elessawy.jpg', name: 'Rawan E' },
  { key: 'khaled-ossama', src: '/staff/khaled-ossama.jpg', name: 'Khaled O' },
  { key: 'zahra', src: '/staff/zahra.jpg', name: 'Zahra Moustafa' },
  { key: 'nourane', src: '/staff/nourane.jpg', name: 'Nourane Elsayed' },
  { key: 'roaa', src: '/staff/roaa.jpg', name: 'Roaa Nasr' },
  { key: 'abdelrahman-elleimy', src: '/staff/abdelrahman-elleimy.jpg', name: 'Abdelrahman Eliemy' },
  { key: 'lina', src: '/staff/lina.jpg', name: 'Lina' },
  { key: 'ihab-khaled', src: '/staff/ihab-khaled.jpg', name: 'Ihab Khaled' },
];

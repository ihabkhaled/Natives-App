/**
 * Request/response shapes mirroring the backend `POST /contact` DTO
 * (email/subject/message, bounded, `{ sent: true }` on success). The
 * endpoint is not live yet — see `services/submit-contact.service.ts` for
 * the seam this type pins down ahead of the real gateway.
 */
export interface ContactRequestDto {
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

export interface ContactResponseDto {
  readonly sent: true;
}

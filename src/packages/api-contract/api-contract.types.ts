import type { components, operations, paths } from './generated/openapi.generated.types';

export type BackendApiPaths = paths;
export type BackendApiOperations = operations;
export type BackendApiSchemas = components['schemas'];

export type LoginRequestContract = BackendApiSchemas['LoginDto'];
export type LoginResponseContract = BackendApiSchemas['LoginResponseDto'];
export type CurrentUserResponseContract = BackendApiSchemas['AuthUserDto'];
export type RefreshRequestContract = BackendApiSchemas['RefreshDto'];
export type RefreshResponseContract = BackendApiSchemas['AuthSessionResponseDto'];
export type LogoutRequestContract = BackendApiSchemas['LogoutDto'];
export type MessageResponseContract = BackendApiSchemas['MessageResponseDto'];
export type PracticeSessionContract = BackendApiSchemas['SessionResponseDto'];
export type PracticeSessionListContract = BackendApiSchemas['ListSessionsResponseDto'];
export type PracticeRsvpContract = BackendApiSchemas['RsvpResponseDto'];
export type PracticeSessionListQueryContract = NonNullable<
  BackendApiOperations['PracticeSessions.list']['parameters']['query']
>;
export type SetRsvpRequestContract = BackendApiSchemas['SetRsvpDto'];

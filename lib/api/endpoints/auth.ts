import type {
  MeResponse,
  AuthSessionResponse,
  LoginRequest,
  RegisterRequest,
  RoleListResponse,
  RefreshSessionResponse,
  SessionListResponse,
  RevokeSessionResponse,
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
  MessageResponse,
  HealthResponse,
  DbCheckResponse,
  RootResponse,
} from "../types";
import { client } from "../client";

export const api = {
  auth: {
    me: () => client.get<MeResponse>("/auth/me"),

    login: (data: LoginRequest) =>
      client.post<AuthSessionResponse>("/auth/login", data),

    register: (data: RegisterRequest) =>
      client.post<AuthSessionResponse>("/auth/register", data),

    roles: () => client.get<RoleListResponse>("/auth/roles"),

    refresh: () => client.post<RefreshSessionResponse>("/auth/refresh"),

    logout: () => client.post<MessageResponse>("/auth/logout"),

    sessions: {
      list: () => client.get<SessionListResponse>("/auth/sessions"),

      revoke: (sessionId: number) =>
        client.delete<RevokeSessionResponse>(`/auth/sessions/${sessionId}`),
    },

    onboarding: {
      complete: (data: CompleteOnboardingRequest) =>
        client.post<CompleteOnboardingResponse>(
          "/auth/onboarding/complete",
          data,
        ),
    },

    googleLogin: () => {
      window.location.href = `${
        client.defaults.baseURL ?? ""
      }/auth/google/login`;
    },
  },

  health: {
    check: () => client.get<HealthResponse>("/health"),
    dbCheck: () => client.get<DbCheckResponse>("/db-check"),
    root: () => client.get<RootResponse>("/"),
  },
} as const;
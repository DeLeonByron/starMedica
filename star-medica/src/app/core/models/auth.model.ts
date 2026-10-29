export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  photoUrl: string | null;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        context: 'signin';
      }) => void;
      renderButton: (element: HTMLElement, options: {
        theme: 'outline';
        size: 'large';
        text: 'signin_with';
        shape: 'rectangular';
        locale: 'es';
        width: number;
      }) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}
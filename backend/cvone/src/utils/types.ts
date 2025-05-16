export type OAuthUserDetail = {
  email: string;
  fullName: string;
  googleId: string;
  avatar: string;
};

export interface LocalUserDetail {
  email: string;
  password: string;
}

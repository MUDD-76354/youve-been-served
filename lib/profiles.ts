export type UserProfile = {
  id: string;
  email: string;
  serverName: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserProfileInput = {
  email: string;
  password: string;
  serverName: string;
  fullName?: string;
};

export type CreateUserProfileResult =
  | {
      success: true;
      message: string;
      user: {
        id: string;
        email: string;
        serverName: string;
        fullName: string | null;
      };
    }
  | {
      success: false;
      error: string;
    };
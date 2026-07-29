export type PasswordEntry = {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  category: string;
  encrypted_data: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSecret = {
  user_id: string;
  salt: string;
  kdf_iterations: number;
  created_at: string;
};

export type DecryptedPayload = {
  username: string;
  password: string;
  notes: string;
};

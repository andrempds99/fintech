export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  created_at: Date;
  last_login?: Date;
  updated_at?: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
}


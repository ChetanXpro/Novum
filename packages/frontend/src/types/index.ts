


export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  authType: 'GOOGLE' | 'EMAIL';  
  isEmailVerified: boolean;
  profilePicUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

  
  export interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    userId: string;
  }
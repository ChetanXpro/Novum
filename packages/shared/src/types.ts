export interface User {
    id: string;
    username: string;
    email: string;
    profilePicUrl?: string;
  }
  
  export interface Video {
    id: string;
    title: string;
    description: string;
    s3Key: string;
    thumbnailUrl?: string;
    duration?: number;
    views: number;
    userId: string;
  }
  
export interface User {
    id: string;
    username: string;
    email: string;
    profilePicUrl: string;
  }
  
  export interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    userId: string;
  }
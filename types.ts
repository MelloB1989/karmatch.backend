export interface User {
  kid: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  location: string;
  country: string;
  languages: string[];
  primary_language: string;
  profile_picture: string;
  gallery: string[];
  bio: string;
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    github: string;
  };
}

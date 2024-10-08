export interface User {
  kid: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  date_of_birth: string;
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

export interface AiSettings {
  id: string;
  user_id: string;
  ai_name: string;
  ai_slang: string;
}

export interface AiQuestions {
  id: string;
  question: string;
  category: string;
  level: number;
}

export interface AiAnswers {
  id: string;
  question_id: string;
  answer: string;
  user_id: string;
}

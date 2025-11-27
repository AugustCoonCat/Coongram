import { Models } from "appwrite";

export type IContextType = {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuthUser: () => Promise<boolean>;
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  $id?: string;
  userId?: string;
  caption: string;
  file: File;
  location?: string;
  tags?: string | string[];
  creator?: string | { $id: string };
  accountId?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File;
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  $id: string;
  name: string;
  username: string;
  email: string;
imageUrl: string | null;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type ExtendedPost = Models.Document & {
  caption: string;
  imageUrl: string;
  location?: string;
  tags?: string[];
  likes: string[];
  creator: {
    $id: string;
    name: string;
    imageUrl?: string;
  };
}; 

export type INewPostPayload = {
  caption: string;
  file: File;
  location?: string;
  tags?: string[] | string;
  creator: string; 
};

export type NormalizedCreator = {
  $id: string;
  name: string;
  imageUrl?: string;
};

export type NormalizedPost = Models.Document & {
  caption: string;
  imageUrl: string;
  location?: string;
  tags: string[];
  likes: string[];
  creator: NormalizedCreator;
};
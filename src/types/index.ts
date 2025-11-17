import { Models } from "appwrite";

export type IContextType = {
  user: IUser;
  setUser: (user: IUser) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  checkAuthUser: () => Promise<boolean>;
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
  imageUrl: string;
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
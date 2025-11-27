import { Models } from "appwrite";

export type RawPost = Models.Document & any;

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

export function normalizePost(post: RawPost): NormalizedPost {
  const tags: string[] = Array.isArray(post.tags)
    ? post.tags.map((t: string) => (typeof t === "string" ? t.trim() : String(t)))
    : typeof post.tags === "string"
    ? post.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  const likes: string[] = Array.isArray(post.likes) ? post.likes : [];

  let creator = post.creator;
  if (!creator) {
    creator = { $id: "unknown", name: "Unknown User", imageUrl: "/assets/icons/profile-placeholder.svg" };
  } else if (typeof creator === "string") {
    creator = { $id: creator, name: "Unknown User" };
  } else if (creator && typeof creator === "object") {
    creator = {
      $id: creator.$id || creator.id || "unknown",
      name: creator.name || "Unknown User",
      imageUrl: creator.imageUrl || "/assets/icons/profile-placeholder.svg",
    };
  }

  return {
    ...post,
    tags,
    likes,
    creator,
    imageUrl: post.imageUrl || (post.imageId ? post.imageId : ""),
  } as NormalizedPost;
}

export function normalizePosts(posts: RawPost[]): NormalizedPost[] {
  return posts.map(normalizePost);
}

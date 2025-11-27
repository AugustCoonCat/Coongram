import { INewPost, INewUser, IUpdatePost } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { normalizePost } from "@/lib/normalizers/post";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });
    console.log(newUser);
    return newAccount;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", [currentAccount.$id])]
    );

    return currentUser.documents[0] || null;
  } catch (error: any) {
    if (error.code === 401) return null;
    return null;
  }
}

export async function signOutAccount() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createPost(post: INewPost) {
  try {
    const uploadedFile = await uploadFile(post.file);
    if (!uploadedFile) throw new Error("Upload failed");

    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl || typeof fileUrl !== "string") {
      await deleteFile(uploadedFile.$id);
      throw new Error("Invalid file URL");
    }

    let tags: string[] = [];
    if (Array.isArray(post.tags)) {
      tags = post.tags.map((t) => t.trim());
    } else if (typeof post.tags === "string") {
      tags = post.tags.split(",").map((t) => t.trim());
    }


    let creatorId: string | undefined;

    if (typeof post.creator === "string") {
      creatorId = post.creator;
    } else if (
      post.creator &&
      typeof post.creator === "object" &&
      "$id" in post.creator
    ) {
      creatorId = (post.creator as { $id: string }).$id;
    } else if (post.userId && typeof post.userId === "string") {
      creatorId = post.userId;
    }

    if (!creatorId && post.accountId && typeof post.accountId === "string") {
      const userList = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", [post.accountId]), Query.limit(1)]
      );
      if (userList?.documents?.length) creatorId = userList.documents[0].$id;
    }

    if (creatorId && creatorId.startsWith("acc")) {
      const userList = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", [creatorId]), Query.limit(1)]
      );
      if (userList?.documents?.length) creatorId = userList.documents[0].$id;
    }

    if (!creatorId) {
      console.warn(
        "createPost: creatorId not resolved. incoming:",
        post.creator,
        post.userId,
        post.accountId
      );
      await deleteFile(uploadedFile.$id);
      throw new Error(
        "Creator ID not provided or could not be resolved to a user document."
      );
    }

    console.log("createPost: resolved creatorId =", creatorId);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: creatorId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Failed to create post");
    }

    return newPost;
  } catch (error) {
    console.log("createPost error:", error);
    throw error;
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export async function getFilePreview(
  fileId: string
): Promise<string | undefined> {
  try {
    const fileUrl: string = await storage.getFileView({
      bucketId: appwriteConfig.storageId,
      fileId,
    });
    return fileUrl; 
  } catch (error) {
    console.log("getFilePreview error:", error);
    return undefined;
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    const creatorIds = Array.from(
      new Set(
        response.documents
          .map((p: any) => (p?.creator && typeof p.creator === "string" ? p.creator : p?.creator?.$id))
          .filter(Boolean)
      )
    );

    const creatorsMap = new Map<string, any>();
    await Promise.all(
      creatorIds.map(async (id) => {
        try {
          const userDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            id
          );
          creatorsMap.set(id, userDoc);
        } catch {
          // ignore missing creators
        }
      })
    );

    const postsWithCreators = response.documents.map((post: any) => {
      const creatorId = post?.creator && typeof post.creator === "string" ? post.creator : post?.creator?.$id;
      const creator = (creatorId && creatorsMap.get(creatorId)) || post.creator || {
        $id: "unknown",
        name: "Unknown User",
        imageUrl: "/assets/icons/profile-placeholder.svg",
      };

      return normalizePost({ ...post, creator });
    });

    return { documents: postsWithCreators };
  } catch (error) {
    console.error("Ошибка при получении постов:", error);
    return { documents: [] };
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  if (!postId) throw new Error("Post ID required");
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { likes: likesArray }
    );
    if (!updatedPost) throw new Error("Failed to update likes");
    return updatedPost;
  } catch (error) {
    console.error("likePost error:", error);
    throw error;
  }
}

export async function savePost(postId: string, userId: string) {
  if (!postId || !userId) throw new Error("Post ID and User ID required");
  try {
    const newSave = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      { user: userId, post: postId }
    );
    if (!newSave) throw new Error("Failed to save post");
    return newSave;
  } catch (error) {
    console.error("savePost error:", error);
    throw error;
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  if (!savedRecordId) throw new Error("Saved record ID required");
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );
    return { status: "ok" };
  } catch (error) {
    console.error("deleteSavedPost error:", error);
    throw error;
  }
}

export async function getSavedPosts() {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents; 
  } catch (error) {
    console.error("getSavedPosts error:", error);
    throw error;
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) return null;

    let creatorObj = post.creator;
    try {
      const creatorId = post?.creator && typeof post.creator === "string" ? post.creator : post?.creator?.$id;
      if (creatorId) {
        creatorObj = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          creatorId
        );
      }
    } catch {
      creatorObj = { $id: "unknown", name: "Unknown User", imageUrl: "/assets/icons/profile-placeholder.svg" };
    }

    return normalizePost({ ...post, creator: creatorObj });
  } catch (error) {
    console.log("Ошибка при получении поста:", error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate =
    post.file !== undefined &&
    (Array.isArray(post.file) ? post.file.length > 0 : true);

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      let fileToUpload: File;

      if (Array.isArray(post.file)) {
        fileToUpload = post.file[0];
      } else {
        fileToUpload = post.file;
      }

      const uploadedFile = await uploadFile(fileToUpload);
      if (!uploadedFile) throw new Error("Upload failed");

      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl || typeof fileUrl !== "string") {
        await deleteFile(uploadedFile.$id);
        throw new Error("Invalid file URL");
      }

      image = {
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
      };
    }

    const tags: string[] = Array.isArray(post.tags)
      ? post.tags.map((t) => t.trim())
      : typeof post.tags === "string"
      ? post.tags.split(",").map((t) => t.trim())
      : [];

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags,
      }
    );

    if (!updatedPost) {
      if (hasFileToUpdate) await deleteFile(image.imageId);
      throw new Error("Failed to update post");
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) throw Error;
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({
  pageParam,
}: { pageParam?: string } = {}) {
  try {
    const queries: any[] = [
      Query.orderDesc("$updatedAt"),
      Query.limit(10),
      Query.select(["*", "creator.*"]), 
    ];

    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw new Error("No posts");
    return posts;
  } catch (error) {
    console.error("getInfinitePosts error:", error);
    throw error;
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.search("caption", searchTerm),
        Query.select(["*", "creator.*"]), 
      ]
    );

    if (!posts) throw new Error("No posts");
    return posts;
  } catch (error) {
    console.error("searchPosts error:", error);
    throw error;
  }
}

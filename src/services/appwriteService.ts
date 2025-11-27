import { ID, Client, Databases, Query, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('your-project-id');

const databases = new Databases(client);

const getUserId = async () => {
  const account = new Account(client);
  const user = await account.get();
  return user.$id;
};

export const appwriteService = {
  async likePost(postId: string) {
    const userId = await getUserId();

    const likesCollectionId = 'likes'; 
    const result = await databases.listDocuments(
      'your-database-id',
      likesCollectionId,
      [Query.equal('postId', postId), Query.equal('userId', userId)]
    );

    if (result.documents.length > 0) {
      
      await databases.deleteDocument(
        'your-database-id',
        likesCollectionId,
        result.documents[0].$id
      );
    } else {
      
      await databases.createDocument(
        'your-database-id',
        likesCollectionId,
        ID.unique(),
        {
          postId,
          userId,
          timestamp: new Date().toISOString(),
        }
      );
    }
  },
};

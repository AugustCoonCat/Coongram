import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useGetPosts } from "@/lib/react-query/queriesAndMutations";

type Post = {
  $id: string;
  caption?: string;
  imageUrl?: string;
  likes?: string[];
  creator: {
    $id: string;
    name: string;
  };
  $createdAt?: string;
  location?: string;
  tags?: string[];
};

const Profile = () => {
  const { user, isLoading } = useUserContext();
  const { data } = useGetPosts();
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");

  if (isLoading) return <div className="flex-center pt-20">Loading...</div>;
  if (!user) return <div className="flex-center pt-20">User not found.</div>;

  const profileImage = user.imageUrl || "/assets/profile-placeholder.png";

  const allPosts: Post[] = data
    ? data.pages.flatMap((page: any) =>
        page.documents ? (page.documents as Post[]) : []
      )
    : [];

  const myPosts = allPosts.filter((post) => post.creator?.$id === user.id);

  const likedPosts = allPosts.filter(
    (post) => Array.isArray(post.likes) && post.likes.includes(user.id)
  );

  const displayedPosts = activeTab === "posts" ? myPosts : likedPosts;

  return (
    <div className="profile-page-container px-6 pt-10">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profileImage}
            alt={user.name}
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-700"
          />
          <div className="flex flex-col">
            <h2 className="text-white text-2xl font-bold">{user.name}</h2>
            <p className="text-light-4">@{user.username}</p>
            <div className="flex gap-4 mt-2 text-sm text-light-4">
              <span>
                <strong>{myPosts.length}</strong> Posts
              </span>
              <span>
                <strong>{0}</strong> Followers
              </span>
              <span>
                <strong>{0}</strong> Following
              </span>
            </div>
          </div>
        </div>

        <Link to={`/update-profile/${user.id}`}>
          <Button>Edit Profile</Button>
        </Link>
      </div>

      <div className="mt-8 flex gap-4 border-b border-light-2">
        <Button
          variant={activeTab === "posts" ? "default" : "ghost"}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </Button>
        <Button
          variant={activeTab === "liked" ? "default" : "ghost"}
          onClick={() => setActiveTab("liked")}
        >
          Liked Posts
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayedPosts.length > 0 ? (
          displayedPosts.map((post) => (
            <div key={post.$id} className="bg-gray-800 p-3 rounded-lg">
              <img
                src={post.imageUrl || "/assets/profile-placeholder.png"}
                alt={post.caption || "post image"}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2 text-light-4">{post.caption}</p>
            </div>
          ))
        ) : (
          <p className="text-light-4 col-span-full text-center mt-4">
            Нет постов для отображения
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;

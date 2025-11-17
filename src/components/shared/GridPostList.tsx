import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import React from "react";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { ExtendedPost } from "@/types";

type GridPostListProps = {
  posts: ExtendedPost[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <li key={post.$id} className="relative min-w-80 h-80">
          <Link className="grid-post_link" to={`/posts/${post.$id}`}>
            <img
              src={post.imageUrl || "/public/assets/icons/image-placeholder.svg"}
              alt="post"
              className="h-full w-full object-cover"
            />
          </Link>

          <div className="grid-post_user">
            {showUser && post.creator && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={
                    post.creator.imageUrl ||
                    "/public/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="h-8 w-8 rounded-full"
                />
                <p className="line-clamp-1">{post.creator.name}</p>
              </div>
            )}

            {showStats && user && (
              <PostStats userId={user.id} post={post} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;
import Loader from "./Loader";
import GridPostList from "./GridPostList";
import { Models } from "appwrite";

type DocumentWithCreator = Models.Document & {
  creator?: { $id: string; name: string; imageUrl?: string };
  location?: string;
  caption: string;
  imageUrl: string;
  tags?: string[] | string;
  likes?: string[];
};

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: DocumentWithCreator[];
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultsProps) => {
  if (isSearchFetching) return <Loader />;

  if (searchedPosts.length > 0) {
    // Normalize tags to string[] to satisfy GridPostList typing
    const normalized = searchedPosts.map((p) => ({
      ...p,
      tags: Array.isArray(p.tags)
        ? p.tags
        : typeof p.tags === "string"
        ? p.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      likes: Array.isArray(p.likes) ? p.likes : [],
      creator:
        p.creator && typeof p.creator === "object"
          ? p.creator
          : p.creator && typeof p.creator === "string"
          ? { $id: p.creator, name: "Unknown User" }
          : { $id: "unknown", name: "Unknown User", imageUrl: "/assets/icons/profile-placeholder.svg" },
    }));

    return <GridPostList posts={normalized} />;
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full">
      No results found
    </p>
  );
};

export default SearchResults;
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {
  useGetPosts,
  useSearchPosts,
} from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

// Тип поста с creator
type DocumentWithCreator = Models.Document & {
  creator?: { $id: string; name: string; imageUrl?: string };
  location?: string;
  caption: string;
  imageUrl: string;
  tags?: string[] | string;
  likes?: string[];
};

const Explore = () => {
  const { ref, inView } = useInView();

  // Основные посты
  const { data: postsData, fetchNextPage, hasNextPage } = useGetPosts();
  const posts = postsData as unknown as
    | {
        pages: { documents?: DocumentWithCreator[] }[];
      }
    | undefined;

  // Поиск
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);
  const { data: searchData, isFetching: isSearchFetching } =
    useSearchPosts(debouncedValue);
 const searchedPosts: DocumentWithCreator[] =
  searchData?.documents?.map((post) => ({
    ...post,
    caption: post.caption || "",
    imageUrl: post.imageUrl || "",
    creator: post.creator || { $id: "unknown", name: "Unknown" },
    likes: Array.isArray(post.likes) ? post.likes : [],
    tags: Array.isArray(post.tags) ? post.tags : [],
  })) || [];

  // Подгрузка новых страниц при скролле
  useEffect(() => {
    if (inView && !searchValue) fetchNextPage?.();
  }, [inView, searchValue, fetchNextPage]);

  // Лоадер пока нет данных
  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts.pages.every((item) => !item.documents || item.documents.length === 0);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/public/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/public/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList
              key={`page-${index}`}
              posts={
                item.documents?.map((post) => ({
                  ...post,
                  caption: post.caption || "",
                  imageUrl: post.imageUrl || "",
                  creator: post.creator || { $id: "unknown", name: "Unknown" },
                  likes: Array.isArray(post.likes) ? post.likes : [],
                  tags: Array.isArray(post.tags) ? post.tags : [],
                })) || []
              }
            />
          ))
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div className="mt-10" ref={ref}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;

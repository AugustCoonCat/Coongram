import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";

import { PostValidation } from "@/lib/validation";
import { toast } from "sonner";
import FileUploader from "../shared/FileUploader";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreatePost,
  useUpdatePost,
} from "@/lib/react-query/queriesAndMutations";
import { getCurrentUser } from "@/lib/appwrite/api";

type PostFormProps = {
  post?: any;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();

  const { user } = useUserContext();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      file: undefined,
      location: post?.location || "",
      tags: post?.tags?.join(", ") || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof PostValidation>) => {
  // Проверяем файл только если это создание поста
  if (action === "Create" && !values.file) {
    toast.error("Image is required");
    return;
  }

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const payload = {
      caption: values.caption,
      file: values.file || post?.imageUrl, // используем старое фото если не меняем
      location: values.location,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      creator: currentUser.$id,
    };

    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl,
      });

      if (!updatedPost) {
        toast.error("Post update failed. Please try again.");
      } else {
        toast.success("Post updated!");
      }

      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost(payload);

    if (!newPost) {
      toast.error("Post creation failed. Please try again.");
      return;
    }

    toast.success("Post created!");
    navigate("/");
  } catch (err) {
    console.error("Post creation error:", err);
    toast.error("Something went wrong. Please try again.");
  }
};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  imageUrl={post?.imageUrl || ""}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma ",")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Art,Expression,Learn"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={ isLoadingUpdate}

          >
            {isLoadingUpdate && "Loading..."}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;

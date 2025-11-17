import * as z from "zod";

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Слишком короткое имя" }),
  username: z.string().min(2, { message: "Слишком короткое имя" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Пароль должен содержать минимум 8 символов" }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Пароль должен содержать минимум 8 символов" }),
});

export const PostValidation = z.object({
  caption: z.string().min(5).max(2200),
  file: z.custom<File>(),
  location: z.string().min(2).max(100),
  tags: z.string(),
});

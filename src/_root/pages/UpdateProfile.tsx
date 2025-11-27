"use client";

import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

export default function UpdateProfile() {
  const { user, setUser } = useUserContext();

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        imageUrl:
          user.imageUrl && user.imageUrl.trim() !== ""
            ? user.imageUrl
            : "/assets/profile-placeholder.png",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="profile-update">
      <h2 className="title">Редактирование профиля</h2>

      <div className="profile-image-block">
        <img
          src={
            form.imageUrl && form.imageUrl.trim() !== ""
              ? form.imageUrl
              : "/assets/profile-placeholder.png"
          }
          alt="profile"
          width={120}
          height={120}
          className="avatar"
        />
      </div>

      <form onSubmit={handleSubmit} className="update-form">
        <label>
          Имя
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>

        <label>
          Никнейм
          <input
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
        </label>

        <label>
          О себе
          <textarea
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </label>

        <label>
          Фото (URL)
          <input
            value={form.imageUrl}
            onChange={(e) => handleChange("imageUrl", e.target.value)}
          />
        </label>

        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
}

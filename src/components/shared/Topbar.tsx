import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
  if (isSuccess) navigate("/sign-in");
}, [isSuccess]);

  return (
    <section className="topbar">
      <div className="flex-between p-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <div className="flex justify-start">
            <img
              className="w-16 h-16"
              src="/public/assets/images/Logo.png"
              alt="logo"
            />
            <h1 className="text-2xl font-bold pt-4">Coongram</h1>
          </div>
        </Link>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
          >
            <img src="/public/assets/icons/logout.svg" alt="logout" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
          <img src={user.imageUrl || '/public/assets/icons/profile-placeholder.svg'} alt="profile" className="h-8 w-8 rounded-full"/>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;

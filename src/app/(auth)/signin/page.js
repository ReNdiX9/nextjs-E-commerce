"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FaLock, FaLockOpen, FaGoogle, FaDiscord } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function SignIn() {
  const [oauthLoading, setOauthLoading] = useState(null); // "google" | "discord" | null
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    setError,
    setFocus,
  } = useForm();

  const [serverMsg, setServerMsg] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);

  const inputBase =
    "w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-text-primary placeholder-text-secondary outline-none focus:border-text-primary hover:border-text-primary transition-all";

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  if (isLoading || !isLoaded) {
    return (
      <div className="text-center p-5 text-2xl text-text-secondary bg-background w-full h-screen">Loading form...</div>
    );
  }

  //clerk sign in function made with chatgpt
  const onSubmit = async (values) => {
    setServerMsg("");
    try {
      const res = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (res?.status === "complete" && res?.createdSessionId) {
        console.debug("Sign in successful, activating session...", res);
        await setActive({ session: res.createdSessionId });

        // Force a client-side refresh so Clerk React hooks (SignedIn / useUser) pick up the active session
        try {
          await fetch("/api/users", { method: "POST" });
        } catch (err) {
          console.warn("Failed to POST /api/users after sign-in:", err);
        }

        // Refresh the current route to make sure client-side auth state is updated
        try {
          router.refresh();
        } catch (err) {
          console.warn("router.refresh() failed:", err);
        }

        // Navigate to home (or settings if you prefer)
        router.push("/");
      } else {
        setServerMsg("Additional step required. Check your email or follow the next step.");
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || "Invalid email or password.";
      setError("root", { message: msg });
    }
  };
  //clerk sign in with provider function  made with chatgpt
  const handleOAuth = async (provider) => {
    setServerMsg("");
    setOauthLoading(provider);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider === "google" ? "oauth_google" : "oauth_discord",
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || "OAuth failed";
      setError("root", { message: msg });
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <div className="mb-6">
        <Image alt="Logo" src="/logo.png" width={50} height={50} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-2xl p-6 shadow-md border border-card-border bg-card-bg"
      >
        <h1 className="text-3xl font-semibold mb-5 text-text-primary text-center">Log in to your account</h1>

        <label className="block mb-2 text-sm font-medium text-text-primary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="youremail@gmail.com"
          className={`${inputBase} ${errors.email ? "border-red-500" : "border-neutral-300"}`}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email" },
          })}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}

        <label className="block mt-4 mb-2 text-sm font-medium text-text-primary" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={passwordShow ? "text" : "password"}
            placeholder="••••••••"
            className={`${inputBase} ${errors.password ? "border-red-500" : "border-neutral-300"} pr-11`}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
          />
          <button
            type="button"
            aria-label={passwordShow ? "Hide password" : "Show password"}
            onClick={() => setPasswordShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none"
            title={passwordShow ? "Hide password" : "Show password"}
          >
            <FaLockOpen style={{ display: passwordShow ? "block" : "none" }} className="cursor-pointer" />
            <FaLock style={{ display: passwordShow ? "none" : "block" }} className="cursor-pointer" />
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}

        {errors.root && <p className="mt-3 text-sm text-red-600">{errors.root.message}</p>}
        {serverMsg && <p className="mt-3 text-sm text-emerald-700">{serverMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-text-primary text-background py-2 font-medium disabled:opacity-60 
          hover:scale-103 transition-all cursor-pointer"
        >
          {isSubmitting ? "Signing in..." : "Log In"}
        </button>

        <div className="my-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className=" text-text-secondary">or</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="grid grid-cols-2 gap-3  items-center content-center justify-center justify-items-center">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-2 rounded-lg border border-card-border py-2 hover:bg-card-bg disabled:opacity-60 cursor-pointer hover:scale-105 transition-all w-20"
            title="Continue with Google"
          >
            <FaGoogle color="black" />
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("discord")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center gap-2 rounded-lg border border-card-border py-2 hover:bg-card-bg disabled:opacity-60 cursor-pointer hover:scale-105 transition-all w-20"
            title="Continue with Discord"
          >
            <FaDiscord color="black" />
          </button>
        </div>

        <p className="mt-4 text-sm text-center text-text-primary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline text-text-secondary">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

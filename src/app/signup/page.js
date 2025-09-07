//signup page
"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { FaLock, FaLockOpen } from "react-icons/fa";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    reset,
    setFocus,
  } = useForm();

  const [serverMsg, setServerMsg] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);
  const inputBase =
    "w-full rounded-lg border bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 hover:border-neutral-900 transition-all";

  const onSubmit = async (values) => {
    setServerMsg("");
    const { name, email, password, phone } = values;
    console.log(values);

    // Supabase signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name || "", phone: phone || "" },
        // emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    });

    if (error) {
      setError("root", { message: error.message });
      return;
    }

    if (data?.user) {
      // Save user to MongoDB
      await fetch("/api/saveUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          supabaseId: data.user.id
        })
      });
    }

    if (data?.user && !data?.session) {
      setServerMsg("Check your inbox to confirm your email and complete sign up.");
      reset({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
    } else {
      setServerMsg("Signed up successfully!");
    }
  };

  const pwd = watch("password", "");

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-white ">
      <div className="mb-6">
        <Image alt="Logo" src="/logo.png" width={50} height={50} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm rounded-2xl p-6 shadow-md border">
        <h1 className="text-3xl font-semibold mb-5 text-black text-center">Create an account</h1>

        {/* Name */}
        <label className="block mb-2 text-sm font-medium text-black" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Don Fricks"
          className={`${inputBase} ${errors.name ? "border-red-500" : "border-neutral-300"} mb-3`}
          {...register("name", {
            required: "Full name is required",
          })}
        />

        {/* Email */}
        <label className="block mb-2 text-sm font-medium text-black" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="youremail@gmail.com"
          className={`${inputBase} ${errors.email ? "border-red-500" : "border-neutral-300"}`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Enter a valid email",
            },
          })}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}

        {/* Phone */}
        <label className="block mt-4 mb-2 text-sm font-medium text-black" htmlFor="phone">
          Phone number (optional)
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+1 234 567 890"
          className={`${inputBase} ${errors.phone ? "border-red-500" : "border-neutral-300"}`}
          {...register("phone", {
            pattern: {
              value: /^[0-9+\-\s()]*$/,
              message: "Enter a valid phone number",
            },
          })}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}

        {/* Password */}
        <label className="block mt-4 mb-2 text-sm font-medium text-black" htmlFor="password">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none cursor-pointer "
            title={passwordShow ? "Hide password" : "Show password"}
          >
            {passwordShow ? <FaLockOpen /> : <FaLock />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}

        {/* Confirm Password */}
        <label className="block mt-4 mb-2 text-sm font-medium text-black" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className={`${inputBase} ${errors.confirmPassword ? "border-red-500" : "border-neutral-300"}`}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (val) => val === pwd || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}

        {/* Root/server error */}
        {errors.root && <p className="mt-3 text-sm text-red-600">{errors.root.message}</p>}

        {/* Server message */}
        {serverMsg && <p className="mt-3 text-sm text-emerald-700">{serverMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60 hover:scale-103
          transition-all cursor-pointer"
        >
          {isSubmitting ? "Creating..." : "Sign Up"}
        </button>

        <p className="mt-3 text-sm text-center text-black">
          Already have an account?{" "}
          <Link href="/signin" className="underline text-gray-500">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

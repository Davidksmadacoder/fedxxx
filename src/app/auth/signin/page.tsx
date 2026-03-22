"use client";
import { LoginFormData, LoginSchema } from "@/utils/schemas/schemas";
import Link from "next/link";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/api/axios";
import toast from "react-hot-toast";
import Input1 from "@/components/ui/input/Input1";
import { TiChevronLeft } from "react-icons/ti";
import { UserContext } from "@/contexts/UserContext";
import Button1 from "@/components/ui/button/Button1";
import { MdLocalShipping, MdSecurity } from "react-icons/md";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post(
        "/auth/login",
        {
          email: data.email,
          password: data.password,
        },
        { timeout: 30000 }
      );
      toast.success(response.data.message || "Login successful!");
      const loginData = {
        token: response?.data?.token,
        user: response?.data?.admin,
      };
      login(loginData);
      router.push("/admin-dashboard");
    } catch (error: any) {
      if (error?.code === "ECONNABORTED") {
        toast.error("Login request timed out. Please try again.");
        return;
      }
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        const backendErrors = error.response.data;
        Object.values(backendErrors).forEach((err: any) => {
          toast.error(err[0]);
        });
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm custom-black-white-theme-switch-text hover:text-gray-700 transition-colors duration-300"
        >
          <TiChevronLeft />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[var(--bg-general-lighter)] rounded-xl flex items-center justify-center">
                <MdLocalShipping
                  className="text-[var(--bg-general)]"
                  size={24}
                />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold custom-black-white-theme-switch-text">
                  Welcome to Fedx Global Shipping
                </h1>
                <p className="text-sm custom-black-white-theme-switch-text">
                  Your trusted logistics partner
                </p>
              </div>
            </div>
            <p className="text-sm custom-black-white-theme-switch-text text-gray-600 dark:text-gray-400">
              Securely access your logistics dashboard
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <Input1
                label="Email Address*"
                id="email"
                placeholder="Enter your registered email"
                type="email"
                register={register}
                error={errors.email?.message}
              />

              {/* Password */}
              <Input1
                label="Password*"
                id="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                register={register}
                error={errors.password?.message}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />

              {/* Submit Button */}
              <div className="col-span-1 sm:col-span-2 pt-2">
                <Button1
                  isLoading={isLoading}
                  loadingText="Signing In..."
                  text="Access Dashboard"
                />
              </div>
            </form>

            {/* Security Notice */}
            <div className="p-4 mt-6 text-xs border rounded-lg border-[var(--bg-general-light)] bg-[var(--bg-general-lighter)]">
              <div className="flex items-start gap-3">
                <MdSecurity
                  className="text-[var(--bg-general)] flex-shrink-0 mt-0.5"
                  size={16}
                />
                <div>
                  <h3 className="font-medium text-[var(--bg-general)] mb-1">
                    Security Notice
                  </h3>
                  <p className="custom-black-white-theme-switch-text">
                    Fedx Global Shipping will never ask for your password via
                    email or phone. Always ensure you're on our official website
                    before entering your credentials. Keep your login details
                    confidential.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

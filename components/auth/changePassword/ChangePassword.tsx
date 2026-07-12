/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import { useChangePasswordMutation } from "@/store/auth/authApi";
import TranslateHook from "@/translate/TranslateHook";
import LangUseParams from "@/translate/LangUseParams";
import { dash } from "@/constants/dashboardUi";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ChangePasswordSkeleton from "@/components/skeleton/ChangePasswordSkeleton";

const ChangePassword = () => {
  const router = useRouter();
  const lang = LangUseParams();
  const translate = TranslateHook();
  const t = translate?.pages.changePassword;
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [form, setForm] = useState({
    old_password: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (key: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!form.old_password.trim()) {
      errors.push(t?.oldRequired);
    }
    if (!form.password.trim()) {
      errors.push(t?.newRequired);
    } else if (form.password.length < 8) {
      errors.push(t?.minLength);
    }
    if (form.password !== form.password_confirmation) {
      errors.push(t?.notMatch);
    }
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    try {
      const res = await changePassword(form).unwrap();
      toast.success(res?.message);

      setForm({
        old_password: "",
        password: "",
        password_confirmation: "",
      });

      setTimeout(() => {
        router.push(`/${lang}`);
      }, 1000);
    } catch (err: any) {
      const errorData = err?.data ?? err;

      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((messages: any) =>
          messages.forEach((msg: string) => toast.error(msg)),
        );
        return;
      }
    }
  };

  if (!translate) {
    return <ChangePasswordSkeleton />;
  }

  const passwordField = (
    id: string,
    name: keyof typeof form,
    label: string | undefined,
    showKey: keyof typeof showPassword,
    autoComplete: string,
    hint?: string | undefined,
  ) => (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800"
      >
        {label}
      </Label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={showPassword[showKey] ? "text" : "password"}
          name={name}
          value={form[name]}
          onChange={handleChange}
          autoComplete={autoComplete}
          className={cn("h-11 ps-10 pe-10", dash.input)}
        />
        <button
          type="button"
          onClick={() => togglePassword(showKey)}
          className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword[showKey] ? "Hide password" : "Show password"}
        >
          {showPassword[showKey] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {hint ? (
        <p className="text-xs text-red-500">{hint}</p>
      ) : null}
    </div>
  );

  return (
    <div className={dash.formPage} >
      <Card className={dash.formCard}>
        <CardHeader className={dash.formCardHeader}>
          <CardTitle className="flex flex-wrap items-start gap-4 text-xl md:text-2xl font-bold text-slate-900">
            <span className={dash.pageIconBox}>
              <Lock className="w-6 h-6" />
            </span>
            <div className="space-y-2 min-w-0 text-start">
              <span className="leading-tight block">{t?.title}</span>
              <CardDescription className={cn(dash.listDescription, "mt-0")}>
                {t?.subtitle}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={cn(dash.formCardContent, "space-y-8")}>
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <section className={dash.sectionNeutral}>
              <div className="mb-6 flex flex-wrap items-start gap-4">
                <span className={dash.sectionIconWrap}>
                  <KeyRound className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {t?.title}
                </p>
              </div>

              <div className="space-y-6">
                {passwordField(
                  "old_password",
                  "old_password",
                  t?.oldPassword,
                  "old",
                  "current-password",
                )}
                {passwordField(
                  "password",
                  "password",
                  t?.password,
                  "new",
                  "new-password",
                  t?.passCondition,
                )}
                {passwordField(
                  "password_confirmation",
                  "password_confirmation",
                  t?.confirmPassword,
                  "confirm",
                  "new-password",
                )}
              </div>
            </section>

            <div className={cn(dash.formFooterBar, "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-center")}>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl px-8 py-6 text-base font-semibold"
                onClick={() => router.push(`/${lang}`)}
              >
                {t?.cancelBtn}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(dash.formSubmit, "mt-0 gap-2")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                    {t?.confirmBtn}
                  </>
                ) : (
                  t?.confirmBtn
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;

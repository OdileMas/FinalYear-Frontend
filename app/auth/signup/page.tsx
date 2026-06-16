"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  ChevronRight,
  Mail,
  AlertCircle,
  Building2,
  Check,
} from "lucide-react";

import { signupUser, getAuthErrorMessage, AuthUser } from "@/lib/services/auth-service";
import { createOrganization, assignUserOrganization } from "@/lib/services/organization-service";
import { useAuthStore } from "@/lib/auth/auth-store";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const orgSchema = z.object({
  orgName: z.string().min(2, "Organization / village name is required"),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [createdUser, setCreatedUser] = React.useState<AuthUser | null>(null);
  const [createdToken, setCreatedToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const orgForm = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: { orgName: "" },
  });

  // Step 1: create the account first.
  const onCreateAccount = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await signupUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        // Whoever creates the org during signup owns it as its admin.
        role: "HEAD_OF_SECURITY",
      });

      useAuthStore.getState().setSession(token, user);
      setCreatedToken(token);
      setCreatedUser(user);
      setStep(2);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: only after the account exists, create the organization and attach it.
  const onCreateOrg = async (data: OrgFormData) => {
    if (!createdUser || !createdToken) return;
    setLoading(true);
    setError(null);
    try {
      const org = await createOrganization(data.orgName);
      await assignUserOrganization(createdUser.id, org.id);
      useAuthStore.getState().setSession(createdToken, { ...createdUser, organizationId: org.id });
      router.push(createdUser.role === "HEAD_OF_SECURITY" ? "/admin" : "/guard");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-300 py-12">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className="w-full max-w-md px-4"
       >
        <div className="backdrop-blur-xl bg-blue-50/80 border border-blue-200 rounded-3xl shadow-lg overflow-hidden transition-colors duration-300">
          <div className="p-8 sm:p-10">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
            </div>

            <div className="text-center mb-6">
               <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                 {step === 1 ? "Create Account" : "Set Up Your Organization"}
               </h2>
               <p className="text-sm text-gray-600">
                 {step === 1 ? "Join the Irondo Security System" : "Almost done — name the community you're securing"}
               </p>
             </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= 1 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > 1 ? <Check className="h-3.5 w-3.5" /> : 1}
                </div>
                <span className={`text-xs font-medium ${step === 1 ? "text-gray-900" : "text-gray-400"}`}>
                  Account
                </span>
              </div>
              <div className={`h-px w-8 ${step > 1 ? "bg-emerald-500" : "bg-gray-200"}`} />
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step >= 2 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  2
                </div>
                <span className={`text-xs font-medium ${step === 2 ? "text-gray-900" : "text-gray-400"}`}>
                  Organization
                </span>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.div>
            )}

            {step === 1 ? (
            <form onSubmit={handleSubmit(onCreateAccount)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 ml-1">Full Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Input id="fullName" type="text" placeholder="Jean Kanimba"
                      className="w-full bg-white border-gray-300 text-gray-900 h-12 rounded-xl pl-11 focus:ring-emerald-500/50 placeholder:text-gray-400 transition-colors duration-300" {...register("fullName")} />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-600 ml-1">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 ml-1">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Input id="email" type="email" autoComplete="email" placeholder="you@irondo.rw"
                      className="w-full bg-white border-gray-300 text-gray-900 h-12 rounded-xl pl-11 focus:ring-emerald-500/50 placeholder:text-gray-400 transition-colors duration-300" {...register("email")} />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 ml-1">{errors.email.message}</p>}
                </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 ml-1">Password</Label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-emerald-500" />
                   </div>
                    <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••"
                      className="w-full bg-white border-gray-300 text-gray-900 h-12 rounded-xl pl-11 pr-11 focus:ring-emerald-500/50 placeholder:text-gray-400 transition-colors duration-300" {...register("password")} />
                   <button type="button" onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 </div>
                 {errors.password && <p className="text-xs text-red-600 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 ml-1">Confirm Password</Label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-emerald-500" />
                   </div>
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••"
                      className="w-full bg-white border-gray-300 text-gray-900 h-12 rounded-xl pl-11 pr-11 focus:ring-emerald-500/50 placeholder:text-gray-400 transition-colors duration-300" {...register("confirmPassword")} />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-500 hover:text-emerald-600 transition-colors">
                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 </div>
                 {errors.confirmPassword && <p className="text-xs text-red-600 ml-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-base mt-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]" disabled={loading}>
                 {loading ? (
                   <span className="flex items-center justify-center gap-2">
                     <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...
                   </span>
                 ) : (
                   <span className="flex items-center justify-center gap-2">Continue <ChevronRight className="h-4 w-4" /></span>
                 )}
              </Button>
            </form>
            ) : (
              <form onSubmit={orgForm.handleSubmit(onCreateOrg)} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-500">
                    Your account is ready. Now set up the community or organization you're securing.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="orgName" className="text-sm font-medium text-gray-700 ml-1">Organization / Village Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Input id="orgName" type="text" placeholder="Kinyinya Village"
                      className="w-full bg-white border-gray-300 text-gray-900 h-12 rounded-xl pl-11 focus:ring-emerald-500/50 placeholder:text-gray-400 transition-colors duration-300" {...orgForm.register("orgName")} />
                  </div>
                  {orgForm.formState.errors.orgName && (
                    <p className="text-xs text-red-600 ml-1">{orgForm.formState.errors.orgName.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-base mt-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating organization...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">Finish <ChevronRight className="h-4 w-4" /></span>
                  )}
                </Button>
              </form>
            )}
          </div>

           <div className="bg-blue-50/50 border-t border-blue-200 p-6 text-center transition-colors duration-300">
              <p className="text-sm text-gray-600">
                Already have an account? <a href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1 transition-colors">Log in</a>
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

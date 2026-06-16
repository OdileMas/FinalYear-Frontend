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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  ChevronRight,
  Mail,
  AlertCircle,
} from "lucide-react";

import { loginUser, getAuthErrorMessage } from "@/lib/services/auth-service";
import { useAuthStore } from "@/lib/auth/auth-store";

const loginSchema = z.object({
  role: z.enum(["HEAD_OF_SECURITY", "GUARD"]),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const bgBlobs = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  w: 50 + (i * 137) % 250,
  h: 50 + (i * 271) % 250,
  left: ((i * 313) % 10000) / 100,
  top: ((i * 479) % 10000) / 100,
  delay: (i * 1.7) % 10,
  dur: 10 + (i * 3) % 10,
}));

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role: undefined },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await loginUser(data.email, data.password);

      if (user.role !== data.role) {
        setError(`This account is registered as ${user.role.replace("_", " ")}, not ${data.role.replace("_", " ")}.`);
        return;
      }

      useAuthStore.getState().setSession(token, user);
      router.push(user.role === "HEAD_OF_SECURITY" ? "/admin" : "/guard");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className="w-full max-w-md px-4"
       >
        <div className="backdrop-blur-xl bg-blue-50/80 dark:bg-gray-900/80 border border-blue-200 dark:border-gray-800 rounded-3xl shadow-lg overflow-hidden transition-colors duration-300">
          <div className="p-8 sm:p-10">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
            </div>

            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">Welcome Back</h2>
               <p className="text-sm text-gray-600 dark:text-gray-400">Login to Irondo Security System</p>
             </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </motion.div>
              )}

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Account Type</Label>
                  <Select onValueChange={(v) => setValue("role", v as "HEAD_OF_SECURITY" | "GUARD", { shouldValidate: true })} defaultValue="">
                    <SelectTrigger id="role" name="role" className="w-full bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-12 rounded-xl focus:ring-emerald-500/50 transition-colors duration-300">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectItem value="HEAD_OF_SECURITY" className="focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-900 dark:focus:text-gray-100 cursor-pointer">
                        Head of Security
                      </SelectItem>
                      <SelectItem value="GUARD" className="focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-900 dark:focus:text-gray-100 cursor-pointer">
                        Security Guard
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-red-600 dark:text-red-400 ml-1">{errors.role.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Input id="email" type="email" autoComplete="email" placeholder="you@irondo.rw"
                      className="w-full bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-12 rounded-xl pl-11 focus:ring-emerald-500/50 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300" {...register("email")} />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 dark:text-red-400 ml-1">{errors.email.message}</p>}
                </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</Label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-emerald-500" />
                   </div>
                    <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                      className="w-full bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-12 rounded-xl pl-11 pr-11 focus:ring-emerald-500/50 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-300" {...register("password")} />
                   <button type="button" onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 </div>
                 {errors.password && <p className="text-xs text-red-600 dark:text-red-400 ml-1">{errors.password.message}</p>}
                <div className="flex justify-end pt-1">
                   <a href="/auth/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">Forgot password?</a>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-base mt-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]" disabled={loading}>
                 {loading ? (
                   <span className="flex items-center justify-center gap-2">
                     <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...
                   </span>
                 ) : (
                   <span className="flex items-center justify-center gap-2">Login <ChevronRight className="h-4 w-4" /></span>
                 )}
              </Button>
            </form>
          </div>
          
           <div className="bg-blue-50/50 dark:bg-gray-900/50 border-t border-blue-200 dark:border-gray-800 p-6 text-center transition-colors duration-300">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account? <a href="/auth/signup" className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium ml-1 transition-colors">Sign up</a>
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
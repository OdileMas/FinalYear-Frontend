"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Mail,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Fake delay for UX to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-300">
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

            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Reset Password</h2>
               <p className="text-sm text-gray-600">Enter your email to receive a reset link</p>
             </div>

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="text-sm text-gray-600">
                  We have sent a password reset link to your email address.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </motion.div>
                )}

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

                <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-base mt-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]" disabled={loading}>
                   {loading ? (
                     <span className="flex items-center justify-center gap-2">
                       <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...
                     </span>
                   ) : (
                     <span className="flex items-center justify-center gap-2">Send Reset Link <ChevronRight className="h-4 w-4" /></span>
                   )}
                </Button>
              </form>
            )}
          </div>
          
           <div className="bg-blue-50/50 border-t border-blue-200 p-6 text-center transition-colors duration-300">
              <p className="text-sm text-gray-600">
                Remember your password? <a href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1 transition-colors">Log in</a>
              </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

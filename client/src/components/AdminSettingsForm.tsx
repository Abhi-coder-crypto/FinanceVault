import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { phoneNumberSchema, strongPasswordSchema } from "@shared/schema";
import type { User } from "@shared/schema";

const adminProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: phoneNumberSchema.optional().or(z.literal("")),
  password: strongPasswordSchema.optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AdminProfileFormData = z.infer<typeof adminProfileSchema>;

interface AdminSettingsFormProps {
  user: User;
  onUpdate: (data: { name?: string; phoneNumber?: string; password?: string }) => Promise<void>;
}

export default function AdminSettingsForm({ user, onUpdate }: AdminSettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<AdminProfileFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AdminProfileFormData) => {
    try {
      setLoading(true);
      
      const updates: { name?: string; phoneNumber?: string; password?: string } = {};
      
      if (data.name && data.name !== user.name) {
        updates.name = data.name;
      }
      
      if (data.phoneNumber && data.phoneNumber !== user.phoneNumber) {
        updates.phoneNumber = data.phoneNumber;
      }
      
      if (data.password) {
        updates.password = data.password;
      }

      if (Object.keys(updates).length === 0) {
        form.setError("root", { message: "No changes to save" });
        return;
      }

      await onUpdate(updates);
      
      form.reset({
        name: updates.name || user.name || "",
        phoneNumber: updates.phoneNumber || user.phoneNumber || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Profile</CardTitle>
        <CardDescription>
          Update your profile information and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your name"
                      data-testid="input-admin-name"
                    />
                  </FormControl>
                  <FormDescription>
                    Your display name for the admin account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="font-mono"
                      data-testid="input-admin-phone"
                    />
                  </FormControl>
                  <FormDescription>
                    Your phone number with country code (e.g., +1234567890)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Leave blank to keep your current password
              </p>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter new password"
                          data-testid="input-admin-password"
                        />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm new password"
                          data-testid="input-admin-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {form.formState.errors.root && (
              <div className="text-sm text-destructive" data-testid="text-error">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              data-testid="button-save-profile"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

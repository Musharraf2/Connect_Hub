"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { updatePhonePrivacy } from "@/lib/api";

interface PrivacyToggleProps {
  userId: number;
  isPhonePublic?: boolean;
  onToggle?: (isPublic: boolean) => void;
}

export function PrivacyToggle({
  userId,
  isPhonePublic = false,
  onToggle,
}: PrivacyToggleProps) {
  const [isPublic, setIsPublic] = useState(isPhonePublic);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const newValue = !isPublic;
    setIsLoading(true);

    try {
      const data = await updatePhonePrivacy(userId, newValue);
      setIsPublic(newValue);
      toast.success(data.message);
      
      if (onToggle) {
        onToggle(newValue);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update privacy setting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        {isPublic ? (
          <Eye className="w-5 h-5 text-primary" />
        ) : (
          <EyeOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <Label className="text-sm font-medium">
            Show phone number on public profile
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPublic
              ? "Your phone number is visible to everyone"
              : "Your phone number is only visible to you"}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${isPublic ? "bg-primary" : "bg-muted"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-white" />
          </div>
        ) : (
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isPublic ? "translate-x-6" : "translate-x-1"}
            `}
          />
        )}
      </button>
    </div>
  );
}

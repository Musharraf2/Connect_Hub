"use client";

import { useState } from "react";
import { Phone, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface PhoneInputSectionProps {
  userId: number;
  currentPhone?: string | null;
  isVerified?: boolean;
  onVerificationComplete?: (phoneNumber: string) => void;
}

export function PhoneInputSection({
  userId,
  currentPhone,
  isVerified = false,
  onVerificationComplete,
}: PhoneInputSectionProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || "");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");

  const hasChanged = phoneNumber !== currentPhone;
  const isCurrentlyVerified = isVerified && !hasChanged;

  const handleVerifyClick = async () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      toast.error("Please enter a phone number");
      return;
    }

    // Validate phone format
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      toast.error("Invalid phone format. Use international format: +1234567890");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/phone/verify-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send OTP");
      }

      const data = await response.json();
      toast.success(data.message);
      setPendingPhone(phoneNumber);
      setShowOtpModal(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/phone/verify-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, phoneNumber: pendingPhone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid OTP");
      }

      const data = await response.json();
      toast.success(data.message);
      setShowOtpModal(false);
      setOtp("");
      
      if (onVerificationComplete) {
        onVerificationComplete(pendingPhone);
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone-number" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
          {isCurrentlyVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
              <Check className="w-3 h-3" />
              Verified
            </span>
          )}
        </Label>
        
        <div className="flex gap-2">
          <Input
            id="phone-number"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1"
          />
          
          {hasChanged && (
            <Button
              type="button"
              onClick={handleVerifyClick}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Use international format (e.g., +1234567890). Verification required to update.
        </p>
      </div>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit code to {pendingPhone}. Please enter it below.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="otp">6-Digit Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Code expires in 5 minutes
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOtpModal(false);
                setOtp("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOtpSubmit}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

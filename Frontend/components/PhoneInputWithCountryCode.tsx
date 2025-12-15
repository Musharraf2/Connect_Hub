"use client";

import { useState } from "react";
import { Phone, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { initiatePhoneVerification, confirmPhoneVerification } from "@/lib/api";

interface PhoneInputWithCountryCodeProps {
  userId: number;
  currentPhone?: string | null;
  isVerified?: boolean;
  onVerificationComplete?: (phoneNumber: string) => void;
}

// Common country codes
const COUNTRY_CODES = [
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
];

export function PhoneInputWithCountryCode({
  userId,
  currentPhone,
  isVerified = false,
  onVerificationComplete,
}: PhoneInputWithCountryCodeProps) {
  // Parse existing phone number into country code and number
  const parsePhone = (phone: string | null | undefined) => {
    if (!phone) return { countryCode: "+1", phoneNumber: "" };
    
    // Find matching country code
    const matchedCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
    if (matchedCode) {
      return {
        countryCode: matchedCode.code,
        phoneNumber: phone.substring(matchedCode.code.length),
      };
    }
    
    return { countryCode: "+1", phoneNumber: "" };
  };

  const parsed = parsePhone(currentPhone);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(parsed.phoneNumber);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");

  const fullPhoneNumber = countryCode + phoneNumber;
  const hasChanged = fullPhoneNumber !== currentPhone;
  const isCurrentlyVerified = isVerified && !hasChanged;

  const handleVerifyClick = async () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      toast.error("Please enter a phone number");
      return;
    }

    // Validate phone number (10 digits for most countries)
    if (!phoneNumber.match(/^\d{10}$/)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const fullPhone = countryCode + phoneNumber;
    
    setIsLoading(true);
    try {
      const data = await initiatePhoneVerification(userId, fullPhone);
      toast.success(data.message);
      setPendingPhone(fullPhone);
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
      const data = await confirmPhoneVerification(userId, otp, pendingPhone);
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and limit to 10 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(value);
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
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            id="phone-number"
            type="tel"
            placeholder="1234567890"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="flex-1"
            maxLength={10}
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
          Enter your 10-digit phone number. Verification required to update.
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

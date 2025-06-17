"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Loader2, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

export default function NewClaimPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    contact_email: "",
    event_type: "",
    event_date: "",
    event_location: "",
    damage_description: "",
    vehicle_vin: "",
    photos: [] as string[],
  });

  // Create claim mutation
  const createClaimMutation = api.claims.createClaim.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Claim created successfully",
        description: `Claim ${data.claim_id || "new claim"} has been created and is now under review.`,
      });
      router.push("/claims");
    },
    onError: (error) => {
      toast({
        title: "Error creating claim",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.contact_email || 
        !formData.event_type || !formData.event_date || !formData.damage_description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Date validation
    const eventDate = new Date(formData.event_date);
    const today = new Date();
    if (eventDate > today) {
      toast({
        title: "Validation Error",
        description: "Event date cannot be in the future.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createClaimMutation.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        contact_email: formData.contact_email,
        event_type: formData.event_type,
        event_date: formData.event_date,
        event_location: formData.event_location,
        damage_description: formData.damage_description,
        vehicle_vin: formData.vehicle_vin,
        photos: formData.photos,
        policyholder_id: undefined, // This would be selected from a dropdown in a real app
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  // Handle photo upload (mock functionality)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // In a real app, you'd upload to cloud storage and get URLs
      const newPhotos = files.map(file => `mock-photo-url-${file.name}`);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 5) // Limit to 5 photos
      }));
      
      toast({
        title: "Photos added",
        description: `${files.length} photo(s) added to your claim.`,
      });
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Format event type for display
  const eventTypes = [
    { value: "collision", label: "Vehicle Collision" },
    { value: "animal_collision", label: "Animal Collision" },
    { value: "theft", label: "Theft" },
    { value: "vandalism", label: "Vandalism" },
    { value: "weather", label: "Weather Damage" },
    { value: "fire", label: "Fire Damage" },
    { value: "flood", label: "Flood Damage" },
    { value: "other", label: "Other" },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/claims">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Insurance Claim</h1>
            <p className="text-gray-600">Submit a new insurance claim for review</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Please provide your personal details for this claim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange("contact_email", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>
                Provide information about the incident that occurred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_type">
                    Type of Incident <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => handleInputChange("event_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_date">
                    Date of Incident <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => handleInputChange("event_date", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_location">Location of Incident</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="event_location"
                    value={formData.event_location}
                    onChange={(e) => handleInputChange("event_location", e.target.value)}
                    placeholder="e.g., 123 Main St, City, State"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_vin">Vehicle VIN (if applicable)</Label>
                <Input
                  id="vehicle_vin"
                  value={formData.vehicle_vin}
                  onChange={(e) => handleInputChange("vehicle_vin", e.target.value)}
                  placeholder="e.g., 1HGBH41JXMN109186"
                  maxLength={17}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="damage_description">
                  Damage Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="damage_description"
                  value={formData.damage_description}
                  onChange={(e) => handleInputChange("damage_description", e.target.value)}
                  placeholder="Please describe the damage and what happened in detail..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documentation</CardTitle>
              <CardDescription>
                Upload photos or documents related to your claim (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload photos or documents
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      PNG, JPG, PDF up to 10MB each (max 5 files)
                    </span>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {formData.photos.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.photos.map((photo, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-2 pr-1"
                      >
                        <span>Photo {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/claims">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Claim...
                </>
              ) : (
                "Submit Claim"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
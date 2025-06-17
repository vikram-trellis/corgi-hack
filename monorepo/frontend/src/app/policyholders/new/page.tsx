"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

export default function NewPolicyholderPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: ""
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as Record<string, any>,
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // tRPC mutation
  const createPolicyholder = api.policyholders.createPolicyholder.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Policyholder created successfully",
      });
      router.push("/policyholders");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create policyholder: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPolicyholder.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      address: formData.address
    });
  };
  
  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.last_name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.date_of_birth.trim() !== "" &&
      formData.address.street.trim() !== "" &&
      formData.address.city.trim() !== "" &&
      formData.address.state.trim() !== "" &&
      formData.address.zip.trim() !== ""
    );
  };

  return (
    <AppLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/policyholders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Policyholder</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Policyholder Information</CardTitle>
          <CardDescription>Enter the details for the new policyholder</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">
                  Last Name *
                </label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="date_of_birth" className="text-sm font-medium">
                  Date of Birth *
                </label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="street" className="text-sm font-medium">
                    Street Address *
                  </label>
                  <Input
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City *
                  </label>
                  <Input
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State *
                  </label>
                  <Input
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="zip" className="text-sm font-medium">
                    ZIP Code *
                  </label>
                  <Input
                    id="zip"
                    name="address.zip"
                    value={formData.address.zip}
                    onChange={handleInputChange}
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" asChild>
                <Link href="/policyholders">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={!isFormValid() || createPolicyholder.isLoading}
              >
                {createPolicyholder.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Policyholder
                  </>
                )}
              </Button>
            </div>
            
            {createPolicyholder.isError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                <p className="text-sm">
                  Error: {createPolicyholder.error.message || "An error occurred. Please try again."}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
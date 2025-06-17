"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/app-layout";
import { ArrowRight, ArrowUpRight, DollarSign, FileText, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <AppLayout>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">125</span>
                </div>
                <div className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                  +12.5%
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">24 new in the last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Policyholders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">3,287</span>
                </div>
                <div className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                  +5.8%
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">156 new in the last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Claims Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">$284,521</span>
                </div>
                <div className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                  +2.1%
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">$35,000 in the last 30 days</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>Claims submitted in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "CLM12345678", name: "John Smith", date: "June 15, 2025", type: "Collision", status: "Submitted" },
                  { id: "CLM87654321", name: "Sarah Johnson", date: "June 14, 2025", type: "Theft", status: "Under Review" },
                  { id: "CLM24681357", name: "Michael Williams", date: "June 12, 2025", type: "Weather", status: "Approved" },
                  { id: "CLM13572468", name: "Emily Davis", date: "June 10, 2025", type: "Fire", status: "Pending" },
                ].map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex flex-col">
                      <div className="font-medium">{claim.name}</div>
                      <div className="text-sm text-gray-500">{claim.id}</div>
                    </div>
                    <div className="flex flex-col text-right">
                      <div className="text-sm">{claim.type}</div>
                      <div className="text-xs text-gray-500">{claim.date}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/claims">
                    View All Claims <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Claim Status Overview</CardTitle>
              <CardDescription>Current distribution of claims by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: "Draft", count: 12, color: "bg-gray-100" },
                  { status: "Submitted", count: 28, color: "bg-blue-100" },
                  { status: "Under Review", count: 15, color: "bg-amber-100" },
                  { status: "Approved", count: 42, color: "bg-emerald-100" },
                  { status: "Denied", count: 8, color: "bg-red-100" },
                  { status: "Closed", count: 20, color: "bg-purple-100" },
                ].map((status) => (
                  <div key={status.status} className="flex items-center">
                    <div className="text-sm min-w-24">{status.status}</div>
                    <div className="flex-1 mx-2">
                      <div className="h-2 rounded-full bg-gray-100">
                        <div 
                          className={`h-2 rounded-full ${status.color}`} 
                          style={{ width: `${(status.count / 125) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium">{status.count}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/claims">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
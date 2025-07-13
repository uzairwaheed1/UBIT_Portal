"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { DollarSign, Calendar, AlertCircle } from "lucide-react"

export default function StudentFees() {
  const { user } = useAuth()
  const [fees, setFees] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    try {
      const response = await fetch(`/api/fees?program=BS Computer Science&yearOfAdmission=2021`)
      const data = await response.json()

      if (data.success && data.fees.length > 0) {
        setFees(data.fees[0])
      } else {
        // Set default fees if none found
        setFees({
          program: "BS Computer Science",
          yearOfAdmission: 2021,
          tuitionFee: 50000,
          examFee: 5000,
          labFee: 5000,
          libraryFee: 2000,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        })
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalFees = fees ? fees.tuitionFee + fees.examFee + fees.labFee + fees.libraryFee : 0
  const isDueSoon = fees && new Date(fees.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  if (loading) {
    return <div className="flex items-center justify-center min-h-96">Loading fees information...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fee Structure</h1>
        <p className="text-gray-600 mt-2">View your fee details and payment information</p>
      </div>

      {isDueSoon && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Payment Due Soon!</p>
            </div>
            <p className="text-orange-700 mt-1">
              Your fee payment is due on {new Date(fees.dueDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Fee Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Summary
            </CardTitle>
            <CardDescription>
              {fees?.program} • Admission Year: {fees?.yearOfAdmission}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Tuition Fee</span>
                <span className="text-lg font-bold">₹{fees?.tuitionFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Exam Fee</span>
                <span className="text-lg font-bold">₹{fees?.examFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Lab Fee</span>
                <span className="text-lg font-bold">₹{fees?.labFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Library Fee</span>
                <span className="text-lg font-bold">₹{fees?.libraryFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">₹{totalFees.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Due Date</span>
                <Badge variant={isDueSoon ? "destructive" : "default"}>
                  {new Date(fees?.dueDate).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Status</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Instructions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Visit the accounts office for fee payment</li>
                  <li>• Bring your student ID and fee receipt</li>
                  <li>• Payment can be made via cash, card, or bank transfer</li>
                  <li>• Late payment may incur additional charges</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

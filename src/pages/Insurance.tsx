import { ArrowLeft, Shield, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Insurance() {
  const navigate = useNavigate();

  const mockInsurance = {
    provider: "PetCare Premium Insurance",
    policyNumber: "PC-2024-789456",
    coverage: {
      annual: 10000,
      used: 3250,
      remaining: 6750,
    },
    resetDate: "2025-01-15",
    deductible: {
      annual: 500,
      met: 500,
    },
    reimbursementRate: 80,
  };

  const mockClaims = [
    {
      id: 1,
      date: "2024-10-15",
      service: "Emergency Vet Visit",
      provider: "City Veterinary Clinic",
      amount: 850,
      reimbursed: 680,
      status: "approved",
    },
    {
      id: 2,
      date: "2024-09-22",
      service: "Dental Cleaning",
      provider: "Happy Paws Dental",
      amount: 450,
      reimbursed: 360,
      status: "approved",
    },
    {
      id: 3,
      date: "2024-08-10",
      service: "X-Ray & Consultation",
      provider: "City Veterinary Clinic",
      amount: 320,
      reimbursed: 256,
      status: "approved",
    },
    {
      id: 4,
      date: "2024-07-05",
      service: "Medication Refill",
      provider: "Pet Pharmacy Plus",
      amount: 125,
      reimbursed: 100,
      status: "approved",
    },
    {
      id: 5,
      date: "2024-11-01",
      service: "Annual Checkup",
      provider: "City Veterinary Clinic",
      amount: 180,
      reimbursed: 0,
      status: "pending",
    },
  ];

  const usagePercentage = (mockInsurance.coverage.used / mockInsurance.coverage.annual) * 100;

  return (
    <div className="min-h-screen bg-background pb-20 overflow-y-auto safe-top">
      <div className="sticky top-0 z-10 bg-background border-b safe-top">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Insurance</h1>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Policy Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{mockInsurance.provider}</h2>
              <p className="text-sm text-muted-foreground">Policy: {mockInsurance.policyNumber}</p>
            </div>
          </div>
          <Badge variant="secondary" className="mb-4">Active Coverage</Badge>
        </Card>

        {/* Coverage Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Annual Coverage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Used</span>
                <span className="text-sm font-medium">
                  ${mockInsurance.coverage.used.toLocaleString()} / ${mockInsurance.coverage.annual.toLocaleString()}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-accent">
                <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                <p className="text-2xl font-bold text-primary">
                  ${mockInsurance.coverage.remaining.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Resets On
                </p>
                <p className="text-lg font-semibold">
                  {new Date(mockInsurance.resetDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Policy Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Policy Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Annual Deductible</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Met (${mockInsurance.deductible.met})
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reimbursement Rate</span>
              <span className="font-semibold">{mockInsurance.reimbursementRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Coverage Type</span>
              <span className="font-semibold">Comprehensive</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Premium (Monthly)</span>
              <span className="font-semibold">$89.99</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Max Benefit per Condition</span>
              <span className="font-semibold">$5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wellness Coverage</span>
              <span className="font-semibold">Included</span>
            </div>
          </div>
        </Card>

        {/* Coverage Includes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">What's Covered</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Emergency veterinary care & hospitalization</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Chronic conditions & ongoing treatments</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Diagnostic tests, X-rays & bloodwork</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Surgeries & specialist consultations</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Prescription medications</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Alternative therapies (acupuncture, hydrotherapy)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Annual wellness exams & vaccinations</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Dental cleanings & extractions</span>
            </div>
          </div>
        </Card>

        {/* Recent Claims */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Claims</h3>
          <div className="space-y-3">
            {mockClaims.map((claim) => (
              <Card key={claim.id} className="p-4 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{claim.service}</h4>
                      {claim.status === 'approved' ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{claim.provider}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(claim.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${claim.amount}</p>
                    {claim.reimbursed > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        +${claim.reimbursed}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3">
          <Button className="w-full" size="lg">
            <DollarSign className="w-5 h-5 mr-2" />
            Make Claim
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            Read Policy Documents
          </Button>
        </div>
      </div>
    </div>
  );
}

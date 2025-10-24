// src/pages/NGODashboard.tsx - Updated with API integration
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Building, 
  Coins, 
  TrendingUp, 
  UserPlus, 
  Search, 
  LogOut,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  User,
  Loader2
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Cell, ResponsiveContainer, Pie } from 'recharts';
import { apiService, useApi } from "@/services/api";

// Chart data
const chartData = [
  { month: 'Jan', food: 4000, health: 2400, education: 2400 },
  { month: 'Feb', food: 3000, health: 1398, education: 2210 },
  { month: 'Mar', food: 2000, health: 9800, education: 2290 },
  { month: 'Apr', food: 2780, health: 3908, education: 2000 },
  { month: 'May', food: 1890, health: 4800, education: 2181 },
  { month: 'Jun', food: 2390, health: 3800, education: 2500 },
];

const pieData = [
  { name: 'Food & Nutrition', value: 400, color: '#0088FE' },
  { name: 'Healthcare', value: 300, color: '#00C49F' },
  { name: 'Education', value: 300, color: '#FFBB28' },
  { name: 'Emergency', value: 200, color: '#FF8042' },
];

const NGODashboard = () => {
  const { toast } = useToast();
  const [ngoSession, setNgoSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBeneficiaryDialog, setShowBeneficiaryDialog] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: "",
    location: "",
    emergencyContact: ""
  });
  
  const [newVendor, setNewVendor] = useState({
    name: "",
    wallet: "",
    category: ""
  });
  
  const [aidAllocationForm, setAidAllocationForm] = useState({
    beneficiaryId: "",
    amount: "",
    category: ""
  });

  // Load beneficiaries using API
  const { data: beneficiariesData, loading: beneficiariesLoading, error: beneficiariesError, refetch: refetchBeneficiaries } = useApi(
    () => apiService.getBeneficiaries(),
    []
  );

  // Load transparency data using API
  const { data: transparencyData, loading: transparencyLoading, refetch: refetchTransparency } = useApi(
    () => apiService.getTransparencyData(),
    []
  );

  const beneficiaries = beneficiariesData?.beneficiaries || [];
  const ngoStats = {
    totalAidDistributed: transparencyData?.totalAidDistributed || 0,
    totalBeneficiaries: transparencyData?.totalBeneficiaries || 0,
    activeVendors: 23, // This would come from vendors API
    currentBalance: 45200,
    blockchainEnabled: transparencyData?.blockchainEnabled || false
  };

  useEffect(() => {
    const session = sessionStorage.getItem('ngoSession');
    if (session) {
      setNgoSession(JSON.parse(session));
    } else {
      window.location.href = "/ngo-login";
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('ngoSession');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    window.location.href = "/ngo-login";
  };

  const handleRegisterBeneficiary = async () => {
    if (!newBeneficiary.name || !newBeneficiary.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call an API to register the beneficiary
      // For now, we'll simulate the process
      toast({
        title: "Feature Coming Soon",
        description: "Beneficiary registration will be integrated with the blockchain identity creation process.",
      });
      
      setNewBeneficiary({ name: "", location: "", emergencyContact: "" });
      setShowBeneficiaryDialog(false);
      refetchBeneficiaries();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register beneficiary",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.wallet) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // This would call an API to add vendor
      toast({
        title: "Feature Coming Soon",
        description: "Vendor management will be integrated with smart contract authorization.",
      });
      
      setNewVendor({ name: "", wallet: "", category: "" });
      setShowVendorDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to Add Vendor",
        description: error.message || "Failed to add vendor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAidAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aidAllocationForm.beneficiaryId || !aidAllocationForm.amount || !aidAllocationForm.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!ngoSession?.sessionId) {
      toast({
        title: "Error",
        description: "Invalid session. Please login again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.allocateAid({
        sessionId: ngoSession.sessionId,
        beneficiaryId: aidAllocationForm.beneficiaryId,
        amount: parseInt(aidAllocationForm.amount),
        category: aidAllocationForm.category
      });

      if (response.success) {
        toast({
          title: "Aid Allocated Successfully",
          description: `$${aidAllocationForm.amount} allocated${response.transactionId ? ` (TX: ${response.transactionId.slice(0, 8)}...)` : ''}.`,
        });
        
        setAidAllocationForm({ beneficiaryId: "", amount: "", category: "" });
        refetchBeneficiaries();
        refetchTransparency();
      } else {
        throw new Error(response.message || 'Aid allocation failed');
      }
    } catch (error: any) {
      toast({
        title: "Aid Allocation Failed",
        description: error.message || "Failed to allocate aid",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBeneficiaryAction = async (action: string, beneficiaryId: string, beneficiaryName: string) => {
    if (action === "view") {
      const beneficiary = beneficiaries.find((b: any) => b.digitalId === beneficiaryId);
      setSelectedBeneficiary(beneficiary);
      return;
    }

    setIsLoading(true);
    try {
      // This would call API to update beneficiary status
      toast({
        title: "Feature Coming Soon",
        description: `Beneficiary ${action} will be integrated with blockchain verification.`,
      });
    } catch (error: any) {
      toast({
        title: `Action Failed`,
        description: error.message || `Failed to ${action} beneficiary`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!ngoSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredBeneficiaries = beneficiaries.filter((b: any) => 
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.digitalId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">NGO Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {ngoSession.organizationName}
                {ngoStats.blockchainEnabled && (
                  <span className="ml-2 text-green-600">🔗 Blockchain Connected</span>
                )}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="allocation">Aid Allocation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Aid Distributed"
                value={`$${ngoStats.totalAidDistributed.toLocaleString()}`}
                description={transparencyLoading ? "Loading..." : "+12% from last month"}
                icon={Coins}
                variant="success"
              />
              <StatCard
                title="Total Beneficiaries"
                value={beneficiariesLoading ? "..." : ngoStats.totalBeneficiaries.toString()}
                description="Blockchain verified"
                icon={Users}
                variant="default"
              />
              <StatCard
                title="Active Vendors"
                value={ngoStats.activeVendors.toString()}
                description="Partnership network"
                icon={Building}
                variant="accent"
              />
              <StatCard
                title="Current Balance"
                value={`$${ngoStats.currentBalance.toLocaleString()}`}
                description="Available for allocation"
                icon={TrendingUp}
                variant="default"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest blockchain transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {transparencyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : transparencyData?.recentTransactions?.length > 0 ? (
                    <div className="space-y-4">
                      {transparencyData.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{transaction.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.blockchainTxHash ? (
                                <span className="font-mono">{transaction.blockchainTxHash.slice(0, 12)}...</span>
                              ) : (
                                'Processing...'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${transaction.amount}</p>
                            <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent transactions
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common dashboard actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={showBeneficiaryDialog} onOpenChange={setShowBeneficiaryDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register New Beneficiary
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register New Beneficiary</DialogTitle>
                        <DialogDescription>
                          Add a new beneficiary to the blockchain system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={newBeneficiary.name}
                            onChange={(e) => setNewBeneficiary(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter full name"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newBeneficiary.location}
                            onChange={(e) => setNewBeneficiary(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter location"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergency">Emergency Contact</Label>
                          <Input
                            id="emergency"
                            value={newBeneficiary.emergencyContact}
                            onChange={(e) => setNewBeneficiary(prev => ({ ...prev, emergencyContact: e.target.value }))}
                            placeholder="Enter emergency contact"
                            disabled={isLoading}
                          />
                        </div>
                        <Button onClick={handleRegisterBeneficiary} className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            'Register Beneficiary'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("allocation")}>
                    <Coins className="mr-2 h-4 w-4" />
                    Allocate Aid Tokens
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("analytics")}>
                    <Activity className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Beneficiaries Tab */}
          <TabsContent value="beneficiaries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Beneficiary Management</h2>
                <p className="text-muted-foreground">Manage blockchain-verified beneficiaries</p>
              </div>
              <Button onClick={() => setShowBeneficiaryDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Beneficiary
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search beneficiaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {beneficiariesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : beneficiariesError ? (
                  <div className="text-center py-12 text-red-500">
                    Error loading beneficiaries: {beneficiariesError}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Digital ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aid Balance</TableHead>
                        <TableHead>Reputation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBeneficiaries.length > 0 ? filteredBeneficiaries.map((beneficiary: any) => (
                        <TableRow key={beneficiary.digitalId}>
                          <TableCell className="font-mono text-xs">{beneficiary.digitalId}</TableCell>
                          <TableCell>{beneficiary.firstName} {beneficiary.lastName}</TableCell>
                          <TableCell>{beneficiary.location}</TableCell>
                          <TableCell>
                            <Badge variant={beneficiary.isVerified ? "default" : "secondary"}>
                              {beneficiary.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>${beneficiary.aidBalance || 0}</TableCell>
                          <TableCell>{beneficiary.reputationScore || 0}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleBeneficiaryAction("view", beneficiary.digitalId, `${beneficiary.firstName} ${beneficiary.lastName}`)}
                                disabled={isLoading}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleBeneficiaryAction("verify", beneficiary.digitalId, `${beneficiary.firstName} ${beneficiary.lastName}`)}
                                disabled={beneficiary.isVerified || isLoading}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? 'No beneficiaries match your search' : 'No beneficiaries found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aid Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Allocate Aid Tokens</CardTitle>
                  <CardDescription>
                    Distribute aid to verified beneficiaries via blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAidAllocation} className="space-y-4">
                    <div>
                      <Label htmlFor="beneficiary">Select Beneficiary</Label>
                      <Select 
                        value={aidAllocationForm.beneficiaryId} 
                        onValueChange={(value) => setAidAllocationForm(prev => ({ ...prev, beneficiaryId: value }))}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose verified beneficiary" />
                        </SelectTrigger>
                        <SelectContent>
                          {beneficiaries.filter((b: any) => b.isVerified).map((beneficiary: any) => (
                            <SelectItem key={beneficiary.digitalId} value={beneficiary.digitalId}>
                              {beneficiary.firstName} {beneficiary.lastName} ({beneficiary.digitalId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={aidAllocationForm.amount}
                        onChange={(e) => setAidAllocationForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Enter amount"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Aid Category</Label>
                      <Select 
                        value={aidAllocationForm.category} 
                        onValueChange={(value) => setAidAllocationForm(prev => ({ ...prev, category: value }))}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food Assistance</SelectItem>
                          <SelectItem value="health">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="emergency">Emergency Relief</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={!aidAllocationForm.beneficiaryId || !aidAllocationForm.amount || !aidAllocationForm.category || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Blockchain Transaction...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-4 w-4" />
                          Allocate Aid to Blockchain
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Allocations</CardTitle>
                  <CardDescription>Latest blockchain aid transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {transparencyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : transparencyData?.recentTransactions?.length > 0 ? (
                    <div className="space-y-4">
                      {transparencyData.recentTransactions
                        .filter((t: any) => t.type === 'Aid Allocation')
                        .slice(0, 5)
                        .map((transaction: any, index: number) => (
                          <div key={index} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium">Allocation #{transaction.id?.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${transaction.amount}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.blockchainTxHash ? 'Confirmed' : 'Processing'}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent allocations
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Blockchain-powered insights into aid distribution</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution Trends</CardTitle>
                  <CardDescription>Aid distribution over time by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="food" fill="#8884d8" name="Food" />
                      <Bar dataKey="health" fill="#82ca9d" name="Health" />
                      <Bar dataKey="education" fill="#ffc658" name="Education" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aid Categories Distribution</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Blockchain Impact Metrics</CardTitle>
                <CardDescription>Key performance indicators from blockchain data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {beneficiariesLoading ? "..." : Math.round((beneficiaries.filter((b: any) => b.isVerified).length / Math.max(beneficiaries.length, 1)) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Blockchain Verification Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {ngoStats.blockchainEnabled ? "100%" : "0%"}
                    </div>
                    <p className="text-sm text-muted-foreground">Blockchain Coverage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      ${transparencyLoading ? "..." : Math.round((transparencyData?.totalAidDistributed || 0) / Math.max(transparencyData?.totalBeneficiaries || 1, 1))}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Aid per Beneficiary</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {transparencyLoading ? "..." : transparencyData?.recentTransactions?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Blockchain Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Blockchain Audit Trail</h2>
              <p className="text-muted-foreground">Immutable transaction history and transparency</p>
            </div>

            <Card>
              <CardContent className="p-0">
                {transparencyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Blockchain Hash</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transparencyData?.recentTransactions?.length > 0 ? transparencyData.recentTransactions.map((transaction: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>${transaction.amount}</TableCell>
                          <TableCell>{transaction.timestamp}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.blockchainTxHash ? (
                              <span className="text-green-600">{transaction.blockchainTxHash.slice(0, 16)}...</span>
                            ) : (
                              <span className="text-yellow-600">Processing...</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.blockchainTxHash ? "default" : "secondary"}>
                              {transaction.blockchainTxHash ? "Confirmed" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No blockchain transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Beneficiary Details Dialog */}
      {selectedBeneficiary && (
        <Dialog open={!!selectedBeneficiary} onOpenChange={() => setSelectedBeneficiary(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Beneficiary Profile</DialogTitle>
              <DialogDescription>Blockchain-verified beneficiary details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedBeneficiary.firstName} {selectedBeneficiary.lastName}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{selectedBeneficiary.digitalId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedBeneficiary.location}</p>
                </div>
                <div>
                  <Label>Blockchain Status</Label>
                  <Badge variant={selectedBeneficiary.isVerified ? "default" : "secondary"}>
                    {selectedBeneficiary.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div>
                  <Label>Aid Balance</Label>
                  <p className="text-sm">${selectedBeneficiary.aidBalance || 0}</p>
                </div>
                <div>
                  <Label>Reputation Score</Label>
                  <p className="text-sm">{selectedBeneficiary.reputationScore || 0} points</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                <strong>Registration:</strong> {selectedBeneficiary.registrationDate ? new Date(selectedBeneficiary.registrationDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NGODashboard;
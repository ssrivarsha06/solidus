import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import StatCard from "@/components/StatCard";
import VendorMarketplace from "@/components/VendorMarketplace";
import { 
  Shield, 
  Coins, 
  Gift, 
  QrCode, 
  MapPin, 
  Calendar,
  Heart,
  GraduationCap,
  Utensils,
  ArrowUpRight,
  Camera,
  User
} from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const [userType] = useState<"beneficiary" | "ngo">("beneficiary");
  const [userData, setUserData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [userTokens, setUserTokens] = useState(125);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [aidCategories, setAidCategories] = useState([
    { name: "Food & Nutrition", balance: 45, icon: Utensils, color: "text-accent" },
    { name: "Education", balance: 80, icon: GraduationCap, color: "text-primary" },
    { name: "Healthcare", balance: 0, icon: Heart, color: "text-muted-foreground" },
  ]);
  const [totalAidReceived, setTotalAidReceived] = useState(450);
  const [pendingAid, setPendingAid] = useState(75);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  useEffect(() => {
    // Load user data from session storage
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }

    // Load tokens and transactions
    const storedTokens = sessionStorage.getItem('userTokens');
    if (storedTokens) {
      setUserTokens(parseInt(storedTokens));
    } else {
      sessionStorage.setItem('userTokens', '125');
    }

    const storedTransactions = sessionStorage.getItem('userTransactions');
    if (storedTransactions) {
      setRecentTransactions(JSON.parse(storedTransactions));
    } else {
      // Default transactions
      const defaultTransactions = [
        { id: 1, type: "Food Voucher", amount: 50, date: "2024-01-15", status: "completed" },
        { id: 2, type: "Education Grant", amount: 200, date: "2024-01-10", status: "completed" },
        { id: 3, type: "Healthcare Credit", amount: 100, date: "2024-01-08", status: "completed" },
      ];
      setRecentTransactions(defaultTransactions);
      sessionStorage.setItem('userTransactions', JSON.stringify(defaultTransactions));
    }

    // Load aid categories
    const storedCategories = sessionStorage.getItem('aidCategories');
    if (storedCategories) {
      const categories = JSON.parse(storedCategories);
      setAidCategories([
        { name: "Food & Nutrition", balance: categories.food, icon: Utensils, color: "text-accent" },
        { name: "Education", balance: categories.education, icon: GraduationCap, color: "text-primary" },
        { name: "Healthcare", balance: categories.healthcare, icon: Heart, color: "text-muted-foreground" },
      ]);
    } else {
      sessionStorage.setItem('aidCategories', JSON.stringify({ food: 45, education: 80, healthcare: 0 }));
    }

    // Load total aid received
    const storedTotalAid = sessionStorage.getItem('totalAidReceived');
    if (storedTotalAid) {
      setTotalAidReceived(parseInt(storedTotalAid));
    } else {
      sessionStorage.setItem('totalAidReceived', '450');
    }

    // Load pending aid
    const storedPendingAid = sessionStorage.getItem('pendingAid');
    if (storedPendingAid) {
      setPendingAid(parseInt(storedPendingAid));
    } else {
      sessionStorage.setItem('pendingAid', '75');
    }

    // Listen for token updates
    const handleTokenUpdate = () => {
      const updatedTokens = sessionStorage.getItem('userTokens');
      const updatedTransactions = sessionStorage.getItem('userTransactions');
      const updatedCategories = sessionStorage.getItem('aidCategories');
      const updatedTotalAid = sessionStorage.getItem('totalAidReceived');
      const updatedPendingAid = sessionStorage.getItem('pendingAid');
      
      if (updatedTokens) setUserTokens(parseInt(updatedTokens));
      if (updatedTransactions) setRecentTransactions(JSON.parse(updatedTransactions));
      if (updatedTotalAid) setTotalAidReceived(parseInt(updatedTotalAid));
      if (updatedPendingAid) setPendingAid(parseInt(updatedPendingAid));
      if (updatedCategories) {
        const categories = JSON.parse(updatedCategories);
        setAidCategories([
          { name: "Food & Nutrition", balance: categories.food, icon: Utensils, color: "text-accent" },
          { name: "Education", balance: categories.education, icon: GraduationCap, color: "text-primary" },
          { name: "Healthcare", balance: categories.healthcare, icon: Heart, color: "text-muted-foreground" },
        ]);
      }
    };

    window.addEventListener('tokenUpdate', handleTokenUpdate);
    return () => window.removeEventListener('tokenUpdate', handleTokenUpdate);
  }, []);

  const handleShowQR = () => {
    setShowQR(!showQR);
    toast({
      title: showQR ? "QR Code Hidden" : "QR Code Displayed",
      description: showQR ? "Your digital ID is now hidden" : "Share this QR code to verify your identity",
    });
  };

  const handleRedeemTokens = () => {
    // This will open the vendor marketplace dialog
  };

  const handleViewTransactions = () => {
    setShowAllTransactions(true);
  };
  
  // Default data if no session data available
  const defaultData = {
    digitalId: "SID-A7X9K2M5P",
    name: "Maria Santos",
    location: "São Paulo, Brazil",
    memberSince: "March 2024",
    totalAidReceived: 450,
    activeTokens: userTokens,
    pendingAid: 75,
    recentTransactions: recentTransactions.slice(0, 3)
  };

  // Use stored data or default data
  const beneficiaryData = userData ? {
    digitalId: userData.digitalId || defaultData.digitalId,
    name: `${userData.firstName} ${userData.lastName}`,
    location: userData.location || defaultData.location,
    memberSince: userData.registrationDate ? new Date(userData.registrationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : defaultData.memberSince,
    totalAidReceived: totalAidReceived,
    activeTokens: userTokens,
    pendingAid: pendingAid,
    recentTransactions: recentTransactions.slice(0, 3),
    verificationMethod: userData.verificationMethod,
    hasPhoto: userData.hasPhoto,
    verificationFiles: userData.verificationFiles || []
  } : { ...defaultData, hasPhoto: false, verificationMethod: null, totalAidReceived: totalAidReceived, pendingAid: pendingAid };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {beneficiaryData.name}</h1>
              <p className="text-muted-foreground">Manage your digital identity and aid balance</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleShowQR}>
              <QrCode className="h-4 w-4" />
              {showQR ? "Hide ID" : "Show ID"}
            </Button>
          </div>
          
          {/* Identity Card */}
          <Card className="shadow-medium border-0 bg-gradient-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {beneficiaryData.hasPhoto && userData?.biometricPhoto ? (
                    <div className="relative">
                      <img 
                        src={userData.biometricPhoto} 
                        alt="Biometric verification" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white/20 p-1 rounded-full">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/20 p-3 rounded-full">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">Digital Identity</h2>
                    <p className="text-white/90 font-mono text-sm">{beneficiaryData.digitalId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Verified ✓
                  </Badge>
                  <div className="flex items-center text-white/90 text-sm mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {beneficiaryData.location}
                  </div>
                  {showQR && (
                    <div className="mt-3 bg-white p-2 rounded">
                      <QrCode className="h-12 w-12 text-primary mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Aid Received"
            value={`$${beneficiaryData.totalAidReceived}`}
            description="Lifetime aid value"
            icon={Gift}
            variant="accent"
          />
          <StatCard
            title="Active Tokens"
            value={beneficiaryData.activeTokens.toString()}
            description="Available for redemption"
            icon={Coins}
            variant="default"
          />
          <StatCard
            title="Pending Aid"
            value={`$${beneficiaryData.pendingAid}`}
            description="Being processed"
            icon={Calendar}
            variant="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Aid Categories */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Aid Categories</CardTitle>
                <CardDescription>Your current balance across different aid types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aidCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <category.icon className={`h-5 w-5 ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">${category.balance}</span>
                    </div>
                    <Progress value={(category.balance / 100) * 100} className="h-2" />
                  </div>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-6" variant="accent">
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Aid Tokens
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Vendor Marketplace</DialogTitle>
                      <DialogDescription>
                        Use your aid tokens to purchase essential items from verified vendors
                      </DialogDescription>
                    </DialogHeader>
                    <VendorMarketplace />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest aid transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{transaction.type}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        {transaction.vendor && (
                          <p className="text-xs text-muted-foreground">From: {transaction.vendor}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {transaction.amount < 0 ? '' : '$'}{Math.abs(transaction.amount)}{transaction.amount < 0 ? ' tokens' : ''}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Dialog open={showAllTransactions} onOpenChange={setShowAllTransactions}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full mt-4 text-primary" onClick={handleViewTransactions}>
                      View All Transactions
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>All Transactions</DialogTitle>
                      <DialogDescription>
                        Your complete transaction history
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg border">
                          <div>
                            <p className="font-medium">{transaction.type}</p>
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                            {transaction.vendor && (
                              <p className="text-sm text-muted-foreground">From: {transaction.vendor}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {transaction.amount < 0 ? '' : '$'}{Math.abs(transaction.amount)}{transaction.amount < 0 ? ' tokens' : ''}
                            </p>
                            <Badge variant="outline">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-muted-foreground py-8">No transactions found</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
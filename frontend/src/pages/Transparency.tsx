import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatCard from "@/components/StatCard";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Activity,
  Shield,
  Heart,
  GraduationCap,
  Utensils
} from "lucide-react";

const Transparency = () => {
  // Mock blockchain data
  const globalStats = {
    totalBeneficiaries: 12547,
    totalAidDistributed: 2847302,
    activeNGOs: 89,
    transactionsToday: 1243,
    transparencyScore: 98.7
  };

  const aidDistribution = [
    { category: "Food & Nutrition", amount: 1200000, percentage: 42, icon: Utensils, color: "bg-accent" },
    { category: "Education", amount: 850000, percentage: 30, icon: GraduationCap, color: "bg-primary" },
    { category: "Healthcare", amount: 550000, percentage: 19, icon: Heart, color: "bg-success" },
    { category: "Emergency Aid", amount: 247302, percentage: 9, icon: Shield, color: "bg-warning" }
  ];

  const regionData = [
    { region: "Sub-Saharan Africa", beneficiaries: 4521, aid: 987432 },
    { region: "South Asia", beneficiaries: 3245, aid: 756821 },
    { region: "Latin America", beneficiaries: 2789, aid: 634512 },
    { region: "Southeast Asia", beneficiaries: 1992, aid: 468537 }
  ];

  const recentTransactions = [
    { id: "0xa7b2...8c9d", type: "Food Voucher", amount: 50, recipient: "SID-X8K2M7", timestamp: "2 mins ago" },
    { id: "0x3f8e...1a5b", type: "Education Grant", amount: 200, recipient: "SID-P9L4N1", timestamp: "5 mins ago" },
    { id: "0x9d1c...4e7f", type: "Healthcare Credit", amount: 125, recipient: "SID-R5T8Y2", timestamp: "8 mins ago" },
    { id: "0x2a6b...9f3e", type: "Emergency Aid", amount: 300, recipient: "SID-Q1W7E4", timestamp: "12 mins ago" },
    { id: "0x8e4d...6c2a", type: "Food Voucher", amount: 75, recipient: "SID-Z3X9C5", timestamp: "15 mins ago" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Live Impact Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time transparency into aid distribution powered by blockchain technology. 
            Every transaction is verified, traceable, and publicly auditable.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Beneficiaries"
            value={globalStats.totalBeneficiaries.toLocaleString()}
            description="Across all regions"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Aid Distributed"
            value={`$${(globalStats.totalAidDistributed / 1000000).toFixed(1)}M`}
            description="Total lifetime value"
            icon={DollarSign}
            variant="accent"
          />
          <StatCard
            title="Active NGOs"
            value={globalStats.activeNGOs.toString()}
            description="Verified organizations"
            icon={Shield}
            variant="success"
          />
          <StatCard
            title="Today's Transactions"
            value={globalStats.transactionsToday.toLocaleString()}
            description="Live blockchain activity"
            icon={Activity}
            variant="default"
          />
          <StatCard
            title="Transparency Score"
            value={`${globalStats.transparencyScore}%`}
            description="Blockchain verification"
            icon={TrendingUp}
            variant="accent"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Aid Distribution Breakdown */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Aid Distribution by Category</CardTitle>
                <CardDescription>Breakdown of total aid distributed across different sectors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aidDistribution.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${item.color}`}>
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">${item.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Regional Impact */}
          <div>
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Regional Impact</CardTitle>
                <CardDescription>Aid distribution by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionData.map((region, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{region.region}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Beneficiaries</p>
                          <p className="font-medium">{region.beneficiaries.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Aid Value</p>
                          <p className="font-medium">${(region.aid / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Transaction Feed */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Transaction Feed
              <span className="h-2 w-2 bg-accent rounded-full animate-pulse"></span>
            </CardTitle>
            <CardDescription>Real-time blockchain transactions as they happen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.type}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        To: {tx.recipient} • {tx.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${tx.amount}</p>
                    <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Blockchain Verified</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All transactions are cryptographically secured and publicly verifiable on the blockchain
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transparency;
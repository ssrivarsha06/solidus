import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Store, Check, Clock } from "lucide-react";

const VendorMarketplace = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  const vendors = [
    {
      id: 1,
      name: "Fresh Market Co.",
      category: "Food & Nutrition",
      items: [
        { id: 1, name: "Rice (5kg)", tokens: 15, description: "Premium quality rice" },
        { id: 2, name: "Cooking Oil (1L)", tokens: 8, description: "Sunflower oil" },
        { id: 3, name: "Flour (2kg)", tokens: 10, description: "Wheat flour" },
      ]
    },
    {
      id: 2,
      name: "EduSupplies",
      category: "Education",
      items: [
        { id: 4, name: "School Notebook Set", tokens: 12, description: "Set of 5 notebooks" },
        { id: 5, name: "Pen & Pencil Kit", tokens: 6, description: "Basic writing supplies" },
        { id: 6, name: "Backpack", tokens: 25, description: "Durable school backpack" },
      ]
    },
    {
      id: 3,
      name: "HealthCare Plus",
      category: "Healthcare",
      items: [
        { id: 7, name: "First Aid Kit", tokens: 20, description: "Basic medical supplies" },
        { id: 8, name: "Vitamins (30 days)", tokens: 15, description: "Multi-vitamin supplement" },
        { id: 9, name: "Medicine Consultation", tokens: 30, description: "Doctor consultation" },
      ]
    }
  ];

  const handleAddToCart = (item: any, vendor: any) => {
    const cartItem = { ...item, vendorName: vendor.name, vendorCategory: vendor.category };
    setSelectedItems(prev => [...prev, cartItem]);
    toast({
      title: "Added to Cart",
      description: `${item.name} from ${vendor.name}`,
    });
  };

  const handleRedeem = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart first.",
        variant: "destructive",
      });
      return;
    }

    const totalTokens = selectedItems.reduce((sum, item) => sum + item.tokens, 0);
    const currentTokens = parseInt(sessionStorage.getItem('userTokens') || '125');
    
    if (totalTokens > currentTokens) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${totalTokens} tokens but only have ${currentTokens}.`,
        variant: "destructive",
      });
      return;
    }

    // Update user tokens
    const newTokenBalance = currentTokens - totalTokens;
    sessionStorage.setItem('userTokens', newTokenBalance.toString());

    // Add to transaction history
    const existingTransactions = JSON.parse(sessionStorage.getItem('userTransactions') || '[]');
    const newTransactions = selectedItems.map((item, index) => ({
      id: Date.now() + index,
      type: `${item.name} (${item.vendorCategory})`,
      amount: -item.tokens,
      date: new Date().toISOString().split('T')[0],
      status: "completed",
      vendor: item.vendorName
    }));
    
    sessionStorage.setItem('userTransactions', JSON.stringify([...newTransactions, ...existingTransactions]));

    // Update aid categories based on redemptions
    const currentCategories = JSON.parse(sessionStorage.getItem('aidCategories') || '{"food": 45, "education": 80, "healthcare": 0}');
    const categoryUpdates = { food: 0, education: 0, healthcare: 0 };
    
    selectedItems.forEach(item => {
      const tokenValue = item.tokens * 2; // Convert tokens to dollar value (2:1 ratio)
      if (item.vendorCategory === "Food & Nutrition") {
        categoryUpdates.food += tokenValue;
      } else if (item.vendorCategory === "Education") {
        categoryUpdates.education += tokenValue;
      } else if (item.vendorCategory === "Healthcare") {
        categoryUpdates.healthcare += tokenValue;
      }
    });

    const updatedCategories = {
      food: currentCategories.food + categoryUpdates.food,
      education: currentCategories.education + categoryUpdates.education,
      healthcare: currentCategories.healthcare + categoryUpdates.healthcare
    };
    
    sessionStorage.setItem('aidCategories', JSON.stringify(updatedCategories));

    // Update total aid received
    const currentTotalAid = parseInt(sessionStorage.getItem('totalAidReceived') || '450');
    const totalRedemptionValue = totalTokens * 2; // Convert tokens to dollar value
    sessionStorage.setItem('totalAidReceived', (currentTotalAid + totalRedemptionValue).toString());

    setSelectedItems([]);
    toast({
      title: "Redemption Successful!",
      description: `Redeemed ${totalTokens} tokens for ${selectedItems.length} items.`,
    });

    // Trigger a page refresh to update the dashboard
    window.dispatchEvent(new Event('tokenUpdate'));
  };

  const totalTokens = selectedItems.reduce((sum, item) => sum + item.tokens, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Vendor Marketplace</h2>
        <p className="text-muted-foreground">Redeem your aid tokens for essential items</p>
      </div>

      {/* Shopping Cart */}
      {selectedItems.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart ({selectedItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="secondary">{item.tokens} tokens</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-medium">Total: {totalTokens} tokens</span>
              <Button onClick={handleRedeem} variant="accent">
                <Check className="h-4 w-4 mr-2" />
                Redeem All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <Card key={vendor.id} className="shadow-soft border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{vendor.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vendor.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{item.tokens} tokens</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddToCart(item, vendor)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorMarketplace;
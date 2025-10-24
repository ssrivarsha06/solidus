import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Zap, Eye, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Self-Sovereign Identity",
      description: "Blockchain-based digital identity that's tamper-proof and portable for vulnerable populations."
    },
    {
      icon: Zap,
      title: "Tokenized Aid Distribution",
      description: "Direct aid distribution through blockchain tokens linked to verified digital identities."
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "Every transaction recorded on blockchain with real-time analytics and accountability."
    },
    {
      icon: Users,
      title: "Community Verification",
      description: "Identity creation through biometrics, community verification, or trusted NGO referrals."
    }
  ];

  const benefits = [
    "Fraud prevention through immutable blockchain records",
    "Real-time tracking of aid distribution",
    "Portable identity across organizations",
    "Privacy protection with zero-knowledge proofs",
    "Efficient aid delivery to those who need it most"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Humanitarian Aid
              <span className="bg-gradient-primary bg-clip-text text-transparent block">
                Redefined
              </span>
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Empowering billions without formal identity through blockchain-powered digital IDs 
            and transparent aid distribution. Creating dignity, efficiency, and accountability in humanitarian aid.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group">
              <Link to="/register">
                Get Your Digital Identity
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/transparency">
                View Live Impact
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How SolidusAid Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform combining digital identity with transparent aid distribution
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-200 border-0">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose SolidusAid?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for maximum impact, transparency, and user empowerment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-4">
                <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Aid Distribution?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of beneficiaries and NGOs creating a more transparent and efficient humanitarian ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/register">
                Start Your Journey
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/ngo-login">
                NGO Partnership
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
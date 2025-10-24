// src/pages/Register.tsx - Updated with backend integration
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, QrCode, CheckCircle2, Camera, Users, Building, Upload, X, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

const Register = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    location: "",
    emergencyContact: "",
    verificationMethod: ""
  });
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [digitalId, setDigitalId] = useState<string | null>(null);
  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [biometricPhoto, setBiometricPhoto] = useState<File | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
      toast({
        title: "Camera Started",
        description: "Position your face in the center and click capture when ready.",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        // Convert canvas to blob and create File object
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'biometric-photo.jpg', { type: 'image/jpeg' });
            setBiometricPhoto(file);
            
            // Also store base64 for display
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            setFormData(prev => ({ ...prev, biometricPhoto: photoData }));
          }
        }, 'image/jpeg', 0.8);
        
        stopCamera();
        toast({
          title: "Photo Captured",
          description: "Biometric verification photo captured successfully.",
        });
      }
    }
  }, [stopCamera, toast]);

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.type.includes('image') || file.type.includes('pdf')
      );
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} files uploaded for verification.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVerificationMethodSelect = (method: string) => {
    handleInputChange("verificationMethod", method);
    
    if (method === "biometric") {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const handleGenerateId = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare files for upload
      const files: { biometricPhoto?: File; documents?: File[] } = {};
      
      if (biometricPhoto) {
        files.biometricPhoto = biometricPhoto;
      }
      
      if (uploadedFiles.length > 0) {
        files.documents = uploadedFiles;
      }

      // Call backend API to register identity
      const response = await apiService.registerUser(formData, files);
      
      if (response.success) {
        setDigitalId(response.digitalId);
        setMerkleRoot(response.merkleRoot);
        
        // Save to localStorage for the frontend components
        const userData = {
          ...formData,
          digitalId: response.digitalId,
          merkleRoot: response.merkleRoot,
          verificationFiles: uploadedFiles.map(file => file.name),
          registrationDate: new Date().toISOString(),
          hasPhoto: formData.verificationMethod === "biometric",
          isVerified: true,
          aidBalance: 0,
          status: 'active'
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const updatedUsers = [...existingUsers, userData];
        localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
        
        setStep(3);
        toast({
          title: "Digital Identity Created!",
          description: "Your blockchain-based identity has been successfully generated.",
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create digital identity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 3 && digitalId) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-medium border-0">
            <CardHeader className="text-center">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
              <CardTitle className="text-2xl">Identity Created!</CardTitle>
              <CardDescription>
                Your digital identity is now secured on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-secondary p-8 rounded-lg mb-4">
                  <QrCode className="h-24 w-24 text-primary mx-auto mb-4" />
                  <div className="font-mono text-sm bg-background p-3 rounded border">
                    {digitalId}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This is your unique digital identity. Keep it safe and use it to access aid services.
                </p>
                {merkleRoot && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <strong>Blockchain Hash:</strong><br/>
                    <span className="font-mono break-all">{merkleRoot}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm font-medium">{formData.location}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Verification</span>
                  <span className="text-sm font-medium text-accent">Blockchain Verified ✓</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="text-sm font-medium capitalize">{formData.verificationMethod}</span>
                </div>
              </div>
              
              <Button className="w-full" onClick={() => window.location.href = "/dashboard"}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Create Digital Identity</h1>
          <p className="text-muted-foreground mt-2">
            Step {step} of 2: {step === 1 ? "Personal Information" : "Identity Verification"}
          </p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Personal Information" : "Choose Verification Method"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Provide your basic information to create your digital identity"
                : "Select how you'd like to verify your identity on the blockchain"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Textarea
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter your current location or address"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder="Phone number or name"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.lastName || !formData.location}
                >
                  Continue to Verification
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {isGenerating ? (
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                    <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Generating Your Digital Identity</h3>
                    <p className="text-muted-foreground mb-4">
                      Creating Merkle tree, generating proof, and securing your identity on the blockchain...
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: "70%"}}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      <Card 
                        className={`cursor-pointer transition-all border-2 ${
                          formData.verificationMethod === "biometric" 
                            ? "border-primary bg-primary-subtle" 
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleVerificationMethodSelect("biometric")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Camera className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-semibold">Biometric Verification</h3>
                              <p className="text-sm text-muted-foreground">Use facial recognition with blockchain proof</p>
                            </div>
                          </div>
                          {formData.verificationMethod === "biometric" && (
                            <div className="mt-4 space-y-4">
                              {showCamera ? (
                                <div className="space-y-3">
                                  <div className="relative bg-black rounded-lg overflow-hidden">
                                    <video 
                                      ref={videoRef} 
                                      autoPlay 
                                      playsInline 
                                      className="w-full h-48 object-cover"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={capturePhoto} className="flex-1" size="sm">
                                      <Camera className="h-4 w-4 mr-2" />
                                      Capture Photo
                                    </Button>
                                    <Button onClick={stopCamera} variant="outline" size="sm">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Button onClick={startCamera} variant="outline" className="w-full" size="sm">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Start Camera
                                  </Button>
                                  {biometricPhoto && (
                                    <div className="text-center text-sm text-green-600">
                                      ✓ Biometric photo captured and ready for blockchain registration
                                    </div>
                                  )}
                                </div>
                              )}
                              <canvas ref={canvasRef} className="hidden" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer transition-all border-2 ${
                          formData.verificationMethod === "community" 
                            ? "border-primary bg-primary-subtle" 
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleVerificationMethodSelect("community")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Users className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-semibold">Community Verification</h3>
                              <p className="text-sm text-muted-foreground">Upload community verification documents to blockchain</p>
                            </div>
                          </div>
                          {formData.verificationMethod === "community" && (
                            <div className="mt-4 space-y-3">
                              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Upload community verification documents (will be hashed for blockchain storage)
                                </p>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleFileUpload(e.target.files)}
                                  className="hidden"
                                  id="community-upload"
                                />
                                <Button 
                                  onClick={() => document.getElementById('community-upload')?.click()}
                                  variant="outline" 
                                  size="sm"
                                >
                                  Choose Files
                                </Button>
                              </div>
                              {uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                  {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                                      <span className="truncate">{file.name}</span>
                                      <Button
                                        onClick={() => removeFile(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`cursor-pointer transition-all border-2 ${
                          formData.verificationMethod === "ngo" 
                            ? "border-primary bg-primary-subtle" 
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleVerificationMethodSelect("ngo")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Building className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-semibold">NGO Referral</h3>
                              <p className="text-sm text-muted-foreground">Upload NGO referral documents to blockchain</p>
                            </div>
                          </div>
                          {formData.verificationMethod === "ngo" && (
                            <div className="mt-4 space-y-3">
                              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Upload NGO referral letter & ID documents (will be securely hashed)
                                </p>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleFileUpload(e.target.files)}
                                  className="hidden"
                                  id="ngo-upload"
                                />
                                <Button 
                                  onClick={() => document.getElementById('ngo-upload')?.click()}
                                  variant="outline" 
                                  size="sm"
                                >
                                  Choose Files
                                </Button>
                              </div>
                              {uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                  {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                                      <span className="truncate">{file.name}</span>
                                      <Button
                                        onClick={() => removeFile(index)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p className="font-medium mb-1">🔒 Blockchain Security:</p>
                      <p className="text-muted-foreground">
                        Your data will be processed using Merkle trees and zero-knowledge proofs to ensure privacy and security on the blockchain.
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateId}
                      disabled={!formData.verificationMethod || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Identity...
                        </>
                      ) : (
                        'Generate Blockchain Identity'
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
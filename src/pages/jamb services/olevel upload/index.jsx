import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { useWallet } from '../../../contexts/WalletContext';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OLevelUpload = () => {
  const [formData, setFormData] = useState({
    type: '',
    fullName: '',
    jambRegNo: '',
    phoneNumber: '',
    email: '',
    additionalInfo: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { walletBalance, addTransaction } = useWallet();
  
  const SERVICE_COST = 400;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(uploadedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (walletBalance < SERVICE_COST) {
      toast.error('Insufficient balance. Please fund your wallet.');
      return;
    }

    if (!formData.fullName || !formData.jambRegNo || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Deduct service cost
      await addTransaction({
        label: 'O-Level Upload Service',
        description: `O-Level upload for ${formData.fullName}`,
        amount: SERVICE_COST,
        type: 'debit',
        category: 'jamb_service',
        status: 'Successful'
      });

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
      toast.success('O-Level upload request submitted successfully!');
    } catch (error) {
      toast.error('Service request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Request Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your O-Level upload request has been received. We'll process it within 24 hours.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Request Details:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {formData.fullName}</p>
                <p><strong>JAMB Reg No:</strong> {formData.jambRegNo}</p>
                <p><strong>Type:</strong> {formData.type}</p>
                <p><strong>Files:</strong> {files.length} uploaded</p>
              </div>
            </div>
            <Button onClick={() => setSubmitted(false)}>Submit Another Request</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">O-Level Upload Service</h1>
          <p className="text-muted-foreground mt-2">
            Upload your O-Level results to JAMB portal securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Request Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-md border border-input bg-background"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="UTME">UTME</option>
                        <option value="Direct Entry">Direct Entry</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jambRegNo">JAMB Registration Number *</Label>
                      <Input
                        name="jambRegNo"
                        value={formData.jambRegNo}
                        onChange={handleInputChange}
                        placeholder="Enter JAMB reg number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="files">Upload O-Level Results</Label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full p-3 border border-input rounded-md"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload clear images or PDF of your O-Level results
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      placeholder="Any additional information (optional)"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || walletBalance < SERVICE_COST}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : `Submit Request - ₦${SERVICE_COST}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">₦{SERVICE_COST}</p>
                  <p className="text-sm text-muted-foreground">Service Fee</p>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Your Balance: <span className="font-semibold text-primary">₦{walletBalance.toLocaleString()}</span></p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">What's Included:</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Professional upload service
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      24-hour processing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Email confirmation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Customer support
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OLevelUpload;
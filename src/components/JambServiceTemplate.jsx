import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const JambServiceTemplate = ({ 
  title, 
  description, 
  price, 
  icon: Icon = FileText,
  fields = [],
  requiresUpload = false
}) => {
  const [formData, setFormData] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const [serviceHistory, setServiceHistory] = useState([]);
  // Mock data for now - will be replaced with Supabase data
  const walletBalance = 0;
  const addTransaction = (transaction) => {};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setNotification({ visible: false, message: '', type: '' });

    try {
      if (price > walletBalance) {
        throw new Error('Insufficient wallet balance');
      }

      // Validate required fields
      const missingFields = fields.filter(field => field.required && !formData[field.name]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
      }

      if (requiresUpload && !uploadedFile) {
        throw new Error('Please upload the required document');
      }

      addTransaction({
        amount: price,
        type: 'debit',
        label: title,
        description: `${title} service request`,
        category: 'jamb_service',
        status: 'Successful'
      });

      const newService = {
        id: Date.now(),
        title,
        data: formData,
        file: uploadedFile?.name,
        date: new Date().toLocaleDateString('en-CA'),
        status: 'Processing'
      };

      setServiceHistory(prev => [newService, ...prev]);
      setFormData({});
      setUploadedFile(null);
      
      setNotification({ 
        visible: true, 
        message: `${title} request submitted successfully!`, 
        type: 'success' 
      });
    } catch (error) {
      setNotification({ 
        visible: true, 
        message: error.message, 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600';
      case 'Processing': return 'text-yellow-600';
      case 'Failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Icon className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Notification */}
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white font-medium flex items-center gap-3 z-50 ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Service Request</span>
              </CardTitle>
              <CardDescription>
                Fill in the required information for {title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {requiresUpload && (
                <div className="space-y-2">
                  <Label>Upload Document *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    {uploadedFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {uploadedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between text-sm">
                  <span>Service Fee:</span>
                  <span className="font-semibold">₦{price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Wallet Balance:</span>
                  <span className={`font-semibold ${walletBalance >= price ? 'text-green-600' : 'text-red-600'}`}>
                    ₦{walletBalance.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || walletBalance < price}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Service History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Request History</span>
              </CardTitle>
              <CardDescription>
                {serviceHistory.length} request{serviceHistory.length !== 1 ? 's' : ''} submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[450px] overflow-y-auto">
                {serviceHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No requests yet</p>
                    <p className="text-sm text-muted-foreground">Submit your first {title.toLowerCase()} request</p>
                  </div>
                ) : (
                  serviceHistory.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{service.title}</h4>
                          <p className="text-sm text-muted-foreground">{service.date}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(service.status)}
                          <Badge variant={service.status === 'Completed' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                      {service.file && (
                        <p className="text-xs text-muted-foreground">
                          📎 {service.file}
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JambServiceTemplate;
import React from 'react';
import { Upload } from 'lucide-react';
import JambServiceTemplate from '../../../components/JambServiceTemplate';

const OLevelUpload = () => {
  const fields = [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'UTME', label: 'UTME' },
        { value: 'Direct Entry', label: 'Direct Entry' }
      ],
      required: true,
      placeholder: 'Select type'
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      name: 'jambRegNo',
      label: 'JAMB Registration Number',
      type: 'text',
      required: true,
      placeholder: 'Enter JAMB registration number'
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter phone number'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter email address'
    },
    {
      name: 'additionalInfo',
      label: 'Additional Information',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional information (optional)'
    }
  ];

  return (
    <JambServiceTemplate
      title="O-Level Upload"
      description="Upload your O-Level results to JAMB portal with our secure and reliable service"
      price={400}
      icon={Upload}
      fields={fields}
      requiresUpload={true}
    />
  );
};

export default OLevelUpload;
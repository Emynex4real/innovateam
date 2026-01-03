import React from 'react';
import { Award } from 'lucide-react';
import JambServiceTemplate from '../../../components/JambServiceTemplate';

const OriginalResult = () => {
  const fields = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name as on JAMB'
    },
    {
      name: 'jambRegNo',
      label: 'JAMB Registration Number',
      type: 'text',
      required: true,
      placeholder: 'Enter JAMB registration number'
    },
    {
      name: 'examYear',
      label: 'Examination Year',
      type: 'text',
      required: true,
      placeholder: 'Enter examination year (e.g., 2024)'
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
      name: 'deliveryAddress',
      label: 'Delivery Address',
      type: 'textarea',
      required: true,
      placeholder: 'Enter complete delivery address'
    }
  ];

  return (
    <JambServiceTemplate
      title="Original Result"
      description="Get your original JAMB result certificate delivered to your address"
      price={3500}
      icon={Award}
      fields={fields}
      requiresUpload={false}
    />
  );
};

export default OriginalResult;
import React from 'react';
import { CreditCard } from 'lucide-react';
import JambServiceTemplate from '../../../components/JambServiceTemplate';

const PinVending = () => {
  const fields = [
    {
      name: 'pinType',
      label: 'PIN Type',
      type: 'select',
      options: [
        { value: 'UTME', label: 'UTME PIN' },
        { value: 'Direct Entry', label: 'Direct Entry PIN' },
        { value: 'Change of Course', label: 'Change of Course PIN' },
        { value: 'Change of Institution', label: 'Change of Institution PIN' }
      ],
      required: true,
      placeholder: 'Select PIN type'
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      required: true,
      placeholder: 'Enter quantity (1-10)',
      min: 1,
      max: 10
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name'
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
    }
  ];

  return (
    <JambServiceTemplate
      title="PIN Vending"
      description="Purchase JAMB PINs for various services including UTME, Direct Entry, and more"
      price={4000}
      icon={CreditCard}
      fields={fields}
      requiresUpload={false}
    />
  );
};

export default PinVending;
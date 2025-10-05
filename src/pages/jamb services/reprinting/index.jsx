import React from 'react';
import { Printer } from 'lucide-react';
import JambServiceTemplate from '../../../components/JambServiceTemplate';

const Reprinting = () => {
  const fields = [
    {
      name: 'documentType',
      label: 'Document Type',
      type: 'select',
      options: [
        { value: 'JAMB Result', label: 'JAMB Result' },
        { value: 'Admission Letter', label: 'Admission Letter' },
        { value: 'Change of Course', label: 'Change of Course' },
        { value: 'Change of Institution', label: 'Change of Institution' },
        { value: 'CAPS Document', label: 'CAPS Document' }
      ],
      required: true,
      placeholder: 'Select document type'
    },
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
      name: 'reason',
      label: 'Reason for Reprinting',
      type: 'textarea',
      required: true,
      placeholder: 'Explain why you need the document reprinted'
    }
  ];

  return (
    <JambServiceTemplate
      title="JAMB Reprinting"
      description="Reprint your JAMB documents including results, admission letters, and CAPS documents"
      price={1500}
      icon={Printer}
      fields={fields}
      requiresUpload={false}
    />
  );
};

export default Reprinting;
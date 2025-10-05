import React from 'react';
import { FileText } from 'lucide-react';
import JambServiceTemplate from '../../../components/JambServiceTemplate';

const AdmissionLetter = () => {
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
      name: 'institution',
      label: 'Institution',
      type: 'text',
      required: true,
      placeholder: 'Enter your institution name'
    },
    {
      name: 'course',
      label: 'Course of Study',
      type: 'text',
      required: true,
      placeholder: 'Enter your course of study'
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
      title="Admission Letter"
      description="Get your official JAMB admission letter printed and processed"
      price={2500}
      icon={FileText}
      fields={fields}
      requiresUpload={false}
    />
  );
};

export default AdmissionLetter;
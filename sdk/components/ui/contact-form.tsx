// app/components/ui/contact-form.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Calendar } from 'lucide-react';

interface Field {
  type: string;
  label: string;
  id: string;
  required?: boolean;
  options?: string[];
}

interface ContactFormProps {
  fields: Field[];
  onSubmit: (data: any) => void;
}

export default function ContactForm({ fields, onSubmit }: ContactFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <User className="w-5 h-5 text-gray-500" />;
      case 'email':
        return <Mail className="w-5 h-5 text-gray-500" />;
      case 'tel':
        return <Phone className="w-5 h-5 text-gray-500" />;
      case 'date':
        return <Calendar className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
      <p className="text-sm text-gray-600 mb-6">
        Please provide your contact details and we'll have a counselor reach out to you shortly.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label 
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIcon(field.type)}
              </div>

              <input
                {...register(field.id, { required: field.required })}
                type={field.type}
                id={field.id}
                className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                  errors[field.id] ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
            </div>

            {errors[field.id] && (
              <p className="mt-1 text-sm text-red-600">
                {field.label} is required
              </p>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Request Callback'}
          </button>
        </div>
      </form>
    </div>
  );
}
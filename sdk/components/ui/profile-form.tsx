// app/components/ui/profile-form.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, Globe, DollarSign } from 'lucide-react';

interface Field {
  type: string;
  label: string;
  id: string;
  required?: boolean;
  options?: string[];
}

interface ProfileFormProps {
  fields: Field[];
  onSubmit: (data: any) => void;
}

export default function ProfileForm({ fields, onSubmit }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const getIcon = (fieldId: string) => {
    switch (fieldId) {
      case 'education':
        return <BookOpen className="w-5 h-5 text-gray-500" />;
      case 'countries':
        return <Globe className="w-5 h-5 text-gray-500" />;
      case 'budget':
        return <DollarSign className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'multiselect':
        return (
          <select
            multiple
            {...register(field.id)}
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            {...register(field.id, { required: field.required })}
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter your ${field.label.toLowerCase()}`}
          />
        );

      default:
        return (
          <input
            type={field.type}
            {...register(field.id, { required: field.required })}
            className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter your ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Your Study Preferences</h3>
      <p className="text-sm text-gray-600 mb-6">
        Help us understand your preferences to recommend the best programs for you.
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
                {getIcon(field.id)}
              </div>

              {renderField(field)}
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
            {isSubmitting ? 'Submitting...' : 'Get Recommendations'}
          </button>
        </div>
      </form>
    </div>
  );
}
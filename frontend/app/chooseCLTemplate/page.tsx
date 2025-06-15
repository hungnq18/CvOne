"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type TemplatePreviewProps = {
  template: string;
  name: string;
};

export default function CoverLetterTemplate() {
  const [firstName, setFirstName] = useState('Duong');
  const [lastName, setLastName] = useState('Duy');
  const [selectedCategory, setSelectedCategory] = useState('RECOMMENDED');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  const colors = [
    { name: 'lightblue', class: 'bg-blue-200', selected: 'bg-blue-400' },
    { name: 'gray', class: 'bg-gray-400', selected: 'bg-gray-600' },
    { name: 'blue', class: 'bg-blue-600', selected: 'bg-blue-800' },
    { name: 'teal', class: 'bg-teal-400', selected: 'bg-teal-600' },
    { name: 'green', class: 'bg-green-600', selected: 'bg-green-800' },
    { name: 'red', class: 'bg-red-600', selected: 'bg-red-800' },
    { name: 'pink', class: 'bg-pink-400', selected: 'bg-pink-600' },
    { name: 'yellow', class: 'bg-yellow-400', selected: 'bg-yellow-600' },
  ];

  const templates = [
    {
      id: 'template1',
      name: 'TEMPLATE 1',
      preview: 'template1-preview'
    },
    {
      id: 'crisp',
      name: 'CRISP',
      preview: 'crisp-preview'
    },
    {
      id: 'concept',
      name: 'CONCEPT',
      preview: 'concept-preview'
    },
    {
      id: 'modern',
      name: 'MODERN',
      preview: 'modern-preview'
    },
    {
      id: 'professional',
      name: 'PROFESSIONAL',
      preview: 'professional-preview'
    },
    {
      id: 'creative',
      name: 'CREATIVE',
      preview: 'creative-preview'
    }
  ];

  const TemplatePreview = ({ template, name }: TemplatePreviewProps) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-600',
      'gray': 'bg-gray-600',
      'lightblue': 'bg-blue-200',
      'teal': 'bg-teal-600',
      'green': 'bg-green-600',
      'red': 'bg-red-600',
      'pink': 'bg-pink-600',
      'yellow': 'bg-yellow-600'
    };

    const getColorClass = () => {
      return colorMap[selectedColor] || 'bg-blue-600';
    };

    if (template === 'template1') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-80">
          <div className={`${getColorClass()} h-20 flex items-center px-4`}>
            <div className="text-white font-bold text-sm">{name}</div>
          </div>
          <div className="p-4 space-y-2">
            <div className="text-xs text-gray-600 space-y-1">
              <div>Contact Information</div>
              <div>Email • Phone • Address</div>
            </div>
            <div className="text-xs space-y-1 mt-4">
              <div className="font-semibold">Dear Hiring Manager,</div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="mt-6 text-xs">
              <div>Sincerely,</div>
              <div className="font-semibold mt-2">{name}</div>
            </div>
          </div>
        </div>
      );
    }

    if (template === 'crisp') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-80">
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-bold">{name}</div>
              <div className={`w-3 h-3 rounded-full ${getColorClass()}`}></div>
            </div>
            <div className="text-xs text-gray-600 space-y-1 mb-4">
              <div>Contact Information</div>
              <div>Email • Phone • Address</div>
            </div>
            <div className="text-xs space-y-1">
              <div className="font-semibold">Dear Hiring Manager,</div>
              <div className="space-y-1 mt-2">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            <div className="mt-6 text-xs">
              <div>Sincerely,</div>
              <div className="font-semibold mt-2">{name}</div>
            </div>
          </div>
        </div>
      );
    }

    if (template === 'concept') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-80 flex">
          <div className={`${getColorClass()} w-1/3 p-4 text-white`}>
            <div className="text-sm font-bold mb-4">{name}</div>
            <div className="text-xs space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div>Email</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div>Phone</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div>Address</div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="text-xs space-y-1">
              <div className="font-semibold mb-2">Dear Hiring Manager,</div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="mt-6 text-xs">
              <div>Sincerely,</div>
              <div className="font-semibold mt-2">{name}</div>
            </div>
          </div>
        </div>
      );
    }

    // Default template for others
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm h-80">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-2 h-8 ${getColorClass()}`}></div>
            <div className="text-sm font-bold">{name}</div>
          </div>
          <div className="text-xs text-gray-600 space-y-1 mb-4">
            <div>Contact Information</div>
            <div>Email • Phone • Address</div>
          </div>
          <div className="text-xs space-y-1">
            <div className="font-semibold">Dear Hiring Manager,</div>
            <div className="space-y-1 mt-2">
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              <div className="h-2 bg-gray-200 rounded w-4/5"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="mt-6 text-xs">
            <div>Sincerely,</div>
            <div className="font-semibold mt-2">{name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Choose from our <span className="font-bold">best templates</span> for people with{' '}
            <span className="text-blue-500 font-bold">little experience</span>
          </h1>
          <p className="text-gray-600">
            Add and preview your name on your cover letter. You can always edit your template later.
          </p>
        </div>

        {/* Name Input */}
        <div className="flex justify-center space-x-4 mb-12">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">FIRST NAME</label>
            <div className="relative">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-2.5">
                {firstName ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">LAST NAME</label>
            <div className="relative">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-2.5">
                {lastName ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar - Category & Color Filters */}
          <div className="sticky top-4 h-fit">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">CATEGORY</h3>
                <div className="space-y-2">
                  {['RECOMMENDED', 'ALL'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700 shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:shadow-sm'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">COLOR</h3>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full ${color.class} transition-all duration-300 transform hover:scale-125 hover:shadow-lg ${
                        selectedColor === color.name ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid - 3 columns */}
          <div className="col-span-3">
            <div className="grid grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                    selectedTemplate === template.id ? 'scale-105 -translate-y-2' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`relative overflow-hidden rounded-lg shadow-sm group-hover:shadow-xl transition-shadow duration-300 ${
                    selectedTemplate === template.id ? 'shadow-xl ring-2 ring-blue-500' : ''
                  }`}>
                    <TemplatePreview
                      template={template.id}
                      name={`${firstName} ${lastName}`}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <div className={`transform transition-transform duration-300 bg-white rounded-full p-3 shadow-lg ${
                        selectedTemplate === template.id ? 'scale-100' : 'scale-0 group-hover:scale-100'
                      }`}>
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <h3 className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                      selectedTemplate === template.id ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'
                    }`}>
                      {template.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            className="group flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 hover:shadow-md"
            onClick={() => router.push('/clTemplate')}
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <div className="flex space-x-4">
            <button
              className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 hover:scale-105 hover:bg-blue-50 rounded-lg"
              onClick={() => setSelectedTemplate(null)}
            >
              Choose Later
            </button>
            <button
              className={`group px-8 py-3 font-medium rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-translate-y-1 ${
                selectedTemplate
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => {
                if (selectedTemplate) {
                  router.push(`/createCLTemplate?template=${selectedTemplate}`);
                }
              }}
              disabled={!selectedTemplate}
            >
              <span className="group-hover:scale-110 inline-block transition-transform duration-300">Choose Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
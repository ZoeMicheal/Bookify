'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Image as ImageIcon, X, CheckCircle2, Play } from 'lucide-react';
import { MAX_FILE_SIZE, ACCEPTED_PDF_TYPES, MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES, voiceOptions } from '@/lib/constants';
import LoadingOverlay from '@/components/LoadingOverlay';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  pdfFile: z
    .custom<File>((val) => val instanceof File, 'PDF file is required')
    .refine((file) => file.size <= MAX_FILE_SIZE, `PDF file must be less than 50MB`)
    .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), 'Only .pdf files are accepted'),
  coverImage: z
    .custom<File | null>((val) => val === null || val instanceof File)
    .optional()
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, `Cover image must be less than 10MB`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    ),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author name is required'),
  voice: z.string().min(1, 'Please select a voice'),
});

type FormValues = z.infer<typeof formSchema>;

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      voice: 'rachel',
    },
  });

  const selectedPdf = watch('pdfFile');
  const selectedImage = watch('coverImage');
  const selectedVoice = watch('voice');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(data);
    setIsSubmitting(false);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('pdfFile', file, { shouldValidate: true });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('coverImage', file, { shouldValidate: true });
    } else {
      setValue('coverImage', null, { shouldValidate: true });
    }
  };

  const removePdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('pdfFile', undefined as any, { shouldValidate: true });
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('coverImage', null, { shouldValidate: true });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="new-book-wrapper">
      {isSubmitting && <LoadingOverlay />}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* PDF Upload */}
        <div className="space-y-2">
          <label className="form-label">Book PDF File</label>
          <div 
            onClick={() => pdfInputRef.current?.click()}
            className={cn(
              "upload-dropzone group cursor-pointer",
              selectedPdf && "upload-dropzone-uploaded"
            )}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={pdfInputRef}
              onChange={handlePdfChange}
            />
            {selectedPdf ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="upload-dropzone-icon text-green-600" />
                <p className="upload-dropzone-text">{selectedPdf.name}</p>
                <button 
                  type="button" 
                  onClick={removePdf}
                  className="upload-dropzone-remove"
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="upload-dropzone-icon" />
                <p className="upload-dropzone-text text-xl">Click to upload PDF</p>
                <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
              </div>
            )}
          </div>
          {errors.pdfFile && <p className="text-red-500 text-sm mt-1">{errors.pdfFile.message}</p>}
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="form-label">Cover Image (Optional)</label>
          <div 
            onClick={() => imageInputRef.current?.click()}
            className={cn(
              "upload-dropzone group cursor-pointer",
              selectedImage && "upload-dropzone-uploaded"
            )}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={imageInputRef}
              onChange={handleImageChange}
            />
            {selectedImage ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-28 mb-2 shadow-md rounded overflow-hidden">
                   <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                   />
                </div>
                <p className="upload-dropzone-text">{selectedImage.name}</p>
                <button 
                  type="button" 
                  onClick={removeImage}
                  className="upload-dropzone-remove"
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="upload-dropzone-icon" />
                <p className="upload-dropzone-text text-xl">Click to upload cover image</p>
                <p className="upload-dropzone-hint">Leave empty to auto-generate from PDF</p>
              </div>
            )}
          </div>
          {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage.message}</p>}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            {...register('title')}
            id="title"
            placeholder="ex: Rich Dad Poor Dad"
            className="form-input"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Author */}
        <div className="space-y-2">
          <label htmlFor="author" className="form-label">Author Name</label>
          <input
            {...register('author')}
            id="author"
            placeholder="ex: Robert Kiyosaki"
            className="form-input"
          />
          {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
        </div>

        {/* Voice Selector */}
        <div className="space-y-4">
          <label className="form-label block">Choose Assistant Voice</label>
          
          <div className="voice-selector-options flex-wrap">
            {(Object.keys(voiceOptions) as (keyof typeof voiceOptions)[]).map((voiceKey) => {
              const voice = voiceOptions[voiceKey];
              const isSelected = selectedVoice === voiceKey;
              return (
                <div
                  key={voiceKey}
                  onClick={() => setValue('voice', voiceKey, { shouldValidate: true })}
                  className={cn(
                    "voice-selector-option",
                    isSelected ? "voice-selector-option-selected" : "voice-selector-option-default"
                  )}
                >
                  <Play className={cn(
                    "w-5 h-5",
                    isSelected ? "text-[var(--accent-warm)] fill-[var(--accent-warm)]" : "text-[#8B7355]"
                  )} />
                  <span className={cn(
                    "font-medium text-lg",
                    isSelected ? "text-[var(--accent-warm)]" : "text-[#777]"
                  )}>
                    {voice.name}
                  </span>
                </div>
              );
            })}
          </div>
          {errors.voice && <p className="text-red-500 text-sm mt-1">{errors.voice.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="form-btn w-full !bg-[#663820] text-white font-serif py-4 text-xl shadow-lg transition-all active:scale-[0.98]"
        >
          Begin Synthesis
        </button>
      </form>
    </div>
  );
};

export default UploadForm;

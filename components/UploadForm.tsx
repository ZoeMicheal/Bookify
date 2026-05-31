'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Image as ImageIcon, X, CheckCircle2, Play } from 'lucide-react';
import { MAX_FILE_SIZE, ACCEPTED_PDF_TYPES, MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES, voiceOptions } from '@/lib/constants';
import LoadingOverlay from '@/components/LoadingOverlay';
import {cn, parsePDFFile} from '@/lib/utils';
import {useAuth} from "@clerk/nextjs";
import { toast } from 'sonner';
import {checkBookExists, createBook, saveBookSegments} from "@/lib/actions/book.actions";
import {useRouter} from "next/navigation";
import {upload} from "@vercel/blob/client";

export const UploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  author: z.string().min(1, 'Author name is required').max(100, 'Author name is too long'),
  persona: z.string().optional(),
  voice: z.string().min(1, 'Please select a voice'),
  pdfFile: z.instanceof(File).optional().refine((file) => file !== undefined, { message: "PDF file is required" }).refine((file) => file && file.size <= MAX_FILE_SIZE,
      "File size must be less than 50MB").refine((file) => file && ACCEPTED_PDF_TYPES.includes(file.type), "Only PDF files are accepted"),
  coverImage: z.instanceof(File).optional().refine((file) => {
    if (!file) return true; // Allow undefined/null if optional
    return file.size <= MAX_IMAGE_SIZE;
  }, "Image size must be less than 10MB").refine((file) => {
    if (!file) return true; // Allow undefined/null if optional
    return ACCEPTED_IMAGE_TYPES.includes(file.type);
  }, "Only .jpg, .jpeg, .png, and .webp formats are supported"),
});

type FormValues = z.infer<typeof UploadSchema>;

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(UploadSchema),    
    defaultValues: {
      title: '',
      author: '',
      persona: '',
      pdfFile: undefined,
      coverImage: undefined,
      voice: 'rachel',
    },
  });

  const selectedPdf = watch('pdfFile');
  const selectedImage = watch('coverImage');
  const selectedVoice = watch('voice');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  const onSubmit = async (data: FormValues) => {
    if(!userId) {
      toast.error("Please sign in to upload books...");
      return;
    }
    setIsSubmitting(true);

    // PostHod -> Track book upload

    try {
      const existsCheck = await checkBookExists(data.title);

      if(existsCheck.exists && existsCheck.book) {
        toast.info("Book with this title already exists.");
        reset();
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
      const pdfFile = data.pdfFile;

      if (!pdfFile) {
        toast.error("PDF file is required.");
        setIsSubmitting(false);
        return;
      }

      const parsedPDF = await parsePDFFile(pdfFile);

      if(parsedPDF.content.length === 0) {
        toast.error("Failed to parse PDF. Please try again with a different file.");
        return;
      }

      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'application/pdf'
      });
      
      let coverUrl: string | undefined;
      
      if(data.coverImage) {
        const coverFile = data.coverImage;
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: coverFile.type
        });
        coverUrl = uploadedCoverBlob.url;
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();

        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: 'image/png'
        });
        coverUrl = uploadedCoverBlob.url;
      }

      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        fileSize: pdfFile.size,
      });
      
      if(!book.success) throw new Error("Failed to create book");
      
      if(book.alreadyExists) {
        toast.info("Book with same title already exists.");
        reset()
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }
      
      const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

      if (!segments.success) {
        toast.error("Failed to save book segments");
        throw new Error("Failed to save book segments");
      }

      reset();
      router.push('/');

    } catch (error) {
      console.error(error);
      toast.error("Failed to upload book. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }

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
      setValue('coverImage', undefined, { shouldValidate: true });
    }
  };

  const removePdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('pdfFile', undefined, { shouldValidate: true });
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue('coverImage', undefined, { shouldValidate: true });
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
                   {previewUrl && (
                     <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                     />
                   )}
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

        {/* Persona */}
        <div className="space-y-2">
          <label htmlFor="persona" className="form-label">Assistant Persona (Optional)</label>
          <textarea
            {...register('persona')}
            id="persona"
            placeholder="ex: You are a friendly AI who loves books. You should explain concepts in a simple way."
            className="form-input min-h-[100px] py-3"
          />
          {errors.persona && <p className="text-red-500 text-sm mt-1">{errors.persona.message}</p>}
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

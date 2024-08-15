'use client'
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { completeUpload, initiateUpload } from '../../../lib/api';
import { LuUpload, LuFile, LuCheckCircle, LuAlertCircle } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { userAtom } from '../../../store/authAtoms';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [user] = useAtom(userAtom)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;


    setUploadStatus('uploading');
    setUploadProgress(0);
    

    try {
      const initiateResponse = await initiateUpload(title, user?.id, file.type);
      console.log("initiateResponse", initiateResponse);
      
      const { id, uploadUrl } = initiateResponse;

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      await completeUpload(id);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Upload Your Video</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Video Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Enter your video title"
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
            <div className="relative">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="hidden"
                accept="video/*"
                required
              />
              <label
                htmlFor="file"
                className="flex items-center justify-center w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition duration-200 cursor-pointer"
              >
                {file ? (
                  <>
                    <LuFile className="mr-2" />
                    {file.name}
                  </>
                ) : (
                  <>
                    <LuUpload className="mr-2" />
                    Choose a video file
                  </>
                )}
              </label>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            disabled={uploadStatus === 'uploading'}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Video'}
          </motion.button>
        </form>
        {uploadStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-gray-300">{uploadProgress}% Uploaded</p>
              </div>
            )}
            {uploadStatus === 'success' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center text-green-500"
              >
                <LuCheckCircle size={24} className="mr-2" />
                <span>Upload completed successfully!</span>
              </motion.div>
            )}
            {uploadStatus === 'error' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center text-red-500"
              >
                <LuAlertCircle size={24} className="mr-2" />
                <span>Upload failed. Please try again.</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadPage;
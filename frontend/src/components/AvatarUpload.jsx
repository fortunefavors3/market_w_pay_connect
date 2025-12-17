import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AvatarUpload = ({ size = 'lg', className = '' }) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, etc.)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user.id);

      const response = await fetch(`${BACKEND_URL}/api/users/avatar`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update user context with new avatar URL
      updateUser({ avatar: data.avatar_url });

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.'
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to update your avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        disabled={isUploading}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
      >
        <img
          src={user?.avatar}
          alt={user?.name || 'User avatar'}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with camera icon */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
          isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isUploading ? (
            <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
          ) : (
            <Camera className={`${iconSizes[size]} text-white`} />
          )}
        </div>
      </button>
      
      {/* Small camera badge for always-visible indicator */}
      {!isUploading && (
        <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5 shadow-lg border-2 border-white">
          <Camera className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;

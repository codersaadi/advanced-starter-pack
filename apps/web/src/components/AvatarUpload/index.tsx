'use client';
import { Loader2, Upload as UploadIcon } from 'lucide-react';
import React, { memo, useCallback, useRef } from 'react';

import { useUserStore } from '@/store/user';
import { imageToBase64 } from '@repo/shared/utils/image-to-base64';
import { toast } from '@repo/ui/components/ui/sonner';
import type { UserAvatarProps } from '../UserAvatar';
import UserAvatar from '../UserAvatar';

interface AvatarWithUploadProps extends UserAvatarProps {
  compressSize?: number;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(
  ({ size = 40, compressSize = 256, ...rest }) => {
    const updateAvatar = useUserStore((state) => state.updateAvatar);
    const [uploading, setUploading] = React.useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast('Invalid File', {
            description: 'Please select an image file',
          });
          return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast('Invalid File Size', {
            description: 'File size must be less than 5MB',
          });
          return;
        }

        try {
          setUploading(true);

          // Convert file to data URL
          const reader = new FileReader();
          const avatar = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // Prepare image
          const img = new Image();
          img.src = avatar;

          // Wait for image to load
          await new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });

          // Compress image
          const webpBase64 = imageToBase64({ img, size: compressSize });

          // Upload avatar
          await updateAvatar(webpBase64);

          toast('Success', {
            description: 'Avatar updated successfully',
          });

          setUploading(false);
        } catch (error) {
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.error('Failed to upload avatar:', error);
          setUploading(false);

          toast('Error', {
            description:
              error instanceof Error
                ? error.message
                : 'Failed to upload avatar',
          });
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [compressSize, updateAvatar]
    );

    const handleAvatarClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        {/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
        <div
          className="group relative cursor-pointer"
          onClick={handleAvatarClick}
        >
          <UserAvatar clickable size={size} {...rest} />

          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}

          {/* Upload overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <UploadIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    );
  }
);

export default AvatarWithUpload;

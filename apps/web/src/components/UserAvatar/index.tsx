'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/ui/avatar';
import { cn } from '@repo/ui/lib/utils';
import type React from 'react';
import { forwardRef } from 'react';

import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';
import {
  BRANDING_NAME,
  DEFAULT_USER_AVATAR_URL,
} from '@repo/shared/const/branding';

export interface UserAvatarProps {
  size?: number;
  background?: string;
  clickable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ size = 40, background, clickable, className, style, ...rest }, ref) => {
    const [avatar, username] = useUserStore((s) => [
      userProfileSelectors.userAvatar(s),
      userProfileSelectors.username(s),
    ]);

    const isSignedIn = useUserStore(authSelectors.isLogin);

    const avatarUrl = isSignedIn && !!avatar ? avatar : DEFAULT_USER_AVATAR_URL;
    const altText = isSignedIn && !!username ? username : BRANDING_NAME;

    return (
      <div ref={ref} style={{ flex: 'none', ...style }}>
        <Avatar
          className={cn(
            'relative overflow-hidden transition-all duration-200 ease-out',
            clickable && [
              'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary',
              'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
              'before:translate-x-[-100%] before:skew-x-[-45deg] before:transition-transform before:duration-200',
              'hover:before:translate-x-[100%]',
            ],
            className
          )}
          style={{
            width: size,
            height: size,
            backgroundColor: isSignedIn && avatar ? background : 'transparent',
          }}
          {...rest}
        >
          <AvatarImage src={avatarUrl} alt={altText} className="object-cover" />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {altText.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;

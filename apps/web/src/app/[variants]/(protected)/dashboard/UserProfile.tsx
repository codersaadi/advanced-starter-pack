'use client';
import SignOutButton, {
  ClerkSignOutButton,
} from '@/components/nextauth/signout';
import {
  enableAuth,
  enableClerk,
  enableNextAuth,
} from '@repo/core/config/auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/ui/avatar';
import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import { Separator } from '@repo/ui/components/ui/separator';
import { Check, Clock, Copy, LogOut, Mail, Shield, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface UserProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
  authProvider: 'clerk' | 'nextauth';
  sessionCreatedAt?: Date;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity:
export function UserProfile({
  user,
  authProvider,
  sessionCreatedAt,
}: UserProfileProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = async () => {
    if (user.id) {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    return user.id ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader className="pb-4 text-center">
          <div className="relative mx-auto mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || 'User Avatar'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white text-xl">
                {user.name ? (
                  getInitials(user.name)
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <div
              className={`-bottom-1 -right-1 absolute h-6 w-6 ${getStatusColor()} rounded-full border-4 border-white shadow-sm`}
            />
          </div>

          <CardTitle className="font-bold text-2xl text-gray-900 dark:text-gray-100">
            {user.name || 'Anonymous User'}
          </CardTitle>

          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge
              variant={user.id ? 'default' : 'destructive'}
              className="font-medium text-xs"
            >
              <Shield className="mr-1 h-3 w-3" />
              {user.id ? 'Authenticated' : 'Unauthorized'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {authProvider === 'clerk' ? 'Clerk' : 'NextAuth'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-slate-700">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm dark:text-gray-100">
                  Email
                </p>
                <p className="truncate text-gray-600 text-sm dark:text-gray-300">
                  {user.email || 'Not provided'}
                </p>
              </div>
            </div>

            {user.id && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-slate-700">
                <User className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm dark:text-gray-100">
                    User ID
                  </p>
                  <p className="break-all font-mono text-gray-600 text-xs dark:text-gray-300">
                    {user.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyId}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {sessionCreatedAt && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-slate-700">
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm dark:text-gray-100">
                    Session Started
                  </p>
                  <p className="text-gray-600 text-sm dark:text-gray-300">
                    {sessionCreatedAt.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {user.id ? (
              authProvider === 'clerk' ? (
                <ClerkSignOutButton />
              ) : (
                <SignOutButton />
              )
            ) : (
              <Link
                href={
                  enableAuth && enableClerk
                    ? '/login'
                    : enableNextAuth
                      ? '/next-auth/signin'
                      : '#'
                }
              >
                <Button variant="outline" className="w-full" disabled>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign In Required
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import AuthFlexLayout from '@/components/AuthFlexLayout';
import type React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthFlexLayout>{children}</AuthFlexLayout>;
}

'use client';
import img from '@/assets/auth-bg.jpg';
import Image from 'next/image';
import { useState } from 'react';

export default function AuthLayoutImage() {
  const [loading, setLoading] = useState(true);
  return (
    <div
      className={`-z-10 fixed top-0 left-0 h-screen w-full items-center justify-center overflow-hidden bg-center bg-cover brightness-70 brightness-[20%] md:flex-1 lg:relative lg:flex lg:brightness-90 ${
        loading && 'bg-gradient-to-r from-violet-400 to-primary '
      } `}
    >
      <Image
        src={img}
        width={700}
        height={800}
        alt="auth-image"
        onLoad={() => setLoading(false)}
        quality={75}
        className={`h-full w-full object-cover ${loading && 'blur'}`}
      />
      <div className="absolute top-0 h-screen w-full bg-neutral-700/20" />
    </div>
  );
}

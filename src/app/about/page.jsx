'use client';
import React from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
const About = () => {
  const RainbowText = ({ children, className = "" }) => (
    <span className={`inline-block animate-[rainbow_3s_infinite] ${className}`}>
      {children}
    </span>
  );

  const Divider = () => (
    <div className="flex items-center justify-center my-4">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="mx-1 text-2xl animate-[spin_1s_linear_infinite]">
          🧍‍♂️
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black bg-[url('/api/placeholder/100/100')] bg-repeat text-green-400 font-['Comic_Sans_MS'] text-center p-5">
      <div className="max-w-4xl mx-auto bg-[#000033] border-[5px] border-[#c0c0c0] border-solid p-5">
        <RainbowText className="text-5xl font-bold block mb-6 [text-shadow:2px_2px_#ff0000,_-2px_-2px_#0000ff]">
          About Me
        </RainbowText>

        <Divider />

        <div className="grid md:grid-cols-2 gap-8 my-8">
          <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4">
            <div className="border-2 border-[#808080] border-inset p-2">
              <div className="aspect-square bg-gray-700 flex items-center justify-center">
                <Image src="/img.jpg" alt="Jake Milad" width={350} height={350} />
              </div>
            </div>
            <p className="mt-2 text-yellow-300 animate-[blink_1s_infinite]">
              ⚡️ That's me! ⚡️
            </p>
          </div>

          <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4 text-left">
            <h2 className="text-2xl mb-4">
              <RainbowText>👋 Hello World!</RainbowText>
            </h2>
            <div className="space-y-4 text-green-400">
              <p>As you can see, I'm absolutely cracked out of my mind at frontend developement. Famously invented centering divs.</p>
            </div>
          </div>
        </div>

        <Divider />

        <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4 my-8">
          <h2 className="text-2xl mb-4">
            <RainbowText>🚀 Super Cool Skills 🚀</RainbowText>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['React', 'Next.js', 'Tailwind', 'Python', 'Datadog', 'Splunk', 'Kubernetes', 'Docker', 'Terraform', 'Git', 'CI/CD', 'Observability', 'AWS'].map((skill, i) => (
              <div
                key={i}
                className="bg-black p-2 border-2 border-[#808080] border-inset"
              >
                <span className="animate-[pulse_2s_infinite]">💫</span> {skill}
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="inline-block bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-3 hover:text-yellow-300"
        >
          <span className="animate-[bounce_1s_ease-in-out_infinite] inline-block">👈</span>
          {' '}
          <RainbowText>Back to Homepage</RainbowText>
          {' '}
          <span className="animate-[bounce_1s_ease-in-out_infinite] inline-block">👈</span>
        </Link>
      </div>

      <style jsx global>{`
        @keyframes rainbow {
          0% { color: #ff0000; }
          20% { color: #ffff00; }
          40% { color: #00ff00; }
          60% { color: #00ffff; }
          80% { color: #ff00ff; }
          100% { color: #ff0000; }
        }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default About;

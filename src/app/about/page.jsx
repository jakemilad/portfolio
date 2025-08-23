'use client';
import React from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


const aboutMeSection = () => {
  return (
    <div className="text-left text-sm">
      <p>I like building things that make things easier.</p>
      <br />
      <p>At lululemon, I founded an executive-level tool that consolidates critical system health into a single pane of glass. That gave leadership and engineering teams a high level view into how well we’re selling yoga pants and also figure out if we got an issue selling yoga pants. I’ve worked across the stack to bring it to life, from backend data pipelines to process  hundreds and thousands of metrics, responsive frontend dashboards with sub-second latency and multi-layer caching architecture. I also work pretty closely with other teams to improve their metrics, logs, tracing, and strategizing solutions to improve their observability. I do big picture stuff too like building out the enterprise reliability standards across the org,  developing Service Level Objectives for all critical commerce services in production.</p>
      <br />
      <p>Outside of work, I like to build stuff that I can use and that push my technical curiosity. Also so that I’m still good at programming. I built an LLM powered financial transaction tool that helps categorize, summarize and provide insights into my plain and boring statement data from the bank. I’ve designed dynamic data ingestion solutions to adapt to different schemas from different banks, all beautifully visualized with cool charts. I also love to get into systems level stuff - I built a minimal container runtime in Go where I used Linux namespaces and kernel primitives.</p>
    </div>
  )
}

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
    <div className="min-h-screen bg-black bg-repeat text-green-400 font-['Comic_Sans_MS'] text-center p-5">
      <div className="max-w-4xl mx-auto bg-[#000033] border-[5px] border-[#c0c0c0] border-solid p-5">
        <RainbowText className="text-5xl font-bold block mb-6 [text-shadow:2px_2px_#ff0000,_-2px_-2px_#0000ff]">
          About Me
        </RainbowText>


        <div className="grid md:grid-cols-2 gap-8 my-8">
          <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4">
            <div className="border-2 border-[#808080] border-inset p-2">
              <div className="aspect-square bg-gray-700 flex items-center justify-center">
                <Image src="/img.jpg" alt="Jake Milad" width={350} height={350} />
              </div>
            </div>
            <p className="mt-2 text-yellow-300 animate-[blink_1s_infinite]">
              ⚡️ That's me ⚡️
            </p>
          </div>

          <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4 text-left">
            <h2 className="text-2xl mb-4">
              <RainbowText>👋 Hello, I'm Jake</RainbowText>
            </h2>
            <div className="space-y-4 text-green-400">
              {aboutMeSection()}
            </div>
          </div>
        </div>


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
        <Divider />
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

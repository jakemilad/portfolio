'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ContactCard from './ContactCard';

class Avatar3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Avatar3D Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <Simple2DAvatar />;
    }

    return this.props.children;
  }
}


const Avatar3D = dynamic(() => import('./Avatar3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#000066] border-2 border-[#c0c0c0] border-inset">
      <div className="text-green-400 animate-pulse">Loading 3D Jake... 🤖</div>
    </div>
  )
});

const Simple2DAvatar = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 border-2 border-gray-400">
    <div className="text-6xl mb-4 animate-bounce">👨‍💻</div>
    <div className="text-green-400 text-center">
      <div className="text-lg font-bold">Jake Milad</div>
      <div className="text-sm">Software Engineer</div>
      <div className="text-xs mt-2 text-yellow-300">
        (2D Mode - WebGL Unavailable)
      </div>
    </div>
  </div>
);


const NinetyHomepage = () => {
  const [visitorCount, setVisitorCount] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [currentAnimation, setCurrentAnimation] = useState('dance');
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);
  const audioRef = useRef(null);

  const [showDebug, setShowDebug] = useState(false);



  const animations = [
    { id: 'dance', name: 'Dance', emoji: '🕺', model: '/models/dance-compressed.glb' },
    { id: 'agree', name: 'Agree', emoji: '👍', model: '/models/agree-compressed.glb' },
    { id: 'walk', name: 'Walk', emoji: '🚶', model: '/models/walk-compressed.glb' },
    { id: 'run', name: 'Run', emoji: '🏃', model: '/models/run-compressed.glb' }
  ];

  const emojis = ['😁', '🤟', '🥶', '⚽', '🤢']

  useEffect(() => {
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-black bg-repeat text-green-400 font-['Comic_Sans_MS'] text-center p-5 mt-10">

      <div className="fixed top-4 right-4 bg-[#000066] border-2 border-[#c0c0c0] border-ridge rounded overflow-hidden">
        {!isControlsMinimized ? (

          <div className="p-2 flex items-center gap-2">

            <div className="bg-black text-red-500 font-mono p-1 border border-[#808080] border-inset rounded text-sm">
              {currentTime ? currentTime.toLocaleTimeString() : "00:00:00"}
            </div>
            <div className="w-px h-6 bg-[#c0c0c0]"></div>
            <Music className="w-5 h-5" />
            <button
              onClick={toggleAudio}
              className="hover:text-yellow-300"
            >
              {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="w-px h-6 bg-[#c0c0c0]"></div>

            <button
              onClick={() => setIsControlsMinimized(true)}
              className="hover:text-yellow-300 text-xs font-mono"
              title="Minimize controls"
            >
              ⊟
            </button>
            <audio 
              ref={audioRef}
              loop 
              src="/toto.mid"
            >
              Your browser doesn't support audio playback
            </audio>
          </div>
        ) : (

          <div className="p-1 flex items-center gap-1">

            <div className="text-red-500 text-xs font-mono">●</div>
            <div className="text-green-400 text-xs">♪</div>

            <button
              onClick={() => setIsControlsMinimized(false)}
              className="hover:text-yellow-300 text-xs font-mono ml-1"
              title="Restore controls"
            >
              ⊞
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-[#000033] border-[5px] border-[#c0c0c0] border-solid p-5">



        <RainbowText className="text-5xl font-bold block mb-6 [text-shadow:2px_2px_#ff0000,_-2px_-2px_#0000ff]">
          Jake Milad Portfolio
        </RainbowText>
        

        <div className="my-5 text-2xl text-red-500 animate-[blink_1s_infinite] overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_10s_linear_infinite]">
            🚧 WOAH HOLD UP 🚧 SOFTWARE ENGINEER HERE 🚧 THIS IS ALWAYS A WORK IN PROGRESS 🚧
          </div>
        </div>

        <Divider />


        <div className="flex justify-center gap-4 my-4">
          {emojis.map((emoji, i) => (
            <span
              key={i}
              className="text-3xl animate-[bounce_1s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>


        <div className="my-6">
          <div className="text-center mb-3">
            <RainbowText className="text-xl font-bold">
              🕺 INTERACTIVE JAKE! 🕺
            </RainbowText>

          </div>
          
          <div className="max-w-lg mx-auto mb-4">
            <div className="bg-[#000066] border-2 border-[#c0c0c0] border-groove p-2 rounded">
              <div className="grid grid-cols-4 gap-2">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => setCurrentAnimation(anim.id)}
                    className={`
                      relative p-2 rounded border-2 transition-all duration-200 font-mono text-xs
                      ${currentAnimation === anim.id 
                        ? 'bg-[#ff6b6b] border-[#ff9999] text-white border-outset' 
                        : 'bg-[#c0c0c0] border-[#808080] text-black border-outset hover:bg-[#d0d0d0]'
                      }
                    `}
                  >
                    <div className="text-lg">{anim.emoji}</div>
                    <div className="text-xs">{anim.name}</div>
                    {currentAnimation === anim.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="max-w-lg mx-auto bg-[#1a1a1a] border border-[#333] rounded-lg p-1 shadow-2xl">
            <div className="h-[380px] bg-[#0a0a0a] rounded border border-[#222] relative overflow-hidden">
              <Avatar3DErrorBoundary fallback={<Simple2DAvatar />}>
                <Avatar3D
                  key={currentAnimation}
                  modelPath={animations.find(a => a.id === currentAnimation)?.model}
                  enableControls={true}
                  autoRotate={true}
                  className="w-full h-full"
                />
              </Avatar3DErrorBoundary>
              
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 pointer-events-none"></div>
            </div>
            
            <div className="mt-1 text-center">
              <div className="text-green-400 font-mono text-xs animate-pulse">
                ● JAKE - {animations.find(a => a.id === currentAnimation)?.name.toUpperCase()} MODE
              </div>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-yellow-300 text-xs animate-[blink_3s_infinite]">
              💻 Drag • Scroll • Click Buttons Above 💻
            </p>
          </div>
        </div>

        <Divider />


        <nav className="bg-[#000066] border-[3px] border-[#c0c0c0] border-groove p-3 my-5">
          {[
            ['About Me', '/about', '👤'],
            ['My Cool Stuff', '/portfolio', '🎮'],
            ['Contact Me!', '#contact', '📧']
          ].map(([text, href, icon], i) => (
            <React.Fragment key={text}>
              <Link 
                href={href}
                className="text-xl text-green-400 no-underline mx-3 hover:text-yellow-300 hover:underline inline-flex items-center gap-2"
              >
                <span className="animate-[pulse_2s_infinite]">{icon}</span>
                <RainbowText>{text}</RainbowText>
              </Link>
              <span className="inline-block animate-[spin_3s_linear_infinite]">💫</span>
            </React.Fragment>
          ))}
        </nav>

        <Divider />


        <div className="overflow-hidden whitespace-nowrap my-4">
        <div className="animate-[marquee_20s_linear_infinite]">
        <pre className="font-mono text-yellow-300 text-xs inline-block">
        {`
          JJJJJJJJJJJ          AAA               KKKKKKKKK    KKKKKKKEEEEEEEEEEEEEEEEEEEEEE     MMMMMMMM               MMMMMMMMIIIIIIIIIILLLLLLLLLLL                            AAA               DDDDDDDDDDDDD        
          J:::::::::J         A:::A              K:::::::K    K:::::KE::::::::::::::::::::E     M:::::::M             M:::::::MI::::::::IL:::::::::L                           A:::A              D::::::::::::DDD     
          J:::::::::J        A:::::A             K:::::::K    K:::::KE::::::::::::::::::::E     M::::::::M           M::::::::MI::::::::IL:::::::::L                          A:::::A             D:::::::::::::::DD   
          JJ:::::::JJ       A:::::::A            K:::::::K   K::::::KEE::::::EEEEEEEEE::::E     M:::::::::M         M:::::::::MII::::::IILL:::::::LL                         A:::::::A            DDD:::::DDDDD:::::D  
            J:::::J        A:::::::::A           KK::::::K  K:::::KKK  E:::::E       EEEEEE     M::::::::::M       M::::::::::M  I::::I    L:::::L                          A:::::::::A             D:::::D    D:::::D 
            J:::::J       A:::::A:::::A            K:::::K K:::::K     E:::::E                  M:::::::::::M     M:::::::::::M  I::::I    L:::::L                         A:::::A:::::A            D:::::D     D:::::D
            J:::::J      A:::::A A:::::A           K::::::K:::::K      E::::::EEEEEEEEEE        M:::::::M::::M   M::::M:::::::M  I::::I    L:::::L                        A:::::A A:::::A           D:::::D     D:::::D
            J:::::j     A:::::A   A:::::A          K:::::::::::K       E:::::::::::::::E        M::::::M M::::M M::::M M::::::M  I::::I    L:::::L                       A:::::A   A:::::A          D:::::D     D:::::D
            J:::::J    A:::::A     A:::::A         K:::::::::::K       E:::::::::::::::E        M::::::M  M::::M::::M  M::::::M  I::::I    L:::::L                      A:::::A     A:::::A         D:::::D     D:::::D
JJJJJJJ     J:::::J   A:::::AAAAAAAAA:::::A        K::::::K:::::K      E::::::EEEEEEEEEE        M::::::M   M:::::::M   M::::::M  I::::I    L:::::L                     A:::::AAAAAAAAA:::::A        D:::::D     D:::::D
J:::::J     J:::::J  A:::::::::::::::::::::A       K:::::K K:::::K     E:::::E                  M::::::M    M:::::M    M::::::M  I::::I    L:::::L                    A:::::::::::::::::::::A       D:::::D     D:::::D
J::::::J   J::::::J A:::::AAAAAAAAAAAAA:::::A    KK::::::K  K:::::KKK  E:::::E       EEEEEE     M::::::M     MMMMM     M::::::M  I::::I    L:::::L         LLLLLL    A:::::AAAAAAAAAAAAA:::::A      D:::::D    D:::::D 
J:::::::JJJ:::::::JA:::::A             A:::::A   K:::::::K   K::::::KEE::::::EEEEEEEE:::::E     M::::::M               M::::::MII::::::IILL:::::::LLLLLLLLL:::::L   A:::::A             A:::::A   DDD:::::DDDDD:::::D  
 JJ:::::::::::::JJA:::::A               A:::::A  K:::::::K    K:::::KE::::::::::::::::::::E     M::::::M               M::::::MI::::::::IL::::::::::::::::::::::L  A:::::A               A:::::A  D:::::::::::::::DD   
   JJ:::::::::JJ A:::::A                 A:::::A K:::::::K    K:::::KE::::::::::::::::::::E     M::::::M               M::::::MI::::::::IL::::::::::::::::::::::L A:::::A                 A:::::A D::::::::::::DDD     
     JJJJJJJJJ  AAAAAAA                   AAAAAAAKKKKKKKKK    KKKKKKKEEEEEEEEEEEEEEEEEEEEEE     MMMMMMMM               MMMMMMMMIIIIIIIIIILLLLLLLLLLLLLLLLLLLLLLLLAAAAAAA                   AAAAAAADDDDDDDDDDDDD        
          `}
            </pre>
            </div>
        </div>


        <div className="h-48 my-5 overflow-hidden bg-[#000066] border-[3px] border-[#c0c0c0] border-inset">
          <div className="animate-[scrollUp_15s_linear_infinite]">
            {[
              '🎓 UBC Business & Computer Science Degree',
              '👨‍💻 2+ years of Software Engineering Experience',
              '🔧 Site reliability engineering at lululemon',
              '🧮 Addicted to taking business problems and applying technical solutions',
              '✨ Obsessed with driving key metrics',
              '🔍 Observability enjoyer',
            ].map((text, i) => (
              <p key={i} className="my-2">
                <RainbowText>{text}</RainbowText>
              </p>
            ))}
          </div>
        </div>

        <Divider />


        <div id="contact" className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-5 my-5">
          <h2 className="text-2xl mb-6">
            <RainbowText>📧 CONTACT ME! 📧</RainbowText>
          </h2>
          
          <div className="max-w-md mx-auto space-y-4">
            <ContactCard href="mailto:jake.milad@gmail.com" icon="📧" title="EMAIL" value="jake.milad@gmail.com" />
            <ContactCard href="https://linkedin.com/in/jakemilad" icon="💼" title="LINKEDIN" value="https://linkedin.com/in/jakemilad" />
            <ContactCard href="https://github.com/jakemilad" icon="👨‍💻" title="GITHUB" value="https://github.com/jakemilad" />
          </div>

          <div className="mt-6 text-center">
            <div className="text-yellow-300 text-sm animate-[blink_3s_infinite]">
              💻 Click any link above to get in touch! 💻
            </div>
          </div>
        </div>


        <div className="my-5">
          <p className="text-yellow-300">Visitors:</p>
          <div className="inline-block bg-black text-red-500 font-['Courier_New'] p-2 border-2 border-[#808080] border-inset">
            {String(visitorCount).padStart(6, '0')}
          </div>
        </div>


        <div className="overflow-hidden whitespace-nowrap my-5">
          <div className="animate-[marquee_15s_linear_infinite]">
            ⭐️ Best viewed at 800x600 resolution ⭐️ Sound ON! ⭐️
          </div>
        </div>


        <p className="text-xs text-gray-500">
          © 2001 - Made with <span className="animate-[pulse_2s_infinite]">❤️</span> and lots of HTML
        </p>
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

        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }

        @keyframes scrollUp {
          from { transform: translateY(100%); }
          to { transform: translateY(-100%); }
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

export default NinetyHomepage;
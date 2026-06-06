'use client';

import React, { useState, useEffect } from 'react';
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

const Homepage = () => {
  const [visitorCount, setVisitorCount] = useState(13492);
  const [currentAnimation, setCurrentAnimation] = useState('run');

  const [showDebug, setShowDebug] = useState(false);



  const animations = [
    { id: 'run', name: 'Run', emoji: '🏃', model: '/models/run-compressed.glb' },
    { id: 'walk', name: 'Walk', emoji: '🚶', model: '/models/walk-compressed.glb' },
    { id: 'dance', name: 'Dance', emoji: '🕺', model: '/models/dance-compressed.glb' },
    // { id: 'agree', name: 'Agree', emoji: '👍', model: '/models/agree-compressed.glb' },
  ];

  // const emojis = ['😁', '🤟', '🥶', '⚽', '🤢']

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
    <div className="min-h-screen bg-black bg-repeat text-green-400 font-['Comic_Sans_MS'] text-center p-2 sm:p-5 mt-10">
      <div className="max-w-4xl mx-auto bg-[#000033] border-[3px] sm:border-[5px] border-[#c0c0c0] border-solid p-2 sm:p-5">



        <RainbowText className="text-2xl sm:text-4xl md:text-5xl font-bold block mb-4 sm:mb-6 [text-shadow:2px_2px_#ff0000,_-2px_-2px_#0000ff]">
          Jake Milad Portfolio
        </RainbowText>
        


        {/* <Divider /> */}


        {/* <div className="flex justify-center gap-4 my-4">
          {emojis.map((emoji, i) => (
            <span
              key={i}
              className="text-3xl animate-[bounce_1s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div> */}

        {/* <Divider /> */}


        <nav className="bg-[#000066] border-[3px] border-[#c0c0c0] border-groove p-2 sm:p-3 my-3 sm:my-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            {[
              // ['About Me', '/about', '👤'],
              ['My Projects', '/portfolio', '🎮'],
              ['Contact Me!', '#contact', '📧']
            ].map(([text, href, icon], i) => (
              <React.Fragment key={text}>
                <Link 
                  href={href}
                  className="text-base sm:text-xl text-green-400 no-underline mx-2 sm:mx-3 hover:text-yellow-300 hover:underline inline-flex items-center gap-2"
                >
                  <span className="animate-[pulse_2s_infinite]">{icon}</span>
                  <RainbowText>{text}</RainbowText>
                </Link>
                <span className="hidden sm:inline-block animate-[spin_3s_linear_infinite]">💫</span>
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* <Divider /> */}


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


        {/* <div className="h-48 my-5 overflow-hidden bg-[#000066] border-[3px] border-[#c0c0c0] border-inset">
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
        </div> */}


        <div className="my-4 sm:my-6">
          <div className="text-center mb-2 sm:mb-3">
            <RainbowText className="text-base sm:text-xl font-bold">
              🕺 INTERACTIVE JAKE! 🕺
            </RainbowText>
          </div>
          
          <div className="max-w-lg mx-auto mb-3 sm:mb-4 px-2 sm:px-0">
            <div className="bg-[#000066] border-2 border-[#c0c0c0] border-groove p-2 rounded">
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {animations.map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => setCurrentAnimation(anim.id)}
                    className={`
                      relative p-1.5 sm:p-2 rounded border-2 transition-all duration-200 font-mono text-xs
                      ${currentAnimation === anim.id 
                        ? 'bg-[#ff6b6b] border-[#ff9999] text-white border-outset' 
                        : 'bg-[#c0c0c0] border-[#808080] text-black border-outset hover:bg-[#d0d0d0]'
                      }
                    `}
                  >
                    <div className="text-base sm:text-lg">{anim.emoji}</div>
                    <div className="text-[10px] sm:text-xs">{anim.name}</div>
                    {currentAnimation === anim.id && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-[#333] rounded-lg p-1 shadow-2xl">
            <div className="h-[280px] sm:h-[350px] md:h-[380px] bg-[#0a0a0a] rounded border border-[#222] relative overflow-hidden">
              <Avatar3DErrorBoundary fallback={<Simple2DAvatar />}>
                <Avatar3D
                  modelPath={animations.find(a => a.id === currentAnimation)?.model}
                  enableControls={true}
                  autoRotate={true}
                  className="w-full h-full"
                />
              </Avatar3DErrorBoundary>
              
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 pointer-events-none"></div>
            </div>
            
            <div className="mt-1 text-center">
              <div className="text-green-400 font-mono text-[10px] sm:text-xs animate-pulse">
                ● JAKE - {animations.find(a => a.id === currentAnimation)?.name.toUpperCase()} MODE
              </div>
            </div>
          </div>
          
          <div className="text-center mt-2 sm:mt-3">
            <p className="text-yellow-300 text-[10px] sm:text-xs animate-[blink_3s_infinite]">
              💻 Drag • Scroll • Click Buttons Above 💻
            </p>
          </div>
        </div>


        <div id="contact" className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-3 sm:p-5 my-3 sm:my-5">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6">
            <RainbowText>📧 CONTACT ME 📧</RainbowText>
          </h2>
          
          <div className="max-w-md mx-auto space-y-3 sm:space-y-4 px-1 sm:px-0">
            <ContactCard href="mailto:jake.milad@gmail.com" icon="📧" title="EMAIL" value="jake.milad@gmail.com" />
            <ContactCard href="https://linkedin.com/in/jakemilad" icon="💼" title="LINKEDIN" value="linkedin.com/in/jakemilad" />
            <ContactCard href="https://github.com/jakemilad" icon="👨‍💻" title="GITHUB" value="github.com/jakemilad" />
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <div className="text-yellow-300 text-xs sm:text-sm animate-[blink_3s_infinite]">
              💻 Click any link above to get in touch 💻
            </div>
          </div>
        </div>


        <div className="my-3 sm:my-5">
          <p className="text-yellow-300 text-sm sm:text-base">Visitors:</p>
          <div className="inline-block bg-black text-red-500 font-['Courier_New'] p-1.5 sm:p-2 text-sm sm:text-base border-2 border-[#808080] border-inset">
            {String(visitorCount).padStart(6, '0')}
          </div>
        </div>



        <div className="overflow-hidden whitespace-nowrap my-3 sm:my-5">
          <div className="animate-[marquee_15s_linear_infinite] text-xs sm:text-base">
            ⭐️ This Counter Doesn't work ⭐️ It's Hardcoded ⭐️ Or is it.. ⭐️
          </div>
        </div>


        <p className="text-[10px] sm:text-xs text-gray-500">
          © 2001
        </p>
      </div>

      <div className="my-3 sm:my-5 text-base sm:text-2xl text-red-500 animate-[blink_1s_infinite] overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_10s_linear_infinite]">
            🚧 WORK IN PROGRESS 🚧 WORK IN PROGRESS 🚧 WORK IN PROGRESS 🚧
          </div>
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

        @keyframes slideInRight {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;

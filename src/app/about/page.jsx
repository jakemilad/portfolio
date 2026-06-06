'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';


const aboutMeSection = () => {
  return (
    <div className="text-left text-sm space-y-5">

      <div className='bg-[#000066] border-[3px] border-[#c0c0c0] border-inset p-3'>
        <h3 className='text-xl mb-2 text-yellow-300'>Education</h3>
        <p>Business + Computer Science at UBC.</p>
      </div>

      <div className='bg-[#000066] border-[3px] border-[#c0c0c0] border-inset p-3'>
        <h3 className='text-xl mb-2 text-yellow-300'>lululemon</h3>
        <ul className='list-disc ml-5 space-y-2'>
          <li>Main builder behind SweatCheck, an internal observability platform. It unifies telemetry from 300+ services into one dashboard to spot issues fast (especially on Black Friday).</li>
          <li>Built end to end with Next.js, TypeScript, Redis, Datadog, and Snowflake. Three-tier caching + parallel pipelines cut API load ~90% while keeping data fresh every 45 seconds.</li>
          <li>Introduced SLOs for checkout (cart, shipping, payment, order) targeting 99.95% availability, and automated Datadog setup with a Python CLI for 40+ GraphQL resolvers — reducing detection time ~30%.</li>
        </ul>
      </div>

      <div className='bg-[#000066] border-[3px] border-[#c0c0c0] border-inset p-3'>
        <h3 className='text-xl mb-2 text-yellow-300'>Side Projects</h3>
        <p>
          I build tools I actually use: an LLM-powered personal finance analyzer with flexible ingestion and crisp charts; and a tiny container runtime in Go using Linux namespaces and kernel primitives.
        </p>
      </div>
    </div>
  )
}

const SkillSection = ({skills, title, id}) => {
  return (
    <div key={id} className='p-2'>
      <h2 className='text-2xl text-left'>{title}</h2>
      <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
        {skills.map((lang, i) => (
          <div
            key={i}
            className='bg-black p-3 border border-[#808080] border-inset'
          >
            <span className="animate-[pulse_2s_infinite]">💫</span> {lang} <span className="animate-[pulse_2s_infinite]">💫</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// function skillSection({skills, title}) {
//   return (
//   <div className='p-2'>
//     <h1 className='text-2xl text-left'>{title}</h1>
//     <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
//       {skills.map((lang, i) => (
//         <div
//           key={i}
//           className='bg-black p-2 border border-[#808080] border-inset'
//         >
//           <span className="animate-[pulse_2s_infinite] p-2">💫</span>{lang}
//         </div>
//       ))}
//   </div>
//   </div>
//   )
// }

const About = () => {
  const RainbowText = ({ children, className = "" }) => (
    <span className={`inline-block animate-[rainbow_3s_infinite] ${className}`}>
      {children}
    </span>
  );
  const languages = ['Python',' TypeScript', 'JavaScript', 'Go', 'Java', 'SQL', 'HTML', 'CSS']
  const data = ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'PostgreSQL', 'MongoDB', 'Snowflake', 'Redis']
  const frameworks = ['Node.js', 'Django', 'Next.js', 'React', 'Pandas', 'NumPy', 'Jest', 'Flask', 'GraphQL', 'PostCSS', 'TailwindCSS']
  const tools = ['Git', 'Datadog', 'Splunk', 'OpenTelemetry', 'Grafana', 'Prometheus', 'Loki', 'ArgoCD', 'GitLabCI', 'TravisCI']

  const skillsSectionArray = [
    {title: "Languages", skills: languages, id: "languages"},
    {title: "Data & Infrastructure", skills: data, id: "data"},
    {title: "Frameworks & Libraries", skills: frameworks, id: "frameworks"},
    {title: "Tools & DevOps", skills: tools, id: "tools"},
  ]
  // const technologies = ['React', 'Next.js', 'Tailwind', 'Python', 'Datadog', 'Splunk', 'Kubernetes', 'Docker', 'Terraform', 'Git', 'CI/CD', 'Observability', 'AWS']
    //   Languages: Python, TypeScript/JavaScript, Go, Java, SQL, R, HTML, CSS
    // Data & Infrastructure: AWS, Docker, Kubernetes, Terraform, PostgreSQL, MongoDB, Snowflake, Redis
    // Frameworks & Libraries: Node.js, Django, Next.js, React, Pandas, NumPy, Jest, Flask, GraphQL, PostCSS, TailwindCSS
    // Tools & DevOps: Git, Datadog, Splunk, OpenTelemetry, Grafana, Prometheus, Loki, ArgoCD, GitLabCI, TravisCI
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
              That's me
            </p>
          </div>

          <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4 text-left">
            <h2 className="text-2xl mb-4">
              <RainbowText>Hello, I'm Jake</RainbowText>
            </h2>
            <div className="space-y-4 text-green-400">
              {aboutMeSection()}
            </div>
          </div>
        </div>


        {/* <div className="bg-[#000066] border-[3px] border-[#c0c0c0] border-ridge p-4 my-8">
          <h2 className="text-2xl mb-4">
            <RainbowText>🚀 Super Cool Skills 🚀</RainbowText>
          </h2>

          {skillsSectionArray.map((s) => {
            return <SkillSection key={s.id} skills={s.skills} title={s.title} />
          })}
        </div> */}

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
          0% { color: var(--theme-rainbow-1); }
          20% { color: var(--theme-rainbow-2); }
          40% { color: var(--theme-rainbow-3); }
          60% { color: var(--theme-rainbow-4); }
          80% { color: var(--theme-rainbow-5); }
          100% { color: var(--theme-rainbow-1); }
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

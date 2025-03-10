import React from 'react';

const About= () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">About EventX</h1>
        <p className="mt-2 text-lg text-gray-600">
          Transforming Event Management with AI, Blockchain & Web3 Integration
        </p>
      </header>

      {/* Our Mission */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          At EventX, we believe that hackathons and event hosting should be as innovative as the ideas they inspire. We are on a quest to revolutionize event management by eliminating traditional inefficiencies and introducing automation, transparency, and fairness through cutting-edge technology.
        </p>
        <p className="text-gray-700">
          Our platform harnesses the power of AI for smart team formation and unbiased resume screening, while blockchain-driven smart contracts ensure seamless and trustless prize distribution. Every participant’s achievement is immortalized through NFT-based certificates, creating a verifiable record of success.
        </p>
      </section>

      {/* Our Story */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
        <p className="text-gray-700 mb-4">
          Born from the frustration of managing disjointed, outdated event systems, EventX emerged as a bold solution to transform the hackathon experience. Our founders, passionate about technology and innovation, envisioned a unified platform where organizers could effortlessly set up events and participants could engage in a dynamic, interactive environment.
        </p>
        <p className="text-gray-700">
          Today, EventX stands at the forefront of event hosting, offering a streamlined experience that combines AI-driven insights with the security and transparency of blockchain technology. We are not just organizing events—we’re building a community where creativity thrives and every achievement is celebrated.
        </p>
      </section>

      {/* Key Features & Technology */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features & Technology</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <span className="font-semibold">Smart Team Formation:</span> AI-powered recommendations pair participants based on skills and interests for a winning team dynamic.
          </li>
          <li>
            <span className="font-semibold">Automated Prize Distribution:</span> Blockchain smart contracts handle rewards transparently and automatically.
          </li>
          <li>
            <span className="font-semibold">NFT-Based Certificates:</span> Immutable, on-chain credentials that verify every participant's achievements.
          </li>
          <li>
            <span className="font-semibold">AI-Powered Resume Screening:</span> Advanced NLP and ML algorithms ensure unbiased and efficient candidate ranking.
          </li>
          <li>
            <span className="font-semibold">Web3 Authentication:</span> One-click registration with secure and modern login methods.
          </li>
        </ul>
      </section>

      {/* Impact & Benefits */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Impact & Benefits</h2>
        <p className="text-gray-700 mb-4">
          EventX is more than a platform—it’s a catalyst for change in the world of hackathons and event management. By automating cumbersome processes and introducing verifiable technology, we empower organizers to host seamless events, enable participants to focus on innovation, and help businesses discover top talent effortlessly.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Streamlined event operations that save time and resources.</li>
          <li>Fair, transparent, and trustless prize distribution.</li>
          <li>Enhanced networking and team-building through smart technology.</li>
          <li>Verifiable credentials that build trust with recruiters and partners.</li>
        </ul>
        <p className="text-gray-700 mt-4">
          Join us on our journey to redefine event hosting, where every challenge is met with innovation and every success is etched on the blockchain.
        </p>
      </section>
    </div>
  );
};

export default About;
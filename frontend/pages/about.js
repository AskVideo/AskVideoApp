import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const About = () => {
  return (
    <div>
      <Head>
        <title>About - AskVideo</title>
      </Head>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold underline">About Us</h1>
        <p>This is the about page for AskVideo, an innovative platform where users can interact with video content by asking questions and getting relevant answers from specific segments of videos.</p>
        {/* Other about page content */}
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default About;

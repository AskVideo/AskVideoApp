import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const Features = () => {
  return (
    <div>
      <Head>
        <title>Features - AskVideo</title>
      </Head>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold underline">Features</h1>
        <p>Explore the unique features of AskVideo that make video content more interactive and informative, such as targeted video responses, easy navigation within videos, and a user-friendly interface.</p>
        {/* List of features or other content */}
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default Features;

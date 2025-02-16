import Head from 'next/head';
import ChatContainer from '../components/ChatContainer';

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Chat Assistant</title>
        <meta name="description" content="Chat with an AI assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatContainer />
    </>
  );
} 
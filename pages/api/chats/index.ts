import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Chat from '../../../models/Chat';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        console.log('Fetching chats for user:', session.user.id); // Debug log
        const chats = await Chat.find({ userId: session.user.id })
          .sort({ createdAt: -1 });
        console.log('Found chats:', chats); // Debug log
        res.status(200).json(chats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Error fetching chats' });
      }
      break;

    case 'POST':
      try {
        console.log('Creating chat for user:', session.user.id); // Debug log
        console.log('Chat data:', req.body); // Debug log
        const chat = await Chat.create({
          userId: session.user.id,
          title: req.body.title,
          messages: req.body.messages
        });
        console.log('Created chat:', chat); // Debug log
        res.status(201).json(chat);
      } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Error creating chat' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 
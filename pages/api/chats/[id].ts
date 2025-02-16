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

  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'PUT':
      try {
        const { messages } = req.body;
        
        // Log the incoming messages for debugging
        console.log('Updating chat with messages:', messages);
        
        // Use findById first to get the current chat
        const currentChat = await Chat.findById(id);
        
        if (!currentChat) {
          return res.status(404).json({ error: 'Chat not found' });
        }
        
        // Convert to string for comparison
        const chatUserId = currentChat.userId.toString();
        const sessionUserId = session.user.id.toString();
        
        // Verify user ownership
        if (chatUserId !== sessionUserId) {
          console.log('Auth mismatch:', { chatUserId, sessionUserId }); // Debug log
          return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update using findOneAndUpdate for atomic operation
        const updatedChat = await Chat.findOneAndUpdate(
          { 
            _id: id,
            userId: sessionUserId // Additional security
          },
          { 
            $set: { 
              messages: messages,
              updatedAt: new Date()
            }
          },
          { 
            new: true,
            runValidators: true 
          }
        );

        if (!updatedChat) {
          throw new Error('Failed to update chat messages');
        }

        res.status(200).json(updatedChat);
      } catch (error: any) {
        console.error('Error updating chat:', error);
        res.status(500).json({ 
          error: 'Error updating chat', 
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      break;

    case 'DELETE':
      try {
        const deletedChat = await Chat.findOneAndDelete({
          _id: id,
          userId: session.user.id
        });

        if (!deletedChat) {
          return res.status(404).json({ error: 'Chat not found' });
        }

        res.status(200).json({ message: 'Chat deleted successfully' });
      } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Error deleting chat' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 
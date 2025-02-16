import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Container,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import { useSession, signIn, signOut } from 'next-auth/react';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';
import { FiCopy, FiThumbsUp, FiThumbsDown, FiMoreHorizontal } from 'react-icons/fi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  complete?: boolean;
}

interface Chat {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function ChatContainer() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats when component mounts
  useEffect(() => {
    const loadChats = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch('/api/chats');
        if (!response.ok) throw new Error('Failed to fetch chats');
        const data = await response.json();
        setChats(data);
        
        // If there's a currentChatId, load its messages
        if (currentChatId) {
          const currentChat = data.find((chat: Chat) => chat._id === currentChatId);
          if (currentChat) {
            setMessages(currentChat.messages);
          }
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    loadChats();
  }, [session, currentChatId]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !session?.user?.id) return;

    const newUserMessage: Message = { role: 'user', content: message };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const assistantPlaceholder: Message = { 
        role: 'assistant', 
        content: '', 
        complete: false 
      };
      setMessages([...updatedMessages, assistantPlaceholder]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        content += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: content,
            complete: false,
          };
          return newMessages;
        });
      }

      const finalMessages: Message[] = [
        ...updatedMessages,
        { 
          role: 'assistant' as const,
          content, 
          complete: true 
        }
      ];

      if (currentChatId) {
        try {
          const response = await fetch(`/api/chats/${currentChatId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              ...(session?.user && { 'Authorization': `Bearer ${session.user.id}` })
            },
            body: JSON.stringify({
              messages: finalMessages,
              userId: session.user.id
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Update chat error:', errorData);
            
            if (response.status === 401 || response.status === 403) {
              throw new Error('You are not authorized to update this chat');
            }
            throw new Error(errorData.error || 'Failed to update chat');
          }

          const updatedChat = await response.json();
          setChats(prev => prev.map(chat => 
            chat._id === currentChatId ? updatedChat : chat
          ));
          setMessages(finalMessages);
        } catch (error: any) {
          console.error('Error updating chat:', error);
          throw error;
        }
      } else {
        // Create new chat
        try {
          const chatTitle = message.slice(0, 40) + (message.length > 40 ? '...' : '');
          const response = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: chatTitle,
              messages: finalMessages,
              userId: session.user.id
            }),
          });

          if (!response.ok) throw new Error('Failed to create chat');
          
          const newChat = await response.json();
          setChats(prev => [newChat, ...prev]);
          setCurrentChatId(newChat._id);
          setMessages(finalMessages);
        } catch (error) {
          console.error('Error creating chat:', error);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => {
        const withoutLastMessage = prev.slice(0, -1);
        return [...withoutLastMessage, { 
          role: 'assistant', 
          content: `Error: ${error.message || 'There was an error processing your request.'}`, 
          complete: true 
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function to handle scrolling
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add useEffect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show login prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <Box h="100vh" bg="#212121" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Heading
            as="h1"
            size="2xl"
            color="white"
            textAlign="center"
            fontWeight="semibold"
          >
            RaaVaan Junior (RJ)
          </Heading>
          <Text color="gray.400" fontSize="lg" textAlign="center">
            Please sign in to start chatting with RJ
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => signIn()}
          >
            Sign In
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box h="100vh" bg="#212121">
      {/* Header */}
      <Flex
        position="fixed"
        top={0}
        right={0}
        left={isSidebarOpen ? "260px" : "0"}
        height="40px"
        bg="#212121"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        transition="left 0.2s"
        zIndex={10}
      >
        <IconButton
          icon={<HiOutlineMenuAlt1 size="18px" />}
          aria-label="Toggle Sidebar"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
          color="gray.400"
          size="sm"
          _hover={{ bg: 'whiteAlpha.100' }}
        />
        <Menu>
          <MenuButton>
            <Avatar
              size="sm"
              name={session?.user?.name || "User"}
              bg="blue.500"
              color="white"
              cursor="pointer"
              h="28px"
              w="28px"
            />
          </MenuButton>
          <MenuList bg="#2D3748" borderColor="whiteAlpha.200">
            <MenuItem
              color="white"
              _hover={{ bg: 'whiteAlpha.100' }}
              fontSize="13px"
            >
              Profile
            </MenuItem>
            <MenuItem
              color="white"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={() => signOut()}
              fontSize="13px"
            >
              Sign Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <Box
        ml={isSidebarOpen ? "260px" : "0"}
        transition="margin-left 0.2s"
        h="100vh"
        display="flex"
        flexDirection="column"
        pt="40px"
      >
        <Box 
          flex="1" 
          overflowY="auto" 
          position="relative"
          sx={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'whiteAlpha.100',
              borderRadius: '4px',
            },
          }}
        >
          {messages.length === 0 ? (
            <Container maxW="3xl" pt={20} pb={20}>
              <VStack spacing={12}>
                <VStack spacing={4}>
                  <Heading
                    as="h1"
                    size="2xl"
                    color="white"
                    textAlign="center"
                    fontWeight="semibold"
                  >
                    RaaVaan Junior (RJ)
                  </Heading>
                  <Text color="gray.400" fontSize="lg" textAlign="center">
                    Your AI Assistant for Seamless Conversations
                  </Text>
                </VStack>
                <VStack spacing={3} w="full">
                  <Text color="gray.400" fontSize="sm">
                    Examples
                  </Text>
                  {[
                    "Explain quantum computing in simple terms",
                    "What are some creative uses of AI in education?",
                    "Write a Python function to find prime numbers"
                  ].map((example) => (
                    <Button
                      key={example}
                      onClick={() => handleSendMessage(example)}
                      variant="ghost"
                      w="full"
                      py={3}
                      px={4}
                      height="auto"
                      justifyContent="flex-start"
                      alignItems="center"
                      color="white"
                      bg="rgba(255,255,255,0.05)"
                      borderRadius="md"
                      _hover={{
                        bg: 'whiteAlpha.200',
                      }}
                      fontSize="13px"
                      fontWeight="normal"
                      whiteSpace="normal"
                      textAlign="left"
                      position="relative"
                      pl={4}
                      pr={8}
                    >
                      {example}
                      <Icon
                        as={FiMoreHorizontal}
                        position="absolute"
                        right={3}
                        color="gray.500"
                      />
                    </Button>
                  ))}
                </VStack>
              </VStack>
            </Container>
          ) : (
            <VStack spacing={0} align="stretch">
              {messages.map((message, index) => (
                <Box 
                  key={index} 
                  position="relative"
                >
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                    complete={message.complete}
                  />
                </Box>
              ))}
              {/* This div will be our scroll target */}
              <div ref={messagesEndRef} style={{ height: '20px' }} />
            </VStack>
          )}
        </Box>
        
        <Box
          position="relative"
          bg="#212121"
        >
          <Box p={4}>
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            <Text
              textAlign="center"
              color="gray.500"
              fontSize="xs"
              mt={3}
            >
              RaaVaan Junior can make mistakes. Consider checking important information.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 
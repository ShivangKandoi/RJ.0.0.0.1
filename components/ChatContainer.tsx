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
import { HiOutlineMenuAlt1, HiMenuAlt2, HiX } from 'react-icons/hi';
import { FiCopy, FiThumbsUp, FiThumbsDown, FiMoreHorizontal } from 'react-icons/fi';
import styles from '../styles/ChatContainer.module.css';

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
        body: JSON.stringify({ 
          message,
          systemPrompt: `You are Zemon AI, a highly capable AI assistant powered by Google's Gemini model. You have access to real-time web search through Serper API.

Follow these steps for every user query:

1. FIRST, carefully analyze if you NEED web search. Only search when:
   - You lack sufficient knowledge about the topic
   - The query requires very recent information
   - You need to verify specific facts or claims
   - The topic involves current events or rapidly changing information
   - You're unsure about your existing knowledge

2. If you decide to search:
   - Start with: "🔍 Let me search for accurate information about this..."
   - Analyze the search results thoroughly
   - Synthesize information from multiple sources
   - Format your findings as:

   "🔍 Research Summary:
   - Key Point 1
   - Key Point 2
   - Key Point 3
   
   Sources:
   [1] Title - URL
   [2] Title - URL"

3. Then provide your response:
   "🤖 Based on my research:
   [Your comprehensive response incorporating the research]"

4. If web search is NOT needed:
   - Respond directly using your existing knowledge
   - Be confident in your expertise
   - Explain concepts clearly and thoroughly

5. For all responses:
   - Use clear formatting and structure
   - Break down complex topics
   - Provide examples when helpful
   - Be precise and accurate

Remember: Only search when necessary. If you have sufficient knowledge, respond directly. Always synthesize and summarize search results rather than just listing them.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      
      while (true) {
        try {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          
          // Handle search message and regular content
          if (chunk.includes('{"error"')) {
            // If we get an error after the search message, keep the search message
            // but show a friendly error
            throw new Error("I apologize, but I encountered an error while searching. Let me try to answer based on my existing knowledge instead.");
          } else {
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
        } catch (streamError) {
          throw streamError;
        }
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
        let errorMessage = "I apologize, but I encountered an error. Let me try to help you without searching the web.";
        
        // If we already started searching, keep that part of the message
        if (prev[prev.length - 1]?.content.includes('🔍')) {
          errorMessage = prev[prev.length - 1].content.split('{"error"')[0] + 
            "\n\nI apologize, but I encountered an error while searching. Let me answer based on my existing knowledge:\n\n" +
            "Today's date is " + new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
        }
        
        return [...withoutLastMessage, { 
          role: 'assistant', 
          content: errorMessage,
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div className={styles.container}>
      {/* Overlay for mobile */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.active : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <button 
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <HiMenuAlt2 />
        </button>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
      </aside>

      {/* Main content */}
      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.withSidebar : ''}`}>
        {/* Header */}
        <Flex
          position="fixed"
          top={0}
          right={0}
          left={isSidebarOpen ? "260px" : "0"}
          height="60px"
          bg="#212121"
          alignItems="center"
          justifyContent="space-between"
          px={4}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          zIndex={10}
        >
          <Text
            fontSize="lg"
            fontWeight="600"
            color="white"
            letterSpacing="tight"
            className={styles.brandName}
          >
            Zemon AI
          </Text>

          <Menu>
            <MenuButton>
              <Avatar
                name={session?.user?.name || "User"}
                bg="blue.500"
                color="white"
                size="md"
                h="40px"
                w="40px"
                cursor="pointer"
              />
            </MenuButton>
            <MenuList bg="#2D3748" borderColor="whiteAlpha.200">
              <MenuItem
                color="white"
                _hover={{ bg: 'whiteAlpha.100' }}
                fontSize="14px"
              >
                Profile
              </MenuItem>
              <MenuItem
                color="white"
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() => signOut()}
                fontSize="14px"
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Box
          ml={isSidebarOpen ? "260px" : "0"}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          h="100vh"
          display="flex"
          flexDirection="column"
          pt="60px"
        >
          <Box 
            flex="1" 
            overflowY="auto" 
            position="relative"
            maxW="800px"
            w="100%"
            px={4}
            sx={{
              transform: isSidebarOpen ? 'translateX(-130px)' : 'translateX(0)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              margin: '0 auto',
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
              <Container maxW="800px" pt={20} pb={20} px={4}>
                <VStack spacing={12}>
                  <VStack spacing={4}>
                    <Heading
                      as="h1"
                      size="2xl"
                      color="white"
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Zemon AI
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
            maxW="800px"
            w="100%"
            sx={{
              transform: isSidebarOpen ? 'translateX(-130px)' : 'translateX(0)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              margin: '0 auto',
            }}
          >
            <Box p={4}>
              <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
              <Text
                textAlign="center"
                color="gray.500"
                fontSize="xs"
                mt={3}
              >
                Zemon AI can make mistakes. Consider checking important information.
              </Text>
            </Box>
          </Box>
        </Box>
      </main>
    </div>
  );
} 
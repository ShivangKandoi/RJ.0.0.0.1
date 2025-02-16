import { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { FiPlus, FiMessageSquare } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  complete?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  chats, 
  currentChatId,
  onNewChat,
  onSelectChat 
}: SidebarProps) {
  const today = new Date().toDateString();
  const groupedChats = chats.reduce((groups: { [key: string]: Chat[] }, chat) => {
    const chatDate = new Date(chat.createdAt).toDateString();
    const group = chatDate === today ? 'Today' : chatDate;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(chat);
    return groups;
  }, {});

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isOpen ? "260px" : "0"}
      bg="#171717"
      transition="width 0.2s"
      overflow="hidden"
      zIndex={20}
    >
      {/* Sidebar Header */}
      <Flex
        h="60px"
        alignItems="center"
        px={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Button
          key="new-chat-button"
          w="full"
          h="9"
          bg="whiteAlpha.50"
          color="white"
          leftIcon={<Icon as={FiPlus} boxSize="3.5" />}
          justifyContent="flex-start"
          _hover={{ bg: 'whiteAlpha.100' }}
          _active={{ bg: 'whiteAlpha.200' }}
          onClick={onNewChat}
          fontSize="sm"
          borderRadius="md"
          fontWeight="medium"
          border="1px solid"
          borderColor="whiteAlpha.100"
          backdropFilter="blur(8px)"
        >
          New chat
        </Button>
      </Flex>

      {/* Chat List */}
      <Box 
        h="calc(100vh - 120px)" 
        overflowY="auto"
        py={2}
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
        <VStack spacing="1" align="stretch" px="2">
          {Object.entries(groupedChats).map(([date, dateChats]) => (
            <Box key={date} mb={3}>
              <Text 
                color="gray.500" 
                fontSize="xs" 
                fontWeight="medium" 
                px="3" 
                py="1.5"
                letterSpacing="0.5px"
              >
                {date}
              </Text>
              <VStack spacing="1" align="stretch">
                {dateChats.map((chat) => (
                  <Button
                    key={chat._id}
                    variant="ghost"
                    justifyContent="flex-start"
                    py="2"
                    px="3"
                    color="gray.300"
                    bg={chat._id === currentChatId ? 'whiteAlpha.100' : 'transparent'}
                    _hover={{ bg: 'whiteAlpha.50' }}
                    leftIcon={<Icon as={FiMessageSquare} boxSize="3.5" color="gray.500" />}
                    fontSize="sm"
                    fontWeight="normal"
                    h="auto"
                    minH="9"
                    whiteSpace="normal"
                    textAlign="left"
                    onClick={() => onSelectChat(chat._id)}
                    w="full"
                    borderRadius="md"
                    transition="all 0.2s"
                  >
                    <Text noOfLines={1} fontSize="13px">
                      {chat.title}
                    </Text>
                  </Button>
                ))}
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Upgrade Plan */}
      <Box 
        position="absolute" 
        bottom="0" 
        left="0" 
        right="0"
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Button
          key="upgrade-plan-button"
          variant="ghost"
          w="full"
          justifyContent="flex-start"
          alignItems="center"
          color="gray.300"
          py="3"
          px="4"
          _hover={{ bg: 'whiteAlpha.50' }}
          h="auto"
          borderRadius="0"
        >
          <Icon as={RiRobot2Line} boxSize="4.5" mr="3" color="gray.400" />
          <Box>
            <Text fontSize="13px" fontWeight="medium">Upgrade plan</Text>
            <Text fontSize="xs" color="gray.500">
              More access to the best models
            </Text>
          </Box>
        </Button>
      </Box>
    </Box>
  );
} 
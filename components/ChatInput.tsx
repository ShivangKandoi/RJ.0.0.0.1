import { useState, KeyboardEvent } from 'react';
import {
  Box,
  Textarea,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box maxW="3xl" mx="auto" w="full" px={4}>
      <Flex
        position="relative"
        bg="#303030"
        borderRadius="xl"
        border="1px solid"
        borderColor="rgba(255,255,255,0.1)"
      >
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={disabled}
          rows={1}
          minH="40px"
          maxH="200px"
          py={3}
          px={4}
          pr={12}
          resize="none"
          bg="transparent"
          border="none"
          color="white"
          _placeholder={{ color: 'gray.500' }}
          _focus={{ boxShadow: 'none' }}
          _hover={{ borderColor: 'rgba(255,255,255,0.1)' }}
          fontSize="sm"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
            },
          }}
        />
        <IconButton
          icon={<FiSend />}
          position="absolute"
          right={2}
          bottom={2}
          size="sm"
          color="gray.400"
          isDisabled={disabled || !message.trim()}
          onClick={handleSubmit}
          aria-label="Send message"
          variant="ghost"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        />
      </Flex>
    </Box>
  );
} 
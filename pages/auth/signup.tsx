import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast({
        title: 'Account created.',
        description: "You've successfully signed up! Please sign in.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/auth/signin');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#212121" display="flex" alignItems="center" justifyContent="center">
      <Box w="full" maxW="md" p={8}>
        <VStack spacing={8}>
          <Heading color="white">Create your RJ Account</Heading>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.300">Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gray.300">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gray.300">Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'blue.300', boxShadow: 'none' }}
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
                mt={2}
              >
                Sign Up
              </Button>
            </VStack>
          </form>
          <Text color="gray.300">
            Already have an account?{' '}
            <Link as={NextLink} href="/auth/signin" color="blue.400">
              Sign in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
} 
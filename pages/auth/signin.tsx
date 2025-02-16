import { useState } from 'react';
import { signIn } from 'next-auth/react';
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

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      router.push('/');
    }

    setIsLoading(false);
  };

  return (
    <Box minH="100vh" bg="#212121" display="flex" alignItems="center" justifyContent="center">
      <Box w="full" maxW="md" p={8}>
        <VStack spacing={8}>
          <Heading color="white">Sign in to RaaVaan Junior</Heading>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="whiteAlpha.100"
                  color="white"
                  borderColor="whiteAlpha.300"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </VStack>
          </form>
          <Text color="gray.300">
            Don't have an account?{' '}
            <Link as={NextLink} href="/auth/signup" color="blue.400">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
} 
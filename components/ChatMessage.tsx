import { useEffect, useState, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Box, Flex, Icon, IconButton, Text, useToast } from '@chakra-ui/react';
import { FiUser, FiCopy, FiThumbsUp, FiThumbsDown, FiSearch, FiBook, FiExternalLink } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import type { Components } from 'react-markdown';
import styles from '../styles/ChatMessage.module.css';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  complete?: boolean;
}

interface CodeBlockProps {
  className?: string;
  children: string | string[];
}

// Add a type for the formatted content
type FormattedContent = string | JSX.Element;

// Update the getFaviconUrl helper function
function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return null;
  }
}

export default function ChatMessage({ role, content, complete }: ChatMessageProps) {
  const [formattedContent, setFormattedContent] = useState<FormattedContent>(content);
  const isUser = role === 'user';
  const toast = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (content.includes('🔍 Research Summary')) {
      const sections = content.split('\n\nSources:');
      const summary = sections[0];
      const sources = sections[1] || '';

      const formatted = (
        <Box className={styles.researchContainer}>
          {/* Summary Section */}
          <Box className={styles.summarySection}>
            <Flex align="center" className={styles.summaryHeader}>
              <Icon as={FiSearch} className={styles.searchIcon} />
              <Text fontWeight="bold" fontSize="lg">Research Summary</Text>
            </Flex>
            <Box className={styles.summaryContent}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={components}
              >
                {summary.replace('🔍 Research Summary:', '')}
              </ReactMarkdown>
            </Box>
          </Box>

          {/* Sources Section */}
          {sources && (
            <Box className={styles.sourcesSection}>
              <Text fontSize="sm" color="gray.400" mb={2}>Sources</Text>
              <Flex className={styles.sourcesList} wrap="wrap" gap={2}>
                {sources.split('\n').map((source, index) => {
                  if (!source.trim()) return null;
                  
                  // Extract URL from the source string
                  const urlMatch = source.match(/https?:\/\/[^\s]+/);
                  if (!urlMatch) return null;
                  
                  const url = urlMatch[0];
                  const faviconUrl = getFaviconUrl(url);
                  
                  try {
                    const domain = new URL(url).hostname.replace('www.', '');
                    
                    return (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceChip}
                      >
                        {faviconUrl && (
                          <img 
                            src={faviconUrl}
                            alt=""
                            className={styles.favicon}
                            onError={(e) => {
                              // Hide broken favicon
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className={styles.siteName}>{domain}</span>
                      </a>
                    );
                  } catch {
                    return null;
                  }
                })}
              </Flex>
            </Box>
          )}
        </Box>
      );
      setFormattedContent(formatted);
    } else if (content.includes('search attempt failed')) {
      const formatted = (
        <Box className={styles.errorContainer}>
          <Flex align="center" className={styles.errorHeader}>
            <Icon as={FiSearch} className={styles.searchIcon} />
            <Text>Search attempt failed</Text>
          </Flex>
          <Box className={styles.errorContent}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={components}
            >
              {content.split('🤖 Based on')[1] || content}
            </ReactMarkdown>
          </Box>
        </Box>
      );
      setFormattedContent(formatted);
    } else {
      const formatted = (
        <Box className={styles.messageContent}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </Box>
      );
      setFormattedContent(formatted);
    }
  }, [content]);

  const components: Components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        return (
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <span className={styles.language}>{language}</span>
              <button 
                onClick={() => handleCopy(String(children))}
                className={styles.copyButton}
              >
                <FiCopy size={14} />
              </button>
            </div>
            <SyntaxHighlighter
              style={atomDark}
              language={language}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    p: ({ children }) => (
      <Text 
        as="div" 
        mb={isUser ? 1 : 2}
        lineHeight="tall"
        textAlign="left"
        fontSize={isUser ? '16px' : '15px'}
        fontWeight="normal"
      >
        {children}
      </Text>
    )
  };

  return (
    <Box 
      w="100%" 
      bg={isUser ? 'transparent' : '#212121'}
      position="relative"
      py={isUser ? 2 : 4}
    >
      <Flex
        maxW="48rem"
        mx="auto"
        px={{ base: 4, md: 6 }}
        direction="column"
        position="relative"
      >
        <Flex 
          w="full" 
          flexDirection={isUser ? 'row-reverse' : 'row'}
          gap={4}
          alignItems="flex-start"
        >
          <Box 
            flex="1"
            display="flex"
            justifyContent={isUser ? 'flex-end' : 'flex-start'}
            position="relative"
          >
            <Box
              maxW={isUser ? "80%" : "100%"}
              minW={isUser ? "auto" : "0"}
              color="white"
              className="math-content"
              sx={{
                '.katex-display': {
                  margin: '1em 0',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: '0.5em 0',
                },
                '.katex': {
                  fontSize: '1.1em',
                },
                'span.katex-display': {
                  display: 'flex',
                  justifyContent: 'center',
                }
              }}
              {...(isUser && {
                bg: '#2C2C2C',
                borderRadius: '20px',
                px: 4,
                py: 2,
                boxShadow: 'sm',
                border: '1px solid',
                borderColor: 'whiteAlpha.100',
                fontSize: '16px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                display: 'inline-block'
              })}
            >
              {typeof formattedContent === 'string' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={components}
                >
                  {formattedContent}
                </ReactMarkdown>
              ) : (
                formattedContent
              )}
              {/* Only show cursor for assistant messages that are not complete */}
              {role === 'assistant' && !complete && (
                <Box
                  as="span"
                  display="inline-block"
                  w="2px"
                  h="16px"
                  bg="blue.400"
                  ml={1}
                  animation="blink 1s infinite"
                  sx={{
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0 }
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        </Flex>
        
        {/* Action buttons - only for AI responses */}
        {!isUser && complete && (
          <Flex 
            mt={3}
            gap={1.5}
            ml={{ base: "44px", md: "52px" }}
          >
            <IconButton
              icon={<FiCopy size="16px" />}
              aria-label="Copy"
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            />
            <IconButton
              icon={<FiThumbsUp size="16px" />}
              aria-label="Like"
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            />
            <IconButton
              icon={<FiThumbsDown size="16px" />}
              aria-label="Dislike"
              size="sm"
              variant="ghost"
              color="gray.500"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            />
          </Flex>
        )}
      </Flex>
    </Box>
  );
} 
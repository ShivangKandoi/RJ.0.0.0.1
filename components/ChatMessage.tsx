import { useEffect, useState, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Box, Flex, Icon, IconButton } from '@chakra-ui/react';
import { FiUser, FiCopy, FiThumbsUp, FiThumbsDown, FiSearch, FiBook } from 'react-icons/fi';
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
type FormattedContent = string | ReactNode;

export default function ChatMessage({ role, content, complete }: ChatMessageProps) {
  const [formattedContent, setFormattedContent] = useState<FormattedContent>(content);
  const isUser = role === 'user';

  useEffect(() => {
    // Format the content, handling web search results specially
    let formatted: FormattedContent = content;
    if (content.includes('🔍 Searching for')) {
      if (content.includes('Research Summary:')) {
        // Handle full search response with results
        const [summary, ...rest] = content.split('Sources:');
        const sources = rest.join('Sources:');

        formatted = (
          <>
            <div className={styles.researchSummary}>
              <div className={styles.summaryTitle}>
                <FiBook /> Research Summary
              </div>
              <ul className={styles.keyPoints}>
                {summary.split('\n')
                  .filter(line => line.trim().startsWith('-'))
                  .map((point, index) => (
                    <li key={index} className={styles.keyPoint}>
                      <span className={styles.bulletPoint}>•</span>
                      {point.replace('-', '').trim()}
                    </li>
                  ))}
              </ul>
              {sources && (
                <div className={styles.sources}>
                  <div className={styles.sourceTitle}>Sources:</div>
                  <div className={styles.sourceList}>
                    {sources.split('\n')
                      .filter(line => line.trim().length > 0)
                      .map((source, index) => {
                        if (source.includes('Link:')) {
                          const [title, url] = source.split('Link:');
                          return (
                            <div key={index} className={styles.sourceItem}>
                              <span className={styles.sourceNumber}>[{index + 1}]</span>
                              <a 
                                href={url?.trim()} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.sourceLink}
                              >
                                {title.trim()}
                              </a>
                            </div>
                          );
                        }
                        return null;
                      })}
                  </div>
                </div>
              )}
            </div>
            {content.includes('🤖 Based on') && (
              <div className={styles.aiResponse}>
                <div className={styles.aiResponseTitle}>
                  <RiRobot2Line /> AI Analysis
                </div>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={components}
                >
                  {content.split('🤖 Based on')[1]}
                </ReactMarkdown>
              </div>
            )}
          </>
        );
      } else if (content.includes('search attempt failed')) {
        // Handle failed search response
        formatted = (
          <>
            <div className={styles.searchProcess}>
              <FiSearch className={styles.searchIcon} />
              Search attempt failed
            </div>
            <div className={styles.aiResponse}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={components}
              >
                {content.split('🤖 Based on')[1] || content}
              </ReactMarkdown>
            </div>
          </>
        );
      } else {
        // Handle initial search message
        formatted = (
          <div className={styles.searchProcess}>
            <FiSearch className={styles.searchIcon} />
            Searching for up-to-date information...
          </div>
        );
      }
    } else {
      // Handle regular responses
      formatted = (
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      );
    }
    
    setFormattedContent(formatted);
  }, [content]);

  const components: Components = {
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      
      return !isInline ? (
        <Box my={3} borderRadius="md" overflow="hidden">
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={match ? match[1] : ''}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '4px',
              background: '#1e1e1e',
              fontSize: '14px',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <Box
          as="code"
          bg="#1e1e1e"
          px={1}
          borderRadius="sm"
          fontSize="14px"
          {...props}
        >
          {children}
        </Box>
      );
    },
    p: ({ children }) => (
      <Box 
        as="p" 
        mb={isUser ? 1 : 2}
        lineHeight="tall"
        textAlign="left"
        fontSize={isUser ? '16px' : '15px'}
        fontWeight="normal"
      >
        {children}
      </Box>
    )
  };

  return (
    <Box w="100%" bg={isUser ? 'transparent' : '#212121'}>
      <Flex
        py={4}
        px={0}
        minH="40px"
        maxW="48rem"
        mx="auto"
        direction="column"
      >
        <Flex 
          w="full" 
          px={6}
          flexDirection={isUser ? 'row-reverse' : 'row'}
          gap={4}
          alignItems="flex-start"
        >
          {/* Only show icon for AI responses */}
          {!isUser && (
            <Box flexShrink={0}>
              <Flex
                w="28px"
                h="28px"
                bg="purple.500"
                borderRadius="sm"
                alignItems="center"
                justifyContent="center"
              >
                <Icon
                  as={RiRobot2Line}
                  color="white"
                  boxSize="16px"
                />
              </Flex>
            </Box>
          )}
          <Box 
            flex="1"
            pl={isUser ? 0 : 0}
            pr={isUser ? 0 : 8}
            display="flex"
            justifyContent={isUser ? 'flex-end' : 'flex-start'}
          >
            <Box
              maxW={isUser ? "75%" : "90%"}
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
                px: 5,
                py: 2.5,
                boxShadow: 'sm',
                border: '1px solid',
                borderColor: 'whiteAlpha.100',
                fontSize: '16px',
                lineHeight: 'tall',
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
            mt={2} 
            gap={1.5}
            ml="52px"
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
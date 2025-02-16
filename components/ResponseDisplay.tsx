import { SearchResponse } from '../types';
import styles from '../styles/ResponseDisplay.module.css';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ResponseDisplayProps {
  response: SearchResponse;
}

const ResponseDisplay = ({ response }: ResponseDisplayProps) => {
  const [formattedResponse, setFormattedResponse] = useState<string>('');

  useEffect(() => {
    if (response.aiResponse) {
      // Clean up the AI response for better formatting
      setFormattedResponse(response.aiResponse.replace(/```(\w+)?\n/g, '```$1\n'));
    }
  }, [response.aiResponse]);

  return (
    <div className={styles.responseContainer}>
      {response.type === 'text' && (
        <div className={styles.textResponse}>
          {formattedResponse && (
            <div className={styles.aiResponse}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {formattedResponse}
              </ReactMarkdown>
            </div>
          )}
          {response.webResults && response.webResults.length > 0 && (
            <>
              <h3 className={styles.webResultsTitle}>Web Search Results</h3>
              <div className={styles.webResults}>
                {response.webResults.map((result, index) => (
                  <div key={index} className={styles.webResult}>
                    <h3><a href={result.link} target="_blank" rel="noopener noreferrer">{result.title}</a></h3>
                    <p>{result.snippet}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {response.type === 'code' && (
        <div className={styles.codeResponse}>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language="javascript"
            className={styles.codeBlock}
          >
            {response.codeSnippet || ''}
          </SyntaxHighlighter>
        </div>
      )}

      {response.type === 'math' && response.mathSolution && (
        <div className={styles.mathSolution}>
          <h3>Problem:</h3>
          <p className={styles.problem}>{response.mathSolution.problem}</p>
          <h3>Solution Steps:</h3>
          <div className={styles.steps}>
            {response.mathSolution.steps.map((step, index) => (
              <div key={index} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}.</span>
                <span className={styles.stepContent}>{step}</span>
              </div>
            ))}
          </div>
          <h3>Final Solution:</h3>
          <p className={styles.finalSolution}>{response.mathSolution.solution}</p>
        </div>
      )}

      {response.type === 'image' && response.images && (
        <div className={styles.imageResponse}>
          <h3>Image Results:</h3>
          <div className={styles.imageGrid}>
            {response.images.map((image, index) => (
              <div key={index} className={styles.imageWrapper}>
                <img src={image} alt={`Search result ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay; 
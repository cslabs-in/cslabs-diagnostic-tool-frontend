import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

SyntaxHighlighter.registerLanguage("c", c);

/**
 * CodeBlock -- required per frontend-v1-decisions.md §7.3: most Grammar/
 * Data Representation questions include C source snippets, rendered as a
 * distinct monospace block WITH line numbers, separate from the question
 * stem text. Uses PrismLight (not the full Prism bundle) to keep bundle
 * size down -- only the "c" language is registered, since that's all v1
 * needs.
 */
export interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <SyntaxHighlighter
        language="c"
        style={oneLight}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          background: "#fafafa",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
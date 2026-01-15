import React from 'react';
import type { HighlightSegment } from '../../types/search.types';

/**
 * HighlightedText Component
 * Task 4.1: Create HighlightedText Component
 *
 * Renders text with highlighted segments for fuzzy search matches.
 * Uses Naples Yellow theme for highlighting.
 *
 * @module components/common/HighlightedText
 */

interface HighlightedTextProps {
  /** Array of text segments with match indicators */
  segments: HighlightSegment[];
  /** Custom class for highlighted text */
  highlightClassName?: string;
  /** Custom class for non-highlighted text */
  textClassName?: string;
  /** Whether to apply line-clamp */
  lineClamp?: 1 | 2 | 3;
}

/**
 * Default highlight styling using Naples Yellow theme
 */
const defaultHighlightClass =
  'bg-gradient-to-b from-naples/20 to-naples/30 px-0.5 rounded font-medium text-charcoal';

/**
 * Renders text with highlighted segments
 *
 * @example
 * ```tsx
 * <HighlightedText
 *   segments={[
 *     { text: 'Cheese', isMatch: true },
 *     { text: ' Burger', isMatch: false }
 *   ]}
 * />
 * ```
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  segments,
  highlightClassName = defaultHighlightClass,
  textClassName = '',
  lineClamp,
}) => {
  // Handle empty segments
  if (!segments || segments.length === 0) {
    return null;
  }

  // If only one segment with no match, render as plain text
  if (segments.length === 1 && !segments[0].isMatch) {
    const clampClass = lineClamp ? `line-clamp-${lineClamp}` : '';
    return <span className={`${textClassName} ${clampClass}`.trim()}>{segments[0].text}</span>;
  }

  const clampClass = lineClamp ? `line-clamp-${lineClamp}` : '';

  return (
    <span className={clampClass || undefined}>
      {segments.map((segment, index) => (
        <span
          key={`${index}-${segment.text.slice(0, 10)}`}
          className={segment.isMatch ? highlightClassName : textClassName}
        >
          {segment.text}
        </span>
      ))}
    </span>
  );
};

/**
 * Render plain text with optional line clamp (used when no highlights)
 */
export const PlainText: React.FC<{
  text: string | null | undefined;
  className?: string;
  lineClamp?: 1 | 2 | 3;
}> = ({ text, className = '', lineClamp }) => {
  if (!text) return null;

  const clampClass = lineClamp ? `line-clamp-${lineClamp}` : '';
  return <span className={`${className} ${clampClass}`.trim()}>{text}</span>;
};

/**
 * Smart text renderer that uses highlights if available, otherwise plain text
 */
export const SmartText: React.FC<{
  text: string | null | undefined;
  segments?: HighlightSegment[];
  className?: string;
  highlightClassName?: string;
  lineClamp?: 1 | 2 | 3;
}> = ({ text, segments, className, highlightClassName, lineClamp }) => {
  // Use highlighted version if segments are provided and have matches
  if (segments && segments.some((s) => s.isMatch)) {
    return (
      <HighlightedText
        segments={segments}
        textClassName={className}
        highlightClassName={highlightClassName}
        lineClamp={lineClamp}
      />
    );
  }

  // Fall back to plain text
  return <PlainText text={text} className={className} lineClamp={lineClamp} />;
};

export default HighlightedText;

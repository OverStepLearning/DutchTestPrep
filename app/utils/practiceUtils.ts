/**
 * Helper function to safely display content that might be a string, array, or undefined
 */
export const displayContent = (content: string | string[] | undefined): string => {
  if (!content) {
    return '';
  }
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.join('\n');
  }
  return '';
}; 
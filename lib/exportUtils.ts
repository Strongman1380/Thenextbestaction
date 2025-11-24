// A simple function to generate a filename based on the current date
const generateFilename = (extension: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `CasePlan-${year}-${month}-${day}.${extension}`;
};

/**
 * Exports markdown content as a plain text file
 * @param markdownContent The markdown content of the case plan.
 * @param title The title to be included at the top of the document.
 */
export const exportPlanToText = (markdownContent: string, title: string = 'AI-Generated Case Plan') => {
  try {
    const fullContent = `${title}\n${'='.repeat(title.length)}\n\n${markdownContent}`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generateFilename('txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to text:', error);
    alert('Could not export the plan. Please try again.');
  }
};

/**
 * Legacy function name for backward compatibility
 */
export const exportPlanToDocx = exportPlanToText;

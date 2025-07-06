// Simple useOverlay hook implementation
export const useOverlay = () => {
  const openOverlay = (content: React.ReactNode) => {
    // Simple implementation - you can enhance this later
    console.log('Opening overlay:', content);
  };
  
  return { openOverlay };
};

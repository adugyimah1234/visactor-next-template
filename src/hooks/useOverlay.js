// Simple useOverlay hook implementation
export const useOverlay = () => {
    const openOverlay = (content) => {
        // Simple implementation - you can enhance this later
        console.log('Opening overlay:', content);
    };
    return { openOverlay };
};

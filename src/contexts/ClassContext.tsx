import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass,
  createSection,
  updateSection,
  deleteSection
} from '@/services/class';
import { 
  Class, 
  Section, 
  CreateClassDTO, 
  UpdateClassDTO, 
  CreateSectionDTO, 
  UpdateSectionDTO,
  ClassFilters
} from '@/types/class';

interface ClassContextProps {
  // State
  classes: Class[];
  currentClass: Class | null;
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  // Actions for classes
  fetchClasses: (filters?: ClassFilters) => Promise<void>;
  fetchClassById: (id: string) => Promise<void>;
  addClass: (data: CreateClassDTO) => Promise<string | null>;
  editClass: (id: string, data: UpdateClassDTO) => Promise<boolean>;
  removeClass: (id: string) => Promise<boolean>;
  // Actions for sections
  addSection: (classId: string, data: CreateSectionDTO) => Promise<string | null>;
  editSection: (classId: string, sectionId: string, data: UpdateSectionDTO) => Promise<boolean>;
  removeSection: (classId: string, sectionId: string) => Promise<boolean>;
  // Helper methods
  refreshClassList: () => Promise<void>;
  refreshClassDetails: (id: string) => Promise<void>;
  clearCurrentClass: () => void;
  // Filtering
  currentAcademicYearId: string | null;
  setCurrentAcademicYearId: (id: string | null) => void;
}

const ClassContext = createContext<ClassContextProps | undefined>(undefined);

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string | null>(null);

  // Fetch all classes with optional filtering
  const fetchClasses = useCallback(async (filters?: ClassFilters) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fetchedClasses = await getClasses(filters?.academic_year_id || currentAcademicYearId || undefined);
      setClasses(fetchedClasses);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentAcademicYearId]);

  // Fetch a specific class by its ID
  const fetchClassById = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fetchedClass = await getClassById(id);
      setCurrentClass(fetchedClass);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch class details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add a new class
  const addClass = useCallback(async (data: CreateClassDTO): Promise<string | null> => {
    if (!user) return null;
    
    setIsSubmitting(true);
    try {
      const response = await createClass(data);
      
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      
      // Refresh the class list
      await fetchClasses();
      
      return response.id;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create class",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, fetchClasses]);

  // Edit an existing class
  const editClass = useCallback(async (id: string, data: UpdateClassDTO): Promise<boolean> => {
    if (!user) return false;
    
    setIsSubmitting(true);
    try {
      await updateClass(id, data);
      
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      
      // Update the class in the local state
      setClasses(prev => prev.map(c => 
        c.id === id ? { ...c, ...data } : c
      ));
      
      // If this is the currently viewed class, update it
      if (currentClass && currentClass.id === id) {
        setCurrentClass(prev => prev ? { ...prev, ...data } : null);
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update class",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentClass]);

  // Delete a class
  const removeClass = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsSubmitting(true);
    try {
      await deleteClass(id);
      
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      // Remove the class from the local state
      setClasses(prev => prev.filter(c => c.id !== id));
      
      // If this is the currently viewed class, clear it
      if (currentClass && currentClass.id === id) {
        setCurrentClass(null);
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete class",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentClass]);

  // Add a new section to a class
  const addSection = useCallback(async (classId: string, data: CreateSectionDTO): Promise<string | null> => {
    if (!user) return null;
    
    setIsSubmitting(true);
    try {
      const response = await createSection(classId, data);
      
      toast({
        title: "Success",
        description: "Section created successfully",
      });
      
      // If this is the currently viewed class, refresh it to get the new section
      if (currentClass && currentClass.id === classId) {
        await fetchClassById(classId);
      }
      
      return response.id;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create section",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentClass, fetchClassById]);

  // Edit an existing section
  const editSection = useCallback(async (classId: string, sectionId: string, data: UpdateSectionDTO): Promise<boolean> => {
    if (!user) return false;
    
    setIsSubmitting(true);
    try {
      await updateSection(classId, sectionId, data);
      
      toast({
        title: "Success",
        description: "Section updated successfully",
      });
      
      // If this is the currently viewed class, update its section
      if (currentClass && currentClass.id === classId && currentClass.sections) {
        setCurrentClass(prev => {
          if (!prev || !prev.sections) return prev;
          
          const updatedSections = prev.sections.map(section => 
            section.id === sectionId ? { ...section, ...data } : section
          );
          
          return { ...prev, sections: updatedSections };
        });
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update section",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentClass]);

  // Delete a section
  const removeSection = useCallback(async (classId: string, sectionId: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsSubmitting(true);
    try {
      await deleteSection(classId, sectionId);
      
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
      
      // If this is the currently viewed class, remove the section from it
      if (currentClass && currentClass.id === classId && currentClass.sections) {
        setCurrentClass(prev => {
          if (!prev || !prev.sections) return prev;
          
          const updatedSections = prev.sections.filter(section => section.id !== sectionId);
          
          return { ...prev, sections: updatedSections };
        });
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete section",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, currentClass]);

  // Helper to refresh the class list
  const refreshClassList = useCallback(async () => {
    await fetchClasses();
  }, [fetchClasses]);

  // Helper to refresh the current class details
  const refreshClassDetails = useCallback(async (id: string) => {
    await fetchClassById(id);
  }, [fetchClassById]);

  // Clear the current class selection
  const clearCurrentClass = useCallback(() => {
    setCurrentClass(null);
  }, []);

  // Load classes when the context is first used or when the academic year changes
  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user, currentAcademicYearId, fetchClasses]);

  const value = {
    classes,
    currentClass,
    isLoading,
    isSubmitting,
    fetchClasses,
    fetchClassById,
    addClass,
    editClass,
    removeClass,
    addSection,
    editSection,
    removeSection,
    refreshClassList,
    refreshClassDetails,
    clearCurrentClass,
    currentAcademicYearId,
    setCurrentAcademicYearId,
  };

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

export const useClasses = (): ClassContextProps => {
  const context = useContext(ClassContext);
  
  if (context === undefined) {
    throw new Error("useClasses must be used within a ClassProvider");
  }
  
  return context;
};


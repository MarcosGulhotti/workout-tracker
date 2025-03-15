import { CreateWorkoutContext } from "@/context/CreateWorkoutContext";
import { useContext } from "react";

/**
 * Custom hook to access the CreateWorkoutContext.
 *
 * This hook provides the context value for the CreateWorkoutContext.
 * It must be used within a CreateWorkoutProvider, otherwise it will throw an error.
 *
 * @throws {Error} If the hook is used outside of a CreateWorkoutProvider.
 * @returns The context value of CreateWorkoutContext.
 */
export const useCreateWorkoutContext = () => {
  const context = useContext(CreateWorkoutContext);
  if (!context) {
    throw new Error(
      "useCreateWorkoutContext must be used within a CreateWorkoutProvider",
    );
  }
  return context;
};

import { useEffect, useState } from "react";
import { TextInput } from "react-native";

type InputProps = {
    getValue?: () => Promise<string>;
} & React.ComponentPropsWithoutRef<typeof TextInput>;

/**
 * A functional component that renders a text input field.
 * 
 * @param {InputProps} args - The properties passed to the input component.
 * 
 * @returns {JSX.Element} A TextInput component with the computed value and other passed properties.
 */
export function Input(args: InputProps) {
    const { getValue, value } = args;

    const [inputValue, setInputValue] = useState<string | undefined>(value);

  // Fetch the value from the promise when the component mounts
  useEffect(() => {
    const getCustomValue = async () => {
      try {
        if (!getValue) {
            throw new Error("No getValue function provided");
        }
        const customValue = await getValue();
        setInputValue(customValue); // Set the resolved value to the state
      } catch (error) {
        console.error("Error fetching value:", error);
      }
    };

    getCustomValue();
  }, []); // Empty dependency array ensures this runs once when the component mounts


    return <TextInput value={inputValue} {...args} />;
}
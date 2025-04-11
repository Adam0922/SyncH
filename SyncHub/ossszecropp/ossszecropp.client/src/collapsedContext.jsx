import { createContext, useContext, useState, useEffect } from "react";

const CollapsedContext = createContext();

export const CollapsedProvider = ({ children }) => {
  const storedValue = localStorage.getItem('menuState');
  const [collapsed, setCollapsed] = useState(
    storedValue ? JSON.parse(storedValue) : false
  );

  useEffect(() => {
    localStorage.setItem('menuState', JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <CollapsedContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </CollapsedContext.Provider>
  );
};

export const useCollapsed = () => useContext(CollapsedContext);

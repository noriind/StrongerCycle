import { createContext, useState, useContext } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}

export { UserProvider, useUser };

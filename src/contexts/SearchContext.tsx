import React, { createContext, useState } from "react";

type SearchContextType = {
  searchval: string | number | boolean | null;
  setSearchVal: React.Dispatch<React.SetStateAction<string>>;
};

type SearchProviderProp = {
  children: React.ReactNode;
};

export const SearchContext = createContext<SearchContextType>(null!);

const SearchProvider = ({ children }: SearchProviderProp) => {
  const [searchval, setSearchVal] = useState("");
  return (
    <SearchContext.Provider value={{ searchval, setSearchVal }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;

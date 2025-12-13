import { createContext, useContext, useState, ReactNode } from "react";

interface SideNavContextType {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const SideNavContext = createContext<SideNavContextType | undefined>(undefined);

export const SideNavProvider = ({ children }: { children: ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <SideNavContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </SideNavContext.Provider>
    );
};

export const useSideNav = () => {
    const context = useContext(SideNavContext);
    if (context === undefined) {
        throw new Error("useSideNav must be used within a SideNavProvider");
    }
    return context;
};

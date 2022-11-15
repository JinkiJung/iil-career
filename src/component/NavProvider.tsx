import { createContext, useState } from 'react';

interface ActiveNavLink {
    activeNavLinkId: string,
    setActiveNavLinkId: (value: string) => void;
}

export const NavContext = createContext<ActiveNavLink>({} as ActiveNavLink);

export const NavProvider = ({ children }: any) => {
	const [activeNavLinkId, setActiveNavLinkId] = useState('');

	return (
		<NavContext.Provider value={{
            activeNavLinkId,
            setActiveNavLinkId
        }}>{children}</NavContext.Provider>
	);
};
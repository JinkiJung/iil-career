import {useState} from 'react'

const navLinks = [
  {navLinkId: 'Top', scrollToId: 'homeContainer'},
]

export interface NavLinkProp{
    navLinkId: string;
    scrollToId: string;
    activeNavLinkId: string;
    setActiveNavLinkId: (navLinkId: string) => void;
}

export const NavLink = ({ navLinkId, scrollToId, activeNavLinkId, setActiveNavLinkId }: NavLinkProp) => {
	const handleClick = () => {
		setActiveNavLinkId(navLinkId);
		document.getElementById(scrollToId)!.scrollIntoView({
			behavior: 'smooth', // gives an ease-in-out effect to our scroll
		});
	};
	
	return (
		<span 
		 	id={navLinkId} 
			className={activeNavLinkId === navLinkId ? 'activeClass' : ''} 
		 	onClick={handleClick}
		>
			{navLinkId}
		</span>
	);
};

export const Nav = () => {
	const [activeNavLinkId, setActiveNavLinkId] = useState('');

	return (
	    <nav>
	      {navLinks.map(
		({navLinkId, scrollToId}) =>
		  <NavLink 
			key={navLinkId}
			navLinkId={navLinkId} 
			scrollToId={scrollToId} 
			activeNavLinkId={activeNavLinkId}
			setActiveNavLinkId={setActiveNavLinkId} 
		  />
	      )}
	    </nav>
	  )
};
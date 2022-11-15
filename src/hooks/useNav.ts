import { useRef, useContext, useEffect } from 'react';
import { NavContext } from '../component/NavProvider';
import { useOnScreen } from './useScreen';

export const useNav = (navLinkId: any) => {
	const ref = useRef(null);

	const { setActiveNavLinkId } = useContext(NavContext);

	const isOnScreen = useOnScreen(ref);

	useEffect(() => {
		if (isOnScreen) {
			setActiveNavLinkId(navLinkId);
		}
	}, [isOnScreen, setActiveNavLinkId, navLinkId]);

	return ref;
};
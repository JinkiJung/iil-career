import { useNavigate } from 'react-router-dom';
import './LangSwitch.scss';

interface LangSwitchProps {
    current: string;
}

export const LangSwitch = ({ current }: LangSwitchProps) => {
    const navigate = useNavigate();

    const switchTo = (locale: string) => {
        if (locale !== current) {
            navigate(`/${locale}`);
        }
    };

    return (
        <div className="lang-switch">
            <button
                className={`lang-switch-btn ${current === 'en' ? 'lang-switch-btn--active' : ''}`}
                onClick={() => switchTo('en')}
            >
                EN
            </button>
            <button
                className={`lang-switch-btn ${current === 'ko' ? 'lang-switch-btn--active' : ''}`}
                onClick={() => switchTo('ko')}
            >
                KO
            </button>
        </div>
    );
};

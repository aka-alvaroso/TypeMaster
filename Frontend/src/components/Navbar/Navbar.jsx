import PropTypes from 'prop-types';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Settings2, Volume2, VolumeX, ChevronDown, User, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Navbar = ({ sound, setSound }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubMenuOpened, setIsSubMenuOpened] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    imageURL: 'https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.webp',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (sessionStorage.getItem('loggedIn') === 'true') {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/user/data`,
            { headers: { username: JSON.parse(sessionStorage.getItem('userData')).username } }
          );
          if (response.status === 200) setUserData(response.data.user);
        }
      } catch (e) {
        console.error('Error al obtener el usuario:', e);
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="w-4/5 flex items-center py-8 px-4">
      <div className="flex items-center gap-4">
        <Link className="flex items-center gap-3" to="/">
          <svg viewBox="529 728 789 848" className="w-9 h-auto fill-kp-accent" aria-label="logo">
            <g transform="translate(0,2304) scale(0.1,-0.1)">
              <path d="M9040 15559 c-174 -20 -373 -75 -502 -140 -88 -44 -422 -233 -743 -420 -148 -86 -391 -226 -540 -310 -316 -178 -857 -491 -965 -557 -187 -114 -388 -305 -503 -478 -123 -186 -225 -431 -269 -647 l-23 -112 0 -1360 c0 -1274 1 -1367 18 -1469 46 -272 156 -528 324 -752 73 -98 261 -276 369 -350 85 -59 498 -303 954 -564 118 -67 292 -167 385 -220 914 -526 938 -539 1050 -586 266 -109 573 -148 872 -110 268 34 411 89 763 292 135 77 380 218 545 313 165 95 372 215 460 266 88 51 338 195 555 320 446 258 482 280 599 379 268 226 484 594 556 951 34 167 36 288 32 1605 -3 1195 -5 1311 -21 1379 -50 214 -129 427 -206 557 -109 185 -317 418 -470 525 -61 44 -451 271 -1055 617 -471 270 -926 533 -1037 599 -213 127 -414 211 -593 247 -176 35 -383 44 -555 25z m2837 -1813 c164 -44 323 -162 417 -309 49 -77 92 -189 112 -293 22 -120 15 -326 -15 -441 -43 -167 -66 -215 -409 -885 -113 -221 -142 -307 -142 -429 0 -104 19 -169 73 -251 39 -58 170 -191 283 -286 120 -102 214 -247 266 -412 20 -66 23 -93 22 -225 -1 -127 -5 -165 -28 -250 -92 -352 -391 -687 -713 -800 -244 -85 -487 -37 -688 136 -166 142 -198 167 -245 193 -66 36 -145 44 -204 22 -124 -47 -191 -188 -246 -516 -44 -262 -101 -420 -215 -590 -83 -126 -222 -267 -335 -342 -99 -66 -148 -88 -274 -125 -79 -24 -108 -28 -221 -27 -148 0 -219 15 -330 69 -183 89 -311 252 -395 502 -59 177 -60 209 -60 1738 0 1470 2 1537 49 1731 90 370 375 677 731 788 63 20 115 28 200 33 221 10 353 -40 556 -212 117 -99 221 -142 314 -129 141 19 222 128 340 454 102 284 202 460 335 595 185 188 438 292 680 280 50 -3 113 -11 142 -19z"/>
            </g>
          </svg>
          <span className="text-xl font-medium text-kp-text tracking-tight">KeyPro</span>
        </Link>

        <button
          className="text-kp-muted hover:text-kp-accent transition-colors"
          onClick={() => navigate('/rankings')}
        >
          <Crown size={16} />
        </button>

        <button
          className="text-kp-muted hover:text-kp-accent transition-colors"
          onClick={() => navigate('/settings')}
        >
          <Settings2 size={16} />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <LanguageSwitcher />

        <button
          onClick={() => setSound(!sound)}
          className="text-kp-muted hover:text-kp-accent transition-colors"
        >
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {sessionStorage.getItem('loggedIn') === 'true' ? (
          <div className="relative">
            <button
              onClick={() => setIsSubMenuOpened(!isSubMenuOpened)}
              className="flex items-center gap-2 bg-kp-surface border border-kp-border px-3 py-2 text-sm font-medium text-kp-text hover:border-kp-accent hover:text-kp-accent transition-colors"
            >
              <img src={userData.imageURL} className="w-6 h-6 rounded-full object-cover" alt="profile" />
              <span>{JSON.parse(sessionStorage.getItem('userData')).username}</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${isSubMenuOpened ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>

            {isSubMenuOpened && (
              <div className="absolute top-full right-0 mt-2 bg-kp-bg border border-kp-border shadow-lg p-2 min-w-40 z-50">
                <Link
                  to={`/profile/${JSON.parse(sessionStorage.getItem('userData')).username}`}
                  onClick={() => setIsSubMenuOpened(false)}
                >
                  <p className="flex items-center gap-2 py-2 px-3 text-sm text-kp-text hover:bg-kp-surface transition-colors">
                    <User size={14} /> {t('nav.myProfile')}
                  </p>
                </Link>
                <p
                  onClick={() => {
                    sessionStorage.setItem('loggedIn', 'false');
                    sessionStorage.removeItem('userData');
                    sessionStorage.removeItem('token');
                    setIsSubMenuOpened(false);
                    navigate('/');
                  }}
                  className="flex items-center gap-2 py-2 px-3 text-sm text-kp-text hover:bg-kp-surface transition-colors cursor-pointer"
                >
                  <LogIn size={14} /> {t('nav.logout')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth">
            <button className="flex items-center gap-2 bg-kp-accent text-white px-4 py-2 text-sm font-medium hover:brightness-105 transition-all">
              <LogIn size={14} /> {t('nav.login')}
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  sound: PropTypes.bool,
  setSound: PropTypes.func,
};

export default Navbar;

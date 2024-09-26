// src/components/Navbar.jsx

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKeyboard } from '@fortawesome/free-regular-svg-icons'
import { faCrown } from '@fortawesome/free-solid-svg-icons'
import { faBrush } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { faVolumeXmark } from '@fortawesome/free-solid-svg-icons'

const Navbar = ({ active = 'home', sound = true, loggedIn = false }) => {
  return (
    <nav className="w-full max-w-screen-2xl h-1/6  p-4 flex items-start justify-between">
      <div className="flex items-center">
        <img src="logo.png" className="w-14" /> <h2 className="font-bold text-3xl mx-4">TypeMaster</h2>

        <Link to="/" className={`${active === 'home' ? 'active' : ''} text-xl m-2 transition hover:text-orange-600`}><FontAwesomeIcon icon={faKeyboard} /></Link>
        <Link to="/rankings" className={`${active === 'rankigns' ? 'active' : ''} text-xl m-2 transition hover:text-orange-600`}><FontAwesomeIcon icon={faCrown} /></Link>
        <button className={`${active === 'themes' ? 'active' : ''} text-xl m-2 transition hover:text-orange-600`}><FontAwesomeIcon icon={faBrush} /></button>
        <button className={`${active === 'settings' ? 'active' : ''} text-xl m-2 transition hover:text-orange-600`}><FontAwesomeIcon icon={faGear} /></button>
      </div>
      <div className="flex items-center">
        <button className='text-sm m-1 hover:text-orange-600'>{sound ? <FontAwesomeIcon icon={faVolumeHigh} /> : <FontAwesomeIcon icon={faVolumeXmark} />}</button>

        {!loggedIn ?
          <>
            <button className='text-md mx-1 p-2 rounded-lg transition hover:text-orange-600'>Iniciar Sesión</button>
            <button className='text-md mx-1 p-2 rounded-lg transition hover:text-orange-600'>Registrarme</button>
          </>
          :
          <button className='text-md mx-1 p-2 rounded-lg transition hover:text-orange-600'>Mi Perfil</button>
        }
      </div>
    </nav>
  )
}

export default Navbar;

Navbar.propTypes = {
  active: PropTypes.string,
  sound: PropTypes.bool,
  loggedIn: PropTypes.bool,
}
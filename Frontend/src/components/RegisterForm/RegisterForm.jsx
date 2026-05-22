import axios from '../../axiosConfig';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, { username, email, password });
      if (response.data) {
        sessionStorage.setItem('loggedIn', true);
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify({
          username: response.data.user.username,
          email: response.data.user.email,
          stats: response.data.user.stats,
        }));
        navigate('/');
      }
    } catch (err) {
      setError(err.status === 400 ? err.response.data.message : t('register.error'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input type="text" id="register-name" placeholder={t('register.namePlaceholder')} />
      <Input type="email" id="register-email" placeholder={t('register.emailPlaceholder')} />
      <Input type="password" id="register-password" placeholder={t('register.passwordPlaceholder')} />
      <Button type="submit" variant="outline" className="w-full justify-center mt-2">
        {t('register.submit')}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default RegisterForm;

import axios from '../../axiosConfig';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, { email, password });
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
      if (err.status === 401 || err.status === 404) setError(t('login.invalidCredentials'));
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input type="email" id="login-email" placeholder={t('login.emailPlaceholder')} />
      <Input type="password" id="login-password" placeholder={t('login.passwordPlaceholder')} />
      <Button type="submit" variant="outline" className="w-full justify-center mt-2">
        {t('login.submit')}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default LoginForm;

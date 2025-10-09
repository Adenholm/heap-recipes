import { useContext, useState } from "react";
import { ModalContext } from "../../context/modal";
import { AuthContext } from "../../context/auth";
import './style.css';


const LoginModal = () => {
  const { closeModal } = useContext(ModalContext);
  const { onLogin } = useContext(AuthContext);

  const [data, setData] = useState({
    username: '',
    password: ''
  });
  const [err, setErr] = useState('');

  const onChange = (event: { target: { name: any; value: any; }; }) => {
    const { name, value } = event.target;
    setData({
      ...data,
      [name]: value
    });
  };

  const onSubmit = () => {
    if (
      data.username === '' ||
      data.password === ''
    ) {
      setErr('You are missing a required field');
      setTimeout(() => setErr(''), 3000);
      return;
    }
    onLogin(data.username, data.password)
      .then((res) => {
        closeModal();
      })
      .catch((error) => {
        setErr(error.message);
        setTimeout(() => setErr(''), 3000);
      });
  };

  return (
    <form
        onSubmit={e => {
        e.preventDefault();
        onSubmit();
        }}
    >
        <div>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                name="username"
                value={data.username}
                onChange={onChange}
                required
            />
        </div>
        <div>
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={onChange}
                required
            />
        </div>
        {err && <div style={{ color: 'red' }}>{err}</div>}
        <button type="submit" className="login-button">Login</button>
    </form>
  );
};

export default LoginModal;

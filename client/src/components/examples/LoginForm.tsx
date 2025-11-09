import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  return (
    <LoginForm 
      onLogin={(phone, password) => console.log('Login attempted:', phone, password)} 
    />
  );
}

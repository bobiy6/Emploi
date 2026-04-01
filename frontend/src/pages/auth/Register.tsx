import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        isCompany,
        companyName: isCompany ? companyName : null,
        vatNumber: isCompany ? vatNumber : null
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Get started today with hosting</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="johndoe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
             <input
                type="checkbox"
                id="isCompany"
                className="w-5 h-5 accent-blue-600 cursor-pointer"
                checked={isCompany}
                onChange={e => setIsCompany(e.target.checked)}
             />
             <label htmlFor="isCompany" className="text-sm font-bold text-gray-700 cursor-pointer">I am registering as a company</label>
          </div>

          {isCompany && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <Input label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                <Input label="VAT Number" placeholder="e.g. BE0123456789" value={vatNumber} onChange={e => setVatNumber(e.target.value)} required />
             </div>
          )}

          <Button type="submit" className="w-full h-12 mt-4" isLoading={loading}>
            Sign Up
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;

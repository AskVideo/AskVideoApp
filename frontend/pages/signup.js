import React, { useState } from 'react';
import axios from 'axios';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/router';


export default function SignupComponent() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    'e-mail': '',
    password: '',
  });

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/signup', formData); 
      console.log('Signup success:', response.data);
      router.push("/login");
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="mx-auto max-w-sm space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your information to create an account</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First name</Label>
              <Input id="name" placeholder="Lee" required value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Last name</Label>
              <Input id="surname" placeholder="Robinson" required value={formData.surname} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-mail">Email</Label>
            <Input id="e-mail" type="email" placeholder="m@example.com" required value={formData['e-mail']} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
          </div>
          <Button className="w-full" type="submit">Sign Up</Button>
        </div>
      </form>
    </div>
  );
  
}

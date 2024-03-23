import React, { useState } from 'react';
import axios from 'axios';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from 'react-use';
import Link from "next/link";
import { useRouter } from 'next/router' // Import useRouter
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { data } from 'autoprefixer';

export default function SignInComponent() {
  const router = useRouter() // Use useRouter hook to get the router object
  const [user_id, setId] = useLocalStorage("user_id", null);

  const [formData, setFormData] = useState({
    'e-mail': '',
    password: '',
  });
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleError = (errorMsg, isError) => {
    setErrorMsg(errorMsg)
    setError(isError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Replace the URL with your backend's URL, e.g., http://localhost:3000/login
      const response = await axios.post('http://localhost:5000/login', formData);
      setId(JSON.stringify(response.data.data.user_id));
      console.log('Login success:', response.data);
      if (response.data.code == 200) {
        router.push('/search')
      } else {
        handleError(response.data.msg, true)
        setTimeout(function() { handleError("", false) }, 5000);
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      // Handle errors here (e.g., show error message)
    }
  };

  return (
    <form className="flex items-center min-h-screen p-6 space-y-6 md:justify-center md:space-y-10" onSubmit={handleSubmit}>
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your email and password to access your account</p>
        </div>
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="e-mail" placeholder="m@example.com" type="email" value={formData['e-mail']} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} />
          </div>
          <Button className="w-full" type="submit">Sign In</Button>
        </div>
        <div className="text-center text-sm">
          <Link className="underline" href="/">
            Forgot your password?
          </Link>
        </div>
        {error && 
        (<Alert id="alert" variant="destructive">
         <ExclamationTriangleIcon className="h-4 w-4" />
         <AlertTitle id="alert-title">Error</AlertTitle>
         <AlertDescription id="alert-desc">
          {errorMsg}
         </AlertDescription>
        </Alert>)}
      </div>
    </form>
  );
}

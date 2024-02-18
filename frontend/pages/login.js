import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Component() {
  const login = async () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let payload = {
      "email": email,
      "password": password
    }
    try{
          const response = await fetch('http://127.0.0.1:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
      })
        .then(async response => {
          //Success or error msg
          console.log(response.json())
        })
    }catch(err)  {
      console.log(err);
    }

  }
  return (
    <div className="flex items-center min-h-screen p-6 space-y-6 md:justify-center md:space-y-10">
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your email and password to access your account</p>
        </div>
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="m@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full" onClick={login}>Sign In</Button>
        </div>
        <div className="text-center text-sm">
          <Link className="underline" href="/">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
}


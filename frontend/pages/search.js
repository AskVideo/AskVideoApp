/**
 * v0 by Vercel.
 * @see https://v0.dev/t/flqfataSMpx
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="max-w-3xl mx-auto grid gap-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">AskVideo</h1>
          <div className="flex items-center gap-4">
            <Link className="flex gap-2 items-center" href="#">
              <UserIcon className="h-6 w-6" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 grid gap-4">
          <div className="text-sm flex items-center gap-2">
            <SearchIcon className="w-4 h-4" />
            <label className="text-sm font-medium" htmlFor="search">
              Search
            </label>
          </div>
          <Input id="search" placeholder="Enter your search query" />
          <Button>Search</Button>
          <Link className="text-sm text-gray-500 underline dark:text-gray-400" href="/upload">
            or upload
          </Link>
        </div>
        <div className="grid gap-4">
          <div className="flex items-start gap-4 relative">
            <Link className="absolute inset-0" href="#">
              <span className="sr-only">View</span>
            </Link>
            <img
              alt="Thumbnail"
              className="aspect-video rounded-lg object-cover"
              height={94}
              src="/placeholder.svg"
              width={168}
            />
            <div className="text-sm">
              <div className="font-medium line-clamp-2">Introducing v0: Generative UI</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">Vercel</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">300K views · 5 days ago</div>
            </div>
            <Button>Select</Button>
          </div>
          <div className="flex items-start gap-4 relative">
            <Link className="absolute inset-0" href="#">
              <span className="sr-only">View</span>
            </Link>
            <img
              alt="Thumbnail"
              className="aspect-video rounded-lg object-cover"
              height={94}
              src="/placeholder.svg"
              width={168}
            />
            <div className="text-sm">
              <div className="font-medium line-clamp-2">Introducing the frontend cloud</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">Vercel</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">1.2M views · 2 months ago</div>
            </div>
            <Button>Select</Button>
          </div>
          <div className="flex items-start gap-4 relative">
            <Link className="absolute inset-0" href="#">
              <span className="sr-only">View</span>
            </Link>
            <img
              alt="Thumbnail"
              className="aspect-video rounded-lg object-cover"
              height={94}
              src="/placeholder.svg"
              width={168}
            />
            <div className="text-sm">
              <div className="font-medium line-clamp-2">Using Vercel KV with Svelte</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">Lee Robinson</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">21K views · 1 week ago</div>
            </div>
            <Button>Select</Button>
          </div>
          <div className="flex items-start gap-4 relative">
            <Link className="absolute inset-0" href="#">
              <span className="sr-only">View</span>
            </Link>
            <img
              alt="Thumbnail"
              className="aspect-video rounded-lg object-cover"
              height={94}
              src="/placeholder.svg"
              width={168}
            />
            <div className="text-sm">
              <div className="font-medium line-clamp-2">Loading UI with Next.js 13</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">Delba</div>
              <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">12K views · 10 days ago</div>
            </div>
            <Button>Select</Button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="border border-gray-200 rounded-lg p-4 grid gap-4">
          <h2 className="text-sm font-medium">Recent Searches</h2>
          <div className="flex items-center gap-2">
            <Link className="text-sm underline" href="#">
              UI Design
            </Link>
            <Link className="text-sm underline" href="#">
              React Components
            </Link>
            <Link className="text-sm underline" href="#">
              Tailwind CSS
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}


function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
    <h1 className="text-4xl font-bold mb-4">Welcome to Video Sharing Platform</h1>
    <Link href="/login">
      <p className="text-blue-500 hover:text-blue-700">Login</p>
    </Link>
    {' | '}
    <Link href="/register">
      <p className="text-blue-500 hover:text-blue-700">Register</p>
    </Link>
  </div>
  );
}

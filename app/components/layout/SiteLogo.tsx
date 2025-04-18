import { Link } from "@remix-run/react";

export function SiteLogo() {
  return (
    <Link to="/" className="ml-5 mr-6 flex items-center space-x-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <path d="M12 2 L2 7 L12 12 L22 7 L12 2" />
        <path d="M2 17 L12 22 L22 17" />
        <path d="M2 12 L12 17 L22 12" />
      </svg>
      <span className="font-bold inline-block">YkMake</span>
    </Link>
  );
}
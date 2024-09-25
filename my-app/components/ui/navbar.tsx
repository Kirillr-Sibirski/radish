import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-semibold text-gray-800">
                            <Image
                                src="/logo.png" // Path to your logo in the public folder
                                alt="Logo"
                                width={40} // Adjust the width of your logo
                                height={40} // Adjust the height of your logo
                                className="cursor-pointer"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                            App
                        </Link>
                    </div>

                    <div className="flex md:hidden items-center">
                        <button
                            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                            aria-label="Toggle Menu"
                        >
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

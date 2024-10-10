import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav style={{ backgroundColor: '#fcfff7' }} className="shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" style={{ color: '#070707' }} className="text-xl font-semibold">
                            <Image
                                src="/logo.png" // Path to your logo in the public folder
                                alt="Logo"
                                width={50} // Adjust the width of your logo
                                height={50} // Adjust the height of your logo
                                className="cursor-pointer"
                            />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/app" style={{ color: '#070707' }} className="hover:text-[#fb3640] " >
                            App
                        </Link>
                        <div dangerouslySetInnerHTML={{ __html: "<radix-connect-button></radix-connect-button>" }}></div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

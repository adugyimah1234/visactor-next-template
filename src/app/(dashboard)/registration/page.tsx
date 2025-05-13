'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RegistrationSection() {
    const pathname = usePathname();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Registration</h1>

            <div className="bg-white dark:bg-gray-800 shadow rounded-md overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <Link
                            href="/registration/new"
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                pathname === '/registration/new'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            New Registration
                        </Link>
                        <Link
                            href="/registration/manage"
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                pathname === '/registration/manage'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Manage Applicant
                        </Link>
                        {/* Add more tabs here for other registration functionalities */}
                    </nav>
                </div>
                <div className="p-6">
                    {/* The content for the active tab will be rendered here */}
                    {/* Next.js will automatically render the page.tsx file within the 'new' and 'manage' directories */}
                </div>
            </div>
        </div>
    );
}
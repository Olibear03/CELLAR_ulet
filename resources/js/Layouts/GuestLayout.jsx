import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, logoInside = false }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-blue-900 px-4 py-8 text-stone-900">
            {!logoInside && (
                <div className="mb-4">
                    <Link href="/">
                        <ApplicationLogo className="h-16 w-16 fill-current text-white drop-shadow-md" />
                    </Link>
                </div>
            )}

            <div className={`${logoInside ? 'mt-0' : 'mt-2'} w-full overflow-hidden bg-stone-100 px-7 py-8 text-stone-900 shadow-2xl sm:max-w-[420px] rounded-3xl border border-stone-200/60`}>
                {logoInside && (
                    <Link href="/" className="mb-6 flex justify-center">
                        <ApplicationLogo className="h-14 w-auto object-contain" />
                    </Link>
                )}
                {children}
            </div>
        </div>
    );
}

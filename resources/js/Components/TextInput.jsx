import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const input = (
        <input
            {...props}
            type={type === 'password' && isPasswordVisible ? 'text' : type}
            className={
                'border-gray-300 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm ' +
                className +
                (type === 'password' ? ' pr-10' : '')
            }
            ref={localRef}
        />
    );

    if (type !== 'password') {
        return input;
    }

    return (
        <div className="relative w-full">
            {input}
            <button
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-r-md"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isPasswordVisible}
            >
                {isPasswordVisible ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M10.584 10.587a2 2 0 002.829 2.829M9.88 5.09A10.94 10.94 0 0112 4.875c5.25 0 9 4.5 9 7.125a9.5 9.5 0 01-2.057 3.221M6.228 6.228C3.55 7.77 2 10.046 2 12c0 2.625 4.75 7.125 10 7.125 1.243 0 2.424-.283 3.484-.778" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                )}
            </button>
        </div>
    );
});

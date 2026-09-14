export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-blue-400 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest outline-none ring-offset-2 transition ease-in-out duration-150 hover:bg-blue-500 hover:shadow-lg active:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-offset-2 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

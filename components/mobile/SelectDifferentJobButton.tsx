type SelectDifferentJobButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export default function SelectDifferentJobButton({
  onClick,
  disabled = false,
  className = "",
}: SelectDifferentJobButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M15.78 5.22a.75.75 0 010 1.06L9.56 12.5l6.22 6.22a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 011.06 0z"
          clipRule="evenodd"
        />
      </svg>
      Select Different Job
    </button>
  );
}
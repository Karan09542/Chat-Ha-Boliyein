interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "small" | "medium" | "large"; // ✅ नया prop
  className?:string;
}

export default function Switch({ label, checked, onChange, size = "medium", className }: SwitchProps) {
  const sizes = {
    small: { width: "w-8", height: "h-4", dot: "w-3 h-3", translate: "translate-x-4" },
    medium: { width: "w-12", height: "h-6", dot: "w-5 h-5", translate: "translate-x-6" },
    large: { width: "w-16", height: "h-8", dot: "w-7 h-7", translate: "translate-x-8" }
  };

  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <span className="text-sm capitalize">{label}</span>
      <div
        className={`${sizes[size].width} ${sizes[size].height} flex items-center rounded-full p-1 transition duration-300 ${
          checked ? "bg-blue-600" : "bg-gray-400"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`${sizes[size].dot} bg-white rounded-full shadow-md transform transition duration-300 ${
            checked ? sizes[size].translate : "translate-x-0"
          }`}
        ></div>
      </div>
    </label>
  );
}

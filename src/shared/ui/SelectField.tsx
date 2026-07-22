import { formInputBase, formLabelBase } from './formStyles';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  id: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  id,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={formLabelBase}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={formInputBase}
        aria-label={label}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

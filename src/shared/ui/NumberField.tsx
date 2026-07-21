import { formInputBase, formLabelBase } from './formStyles';

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  min?: number;
  step?: string;
}

export function NumberField({ label, value, onChange, id, min, step }: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={formLabelBase}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        step={step}
        className={formInputBase}
        aria-label={label}
        inputMode="decimal"
      />
    </div>
  );
}

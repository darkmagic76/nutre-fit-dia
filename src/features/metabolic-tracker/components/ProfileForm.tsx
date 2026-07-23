import { PrimaryButton, NumberField, SelectField } from '@shared/ui';
import type { UserMetricsFormState } from '@shared/domain';
import type { FormEvent } from 'react';
import { useT } from '@shared/i18n';

interface ProfileFormProps {
  form: UserMetricsFormState;
  onSubmit: (e: FormEvent) => void;
  canSubmit?: boolean;
}

export function ProfileForm({
  form: {
    weight,
    height,
    age,
    diagnosisAge,
    glucose,
    glucoseContext,
    gender,
    paf,
    setWeight,
    setHeight,
    setAge,
    setDiagnosisAge,
    setGlucose,
    setGlucoseContext,
    setGender,
    setPaf,
  },
  onSubmit,
  canSubmit = true,
}: ProfileFormProps) {
  const t = useT();

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
      aria-label={t['metabolic.formAriaLabel']}
      noValidate
    >
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="weight"
          label={t['form.weight']}
          value={weight}
          onChange={setWeight}
          min={30}
        />
        <NumberField
          id="height"
          label={t['form.height']}
          value={height}
          onChange={setHeight}
          min={100}
        />
        <NumberField id="age" label={t['form.age']} value={age} onChange={setAge} min={18} />
        <NumberField
          id="diagnosisAge"
          label={t['form.diagnosisAge']}
          value={diagnosisAge}
          onChange={setDiagnosisAge}
          min={0}
        />
        <NumberField
          id="glucose"
          label={t['form.glucose']}
          value={glucose}
          onChange={setGlucose}
          min={0}
        />
        <SelectField
          id="gender"
          label={t['form.gender']}
          value={gender}
          onChange={setGender}
          options={[
            { value: 'male', label: t['form.genderMale'] },
            { value: 'female', label: t['form.genderFemale'] },
          ]}
        />
      </div>
      <SelectField
        id="paf"
        label={t['form.paf']}
        value={paf}
        onChange={setPaf}
        options={[
          { value: '1.2', label: t['form.pafSedentary'] },
          { value: '1.375', label: t['form.pafLight'] },
          { value: '1.55', label: t['form.pafModerate'] },
          { value: '1.725', label: t['form.pafActive'] },
          { value: '1.9', label: t['form.pafVeryActive'] },
        ]}
      />
      <SelectField
        id="glucoseContext"
        label={t['form.glucoseContext']}
        value={glucoseContext}
        onChange={setGlucoseContext as (v: string) => void}
        options={[
          { value: 'fasting', label: t['form.glucoseFasting'] },
          { value: 'postprandial', label: t['form.glucosePostprandial'] },
        ]}
      />
      <PrimaryButton type="submit" disabled={!canSubmit}>
        {t['ui.calculate']}
      </PrimaryButton>
    </form>
  );
}

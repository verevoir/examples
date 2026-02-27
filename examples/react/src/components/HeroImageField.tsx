import type { FieldEditorProps } from '@nextlake/editor';
import { ImageField } from '@nextlake/media';

export function HeroImageField({ value, onChange }: FieldEditorProps<string>) {
  return (
    <ImageField
      value={(value as string) || ''}
      onChange={onChange}
      label="Hero Image"
    />
  );
}

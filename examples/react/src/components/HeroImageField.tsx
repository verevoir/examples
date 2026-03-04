import type { FieldEditorProps } from '@verevoir/editor';
import { ImageField } from '@verevoir/media';

export function HeroImageField({ value, onChange }: FieldEditorProps<string>) {
  return (
    <ImageField
      value={(value as string) || ''}
      onChange={onChange}
      label="Hero Image"
    />
  );
}
